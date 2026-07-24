from app.scoring.health import battery_health_score, cybersecurity_score, normalize, vehicle_health_score
from app.scoring.predictive import evaluate_alerts

HEALTHY_TELEMETRY = {
    "battery_pct": 100.0,
    "battery_voltage": 12.6,
    "battery_temp_c": 25.0,
    "ecu_temp_c": 40.0,
    "cpu_usage_pct": 0.0,
    "ram_usage_pct": 0.0,
    "coolant_temp_c": 90.0,
    "oil_pressure_kpa": 300.0,
    "engine_load_pct": 0.0,
    "fault_codes": [],
    "encryption_status": "ENABLED",
    "can_bus_error_count": 0,
    "unauthorized_access_attempts": 0,
}
HEALTHY_VEHICLE = {
    "charge_cycles": 0,
    "mileage_km": 0,
    "firmware_version": "20",
}


def test_normalize_higher_is_worse():
    assert normalize(25, good=25, bad=60) == 100.0
    assert normalize(60, good=25, bad=60) == 0.0
    midpoint = normalize(42.5, good=25, bad=60)
    assert 45 < midpoint < 55


def test_normalize_higher_is_better():
    assert normalize(300, good=300, bad=100) == 100.0
    assert normalize(100, good=300, bad=100) == 0.0


def test_normalize_clamps_outside_range():
    assert normalize(-10, good=0, bad=60) == 100.0
    assert normalize(1000, good=0, bad=60) == 0.0


def test_battery_health_score_perfect_conditions():
    score = battery_health_score(HEALTHY_TELEMETRY, HEALTHY_VEHICLE)
    assert score == 100.0


def test_battery_health_score_drops_with_hot_battery():
    hot = {**HEALTHY_TELEMETRY, "battery_temp_c": 60.0}
    score = battery_health_score(hot, HEALTHY_VEHICLE)
    assert score < 100.0


def test_cybersecurity_score_perfect_conditions():
    score = cybersecurity_score(HEALTHY_TELEMETRY, HEALTHY_VEHICLE)
    assert score == 100.0


def test_cybersecurity_score_zero_when_encryption_disabled_and_old_firmware():
    bad_telemetry = {**HEALTHY_TELEMETRY, "encryption_status": "DISABLED", "can_bus_error_count": 50}
    bad_vehicle = {**HEALTHY_VEHICLE, "firmware_version": "0"}
    score = cybersecurity_score(bad_telemetry, bad_vehicle)
    assert score < 30.0


def test_vehicle_health_score_perfect_conditions():
    score = vehicle_health_score(HEALTHY_TELEMETRY, HEALTHY_VEHICLE)
    assert score == 100.0


def test_vehicle_health_score_penalized_by_fault_codes():
    faulty = {**HEALTHY_TELEMETRY, "fault_codes": ["P0A80", "P0217"]}
    score = vehicle_health_score(faulty, HEALTHY_VEHICLE)
    assert score < 100.0


def _reading(**overrides) -> dict:
    base = {
        "battery_temp_c": 25.0,
        "can_bus_error_count": 0,
        "coolant_temp_c": 90.0,
        "oil_pressure_kpa": 300.0,
        "battery_health_score": 90.0,
        "vehicle_health_score": 90.0,
    }
    return {**base, **overrides}


def test_evaluate_alerts_empty_history_gives_no_alerts():
    assert evaluate_alerts([]) == []


def test_evaluate_alerts_healthy_history_gives_no_alerts():
    history = [_reading() for _ in range(8)]
    assert evaluate_alerts(history) == []


def test_evaluate_alerts_battery_trending_hot_fires_battery_alert():
    history = [
        _reading(battery_temp_c=30 + i * 2, battery_health_score=55) for i in range(5)
    ]
    alerts = evaluate_alerts(history)
    categories = [a["category"] for a in alerts]
    assert "BATTERY" in categories


def test_evaluate_alerts_can_errors_rising_fires_cybersecurity_alert():
    history = [_reading(can_bus_error_count=i) for i in range(4)]
    alerts = evaluate_alerts(history)
    categories = [a["category"] for a in alerts]
    assert "CYBERSECURITY" in categories


def test_evaluate_alerts_mechanical_threshold_fires_critical_alert():
    history = [_reading(), _reading(coolant_temp_c=110.0)]
    alerts = evaluate_alerts(history)
    mechanical = [a for a in alerts if a["category"] == "MECHANICAL"]
    assert len(mechanical) == 1
    assert mechanical[0]["severity"] == "CRITICAL"


def test_evaluate_alerts_health_score_drop_fires_ecu_alert():
    history = [_reading(vehicle_health_score=90 - i * 5) for i in range(5)]
    alerts = evaluate_alerts(history)
    categories = [a["category"] for a in alerts]
    assert "ECU" in categories
