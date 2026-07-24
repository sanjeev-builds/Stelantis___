from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class TelemetryIn(BaseModel):
    """Ingestion schema - the plan never specified one, and without it there
    was no way to actually collect telemetry (only replay the seeded mock
    data). Field bounds are physically-plausible ranges for automotive
    sensors, not just type checks: audit found an unvalidated -999999C
    reading was silently scored as a "perfect" battery temperature instead
    of being rejected as an impossible/faulty sensor value."""

    vehicle_id: str
    timestamp: datetime | None = None  # defaults to now if omitted

    battery_pct: float = Field(ge=0, le=100)
    battery_voltage: float = Field(ge=0, le=20, description="12V accessory battery, not the HV traction pack")
    battery_temp_c: float = Field(ge=-40, le=100)
    ecu_temp_c: float = Field(ge=-40, le=150)
    cpu_usage_pct: float = Field(ge=0, le=100)
    ram_usage_pct: float = Field(ge=0, le=100)
    speed_kmh: float = Field(ge=0, le=300)
    motor_rpm: int = Field(ge=0, le=20000)
    engine_load_pct: float = Field(ge=0, le=100)
    coolant_temp_c: float = Field(ge=-40, le=150)
    oil_pressure_kpa: float = Field(ge=0, le=1000)
    fault_codes: list[str] = Field(default_factory=list)
    encryption_status: Literal["ENABLED", "DISABLED"]
    can_bus_error_count: int = Field(ge=0, le=100_000)
    unauthorized_access_attempts: int = Field(ge=0, le=100_000)
    gps_lat: float = Field(ge=-90, le=90)
    gps_lng: float = Field(ge=-180, le=180)


class TelemetryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    vehicle_id: str
    timestamp: datetime
    battery_pct: float
    battery_voltage: float
    battery_temp_c: float
    ecu_temp_c: float
    cpu_usage_pct: float
    ram_usage_pct: float
    speed_kmh: float
    motor_rpm: int
    engine_load_pct: float
    coolant_temp_c: float
    oil_pressure_kpa: float
    fault_codes: list[str]
    encryption_status: str
    can_bus_error_count: int
    unauthorized_access_attempts: int
    gps_lat: float
    gps_lng: float
