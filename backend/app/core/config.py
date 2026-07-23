from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "Hackathon API"
    environment: str = "development"

    database_url: str = "postgresql+psycopg://hackathon:hackathon@localhost:5432/hackathon"

    jwt_secret: str = "change-me-before-the-hackathon"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24

    gemini_api_key: str = ""

    cors_origins: list[str] = ["http://localhost:3000"]


@lru_cache
def get_settings() -> Settings:
    return Settings()
