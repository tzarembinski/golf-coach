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
        if self.database_url.startswith("postgresql://"):
            self.database_url = self.database_url.replace("postgresql://", "postgresql+asyncpg://", 1)
        elif self.database_url.startswith("postgres://"):
            self.database_url = self.database_url.replace("postgres://", "postgresql+asyncpg://", 1)

        # Fix SSL mode for asyncpg - replace ?sslmode=require with ?ssl=require
        if "postgresql+asyncpg://" in self.database_url and "sslmode=" in self.database_url:
            self.database_url = self.database_url.replace("sslmode=", "ssl=")

        # Log database configuration (with sanitized URL)
        db_type = 'Postgres' if 'postgresql' in self.database_url else 'SQLite'
        sanitized_url = self.database_url.split('@')[-1] if '@' in self.database_url else self.database_url[:50]
        print(f"Database type: {db_type}")
        print(f"Connecting to: ...{sanitized_url}")

    # API Configuration
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    debug_mode: bool = False

    # CORS Configuration
    allowed_origins: str = "http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,https://golf-coach-frontend.vercel.app,https://frontend-gilt-two-85.vercel.app"

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
