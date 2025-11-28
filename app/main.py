"""Main FastAPI application for Golf Coach API"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.config import settings
from app.database import init_db
from app.routers import swings

# Configure logging
logging.basicConfig(
    level=logging.INFO if settings.debug_mode else logging.WARNING,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events.
    """
    # Startup
    logger.info("Starting Golf Coach API...")
    logger.info("Initializing database...")
    await init_db()
    logger.info("Database initialized successfully")
    logger.info(f"API ready on {settings.api_host}:{settings.api_port}")

    yield

    # Shutdown
    logger.info("Shutting down Golf Coach API...")


# Create FastAPI application
app = FastAPI(
    title="Golf Coach API",
    description="Backend API for golf swing analysis using Claude AI",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logger.info(f"CORS enabled for origins: {settings.cors_origins}")

# Include routers
app.include_router(swings.router)


@app.get("/")
async def root():
    """Root endpoint - API health check"""
    return {
        "name": "Golf Coach API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "analyze_swing": "POST /api/swings/analyze",
            "get_history": "GET /api/swings/history",
            "get_swing": "GET /api/swings/{swing_id}"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "database": "connected"
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.debug_mode
    )
