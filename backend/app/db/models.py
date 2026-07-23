from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, Integer
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class VehicleTelemetry(Base):
    """Example model matching datasets/mock/vehicle_telemetry.json - copy this pattern
    for whatever entity the actual hackathon problem statement needs."""

    __tablename__ = "vehicle_telemetry"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    engine_temp: Mapped[float] = mapped_column(Float)
    battery_voltage: Mapped[float] = mapped_column(Float)
    rpm: Mapped[int] = mapped_column(Integer)
    speed: Mapped[float] = mapped_column(Float)
    fuel_level: Mapped[float] = mapped_column(Float)
    odometer: Mapped[int] = mapped_column(Integer)
    oil_pressure: Mapped[float] = mapped_column(Float)
    recorded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
