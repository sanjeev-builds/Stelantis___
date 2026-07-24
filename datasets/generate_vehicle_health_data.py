"""Generates mock vehicle + telemetry data for the Vehicle Health Dashboard MVP.

Stdlib only - no pip install needed. Run:
    python datasets/generate_vehicle_health_data.py

Produces datasets/mock/vehicles.json and datasets/mock/telemetry.json matching
the schema in docs/Vehicle-Health-Dashboard-Plan.md (Step 3). A handful of
vehicles are deliberately scripted to trend toward each predictive-alert rule
in their most recent readings, so the demo has something to show.

Two fields fill small gaps left open in the plan doc (which specifies the
scoring formulas but not every input field):
- vehicles.charge_cycles - battery age proxy the plan's scoring formula
  needs; kept on `vehicles` like mileage_km since it changes slowly, not
  per-reading.
- telemetry.unauthorized_access_attempts - the plan's cybersecurity formula
  needs an auth-attempt count; kept per-reading like can_bus_error_count.
"""

import json
import random
from datetime import datetime, timedelta, timezone
from pathlib import Path

OUT_DIR = Path(__file__).parent / "mock"
LATEST_FIRMWARE_VERSION = 20
READINGS_PER_VEHICLE = 60
READING_INTERVAL_MINUTES = 15

MODELS = [
    "Jeep Avenger EV",
    "Fiat 600e",
    "Peugeot e-2008",
    "Citroen e-C4",
    "Chrysler Pacifica PHEV",
    "Opel Corsa Electric",
    "DS 3 E-Tense",
    "Alfa Romeo Junior Elettrica",
]

# Each entry: (scenario, base overrides). "healthy" vehicles stay stable;
# the rest ramp a specific metric over their last few readings so the
# predictive rule engine has something real to fire on.
VEHICLES = [
    {"id": "STL-EV-0001", "model": MODELS[0], "year": 2025, "scenario": "healthy"},
    {"id": "STL-EV-0002", "model": MODELS[1], "year": 2024, "scenario": "healthy"},
    {"id": "STL-EV-0003", "model": MODELS[2], "year": 2023, "scenario": "battery_degrading"},
    {"id": "STL-EV-0004", "model": MODELS[3], "year": 2022, "scenario": "cyber_incident"},
    {"id": "STL-EV-0005", "model": MODELS[4], "year": 2024, "scenario": "mechanical_critical"},
    {"id": "STL-EV-0006", "model": MODELS[5], "year": 2021, "scenario": "overall_decline"},
    {"id": "STL-EV-0007", "model": MODELS[6], "year": 2025, "scenario": "healthy"},
    {"id": "STL-EV-0008", "model": MODELS[7], "year": 2023, "scenario": "healthy"},
]


def make_vehicles() -> list[dict]:
    records = []
    for v in VEHICLES:
        degraded = v["scenario"] != "healthy"
        records.append(
            {
                "vehicle_id": v["id"],
                "model": v["model"],
                "manufacture_year": v["year"],
                "firmware_version": str(
                    LATEST_FIRMWARE_VERSION - (random.randint(2, 5) if degraded else random.randint(0, 1))
                ),
                "mileage_km": round(random.uniform(20000, 140000) if degraded else random.uniform(500, 40000), 1),
                "charge_cycles": random.randint(600, 1400) if degraded else random.randint(20, 400),
            }
        )
    return records


def _ramp(i: int, n: int, start: float, end: float) -> float:
    """Linear ramp from `start` to `end` across the last `n` readings, flat before that."""
    if i < 0:
        return start
    return start + (end - start) * (i / max(n - 1, 1))


