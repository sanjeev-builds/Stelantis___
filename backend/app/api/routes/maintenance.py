"""GET /maintenance/{vehicle_id} - not in the plan's API table, but the
Maintenance dashboard page it specifies needs a way to read maintenance_logs
rows, and nothing else in the plan provides one. Filling that gap the same
way charge_cycles/unauthorized_access_attempts fill gaps in the schema."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import MaintenanceLog, Vehicle
from app.db.session import get_db
from app.schemas.maintenance import MaintenanceLogOut

router = APIRouter(prefix="/maintenance", tags=["maintenance"])


@router.get("/{vehicle_id}", response_model=list[MaintenanceLogOut])
def list_maintenance_logs(
    vehicle_id: str, limit: int = Query(100, ge=1, le=1000), db: Session = Depends(get_db)
) -> list[MaintenanceLog]:
    if db.get(Vehicle, vehicle_id) is None:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    stmt = (
        select(MaintenanceLog)
        .where(MaintenanceLog.vehicle_id == vehicle_id)
        .order_by(MaintenanceLog.id.desc())
        .limit(limit)
    )
    return list(db.scalars(stmt))
