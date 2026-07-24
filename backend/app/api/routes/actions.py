"""POST /analyze, /predict, /chat - cross-cutting actions that don't belong
to one resource. Kept as one small router rather than three near-empty
files."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.models import Alert, HealthScore, MaintenanceLog, Telemetry, Vehicle
from app.db.seed import seed_if_empty
from app.db.session import get_db
from app.schemas.alert import AlertOut, PredictRequest
from app.schemas.chat import ChatRequest, ChatResponse
from app.schemas.health import AnalyzeRequest, HealthScoreOut
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


@router.post("/reset-demo-data")
def reset_demo_data(db: Session = Depends(get_db)) -> dict[str, str]:
    """Not in the plan's API table - backs the Settings page's "regenerate
    mock data" button, which the plan's wireframe calls for but never gives
    an endpoint. Wipes and reseeds from datasets/mock/, demo-only."""
    db.query(MaintenanceLog).delete()
    db.query(Alert).delete()
    db.query(HealthScore).delete()
    db.query(Telemetry).delete()
    db.query(Vehicle).delete()
    db.commit()
    seed_if_empty(db)
    return {"status": "reset"}
