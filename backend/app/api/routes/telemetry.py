from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import Telemetry, Vehicle
from app.db.session import get_db
from app.schemas.telemetry import TelemetryOut

router = APIRouter(prefix="/telemetry", tags=["telemetry"])


@router.get("/{vehicle_id}", response_model=list[TelemetryOut])
def list_telemetry(
    vehicle_id: str,
    limit: int = Query(100, le=1000),
    since: datetime | None = None,
    db: Session = Depends(get_db),
) -> list[Telemetry]:
    if db.get(Vehicle, vehicle_id) is None:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    stmt = select(Telemetry).where(Telemetry.vehicle_id == vehicle_id)
    if since is not None:
        stmt = stmt.where(Telemetry.timestamp >= since)
    stmt = stmt.order_by(Telemetry.timestamp.desc()).limit(limit)

    readings = list(db.scalars(stmt))
    return list(reversed(readings))  # oldest -> newest, ready for charting
