import json
from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Vehicle(Base):
    """One row per simulated vehicle. See docs/Vehicle-Health-Dashboard-Plan.md Step 3."""

    __tablename__ = "vehicles"

    vehicle_id: Mapped[str] = mapped_column(String, primary_key=True)
    model: Mapped[str] = mapped_column(String, nullable=False)
    manufacture_year: Mapped[int] = mapped_column(Integer)
    firmware_version: Mapped[str] = mapped_column(String)
    mileage_km: Mapped[float] = mapped_column(Float)
    # Battery age proxy the scoring formula needs; kept here (not on
    # telemetry) since it changes slowly, like mileage_km.
    charge_cycles: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)


class Telemetry(Base):
    """Raw ECU readings, many rows per vehicle (time series)."""

    __tablename__ = "telemetry"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    vehicle_id: Mapped[str] = mapped_column(String, ForeignKey("vehicles.vehicle_id"), index=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    battery_pct: Mapped[float] = mapped_column(Float)
    battery_voltage: Mapped[float] = mapped_column(Float)
    battery_temp_c: Mapped[float] = mapped_column(Float)
    ecu_temp_c: Mapped[float] = mapped_column(Float)
    cpu_usage_pct: Mapped[float] = mapped_column(Float)
    ram_usage_pct: Mapped[float] = mapped_column(Float)
    speed_kmh: Mapped[float] = mapped_column(Float)
    motor_rpm: Mapped[int] = mapped_column(Integer)
    engine_load_pct: Mapped[float] = mapped_column(Float)
    coolant_temp_c: Mapped[float] = mapped_column(Float)
    oil_pressure_kpa: Mapped[float] = mapped_column(Float)
    fault_codes_json: Mapped[str] = mapped_column("fault_codes", Text, default="[]")
    encryption_status: Mapped[str] = mapped_column(String, default="ENABLED")
    can_bus_error_count: Mapped[int] = mapped_column(Integer, default=0)
    # Cybersecurity score input the plan's formula needs; kept per-reading
    # like can_bus_error_count.
    unauthorized_access_attempts: Mapped[int] = mapped_column(Integer, default=0)
    gps_lat: Mapped[float] = mapped_column(Float)
    gps_lng: Mapped[float] = mapped_column(Float)

    @property
    def fault_codes(self) -> list[str]:
        return json.loads(self.fault_codes_json) if self.fault_codes_json else []

    @fault_codes.setter
    def fault_codes(self, codes: list[str]) -> None:
        self.fault_codes_json = json.dumps(codes)


class HealthScore(Base):
    """Computed score snapshot per telemetry read."""

    __tablename__ = "health_scores"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    vehicle_id: Mapped[str] = mapped_column(String, ForeignKey("vehicles.vehicle_id"), index=True)
    telemetry_id: Mapped[int] = mapped_column(Integer, ForeignKey("telemetry.id"))
    vehicle_health_score: Mapped[float] = mapped_column(Float)
    battery_health_score: Mapped[float] = mapped_column(Float)
    cybersecurity_score: Mapped[float] = mapped_column(Float)
    computed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)


class Alert(Base):
    """Predictive/rule-triggered warning."""

    __tablename__ = "alerts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    vehicle_id: Mapped[str] = mapped_column(String, ForeignKey("vehicles.vehicle_id"), index=True)
    severity: Mapped[str] = mapped_column(String)  # LOW | MEDIUM | HIGH | CRITICAL
    category: Mapped[str] = mapped_column(String)  # BATTERY | ECU | CYBERSECURITY | MECHANICAL
    message: Mapped[str] = mapped_column(Text)
    predicted_days_to_service: Mapped[int] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
    resolved: Mapped[int] = mapped_column(Integer, default=0)


class MaintenanceLog(Base):
    """AI + rule-generated recommendations, and (mock) service history."""

    __tablename__ = "maintenance_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    vehicle_id: Mapped[str] = mapped_column(String, ForeignKey("vehicles.vehicle_id"), index=True)
    recommendation: Mapped[str] = mapped_column(Text)
    ai_explanation: Mapped[str] = mapped_column(Text, default="")
    urgency: Mapped[str] = mapped_column(String)  # ROUTINE | SOON | URGENT
    source: Mapped[str] = mapped_column(String)  # RULE_ENGINE | GEMINI
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)


class User(Base):
    """Demo auth (owner/fleet-manager roles)."""

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String, unique=True)
    hashed_password: Mapped[str] = mapped_column(String)
    role: Mapped[str] = mapped_column(String)  # OWNER | FLEET_MANAGER | ADMIN
    vehicle_id: Mapped[str | None] = mapped_column(String, ForeignKey("vehicles.vehicle_id"), nullable=True)
