from pydantic import BaseModel

from app.schemas.health import HealthScoreOut
from app.schemas.vehicle import VehicleOut


class FleetSummaryRow(BaseModel):
    vehicle: VehicleOut
    latest_score: HealthScoreOut | None
    active_alert_count: int
