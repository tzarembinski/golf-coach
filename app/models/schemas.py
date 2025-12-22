"""Pydantic schemas for request/response validation"""
from pydantic import BaseModel, Field, validator
from typing import Optional, Dict, List
from datetime import datetime
from enum import Enum


class SwingPosition(str, Enum):
    """Valid golf swing positions"""
    ADDRESS = "address"
    TOP = "top"
    IMPACT = "impact"
    FOLLOW_THROUGH = "follow_through"


class SwingAnalysisRequest(BaseModel):
    """Request model for swing analysis - not used directly since we use multipart form"""
    pass


class PositionAnalysis(BaseModel):
    """Analysis for a specific swing position"""
    position: str
    observations: str
    strengths: str
    improvements: str


class SwingAnalysisResult(BaseModel):
    """Structured analysis result from Claude"""
    overall_rating: int = Field(..., ge=1, le=10, description="Overall swing quality rating (1-10)")
    overall_summary: str = Field(..., description="2-3 sentence overall assessment")
    position_analyses: List[PositionAnalysis] = Field(..., description="Analysis for each position")
    specific_issues: List[str] = Field(..., description="2-4 specific technical problems")
    recommendations: List[str] = Field(..., description="3-4 actionable drills or changes")
    raw_analysis: str = Field(..., description="Full raw text from Claude")


class SwingResponse(BaseModel):
    """Response model for a swing analysis"""
    id: int
    created_at: datetime
    images: Dict[str, str] = Field(..., description="Base64 encoded images by position")
    analysis: str = Field(..., description="Full analysis text from Claude")
    summary: Optional[str] = Field(None, description="Brief summary")
    rating: Optional[int] = Field(None, ge=1, le=10, description="Overall rating")
    positions_analyzed: str = Field(..., description="Comma-separated list of positions")
    club: Optional[str] = Field(None, description="Club used")
    shot_outcome: Optional[str] = Field(None, description="Shot outcome")
    focus_area: Optional[str] = Field(None, description="What golfer was working on")
    notes: Optional[str] = Field(None, description="Additional notes")

    class Config:
        from_attributes = True


class SwingHistoryItem(BaseModel):
    """Lightweight swing item for history list"""
    id: int
    created_at: datetime
    summary: Optional[str]
    rating: Optional[int]
    positions_analyzed: str
    thumbnail: Optional[str] = Field(None, description="Base64 thumbnail of first image")
    club: Optional[str] = Field(None, description="Club used")
    shot_outcome: Optional[str] = Field(None, description="Shot outcome")

    class Config:
        from_attributes = True


class SwingHistoryResponse(BaseModel):
    """Response model for swing history list"""
    total: int
    swings: List[SwingHistoryItem]


class AnalyzeSwingResponse(BaseModel):
    """Response after analyzing a swing"""
    swing_id: int
    analysis: str
    rating: Optional[int]
    summary: Optional[str]
    created_at: datetime
    message: str = "Swing analyzed successfully"


class ErrorResponse(BaseModel):
    """Standard error response"""
    error: str
    detail: Optional[str] = None
