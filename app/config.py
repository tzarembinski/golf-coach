"""Application configuration"""
from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # Anthropic API Configuration
    anthropic_api_key: str

    # Database Configuration
    database_url: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./golf_coach.db")

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Convert Neon Postgres URL to use asyncpg driver for async support
        if self.database_url.startswith("postgresql://") or self.database_url.startswith("postgres://"):
            self.database_url = self.database_url.replace("postgresql://", "postgresql+asyncpg://", 1)
            self.database_url = self.database_url.replace("postgres://", "postgresql+asyncpg://", 1)

    # API Configuration
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    debug_mode: bool = False

    # CORS Configuration
    allowed_origins: str = "http://localhost:3000,http://localhost:5173"

    @property
    def cors_origins(self) -> List[str]:
        """Parse comma-separated origins into a list"""
        return [origin.strip() for origin in self.allowed_origins.split(",")]

    # Image Configuration
    max_image_size_mb: int = 5
    allowed_image_formats: List[str] = ["image/jpeg", "image/png", "image/jpg"]

    class Config:
        env_file = ".env"
        case_sensitive = False


# Global settings instance
settings = Settings()
