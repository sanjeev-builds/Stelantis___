from pydantic import BaseModel


class RecallOut(BaseModel):
    campaign_number: str | None = None
    component: str | None = None
    summary: str | None = None
    consequence: str | None = None
    remedy: str | None = None
    report_date: str | None = None


class AmbientConditionsOut(BaseModel):
    temperature_c: float | None = None
    humidity_pct: float | None = None
    condition: str


class ChargingStationOut(BaseModel):
    name: str | None = None
    address: str | None = None
    town: str | None = None
    distance_km: float | None = None
    num_points: int | None = None
    operator: str | None = None


class ChargingStationsResponse(BaseModel):
    configured: bool
    stations: list[ChargingStationOut]
