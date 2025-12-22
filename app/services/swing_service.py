"""Service layer for swing database operations"""
from typing import List, Optional, Dict
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.models.swing import Swing
from app.models.schemas import SwingHistoryItem
from app.utils.image_utils import create_thumbnail
import logging

logger = logging.getLogger(__name__)


class SwingService:
    """Service class for swing database operations"""

    @staticmethod
    async def create_swing(
        db: AsyncSession,
        images: Dict[str, str],
        analysis: str,
        positions: List[str],
        rating: Optional[int] = None,
        summary: Optional[str] = None,
        club: Optional[str] = None,
        shot_outcome: Optional[str] = None,
        focus_area: Optional[str] = None,
        notes: Optional[str] = None
    ) -> Swing:
        """
        Create a new swing analysis record in the database.

        Args:
            db: Database session
            images: Dictionary of position -> base64 image
            analysis: Full analysis text from Claude
            positions: List of swing positions analyzed
            rating: Overall rating (1-10)
            summary: Brief summary text
            club: Club used for the swing
            shot_outcome: Outcome of the shot
            focus_area: What the golfer was working on
            notes: Additional notes

        Returns:
            Created Swing instance
        """
        try:
            positions_str = ",".join(positions)

            swing = Swing(
                images=images,
                analysis=analysis,
                summary=summary,
                rating=rating,
                positions_analyzed=positions_str,
                club=club,
                shot_outcome=shot_outcome,
                focus_area=focus_area,
                notes=notes
            )

            db.add(swing)
            await db.commit()
            await db.refresh(swing)

            logger.info(f"Created swing record with ID: {swing.id}")

            return swing

        except Exception as e:
            await db.rollback()
            logger.error(f"Error creating swing record: {str(e)}")
            raise

    @staticmethod
    async def get_swing_by_id(db: AsyncSession, swing_id: int) -> Optional[Swing]:
        """
        Get a swing analysis by ID.

        Args:
            db: Database session
            swing_id: ID of the swing to retrieve

        Returns:
            Swing instance or None if not found
        """
        try:
            result = await db.execute(
                select(Swing).where(Swing.id == swing_id)
            )
            swing = result.scalar_one_or_none()

            return swing

        except Exception as e:
            logger.error(f"Error retrieving swing {swing_id}: {str(e)}")
            raise

    @staticmethod
    async def get_all_swings(
        db: AsyncSession,
        limit: int = 50,
        offset: int = 0
    ) -> List[Swing]:
        """
        Get all swing analyses, ordered by most recent first.

        Args:
            db: Database session
            limit: Maximum number of records to return
            offset: Number of records to skip

        Returns:
            List of Swing instances
        """
        try:
            result = await db.execute(
                select(Swing)
                .order_by(desc(Swing.created_at))
                .limit(limit)
                .offset(offset)
            )
            swings = result.scalars().all()

            return list(swings)

        except Exception as e:
            logger.error(f"Error retrieving swings: {str(e)}")
            raise

    @staticmethod
    async def get_swing_count(db: AsyncSession) -> int:
        """
        Get total count of swing analyses.

        Args:
            db: Database session

        Returns:
            Total count of swings
        """
        try:
            from sqlalchemy import func
            result = await db.execute(
                select(func.count()).select_from(Swing)
            )
            count = result.scalar()

            return count or 0

        except Exception as e:
            logger.error(f"Error counting swings: {str(e)}")
            raise

    @staticmethod
    async def delete_swing(db: AsyncSession, swing_id: int) -> bool:
        """
        Delete a swing analysis by ID.

        Args:
            db: Database session
            swing_id: ID of the swing to delete

        Returns:
            True if deleted successfully
        """
        try:
            result = await db.execute(
                select(Swing).where(Swing.id == swing_id)
            )
            swing = result.scalar_one_or_none()

            if swing:
                await db.delete(swing)
                await db.commit()
                logger.info(f"Deleted swing record with ID: {swing_id}")
                return True

            return False

        except Exception as e:
            await db.rollback()
            logger.error(f"Error deleting swing {swing_id}: {str(e)}")
            raise

    @staticmethod
    async def get_recent_swings(db: AsyncSession, limit: int = 3) -> List[Swing]:
        """
        Get most recent swing analyses for comparison.

        Args:
            db: Database session
            limit: Number of recent swings to retrieve (default: 3)

        Returns:
            List of recent Swing instances
        """
        try:
            result = await db.execute(
                select(Swing)
                .order_by(desc(Swing.created_at))
                .limit(limit)
            )
            swings = result.scalars().all()
            return list(swings)
        except Exception as e:
            logger.error(f"Error retrieving recent swings: {str(e)}")
            return []

    @staticmethod
    def swing_to_history_item(swing: Swing) -> SwingHistoryItem:
        """
        Convert a Swing model to a SwingHistoryItem response.
        Creates a thumbnail from the first available image.

        Args:
            swing: Swing database model

        Returns:
            SwingHistoryItem schema
        """
        # Get first image as thumbnail
        thumbnail = None
        if swing.images:
            # Get the first available image
            first_position = swing.positions_analyzed.split(',')[0]
            if first_position in swing.images:
                # Create thumbnail from first image
                thumbnail = create_thumbnail(swing.images[first_position])

        return SwingHistoryItem(
            id=swing.id,
            created_at=swing.created_at,
            summary=swing.summary,
            rating=swing.rating,
            positions_analyzed=swing.positions_analyzed,
            thumbnail=thumbnail,
            club=swing.club,
            shot_outcome=swing.shot_outcome
        )


# Global instance
swing_service = SwingService()
