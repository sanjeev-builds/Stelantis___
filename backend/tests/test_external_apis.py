"""Unit tests for app/services/external_apis.py. httpx.get is mocked in every
test - these must never depend on real network access or third-party uptime.
"""

from unittest.mock import MagicMock, patch

import httpx

from app.services import external_apis


def test_split_make_model_single_word_make():
    assert external_apis._split_make_model("Chrysler Pacifica PHEV") == ("Chrysler", "Pacifica")


def test_split_make_model_multi_word_make():
    assert external_apis._split_make_model("Alfa Romeo Junior Elettrica") == ("Alfa Romeo", "Junior")


def test_split_make_model_single_word_model():
    assert external_apis._split_make_model("Fiat 600e") == ("Fiat", "600e")


def _mock_response(json_data, status_ok=True):
    resp = MagicMock()
    resp.json.return_value = json_data
    if status_ok:
        resp.raise_for_status.return_value = None
    else:
        resp.raise_for_status.side_effect = Exception("boom")
    return resp


def test_get_recalls_maps_fields():
    payload = {
        "results": [
            {
                "NHTSACampaignNumber": "24V199000",
                "Component": "AIR BAGS",
                "Summary": "summary text",
                "Consequence": "consequence text",
                "Remedy": "remedy text",
                "ReportReceivedDate": "14/03/2024",
            }
        ]
    }
    with patch("httpx.get", return_value=_mock_response(payload)):
        recalls = external_apis.get_recalls("Chrysler Pacifica PHEV", 2024)
    assert len(recalls) == 1
    assert recalls[0]["campaign_number"] == "24V199000"
    assert recalls[0]["component"] == "AIR BAGS"


def test_get_recalls_returns_empty_list_on_failure():
    with patch("httpx.get", side_effect=httpx.ConnectError("network down")):
        recalls = external_apis.get_recalls("Chrysler Pacifica PHEV", 2024)
    assert recalls == []


def test_get_ambient_conditions_maps_fields():
    payload = {"current": {"temperature_2m": 22.4, "relative_humidity_2m": 74.0, "weather_code": 3}}
    with patch("httpx.get", return_value=_mock_response(payload)):
        conditions = external_apis.get_ambient_conditions(48.8566, 2.3522)
    assert conditions == {"temperature_c": 22.4, "humidity_pct": 74.0, "condition": "Overcast"}


def test_get_ambient_conditions_returns_none_on_failure():
    with patch("httpx.get", side_effect=httpx.ConnectError("network down")):
        assert external_apis.get_ambient_conditions(0, 0) is None


def test_charging_stations_not_configured_without_api_key(monkeypatch):
    monkeypatch.setenv("OPENCHARGEMAP_API_KEY", "")
    external_apis.get_settings.cache_clear()
    result = external_apis.get_nearby_charging_stations(48.8566, 2.3522)
    assert result == {"configured": False, "stations": []}
    external_apis.get_settings.cache_clear()


def test_charging_stations_maps_fields_when_configured(monkeypatch):
    monkeypatch.setenv("OPENCHARGEMAP_API_KEY", "test-key")
    external_apis.get_settings.cache_clear()
    payload = [
        {
            "AddressInfo": {"Title": "Test Station", "AddressLine1": "1 Rue Test", "Town": "Paris", "Distance": 1.2},
            "NumberOfPoints": 4,
            "OperatorInfo": {"Title": "Test Operator"},
        }
    ]
    try:
        with patch("httpx.get", return_value=_mock_response(payload)):
            result = external_apis.get_nearby_charging_stations(48.8566, 2.3522)
    finally:
        monkeypatch.setenv("OPENCHARGEMAP_API_KEY", "")
        external_apis.get_settings.cache_clear()

    assert result["configured"] is True
    assert result["stations"][0]["name"] == "Test Station"
    assert result["stations"][0]["distance_km"] == 1.2
