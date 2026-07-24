from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import HealthScore, Vehicle
from app.db.session import get_db
from app.schemas.health import HealthScoreOut

router = APIRouter(prefix="/health", tags=["health-scores"])


@router.get("/{vehicle_id}", response_model=list[HealthScoreOut])
def list_health_scores(
    vehicle_id: str, limit: int = Query(100, ge=1, le=1000), db: Session = Depends(get_db)
) -> list[HealthScore]:
    if db.get(Vehicle, vehicle_id) is None:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    stmt = (
        select(HealthScore)
        .where(HealthScore.vehicle_id == vehicle_id)
        # id, not computed_at: bulk-seeded rows can share the same timestamp
        # at whatever resolution the platform clock gives us, but id is
        # guaranteed unique and monotonic with insertion (= telemetry) order.
        .order_by(HealthScore.id.desc())
        .limit(limit)
    )
    scores = list(db.scalars(stmt))
    return list(reversed(scores))  # oldest -> newest, ready for charting
