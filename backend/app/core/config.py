from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    """Application configuration loaded from environment variables."""

    # App
    APP_NAME: str = "LearnX-Ray"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    ENVIRONMENT: str = "development"

    # Database
    DATABASE_URL: str = "sqlite:///./learnxray.db"

    # Auth
    SECRET_KEY: str = "dev-secret-key-change-in-production-immediately"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # AI Provider
    AI_PROVIDER: str = "auto"  # auto | gemini | openai | fallback
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4o-mini"
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-3.8-flash"
    AI_REQUEST_TIMEOUT: int = 30
    AI_MAX_RETRIES: int = 2

    # Neo4j (optional)
    NEO4J_URI: Optional[str] = None
    NEO4J_USER: Optional[str] = None
    NEO4J_PASSWORD: Optional[str] = None

    # CORS
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    # Rate limiting
    RATE_LIMIT_AUTH: str = "10/minute"
    RATE_LIMIT_AI: str = "30/minute"
    RATE_LIMIT_DEFAULT: str = "100/minute"

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    @property
    def ai_available(self) -> bool:
        if self.AI_PROVIDER == "fallback":
            return False
        return bool(self.GEMINI_API_KEY or self.OPENAI_API_KEY)

    def is_production_ready(self) -> tuple[bool, list[str]]:
        """Validate whether the configuration is secure for live public deployment."""
        issues = []
        if self.ENVIRONMENT == "production":
            if self.SECRET_KEY == "dev-secret-key-change-in-production-immediately":
                issues.append("SECRET_KEY is still set to the default development value.")
            elif len(self.SECRET_KEY) < 32:
                issues.append("SECRET_KEY must be at least 32 characters long.")
            if self.DEBUG:
                issues.append("DEBUG mode is active. Disable it in production.")
            if "localhost" in self.CORS_ORIGINS:
                issues.append("CORS_ORIGINS contains localhost addresses. Restrict to production domains.")
        return len(issues) == 0, issues

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
