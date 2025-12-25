"""Database configuration and session management"""
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base
from app.config import settings

# Create async engine with serverless-optimized settings
# For Vercel/serverless environments, we need:
# - pool_pre_ping: Test connections before use to avoid "connection closed" errors
# - pool_recycle: Recycle connections periodically to avoid stale connections
# - pool_size & max_overflow: Smaller pools for serverless environments
engine_kwargs = {
    "echo": settings.debug_mode,
    "pool_pre_ping": True,  # Test connection before use - critical for serverless
    "pool_recycle": 300,    # Recycle connections after 5 minutes
}

# Add connect_args for sqlite compatibility
if "sqlite" in settings.database_url:
    engine_kwargs["connect_args"] = {"check_same_thread": False}
else:
    # For PostgreSQL in serverless, use smaller pool
    engine_kwargs["pool_size"] = 5
    engine_kwargs["max_overflow"] = 10

engine = create_async_engine(settings.database_url, **engine_kwargs)

# Create async session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

# Base class for models
Base = declarative_base()


async def get_db() -> AsyncSession:
    """
    Dependency to get database session.
    Yields a database session and ensures it's closed after use.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db():
    """Initialize database tables"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