def make_telemetry(vehicles: list[dict]) -> list[dict]:
    now = datetime.now(timezone.utc)
    records = []
    trend_window = 8  # how many trailing readings carry the scripted trend
    # Overall-decline needs its drop concentrated inside the predictive rule's
    # 5-reading comparison window (see PREDICTIVE["health_score_drop_window"]
    # in app/scoring/config.py), so it gets its own, shorter ramp.
    decline_window = 5

    for v in vehicles:
        scenario = next(x["scenario"] for x in VEHICLES if x["id"] == v["vehicle_id"])
        lat = round(random.uniform(41.0, 49.0), 5)
        lng = round(random.uniform(-8.0, 20.0), 5)

        for i in range(READINGS_PER_VEHICLE):
            ts = now - timedelta(minutes=(READINGS_PER_VEHICLE - i) * READING_INTERVAL_MINUTES)
            # index into the trailing trend window (-1 = not in the window yet)
            trend_i = i - (READINGS_PER_VEHICLE - trend_window) if i >= READINGS_PER_VEHICLE - trend_window else -1
            decline_i = (
                i - (READINGS_PER_VEHICLE - decline_window) if i >= READINGS_PER_VEHICLE - decline_window else -1
            )

            battery_pct = round(random.uniform(35, 95), 1)
            battery_voltage = round(random.gauss(12.6, 0.2), 2)
            battery_temp_c = round(random.uniform(24, 35), 1)
            can_errors = random.randint(0, 1)
            coolant_temp_c = round(random.uniform(85, 95), 1)
            oil_pressure_kpa = round(random.uniform(260, 320), 1)
            fault_codes: list[str] = []
            auth_attempts = 0
            encryption_status = "ENABLED"
            speed_kmh = round(random.uniform(0, 120), 1)

            # Vehicle status / charging / connectivity - varied deliberately so
            # the demo has something of every value to show, not just DRIVING.
            status = "DRIVING" if speed_kmh > 5 else "PARKED"
            charging_state = "NOT_CHARGING"
            connection_status = "ONLINE"

            in_charging_window = v["vehicle_id"] in ("STL-EV-0002", "STL-EV-0008") and 20 <= i < 26
            if in_charging_window:
                speed_kmh = 0.0
                status = "CHARGING"
                charging_state = "CHARGING"
                battery_pct = round(_ramp(i - 20, 6, 40, 85), 1)
            elif speed_kmh <= 5 and random.random() < 0.15:
                status = "IDLE"

            in_offline_window = v["vehicle_id"] == "STL-EV-0004" and 50 <= i < 53
            if in_offline_window:
                status = "OFFLINE"
                connection_status = "OFFLINE"

            in_maintenance_window = v["vehicle_id"] == "STL-EV-0005" and i >= READINGS_PER_VEHICLE - 2
            if in_maintenance_window:
                status = "MAINTENANCE"
                speed_kmh = 0.0

            driver_mode = random.choice(["ECO", "NORMAL", "NORMAL", "SPORT"])

            if scenario == "battery_degrading" and trend_i >= 0:
                battery_temp_c = round(_ramp(trend_i, trend_window, 35, 62), 1)
                battery_pct = round(_ramp(trend_i, trend_window, 55, 30), 1)

            if scenario == "cyber_incident" and trend_i >= 0:
                can_errors = int(_ramp(trend_i, trend_window, 2, 18))
                auth_attempts = random.randint(0, 2) if trend_i >= trend_window - 3 else 0
                if trend_i >= trend_window - 2:
                    encryption_status = "DISABLED"

            if scenario == "mechanical_critical" and trend_i >= 0:
                coolant_temp_c = round(_ramp(trend_i, trend_window, 92, 112), 1)
                oil_pressure_kpa = round(_ramp(trend_i, trend_window, 280, 130), 1)
                if trend_i >= trend_window - 2:
                    fault_codes = ["P0A80"]

            if scenario == "overall_decline" and decline_i >= 0:
                # Steep, multi-system decline (battery + mechanical + ECU load
                # + a fault code) so the composite vehicle_health_score drops
                # well past the >15-point-over-5-readings alert threshold.
                battery_pct = round(_ramp(decline_i, decline_window, battery_pct, 15), 1)
                battery_temp_c = round(_ramp(decline_i, decline_window, battery_temp_c, 55), 1)
                coolant_temp_c = round(_ramp(decline_i, decline_window, coolant_temp_c, 108), 1)
                oil_pressure_kpa = round(_ramp(decline_i, decline_window, oil_pressure_kpa, 170), 1)
                can_errors = int(_ramp(decline_i, decline_window, can_errors, 8))
                if decline_i >= decline_window - 2:
                    fault_codes = ["P0A80"]

            drift = random.uniform(-0.0008, 0.0008)
            lat = round(lat + drift, 5)
            lng = round(lng + drift, 5)

            motor_rpm = random.randint(600, 6000) if status == "DRIVING" else 0

            records.append(
                {
                    "vehicle_id": v["vehicle_id"],
                    "timestamp": ts.isoformat(),
                    "battery_pct": battery_pct,
                    "battery_voltage": battery_voltage,
                    "battery_temp_c": battery_temp_c,
                    "ecu_temp_c": round(random.uniform(35, 55), 1),
                    "cpu_usage_pct": round(random.uniform(10, 60), 1),
                    "ram_usage_pct": round(random.uniform(20, 70), 1),
                    "speed_kmh": speed_kmh,
                    "motor_rpm": motor_rpm,
                    "engine_load_pct": round(random.uniform(5, 70), 1),
                    "coolant_temp_c": coolant_temp_c,
                    "oil_pressure_kpa": oil_pressure_kpa,
                    "fault_codes": fault_codes,
                    "encryption_status": encryption_status,
                    "can_bus_error_count": can_errors,
                    "unauthorized_access_attempts": auth_attempts,
                    "gps_lat": lat,
                    "gps_lng": lng,
                    "status": status,
                    "hv_battery_voltage": round(random.gauss(400, 8), 1),
                    "state_of_health_pct": round(max(70.0, 100 - v["charge_cycles"] / 40), 1),
                    "charging_state": charging_state,
                    "ambient_temp_c": round(random.uniform(5, 30), 1),
                    "network_strength_pct": round(0.0 if status == "OFFLINE" else random.uniform(55, 100), 1),
                    "driver_mode": driver_mode,
                    "regenerative_braking_active": status == "DRIVING" and random.random() < 0.3,
                    "connection_status": connection_status,
                }
            )
    return records


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    vehicles = make_vehicles()
    telemetry = make_telemetry(vehicles)

    (OUT_DIR / "vehicles.json").write_text(json.dumps(vehicles, indent=2))
    print(f"wrote {len(vehicles)} records to {OUT_DIR / 'vehicles.json'}")

    (OUT_DIR / "telemetry.json").write_text(json.dumps(telemetry, indent=2))
    print(f"wrote {len(telemetry)} records to {OUT_DIR / 'telemetry.json'}")


if __name__ == "__main__":
    main()
