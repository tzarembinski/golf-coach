"""API router for swing analysis endpoints"""
from typing import List, Dict
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.schemas import (
    SwingResponse,
    SwingHistoryResponse,
    AnalyzeSwingResponse,
    ErrorResponse
)
from app.services.claude_service import claude_service
from app.services.swing_service import swing_service
from app.utils.image_utils import validate_image, image_to_base64_with_type, validate_swing_position
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/swings", tags=["swings"])


@router.post(
    "/analyze",
    response_model=AnalyzeSwingResponse,
    responses={400: {"model": ErrorResponse}, 500: {"model": ErrorResponse}}
)
async def analyze_swing(
    address: UploadFile = File(None),
    top: UploadFile = File(None),
    impact: UploadFile = File(None),
    follow_through: UploadFile = File(None),
    club: str = Form(None),
    shot_outcome: str = Form(None),
    focus_area: str = Form(None),
    notes: str = Form(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Analyze golf swing from 1-4 uploaded images.

    Upload images for different swing positions:
    - address: Setup position before the swing
    - top: Top of the backswing
    - impact: Impact position with the ball
    - follow_through: Follow-through position after impact

    At least one image is required. Images should be JPEG or PNG format, max 5MB each.

    Returns the analysis from Claude along with a swing ID for future reference.
    """
    try:
        # Collect uploaded files and their positions
        uploaded_files = {
            "address": address,
            "top": top,
            "impact": impact,
            "follow_through": follow_through
        }

        # Filter out None values (files that weren't uploaded)
        uploaded_files = {k: v for k, v in uploaded_files.items() if v is not None}

        if not uploaded_files:
            raise HTTPException(
                status_code=400,
                detail="At least one image is required for analysis"
            )

        if len(uploaded_files) > 4:
            raise HTTPException(
                status_code=400,
                detail="Maximum 4 images allowed"
            )

        logger.info(f"Received {len(uploaded_files)} images for analysis: {list(uploaded_files.keys())}")

        # Validate all images
        for position, file in uploaded_files.items():
            await validate_image(file)

        # Convert images to base64 with their media types
        images_base64: Dict[str, str] = {}
        images_media_types: Dict[str, str] = {}
        positions: List[str] = []

        for position, file in uploaded_files.items():
            base64_data, media_type = await image_to_base64_with_type(file)
            images_base64[position] = base64_data
            images_media_types[position] = media_type
            positions.append(position)

        logger.info(f"Converted {len(images_base64)} images to base64")

        # Build annotation context
        annotation_context = {
            "club": club,
            "shot_outcome": shot_outcome,
            "focus_area": focus_area,
            "notes": notes
        }

        # Call Claude API for analysis with context
        analysis_text = await claude_service.analyze_swing(
            images_base64,
            positions,
            images_media_types,
            annotation_context,
            db  # Pass db for swing history
        )

        # Parse rating and summary from analysis
        rating, summary = claude_service.parse_analysis(analysis_text)

        logger.info(f"Received analysis from Claude. Rating: {rating}, Summary length: {len(summary) if summary else 0}")

        # Save to database with annotation fields
        swing = await swing_service.create_swing(
            db=db,
            images=images_base64,
            analysis=analysis_text,
            positions=positions,
            rating=rating,
            summary=summary,
            club=club,
            shot_outcome=shot_outcome,
            focus_area=focus_area,
            notes=notes
        )

        return AnalyzeSwingResponse(
            swing_id=swing.id,
            analysis=analysis_text,
            rating=rating,
            summary=summary,
            created_at=swing.created_at,
            message="Swing analyzed successfully"
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error analyzing swing: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to analyze swing: {str(e)}"
        )


@router.get(
    "/history",
    response_model=SwingHistoryResponse,
    responses={500: {"model": ErrorResponse}}
)
async def get_swing_history(
    limit: int = 50,
    offset: int = 0,
    db: AsyncSession = Depends(get_db)
):
    """
    Get history of all swing analyses.

    Returns a list of previous swing analyses with thumbnails, summaries, and ratings.
    Results are ordered by most recent first.

    Query parameters:
    - limit: Maximum number of results to return (default: 50, max: 100)
    - offset: Number of results to skip for pagination (default: 0)
    """
    try:
        # Validate and cap limit
        if limit > 100:
            limit = 100
        if limit < 1:
            limit = 1

        logger.info(f"Fetching swing history with limit={limit}, offset={offset}")

        # Get swings from database
        swings = await swing_service.get_all_swings(db, limit=limit, offset=offset)
        total = await swing_service.get_swing_count(db)

        # Convert to history items with thumbnails
        history_items = [
            swing_service.swing_to_history_item(swing)
            for swing in swings
        ]

        logger.info(f"Returning {len(history_items)} swing history items (total: {total})")

        return SwingHistoryResponse(
            total=total,
            swings=history_items
        )

    except Exception as e:
        logger.error(f"Error fetching swing history: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch swing history: {str(e)}"
        )


@router.get(
    "/{swing_id}",
    response_model=SwingResponse,
    responses={404: {"model": ErrorResponse}, 500: {"model": ErrorResponse}}
)
async def get_swing(
    swing_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Get detailed analysis for a specific swing by ID.

    Returns the full swing analysis including all images and the complete
    analysis text from Claude.
    """
    try:
        logger.info(f"Fetching swing with ID: {swing_id}")

        swing = await swing_service.get_swing_by_id(db, swing_id)

        if not swing:
            raise HTTPException(
                status_code=404,
                detail=f"Swing with ID {swing_id} not found"
            )

        logger.info(f"Found swing {swing_id}")

        return SwingResponse(
            id=swing.id,
            created_at=swing.created_at,
            images=swing.images,
            analysis=swing.analysis,
            summary=swing.summary,
            rating=swing.rating,
            positions_analyzed=swing.positions_analyzed
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching swing {swing_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch swing: {str(e)}"
        )


@router.delete(
    "/{swing_id}",
    responses={404: {"model": ErrorResponse}, 500: {"model": ErrorResponse}}
)
async def delete_swing(
    swing_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a specific swing analysis by ID.

    Returns a success message upon deletion.
    """
    try:
        logger.info(f"Deleting swing with ID: {swing_id}")

        swing = await swing_service.get_swing_by_id(db, swing_id)

        if not swing:
            raise HTTPException(
                status_code=404,
                detail=f"Swing with ID {swing_id} not found"
            )

        await swing_service.delete_swing(db, swing_id)

        logger.info(f"Successfully deleted swing {swing_id}")

        return {
            "message": f"Swing {swing_id} deleted successfully",
            "id": swing_id
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting swing {swing_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete swing: {str(e)}"
        )


# Health check router for Claude API testing
health_router = APIRouter(prefix="/api/health", tags=["health"])


@health_router.get(
    "/claude-test",
    responses={500: {"model": ErrorResponse}}
)
async def test_claude_connection():
    """
    Test endpoint to verify Claude API connectivity.

    Makes a minimal "hello" request to Claude to verify:
    1. API key is loaded correctly
    2. API connection is working
    3. Authentication is successful

    Returns detailed success/failure information with full error details if it fails.
    """
    try:
        logger.info("Testing Claude API connection via health endpoint")

        result = await claude_service.test_connection()

        if result["success"]:
            logger.info("Claude API test successful")
            return result
        else:
            logger.error(f"Claude API test failed: {result.get('error_message')}")
            raise HTTPException(
                status_code=500,
                detail=result
            )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error testing Claude connection: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "message": "Failed to test Claude API",
                "error": str(e)
            }
        )
