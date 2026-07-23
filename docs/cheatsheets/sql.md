# SQL / SQLAlchemy Cheat Sheet

## Defining a model (see `backend/app/db/models.py` for the real example)
```python
from sqlalchemy import Integer, Float
from sqlalchemy.orm import Mapped, mapped_column
from app.db.session import Base

class Thing(Base):
    __tablename__ = "things"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    value: Mapped[float] = mapped_column(Float)
```
Tables auto-create on backend startup — no migration step needed for hackathon speed.

## Querying (ORM style used throughout this repo)
```python
from sqlalchemy import select
db.scalars(select(Thing).limit(50)).all()
db.scalars(select(Thing).where(Thing.value > 100)).all()
db.get(Thing, thing_id)                      # get by primary key
```

## Raw SQL quick reference (if you need it)
```sql
SELECT * FROM vehicle_telemetry ORDER BY recorded_at DESC LIMIT 10;
SELECT risk_level, COUNT(*) FROM predictive_maintenance GROUP BY risk_level;
```

## Connecting via psql inside the Docker container
```bash
docker compose exec db psql -U hackathon -d hackathon
```
