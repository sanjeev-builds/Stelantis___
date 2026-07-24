from datetime import datetime

from pydantic import BaseModel, ConfigDict


class HealthScoreOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    vehicle_id: str
    telemetry_id: int
    vehicle_health_score: float
    battery_health_score: float
    cybersecurity_score: float
    computed_at: datetime


class AnalyzeRequest(BaseModel):
    vehicle_id: str
