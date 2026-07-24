"""Loads datasets/mock/{vehicles,telemetry}.json into the DB and runs the
scoring engine over every reading so health_scores/alerts are populated from
the very first request. Runs once at startup (app/main.py) if the vehicles
table is empty - safe to call repeatedly.
"""

import json
import logging
from datetime import datetime
from pathlib import Path

from sqlalchemy.orm import Session

from app.db.models import Alert, HealthScore, MaintenanceLog, Telemetry, Vehicle
from app.scoring.health import battery_health_score, cybersecurity_score, vehicle_health_score
from app.scoring.predictive import evaluate_alerts
from app.services import ai_client

logger = logging.getLogger(__name__)


def _find_mock_data_dir() -> Path:
    candidates = [
        Path(__file__).resolve().parents[3] / "datasets" / "mock",  # local dev: repo root sibling
        Path("/datasets/mock"),  # docker compose volume/copy
    ]
    for candidate in candidates:
        if (candidate / "vehicles.json").exists():
            return candidate
    raise FileNotFoundError(
        "Could not find datasets/mock/vehicles.json - run "
        "`python datasets/generate_vehicle_health_data.py` from the repo root first."
    )


def seed_if_empty(db: Session) -> None:
    if db.query(Vehicle).first() is not None:
        logger.info("Database already seeded, skipping")
        return

    mock_dir = _find_mock_data_dir()
    vehicles_data = json.loads((mock_dir / "vehicles.json").read_text())
    telemetry_data = json.loads((mock_dir / "telemetry.json").read_text())
    logger.info("Seeding %d vehicles, %d telemetry readings", len(vehicles_data), len(telemetry_data))

    vehicles_by_id: dict[str, Vehicle] = {}
    for v in vehicles_data:
        vehicle = Vehicle(**v)
        db.add(vehicle)
        vehicles_by_id[v["vehicle_id"]] = vehicle
    db.flush()

    readings_by_vehicle: dict[str, list[dict]] = {}
    for t in telemetry_data:
        readings_by_vehicle.setdefault(t["vehicle_id"], []).append(t)

    for vehicle_id, readings in readings_by_vehicle.items():
        vehicle = vehicles_by_id[vehicle_id]
        readings.sort(key=lambda r: r["timestamp"])
        history: list[dict] = []

        for raw_reading in readings:
            reading = dict(raw_reading)
            telemetry = Telemetry(**{**reading, "timestamp": datetime.fromisoformat(reading["timestamp"])})
            db.add(telemetry)
            db.flush()  # need telemetry.id for the health_scores FK

            battery_score = battery_health_score(reading, vehicle)
            cyber_score = cybersecurity_score(reading, vehicle)
            overall_score = vehicle_health_score(reading, vehicle, battery_score, cyber_score)

            db.add(
                HealthScore(
                    vehicle_id=vehicle_id,
                    telemetry_id=telemetry.id,
                    vehicle_health_score=overall_score,
                    battery_health_score=battery_score,
                    cybersecurity_score=cyber_score,
                )
            )

            history.append(
                {
                    "battery_temp_c": reading["battery_temp_c"],
                    "can_bus_error_count": reading["can_bus_error_count"],
                    "coolant_temp_c": reading["coolant_temp_c"],
                    "oil_pressure_kpa": reading["oil_pressure_kpa"],
                    "battery_health_score": battery_score,
                    "vehicle_health_score": overall_score,
                }
            )

        latest_reading = dict(readings[-1])
        latest_scores = {
            "vehicle_health_score": history[-1]["vehicle_health_score"],
            "battery_health_score": history[-1]["battery_health_score"],
        }
        for alert_data in evaluate_alerts(history):
            db.add(Alert(vehicle_id=vehicle_id, resolved=0, **alert_data))

            # Mirrors predict_vehicle() in scoring_service.py so a fresh seed's
            # Maintenance page isn't empty - alerts and maintenance_logs must
            # be created together, one without the other leaves the
            # Maintenance page showing "nominal" for vehicles that clearly
            # have active alerts.
            ai_explanation = ai_client.explain_scores(
                {**latest_scores, "triggered_alert": alert_data["message"]}, latest_reading
            )
            db.add(
                MaintenanceLog(
                    vehicle_id=vehicle_id,
                    recommendation=alert_data["message"],
                    ai_explanation=ai_explanation,
                    urgency="URGENT" if alert_data["severity"] in ("HIGH", "CRITICAL") else "SOON",
                    source="RULE_ENGINE",
                )
            )

    db.commit()
    logger.info("Seed complete")
