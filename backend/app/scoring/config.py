"""Every weight/threshold the scoring engine uses, in one place, so it's
tunable live during the demo without touching the formulas themselves.
See docs/Vehicle-Health-Dashboard-Plan.md Steps 4-7.
"""

# This is the 12V accessory/starter battery (electronics, not propulsion) -
# every seeded vehicle is EV-badged, so an unlabeled "battery_voltage" reads
# as the HV traction pack (300-800V on a real EV) unless this is explicit.
# Audit flagged this as a real automotive-credibility gap; fixing it for
# real would mean adding separate HV-pack fields, which is a schema change,
# not a config tweak - this comment plus the TelemetryIn field description
# are the honest stopgap.
NOMINAL_BATTERY_VOLTAGE = 12.6
LATEST_FIRMWARE_VERSION = 20

BATTERY_WEIGHTS = {
    "charge": 0.20,
    "voltage": 0.25,
    "temp": 0.25,
    "cycles": 0.15,
    "age": 0.15,
}
BATTERY_THRESHOLDS = {
    # (good, bad) - direction is inferred from which one is larger, see
    # scoring.health.normalize().
    "voltage_deviation": (0.0, 2.0),
    "temp_c": (25.0, 60.0),
    "cycle_count": (0, 1500),
    "mileage_km": (0, 200_000),
}

CYBER_WEIGHTS = {
    "firmware": 0.25,
    "encryption": 0.30,
    "can_errors": 0.25,
    "auth": 0.20,
}
CYBER_THRESHOLDS = {
    "can_error_count": (0, 50),
}
FIRMWARE_VERSION_PENALTY = 20  # points per version behind, floor 0
AUTH_ATTEMPT_PENALTY = 15  # points per unauthorized attempt, floor 0

OVERALL_WEIGHTS = {
    "battery": 0.30,
    "ecu": 0.25,
    "mechanical": 0.25,
    "cybersecurity": 0.10,
    "fault_codes": 0.10,
}
ECU_THRESHOLDS = {
    "cpu_usage_pct": (0, 90),
    "ram_usage_pct": (0, 90),
    "ecu_temp_c": (40, 100),
}
MECHANICAL_THRESHOLDS = {
    "coolant_temp_c": (90, 115),
    "oil_pressure_kpa": (300, 100),  # higher = better, so good > bad here
    "engine_load_pct": (0, 100),
}
FAULT_CODE_PENALTY = 15  # points per active DTC, floor 0

PREDICTIVE = {
    "battery_temp_slope_c_per_reading": 0.5,
    "battery_temp_trend_window": 5,
    "battery_health_alert_threshold": 60,
    "can_error_trend_window": 3,
    "coolant_temp_critical_c": 105.0,
    "oil_pressure_critical_kpa": 150.0,
    "health_score_drop_threshold": 15,
    "health_score_drop_window": 5,
}
