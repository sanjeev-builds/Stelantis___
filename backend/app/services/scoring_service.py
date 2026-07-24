"""Wires the pure scoring/predictive functions (app/scoring/) to the DB and
to the Gemini explanation layer. Used by both the seed script and the
/analyze, /predict API routes so there's one place that defines "how a
telemetry reading becomes stored scores and alerts."
"""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import Alert, HealthScore, MaintenanceLog, Telemetry, Vehicle
from app.scoring.config import PREDICTIVE
from app.scoring.health import battery_health_score, cybersecurity_score, vehicle_health_score
from app.scoring.predictive import evaluate_alerts
from app.services import ai_client


class VehicleNotFoundError(ValueError):
    pass


class NoTelemetryError(ValueError):
    pass


def _telemetry_dict(t: Telemetry) -> dict:
    return {
        "battery_pct": t.battery_pct,
        "battery_voltage": t.battery_voltage,
        "battery_temp_c": t.battery_temp_c,
        "ecu_temp_c": t.ecu_temp_c,
        "cpu_usage_pct": t.cpu_usage_pct,
        "ram_usage_pct": t.ram_usage_pct,
        "coolant_temp_c": t.coolant_temp_c,
        "oil_pressure_kpa": t.oil_pressure_kpa,
        "engine_load_pct": t.engine_load_pct,
        "fault_codes": t.fault_codes,
        "encryption_status": t.encryption_status,
        "can_bus_error_count": t.can_bus_error_count,
        "unauthorized_access_attempts": t.unauthorized_access_attempts,
    }


def _get_vehicle(db: Session, vehicle_id: str) -> Vehicle:
    vehicle = db.get(Vehicle, vehicle_id)
    if vehicle is None:
        raise VehicleNotFoundError(vehicle_id)
    return vehicle


def analyze_vehicle(db: Session, vehicle_id: str) -> HealthScore:
    """Run the scoring engine on a vehicle's latest telemetry, persist the result."""
    vehicle = _get_vehicle(db, vehicle_id)
    telemetry = db.scalars(
        select(Telemetry).where(Telemetry.vehicle_id == vehicle_id).order_by(Telemetry.timestamp.desc())
    ).first()
    if telemetry is None:
        raise NoTelemetryError(vehicle_id)

    reading = _telemetry_dict(telemetry)
    battery_score = battery_health_score(reading, vehicle)
    cyber_score = cybersecurity_score(reading, vehicle)
    overall_score = vehicle_health_score(reading, vehicle, battery_score, cyber_score)

    health_score = HealthScore(
        vehicle_id=vehicle_id,
        telemetry_id=telemetry.id,
        vehicle_health_score=overall_score,
        battery_health_score=battery_score,
        cybersecurity_score=cyber_score,
    )
    db.add(health_score)
    db.commit()
    db.refresh(health_score)
    return health_score


def predict_vehicle(db: Session, vehicle_id: str) -> list[Alert]:
    """Run the predictive rule engine over recent telemetry, create alerts +
    maintenance_logs rows for anything that fires (plan Steps 4-7)."""
    vehicle = _get_vehicle(db, vehicle_id)

    window = max(
        PREDICTIVE["battery_temp_trend_window"],
        PREDICTIVE["can_error_trend_window"] + 1,
        PREDICTIVE["health_score_drop_window"],
    )
    recent_desc = db.scalars(
        select(Telemetry)
        .where(Telemetry.vehicle_id == vehicle_id)
        .order_by(Telemetry.timestamp.desc())
        .limit(window)
    ).all()
    if not recent_desc:
        raise NoTelemetryError(vehicle_id)
    readings = list(reversed(recent_desc))  # oldest -> newest

    history = []
    for t in readings:
        reading = _telemetry_dict(t)
        battery_score = battery_health_score(reading, vehicle)
        overall_score = vehicle_health_score(reading, vehicle, battery_score)
        history.append(
            {
                "battery_temp_c": t.battery_temp_c,
                "can_bus_error_count": t.can_bus_error_count,
                "coolant_temp_c": t.coolant_temp_c,
                "oil_pressure_kpa": t.oil_pressure_kpa,
                "battery_health_score": battery_score,
                "vehicle_health_score": overall_score,
            }
        )

    latest_reading = _telemetry_dict(readings[-1])
    latest_scores = {
        "vehicle_health_score": history[-1]["vehicle_health_score"],
        "battery_health_score": history[-1]["battery_health_score"],
    }

    created: list[Alert] = []
    for alert_data in evaluate_alerts(history):
        alert = Alert(vehicle_id=vehicle_id, resolved=0, **alert_data)
        db.add(alert)
        created.append(alert)

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
    for alert in created:
        db.refresh(alert)
    return created


def build_vehicle_context(db: Session, vehicle_id: str) -> str:
    """Plain-text summary of a vehicle's current state, passed to Gemini as
    context for /chat - not a vector search, just the structured data
    directly (plan Step 2: Gemini never computes scores, only explains)."""
    vehicle = _get_vehicle(db, vehicle_id)
    telemetry = db.scalars(
        select(Telemetry).where(Telemetry.vehicle_id == vehicle_id).order_by(Telemetry.timestamp.desc())
    ).first()
    latest_score = db.scalars(
        select(HealthScore).where(HealthScore.vehicle_id == vehicle_id).order_by(HealthScore.id.desc())
    ).first()
    active_alerts = db.scalars(
        select(Alert).where(Alert.vehicle_id == vehicle_id, Alert.resolved == 0)
    ).all()

    lines = [
        f"Vehicle {vehicle.vehicle_id}: {vehicle.model}, {vehicle.manufacture_year}, "
        f"{vehicle.mileage_km:.0f} km, firmware {vehicle.firmware_version}.",
    ]
    if telemetry:
        lines.append(
            f"Latest telemetry ({telemetry.timestamp.isoformat()}): "
            f"battery {telemetry.battery_pct:.0f}% at {telemetry.battery_temp_c:.1f}C, "
            f"coolant {telemetry.coolant_temp_c:.1f}C, oil pressure {telemetry.oil_pressure_kpa:.0f}kPa, "
            f"CAN bus errors {telemetry.can_bus_error_count}, "
            f"encryption {telemetry.encryption_status}, fault codes {telemetry.fault_codes or 'none'}."
        )
    if latest_score:
        lines.append(
            f"Latest scores: overall {latest_score.vehicle_health_score:.0f}/100, "
            f"battery {latest_score.battery_health_score:.0f}/100, "
            f"cybersecurity {latest_score.cybersecurity_score:.0f}/100."
        )
    if active_alerts:
        lines.append("Active alerts: " + "; ".join(f"[{a.severity}/{a.category}] {a.message}" for a in active_alerts))
    else:
        lines.append("No active alerts.")

    return "\n".join(lines)
