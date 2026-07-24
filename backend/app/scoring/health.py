"""Deterministic health scoring - no AI. Every formula here is pure math over
telemetry + vehicle fields, auditable and independent of the Gemini layer.
See docs/Vehicle-Health-Dashboard-Plan.md Steps 4-7.

`telemetry` / `vehicle` accept either a dict (e.g. loaded straight from the
mock JSON in the seed script) or an object with matching attributes (e.g. a
SQLAlchemy Telemetry/Vehicle row) - see `_field`.
"""

from typing import Any

from app.scoring.config import (
    AUTH_ATTEMPT_PENALTY,
    BATTERY_THRESHOLDS,
    BATTERY_WEIGHTS,
    CYBER_THRESHOLDS,
    CYBER_WEIGHTS,
    ECU_THRESHOLDS,
    FAULT_CODE_PENALTY,
    FIRMWARE_VERSION_PENALTY,
    LATEST_FIRMWARE_VERSION,
    MECHANICAL_THRESHOLDS,
    NOMINAL_BATTERY_VOLTAGE,
    OVERALL_WEIGHTS,
)


def _field(obj: Any, key: str) -> Any:
    return obj[key] if isinstance(obj, dict) else getattr(obj, key)


def normalize(value: float, good: float, bad: float) -> float:
    """0-100, where `value == good` -> 100 and `value == bad` -> 0. Works for
    both directions (good < bad, e.g. temperature; or good > bad, e.g. oil
    pressure) since the ratio flips sign consistently either way."""
    if good == bad:
        return 100.0
    score = (bad - value) / (bad - good) * 100
    return max(0.0, min(100.0, score))


def battery_health_score(telemetry: Any, vehicle: Any) -> float:
    charge_score = max(0.0, min(100.0, _field(telemetry, "battery_pct")))
    voltage_deviation = abs(_field(telemetry, "battery_voltage") - NOMINAL_BATTERY_VOLTAGE)
    voltage_score = normalize(voltage_deviation, *BATTERY_THRESHOLDS["voltage_deviation"])
    temp_score = normalize(_field(telemetry, "battery_temp_c"), *BATTERY_THRESHOLDS["temp_c"])
    cycle_score = normalize(_field(vehicle, "charge_cycles"), *BATTERY_THRESHOLDS["cycle_count"])
    age_score = normalize(_field(vehicle, "mileage_km"), *BATTERY_THRESHOLDS["mileage_km"])

    w = BATTERY_WEIGHTS
    score = (
        w["charge"] * charge_score
        + w["voltage"] * voltage_score
        + w["temp"] * temp_score
        + w["cycles"] * cycle_score
        + w["age"] * age_score
    )
    return round(score, 2)


def cybersecurity_score(telemetry: Any, vehicle: Any) -> float:
    versions_behind = max(0, LATEST_FIRMWARE_VERSION - int(_field(vehicle, "firmware_version")))
    firmware_score = max(0.0, min(100.0, 100 - FIRMWARE_VERSION_PENALTY * versions_behind))
    encryption_score = 100.0 if _field(telemetry, "encryption_status") == "ENABLED" else 0.0
    can_error_score = normalize(_field(telemetry, "can_bus_error_count"), *CYBER_THRESHOLDS["can_error_count"])
    # Both-ends clamp: unauthorized_access_attempts has no enforced non-negative
    # invariant at the DB layer, so a negative value (bad sensor/ingest data)
    # must not be able to push this over 100 the way an unclamped upper bound
    # would (verified: -3 attempts previously produced a 145 sub-score).
    auth_score = max(0.0, min(100.0, 100 - AUTH_ATTEMPT_PENALTY * _field(telemetry, "unauthorized_access_attempts")))

    w = CYBER_WEIGHTS
    score = (
        w["firmware"] * firmware_score
        + w["encryption"] * encryption_score
        + w["can_errors"] * can_error_score
        + w["auth"] * auth_score
    )
    return round(score, 2)


def vehicle_health_score(
    telemetry: Any,
    vehicle: Any,
    battery_score: float | None = None,
    cyber_score: float | None = None,
) -> float:
    battery = battery_score if battery_score is not None else battery_health_score(telemetry, vehicle)
    cyber = cyber_score if cyber_score is not None else cybersecurity_score(telemetry, vehicle)

    ecu_sub_scores = [
        normalize(_field(telemetry, "cpu_usage_pct"), *ECU_THRESHOLDS["cpu_usage_pct"]),
        normalize(_field(telemetry, "ram_usage_pct"), *ECU_THRESHOLDS["ram_usage_pct"]),
        normalize(_field(telemetry, "ecu_temp_c"), *ECU_THRESHOLDS["ecu_temp_c"]),
    ]
    ecu_score = sum(ecu_sub_scores) / len(ecu_sub_scores)

    mechanical_sub_scores = [
        normalize(_field(telemetry, "coolant_temp_c"), *MECHANICAL_THRESHOLDS["coolant_temp_c"]),
        normalize(_field(telemetry, "oil_pressure_kpa"), *MECHANICAL_THRESHOLDS["oil_pressure_kpa"]),
        normalize(_field(telemetry, "engine_load_pct"), *MECHANICAL_THRESHOLDS["engine_load_pct"]),
    ]
    mechanical_score = sum(mechanical_sub_scores) / len(mechanical_sub_scores)

    num_faults = len(_field(telemetry, "fault_codes") or [])
    fault_code_score = max(0.0, min(100.0, 100 - FAULT_CODE_PENALTY * num_faults))

    w = OVERALL_WEIGHTS
    score = (
        w["battery"] * battery
        + w["ecu"] * ecu_score
        + w["mechanical"] * mechanical_score
        + w["cybersecurity"] * cyber
        + w["fault_codes"] * fault_code_score
    )
    return round(score, 2)
