from datetime import datetime

from pydantic import BaseModel, ConfigDict


class MaintenanceLogOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    vehicle_id: str
    recommendation: str
    ai_explanation: str
    urgency: str
    source: str
    created_at: datetime
