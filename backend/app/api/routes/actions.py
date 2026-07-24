"""POST /analyze, /predict, /chat - cross-cutting actions that don't belong
to one resource. Kept as one small router rather than three near-empty
files."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.models import Alert, HealthScore, MaintenanceLog, Telemetry, Vehicle
from app.db.seed import seed_if_empty
from app.db.session import get_db
from app.scoring.config import BATTERY_WEIGHTS, LATEST_FIRMWARE_VERSION
from app.scoring.health import cybersecurity_score, normalize, vehicle_health_score
from app.scoring.predictive import evaluate_alerts

# The real battery_health_score() formula scores battery_voltage against the
# 12V accessory battery (NOMINAL_BATTERY_VOLTAGE=12.6 in scoring/config.py) -
# correct for real ingested telemetry, but the Simulator UI's slider models
# the HV traction pack (default 380V). Reusing the 12V nominal here would
# score every realistic HV value as maximally deviated. This is a
# simulate-only substitute for the voltage sub-score; the persisted /analyze
# path is untouched.
_SIMULATOR_HV_NOMINAL_VOLTAGE = 400.0
_SIMULATOR_HV_VOLTAGE_DEVIATION_THRESHOLDS = (0.0, 60.0)
from app.schemas.alert import AlertOut, PredictRequest
from app.schemas.chat import ChatRequest, ChatResponse
from app.schemas.fleet import FleetSummaryRow
from app.schemas.health import AnalyzeRequest, HealthScoreOut
from app.schemas.simulate import SimulateRequest, SimulateResponse
from app.schemas.vehicle import VehicleOut
from app.services import ai_client
from app.services.scoring_service import (
    NoTelemetryError,
    VehicleNotFoundError,
    analyze_vehicle,
    build_vehicle_context,
    predict_vehicle,
)

router = APIRouter(tags=["actions"])


@router.post("/simulate", response_model=SimulateResponse)
def simulate(payload: SimulateRequest) -> SimulateResponse:
    """Stateless what-if scoring: run the same deterministic engine used by
    /analyze on hypothetical values, no vehicle or DB row required. Backs the
    Simulator page - nothing here is persisted."""
    telemetry = {
        "battery_pct": payload.battery_pct,
        "battery_voltage": payload.battery_voltage,
        "battery_temp_c": payload.battery_temp_c,
        "ecu_temp_c": payload.ecu_temp_c,
        "cpu_usage_pct": payload.cpu_usage_pct,
        "ram_usage_pct": payload.ram_usage_pct,
        "coolant_temp_c": payload.coolant_temp_c,
        "oil_pressure_kpa": payload.oil_pressure_kpa,
        "engine_load_pct": payload.engine_load_pct,
        "fault_codes": payload.fault_codes,
        "encryption_status": payload.encryption_status,
        "can_bus_error_count": payload.can_bus_error_count,
        "unauthorized_access_attempts": payload.auth_attempts,
    }
    vehicle = {
        "charge_cycles": payload.charge_cycles,
        "mileage_km": payload.mileage_km,
        "firmware_version": payload.firmware_version or LATEST_FIRMWARE_VERSION,
    }
    # Inline battery formula (mirrors scoring.health.battery_health_score)
    # substituting an HV-appropriate voltage sub-score - see the module-level
    # comment on _SIMULATOR_HV_NOMINAL_VOLTAGE above.
    charge_score = max(0.0, min(100.0, payload.battery_pct))
    voltage_deviation = abs(payload.battery_voltage - _SIMULATOR_HV_NOMINAL_VOLTAGE)
    voltage_score = normalize(voltage_deviation, *_SIMULATOR_HV_VOLTAGE_DEVIATION_THRESHOLDS)
    temp_score = normalize(payload.battery_temp_c, 25.0, 60.0)
    cycle_score = normalize(payload.charge_cycles, 0, 1500)
    age_score = normalize(payload.mileage_km, 0, 200_000)
    w = BATTERY_WEIGHTS
    battery = round(
        w["charge"] * charge_score
        + w["voltage"] * voltage_score
        + w["temp"] * temp_score
        + w["cycles"] * cycle_score
        + w["age"] * age_score,
        2,
    )
    cyber = cybersecurity_score(telemetry, vehicle)
    overall = vehicle_health_score(telemetry, vehicle, battery, cyber)

    triggered = evaluate_alerts(
        [
            {
                **telemetry,
                "battery_health_score": battery,
                "vehicle_health_score": overall,
            }
        ]
    )
    # Deterministic, not Gemini: the frontend re-runs /simulate on every
    # slider tick, so a synchronous AI call here would make every keystroke
    # wait on the network and would exhaust the same tight Gemini quota
    # /chat and /predict need. Matches /analyze's own rule of never putting
    # AI in a hot, high-frequency path.
    worst = min(("battery", battery), ("cybersecurity", cyber), ("overall", overall), key=lambda pair: pair[1])
    if triggered:
        summary = f"{len(triggered)} predictive alert(s) triggered - most urgent: {triggered[0]['message']}"
    elif worst[1] < 70:
        summary = f"{worst[0].capitalize()} score is the weakest area at {worst[1]:.0f}/100; no threshold alerts triggered yet."
    else:
        summary = f"All scores nominal (lowest is {worst[0]} at {worst[1]:.0f}/100). No predictive alerts triggered."
    return SimulateResponse(
        vehicle_health_score=overall,
        battery_health_score=battery,
        cybersecurity_score=cyber,
        ai_summary=summary,
        triggered_alerts=triggered,
    )


@router.get("/summary/{vehicle_id}")
def vehicle_summary(vehicle_id: str, db: Session = Depends(get_db)) -> dict[str, str]:
    """Plain-language AI summary of a vehicle's current state - backs the
    vehicle detail page's 'Gemini AI Diagnostic Summary' card."""
    try:
        context = build_vehicle_context(db, vehicle_id)
    except VehicleNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Vehicle not found") from exc
    summary = ai_client.chat(context, "Give a concise 2-3 sentence health summary and any recommended action.")
    return {"summary": summary}


