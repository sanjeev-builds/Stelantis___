from datetime import datetime

from pydantic import BaseModel, ConfigDict


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
