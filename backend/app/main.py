import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import auth, health, vehicles
from app.core.config import get_settings
from app.core.logging import configure_logging
from app.db.session import Base, engine

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


@app.on_event("startup")
def on_startup() -> None:
    # Creates tables if they don't exist yet - fine for hackathon speed.
    # Swap for Alembic migrations if the schema needs to evolve carefully.
    Base.metadata.create_all(bind=engine)
    logger.info("%s started", settings.app_name)
