from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import Telemetry, Vehicle
from app.db.session import get_db
from app.schemas.telemetry import TelemetryIn, TelemetryOut

router = APIRouter(prefix="/telemetry", tags=["telemetry"])


@router.post("", response_model=TelemetryOut, status_code=status.HTTP_201_CREATED)
def ingest_telemetry(payload: TelemetryIn, db: Session = Depends(get_db)) -> Telemetry:
    """Not in the plan's API table. Without this, the system could only
    replay the static seeded dataset - it had no way to actually "collect
    vehicle telemetry" as the problem statement requires. Pydantic enforces
    physically-plausible ranges (see TelemetryIn) before anything reaches
    the scoring engine."""
    if db.get(Vehicle, payload.vehicle_id) is None:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    telemetry = Telemetry(
        vehicle_id=payload.vehicle_id,
        timestamp=payload.timestamp or datetime.now(timezone.utc),
        battery_pct=payload.battery_pct,
        battery_voltage=payload.battery_voltage,
        battery_temp_c=payload.battery_temp_c,
        ecu_temp_c=payload.ecu_temp_c,
        cpu_usage_pct=payload.cpu_usage_pct,
        ram_usage_pct=payload.ram_usage_pct,
        speed_kmh=payload.speed_kmh,
        motor_rpm=payload.motor_rpm,
        engine_load_pct=payload.engine_load_pct,
        coolant_temp_c=payload.coolant_temp_c,
        oil_pressure_kpa=payload.oil_pressure_kpa,
        encryption_status=payload.encryption_status,
        can_bus_error_count=payload.can_bus_error_count,
        unauthorized_access_attempts=payload.unauthorized_access_attempts,
        gps_lat=payload.gps_lat,
        gps_lng=payload.gps_lng,
    )
    telemetry.fault_codes = payload.fault_codes
    db.add(telemetry)
    db.commit()
    db.refresh(telemetry)
    return telemetry


@router.get("/{vehicle_id}", response_model=list[TelemetryOut])
def list_telemetry(
    vehicle_id: str,
    limit: int = Query(100, ge=1, le=1000),
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
