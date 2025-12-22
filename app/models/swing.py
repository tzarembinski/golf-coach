"""Database models for swing analysis"""
from sqlalchemy import Column, Integer, String, Text, DateTime, JSON
from sqlalchemy.sql import func
from app.database import Base


class Swing(Base):
    """
    Swing model representing a golf swing analysis session.
    Stores images as base64 and analysis results from Claude.
    """

    __tablename__ = "swings"

    id = Column(Integer, primary_key=True, index=True)

    # Timestamp for when the analysis was created
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Images stored as base64 strings in JSON format
    # Structure: {"address": "base64...", "top": "base64...", "impact": "base64...", "follow_through": "base64..."}
    images = Column(JSON, nullable=False)

    # Analysis result from Claude API (full structured response)
    analysis = Column(Text, nullable=False)

    # Brief summary for quick display in history (extracted from analysis)
    summary = Column(String(500), nullable=True)

    # Overall rating (1-10) extracted from analysis
    rating = Column(Integer, nullable=True)

    # Swing positions included in this analysis (comma-separated: "address,top,impact,follow_through")
    positions_analyzed = Column(String(200), nullable=False)

    # Shot annotation fields (user-provided context)
    club = Column(String(100), nullable=True)  # e.g., "Driver", "7-iron"
    shot_outcome = Column(String(50), nullable=True)  # e.g., "Straight", "Hook", "Slice"
    focus_area = Column(Text, nullable=True)  # What they were working on
    notes = Column(Text, nullable=True)  # Additional context

    def __repr__(self):
        return f"<Swing(id={self.id}, created_at={self.created_at}, rating={self.rating}, club={self.club})>"
