"""Debug endpoints for viewing request flow and troubleshooting"""
from typing import Optional
from fastapi import APIRouter
from app.utils.debug_logger import DebugLogger

router = APIRouter(prefix="/api/debug", tags=["debug"])


@router.get("/sessions")
async def get_recent_debug_sessions(limit: int = 10):
    """
    Get recent debug sessions showing step-by-step execution flow.

    This endpoint helps identify which step is failing in the request pipeline.

    Query parameters:
    - limit: Number of recent sessions to return (default: 10, max: 50)
    """
    if limit > 50:
        limit = 50

    sessions = DebugLogger.get_recent_sessions(limit=limit)

    return {
        "count": len(sessions),
        "sessions": sessions
    }


@router.get("/sessions/{request_id}")
async def get_debug_session(request_id: str):
    """
    Get a specific debug session by request ID.

    Returns detailed step-by-step execution information for troubleshooting.
    """
    session = DebugLogger.get_session_by_id(request_id)

    if not session:
        return {
            "found": False,
            "message": f"No session found with request_id: {request_id}"
        }

    return {
        "found": True,
        "session": session
    }


@router.get("/health")
async def debug_health():
    """Simple health check for debug endpoints"""
    return {
        "status": "ok",
        "message": "Debug endpoints are working",
        "available_endpoints": [
            "GET /api/debug/sessions - View recent debug sessions",
            "GET /api/debug/sessions/{request_id} - View specific session",
            "GET /api/debug/health - Health check"
        ]
    }
