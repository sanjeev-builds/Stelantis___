from pydantic import BaseModel, ConfigDict


class VehicleOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    vehicle_id: str
    model: str
    manufacture_year: int
    firmware_version: str
    mileage_km: float
    charge_cycles: int
