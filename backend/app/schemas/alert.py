from datetime import datetime

from pydantic import BaseModel, ConfigDict


class AlertOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    vehicle_id: str
    severity: str
    category: str
    message: str
    predicted_days_to_service: int
    created_at: datetime
    resolved: bool


class PredictRequest(BaseModel):
    vehicle_id: str
