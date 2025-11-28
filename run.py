"""Simple script to run the Golf Coach API server"""
import uvicorn
from app.config import settings

if __name__ == "__main__":
    print("=" * 60)
    print("🏌️  Golf Coach API Server")
    print("=" * 60)
    print(f"Starting server on {settings.api_host}:{settings.api_port}")
    print(f"Debug mode: {settings.debug_mode}")
    print(f"CORS origins: {settings.cors_origins}")
    print("=" * 60)
    print(f"\n📚 API Documentation: http://localhost:{settings.api_port}/docs")
    print(f"📊 Health Check: http://localhost:{settings.api_port}/health\n")
    print("Press CTRL+C to stop the server\n")

    uvicorn.run(
        "app.main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.debug_mode,
        log_level="info" if settings.debug_mode else "warning"
    )
