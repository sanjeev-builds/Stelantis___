"""Thin clients for free public APIs that add real-world context around a
vehicle - recalls, ambient weather, nearby charging. All three are additive
and read-only: none of them feed the health/predictive scoring engine, which
stays 100% deterministic (see app/scoring/). Every call is best-effort - a
slow/unavailable third party degrades to an empty result, never a 500, the
same resilience pattern app/services/ai_client.py uses for Groq.
"""

import logging

import httpx

from app.core.config import get_settings

logger = logging.getLogger(__name__)

_TIMEOUT = httpx.Timeout(6.0)

# NHTSA's recallsByVehicle needs an exact make/model string (verified: "Pacifica
# PHEV" returns 0 results, "Pacifica" returns 11) - our mock fleet stores make
# and trim together in one `model` field (e.g. "Chrysler Pacifica PHEV"), so
# reduce it to the two tokens NHTSA actually recognizes: the make, and the
# first word of what's left. Real coverage is US-market only, so most of this
# hackathon's European Stellantis models (Peugeot, Citroen, Opel, DS, Alfa
# Romeo) will correctly return zero results - that's accurate, not a bug.
_MULTI_WORD_MAKES = ["Alfa Romeo"]


def _split_make_model(model_field: str) -> tuple[str, str]:
    for make in _MULTI_WORD_MAKES:
        if model_field.startswith(make):
            rest = model_field[len(make):].strip()
            return make, (rest.split(" ")[0] if rest else "")
    parts = model_field.split(" ", 1)
    make = parts[0]
    rest = parts[1] if len(parts) > 1 else ""
    return make, (rest.split(" ")[0] if rest else "")


def get_recalls(model_field: str, model_year: int) -> list[dict]:
    make, model = _split_make_model(model_field)
    if not model:
        return []
    try:
        resp = httpx.get(
            "https://api.nhtsa.gov/recalls/recallsByVehicle",
            params={"make": make, "model": model, "modelYear": model_year},
            timeout=_TIMEOUT,
        )
        resp.raise_for_status()
        results = resp.json().get("results", [])
    except (httpx.HTTPError, ValueError):
        logger.exception("NHTSA recalls lookup failed for %s %s %s", make, model, model_year)
        return []

    return [
        {
            "campaign_number": r.get("NHTSACampaignNumber"),
            "component": r.get("Component"),
            "summary": r.get("Summary"),
            "consequence": r.get("Consequence"),
            "remedy": r.get("Remedy"),
            "report_date": r.get("ReportReceivedDate"),
        }
        for r in results
    ]


_WEATHER_CODES = {
    0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
    45: "Fog", 48: "Depositing rime fog",
    51: "Light drizzle", 53: "Moderate drizzle", 55: "Dense drizzle",
    61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
    71: "Slight snow", 73: "Moderate snow", 75: "Heavy snow",
    80: "Rain showers", 81: "Moderate rain showers", 82: "Violent rain showers",
    95: "Thunderstorm",
}


def get_ambient_conditions(lat: float, lng: float) -> dict | None:
    try:
        resp = httpx.get(
            "https://api.open-meteo.com/v1/forecast",
            params={
                "latitude": lat,
                "longitude": lng,
                "current": "temperature_2m,relative_humidity_2m,weather_code",
            },
            timeout=_TIMEOUT,
        )
        resp.raise_for_status()
        current = resp.json().get("current", {})
    except (httpx.HTTPError, ValueError):
        logger.exception("Open-Meteo lookup failed for %s,%s", lat, lng)
        return None

    if not current:
        return None
    code = current.get("weather_code")
    return {
        "temperature_c": current.get("temperature_2m"),
        "humidity_pct": current.get("relative_humidity_2m"),
        "condition": _WEATHER_CODES.get(code, "Unknown"),
    }


def get_nearby_charging_stations(lat: float, lng: float, max_results: int = 5) -> dict:
    api_key = get_settings().openchargemap_api_key
    if not api_key:
        return {"configured": False, "stations": []}

    try:
        resp = httpx.get(
            "https://api.openchargemap.io/v3/poi/",
            params={
                "output": "json",
                "latitude": lat,
                "longitude": lng,
                "maxresults": max_results,
                "distance": 25,
                "distanceunit": "KM",
            },
            headers={"X-API-Key": api_key},
            timeout=_TIMEOUT,
        )
        resp.raise_for_status()
        results = resp.json()
    except (httpx.HTTPError, ValueError):
        logger.exception("Open Charge Map lookup failed for %s,%s", lat, lng)
        return {"configured": True, "stations": []}

    stations = [
        {
            "name": (r.get("AddressInfo") or {}).get("Title"),
            "address": (r.get("AddressInfo") or {}).get("AddressLine1"),
            "town": (r.get("AddressInfo") or {}).get("Town"),
            "distance_km": (r.get("AddressInfo") or {}).get("Distance"),
            "num_points": r.get("NumberOfPoints"),
            "operator": (r.get("OperatorInfo") or {}).get("Title"),
        }
        for r in results
    ]
    return {"configured": True, "stations": stations}
