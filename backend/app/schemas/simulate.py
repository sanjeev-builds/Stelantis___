from pydantic import BaseModel, Field


class SimulateRequest(BaseModel):
    """What-if scoring: run the deterministic engine on hypothetical sensor
    values with nothing persisted and no existing vehicle required. Field
    names/ranges intentionally mirror TelemetryIn where they overlap."""

    model: str = "Unnamed Vehicle"
    battery_pct: float = Field(ge=0, le=100)
    # The simulator UI's slider models the HV traction pack (300-800V class,
    # default 380), not the 12V accessory battery TelemetryIn's field means -
    # see NOMINAL_BATTERY_VOLTAGE in scoring/config.py. Scored against a
    # simulator-specific HV nominal below, not the 12V one.
    battery_voltage: float = Field(ge=0, le=900)
    battery_temp_c: float = Field(ge=-40, le=100)
    ecu_temp_c: float = Field(ge=-40, le=150)
    cpu_usage_pct: float = Field(ge=0, le=100)
    ram_usage_pct: float = Field(ge=0, le=100)
    coolant_temp_c: float = Field(ge=-40, le=150)
    oil_pressure_kpa: float = Field(ge=0, le=1000)
    engine_load_pct: float = Field(ge=0, le=100)
    encryption_status: str = "ENABLED"
    can_bus_error_count: int = Field(ge=0)
    auth_attempts: int = Field(ge=0)
    mileage_km: float = Field(ge=0)
    fault_codes: list[str] = []
    # Not collected by the simulator UI - defaulted to a best-case new
    # vehicle so they don't silently tank the score with a false "old and
    # unpatched" signal the user never asked to simulate.
    charge_cycles: int = Field(default=0, ge=0)
    firmware_version: int | None = None


class SimulatedAlert(BaseModel):
    category: str
    severity: str
    message: str
    predicted_days_to_service: int


class SimulateResponse(BaseModel):
    vehicle_health_score: float
    battery_health_score: float
    cybersecurity_score: float
    ai_summary: str
    triggered_alerts: list[SimulatedAlert]
