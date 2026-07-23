from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import VehicleTelemetry
from app.db.session import get_db
from app.schemas.vehicle import VehicleTelemetryCreate, VehicleTelemetryOut

router = APIRouter(prefix="/vehicles", tags=["vehicles"])


@router.get("/", response_model=list[VehicleTelemetryOut])
def list_telemetry(db: Session = Depends(get_db), limit: int = 50) -> list[VehicleTelemetry]:
    return list(db.scalars(select(VehicleTelemetry).limit(limit)))


@router.post("/", response_model=VehicleTelemetryOut)
def create_telemetry(
    payload: VehicleTelemetryCreate, db: Session = Depends(get_db)
) -> VehicleTelemetry:
    record = VehicleTelemetry(**payload.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record