@router.post("/analyze", response_model=HealthScoreOut)
def analyze(payload: AnalyzeRequest, db: Session = Depends(get_db)) -> HealthScore:
    try:
        return analyze_vehicle(db, payload.vehicle_id)
    except VehicleNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Vehicle not found") from exc
    except NoTelemetryError as exc:
        raise HTTPException(status_code=422, detail="No telemetry available for this vehicle") from exc


@router.post("/predict", response_model=list[AlertOut])
def predict(payload: PredictRequest, db: Session = Depends(get_db)) -> list[Alert]:
    try:
        return predict_vehicle(db, payload.vehicle_id)
    except VehicleNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Vehicle not found") from exc
    except NoTelemetryError as exc:
        raise HTTPException(status_code=422, detail="No telemetry available for this vehicle") from exc


@router.post("/chat", response_model=ChatResponse)
def chat(payload: ChatRequest, db: Session = Depends(get_db)) -> ChatResponse:
    try:
        context = build_vehicle_context(db, payload.vehicle_id)
    except VehicleNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Vehicle not found") from exc

    answer = ai_client.chat(context, payload.question)
    return ChatResponse(answer=answer)


@router.get("/fleet-summary", response_model=list[FleetSummaryRow])
def fleet_summary(db: Session = Depends(get_db)) -> list[FleetSummaryRow]:
    """Not in the plan's API table. Audit found the Dashboard fetching 2
    endpoints per vehicle (N+1) - 2,000+ round trips at 1,000 vehicles, with
    no bulk endpoint anywhere in the API. This returns the whole fleet's
    latest scores + active alert counts in 3 fixed-cost queries total,
    regardless of fleet size, instead of O(vehicles)."""
    vehicles = list(db.scalars(select(Vehicle).order_by(Vehicle.vehicle_id)))

    row_number = func.row_number().over(partition_by=HealthScore.vehicle_id, order_by=HealthScore.id.desc())
    ranked = select(HealthScore, row_number.label("rn")).subquery()
    latest_score_rows = db.execute(select(ranked).where(ranked.c.rn == 1)).all()
    latest_scores = {row.vehicle_id: row for row in latest_score_rows}

    alert_count_rows = db.execute(
        select(Alert.vehicle_id, func.count().label("count")).where(Alert.resolved == 0).group_by(Alert.vehicle_id)
    ).all()
    alert_counts = {row.vehicle_id: row.count for row in alert_count_rows}

    telemetry_row_number = func.row_number().over(partition_by=Telemetry.vehicle_id, order_by=Telemetry.id.desc())
    ranked_telemetry = select(Telemetry.vehicle_id, Telemetry.status, telemetry_row_number.label("rn")).subquery()
    latest_status_rows = db.execute(select(ranked_telemetry).where(ranked_telemetry.c.rn == 1)).all()
    latest_statuses = {row.vehicle_id: row.status for row in latest_status_rows}

    summary: list[FleetSummaryRow] = []
    for vehicle in vehicles:
        score_row = latest_scores.get(vehicle.vehicle_id)
        latest_score = (
            HealthScoreOut(
                id=score_row.id,
                vehicle_id=score_row.vehicle_id,
                telemetry_id=score_row.telemetry_id,
                vehicle_health_score=score_row.vehicle_health_score,
                battery_health_score=score_row.battery_health_score,
                cybersecurity_score=score_row.cybersecurity_score,
                computed_at=score_row.computed_at,
            )
            if score_row is not None
            else None
        )
        summary.append(
            FleetSummaryRow(
                vehicle=VehicleOut.model_validate(vehicle),
                latest_score=latest_score,
                active_alert_count=alert_counts.get(vehicle.vehicle_id, 0),
                latest_status=latest_statuses.get(vehicle.vehicle_id),
            )
        )
    return summary


@router.post("/reset-demo-data")
def reset_demo_data(db: Session = Depends(get_db), _user: str = Depends(get_current_user)) -> dict[str, str]:
    """Not in the plan's API table - backs the Settings page's "regenerate
    mock data" button, which the plan's wireframe calls for but never gives
    an endpoint. Wipes and reseeds from datasets/mock/, demo-only.

    Requires a valid bearer token - audit found this endpoint had zero auth
    and could wipe the whole DB with a single unauthenticated request."""
    db.query(MaintenanceLog).delete()
    db.query(Alert).delete()
    db.query(HealthScore).delete()
    db.query(Telemetry).delete()
    db.query(Vehicle).delete()
    db.commit()
    seed_if_empty(db)
    return {"status": "reset"}
