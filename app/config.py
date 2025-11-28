"""Application configuration"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # Anthropic API Configuration
    anthropic_api_key: str

    # Database Configuration
    database_url: str = "sqlite+aiosqlite:///./golf_coach.db"

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
