from datetime import datetime

from pydantic import BaseModel, ConfigDict


class VehicleTelemetryBase(BaseModel):
    engine_temp: float
    battery_voltage: float
    rpm: int
    speed: float
    fuel_level: float
    odometer: int
    oil_pressure: float


class VehicleTelemetryCreate(VehicleTelemetryBase):
    pass


class VehicleTelemetryOut(VehicleTelemetryBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    recorded_at: datetime
