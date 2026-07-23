"""Generates realistic mock automotive JSON datasets for hackathon dev/demo use.

Stdlib only - no pip install needed. Run:
    python datasets/generate_mock_data.py [record_count]

Regenerate anytime (e.g. with more records, or after tweaking a schema) once
the real problem statement is known.
"""

import json
import random
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

OUT_DIR = Path(__file__).parent / "mock"


def vehicle_telemetry(n: int) -> list[dict]:
    now = datetime.now(timezone.utc)
    records = []
    for i in range(1, n + 1):
        records.append(
            {
                "id": i,
                "engine_temp": round(random.uniform(75, 115), 1),
                "battery_voltage": round(random.uniform(11.5, 14.4), 2),
                "rpm": random.randint(700, 6500),
                "speed": round(random.uniform(0, 140), 1),
                "fuel_level": round(random.uniform(2, 100), 1),
                "odometer": random.randint(500, 180000),
                "oil_pressure": round(random.uniform(20, 65), 1),
                "recorded_at": (now - timedelta(minutes=n - i)).isoformat(),
            }
        )
    return records


def battery_health(n: int) -> list[dict]:
    records = []
    for i in range(1, n + 1):
        cycles = random.randint(10, 1500)
        degradation = min(cycles / 2000, 0.4)
        records.append(
            {
                "id": i,
                "vehicle_id": random.randint(1, 50),
                "state_of_charge_pct": round(random.uniform(5, 100), 1),
                "state_of_health_pct": round((1 - degradation) * 100, 1),
                "charge_cycles": cycles,
                "battery_temp_c": round(random.uniform(15, 45), 1),
                "voltage": round(random.uniform(320, 410), 1),
                "fast_charge_count": random.randint(0, 300),
            }
        )
    return records


def predictive_maintenance(n: int) -> list[dict]:
    components = ["brake_pads", "timing_belt", "oil_filter", "battery", "alternator", "tires"]
    records = []
    for i in range(1, n + 1):
        wear_pct = round(random.uniform(0, 100), 1)
        records.append(
            {
                "id": i,
                "vehicle_id": random.randint(1, 50),
                "component": random.choice(components),
                "wear_pct": wear_pct,
                "predicted_failure_km": random.randint(500, 40000),
                "last_service_odometer": random.randint(0, 150000),
                "risk_level": "high" if wear_pct > 80 else "medium" if wear_pct > 50 else "low",
            }
        )
    return records


def fleet(n: int) -> list[dict]:
    statuses = ["active", "idle", "maintenance", "offline"]
    records = []
    for i in range(1, n + 1):
        records.append(
            {
                "id": i,
                "vehicle_id": i,
                "driver_id": random.randint(100, 199),
                "status": random.choice(statuses),
                "latitude": round(random.uniform(41.0, 49.0), 5),
                "longitude": round(random.uniform(-8.0, 20.0), 5),
                "daily_distance_km": round(random.uniform(0, 450), 1),
                "idle_time_minutes": random.randint(0, 240),
            }
        )
    return records


def main() -> None:
    n = int(sys.argv[1]) if len(sys.argv) > 1 else 100
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    datasets = {
        "vehicle_telemetry.json": vehicle_telemetry(n),
        "battery_health.json": battery_health(n),
        "predictive_maintenance.json": predictive_maintenance(n),
        "fleet.json": fleet(n),
    }

    for filename, records in datasets.items():
        path = OUT_DIR / filename
        path.write_text(json.dumps(records, indent=2))
        print(f"wrote {len(records)} records to {path}")


if __name__ == "__main__":
    main()
