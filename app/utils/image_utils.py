"""Image handling utilities for validation and conversion"""
import base64
import io
from typing import Tuple
from PIL import Image
from fastapi import UploadFile, HTTPException
from app.config import settings


async def validate_image(file: UploadFile) -> None:
    """
    Validate uploaded image file.

    Args:
        file: Uploaded file from FastAPI

    Raises:
        HTTPException: If validation fails
    """
    # Check content type
    if file.content_type not in settings.allowed_image_formats:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid image format. Allowed formats: {', '.join(settings.allowed_image_formats)}"
        )

    # Read file to check size
    content = await file.read()
    size_mb = len(content) / (1024 * 1024)

    if size_mb > settings.max_image_size_mb:
        raise HTTPException(
            status_code=400,
            detail=f"Image size ({size_mb:.2f}MB) exceeds maximum allowed size ({settings.max_image_size_mb}MB)"
        )

    # Reset file pointer for later reading
    await file.seek(0)

    # Try to open with PIL to verify it's a valid image
    try:
        image = Image.open(io.BytesIO(content))
        image.verify()
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid image file: {str(e)}"
        )

    # Reset file pointer again
    await file.seek(0)


async def image_to_base64(file: UploadFile) -> str:
    """
    Convert uploaded image file to base64 string.

    Args:
        file: Uploaded file from FastAPI

    Returns:
        Base64 encoded string of the image
    """
    content = await file.read()
    base64_encoded = base64.b64encode(content).decode('utf-8')

    # Reset file pointer
    await file.seek(0)

    return base64_encoded


async def get_image_media_type(file: UploadFile) -> str:
    """
    Get the media type for the image (for Claude API).

    Args:
        file: Uploaded file from FastAPI

    Returns:
        Media type string (e.g., 'image/jpeg', 'image/png')
    """
    content_type = file.content_type or "image/jpeg"

    # Normalize jpeg variations
    if content_type in ["image/jpg", "image/jpeg"]:
        return "image/jpeg"

    return content_type


def create_thumbnail(base64_image: str, max_size: Tuple[int, int] = (200, 200)) -> str:
    """
    Create a thumbnail from a base64 encoded image.

    Args:
        base64_image: Base64 encoded image string
        max_size: Maximum dimensions for thumbnail (width, height)

    Returns:
        Base64 encoded thumbnail string
    """
    try:
        # Decode base64 to image
        image_data = base64.b64decode(base64_image)
        image = Image.open(io.BytesIO(image_data))

        # Create thumbnail
        image.thumbnail(max_size, Image.Resampling.LANCZOS)

        # Convert back to base64
        buffer = io.BytesIO()
        image.save(buffer, format=image.format or 'JPEG')
        thumbnail_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')

        return thumbnail_base64
    except Exception as e:
        # If thumbnail creation fails, return original image
        return base64_image


def validate_swing_position(position: str) -> bool:
    """
    Validate if the position name is valid.

    Args:
        position: Position name (e.g., 'address', 'top', 'impact', 'follow_through')

    Returns:
        True if valid, False otherwise
    """
    valid_positions = ['address', 'top', 'impact', 'follow_through']
    return position.lower() in valid_positions
