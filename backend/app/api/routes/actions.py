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
from app.schemas.alert import AlertOut, PredictRequest
from app.schemas.chat import ChatRequest, ChatResponse
from app.schemas.fleet import FleetSummaryRow
from app.schemas.health import AnalyzeRequest, HealthScoreOut
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
