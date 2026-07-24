import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import actions, alerts, auth, external, health, health_scores, maintenance, telemetry, vehicles
from app.core.config import get_settings
from app.core.logging import configure_logging
from app.db.seed import seed_if_empty
from app.db.session import Base, SessionLocal, engine

configure_logging()
logger = logging.getLogger(__name__)
settings = get_settings()

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api")
app.include_router(auth.router, prefix="/api")
app.include_router(vehicles.router, prefix="/api")
app.include_router(telemetry.router, prefix="/api")
app.include_router(health_scores.router, prefix="/api")
app.include_router(alerts.router, prefix="/api")
app.include_router(maintenance.router, prefix="/api")
app.include_router(actions.router, prefix="/api")
app.include_router(external.router, prefix="/api")


@app.on_event("startup")
def on_startup() -> None:
    # Creates tables if they don't exist yet - fine for hackathon speed.
    # Swap for Alembic migrations if the schema needs to evolve carefully.
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        seed_if_empty(db)
    logger.info("%s started", settings.app_name)
