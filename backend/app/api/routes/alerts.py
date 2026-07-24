from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import Alert, Vehicle
from app.db.session import get_db
from app.schemas.alert import AlertOut

router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.get("/{vehicle_id}", response_model=list[AlertOut])
def list_alerts(
    vehicle_id: str, limit: int = Query(100, ge=1, le=1000), db: Session = Depends(get_db)
) -> list[Alert]:
    if db.get(Vehicle, vehicle_id) is None:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    stmt = select(Alert).where(Alert.vehicle_id == vehicle_id).order_by(Alert.id.desc()).limit(limit)
    return list(db.scalars(stmt))
