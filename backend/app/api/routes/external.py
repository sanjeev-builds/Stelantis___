"""Real-world context endpoints backed by free public APIs - recalls, ambient
weather, nearby charging. Additive only: none of this feeds the deterministic
scoring engine (app/scoring/). See app/services/external_apis.py.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import Telemetry, Vehicle
from app.db.session import get_db
from app.schemas.external import AmbientConditionsOut, ChargingStationsResponse, RecallOut
from app.services import external_apis

router = APIRouter(prefix="/vehicles", tags=["external"])


def _get_vehicle_or_404(db: Session, vehicle_id: str) -> Vehicle:
    vehicle = db.get(Vehicle, vehicle_id)
    if vehicle is None:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle


def _latest_gps_or_404(db: Session, vehicle_id: str) -> tuple[float, float]:
    telemetry = db.scalars(
        select(Telemetry).where(Telemetry.vehicle_id == vehicle_id).order_by(Telemetry.timestamp.desc())
    ).first()
    if telemetry is None:
        raise HTTPException(status_code=422, detail="No telemetry available for this vehicle")
    return telemetry.gps_lat, telemetry.gps_lng


@router.get("/{vehicle_id}/recalls", response_model=list[RecallOut])
def vehicle_recalls(vehicle_id: str, db: Session = Depends(get_db)) -> list[dict]:
    vehicle = _get_vehicle_or_404(db, vehicle_id)
    return external_apis.get_recalls(vehicle.model, vehicle.manufacture_year)


@router.get("/{vehicle_id}/environment", response_model=AmbientConditionsOut)
def vehicle_environment(vehicle_id: str, db: Session = Depends(get_db)) -> dict:
    _get_vehicle_or_404(db, vehicle_id)
    lat, lng = _latest_gps_or_404(db, vehicle_id)
    conditions = external_apis.get_ambient_conditions(lat, lng)
    if conditions is None:
        raise HTTPException(status_code=502, detail="Weather lookup unavailable right now")
    return conditions


@router.get("/{vehicle_id}/charging-stations", response_model=ChargingStationsResponse)
def vehicle_charging_stations(vehicle_id: str, db: Session = Depends(get_db)) -> dict:
    _get_vehicle_or_404(db, vehicle_id)
    lat, lng = _latest_gps_or_404(db, vehicle_id)
    return external_apis.get_nearby_charging_stations(lat, lng)
