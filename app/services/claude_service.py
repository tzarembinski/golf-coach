"""Service for interacting with Claude API for swing analysis"""
import re
from typing import Dict, List
from anthropic import AsyncAnthropic
from app.config import settings
from app.models.schemas import SwingAnalysisResult, PositionAnalysis
import logging

logger = logging.getLogger(__name__)


class ClaudeService:
    """Service class for Claude API interactions"""

    def __init__(self):
        """Initialize Claude client"""
        self.client = AsyncAnthropic(api_key=settings.anthropic_api_key)
        self.model = "claude-3-5-sonnet-20241022"  # Latest model

    def _build_analysis_prompt(self, positions: List[str]) -> str:
        """
        Build the prompt for Claude based on swing positions.

        Args:
            positions: List of swing positions (e.g., ['address', 'top', 'impact'])

        Returns:
            Formatted prompt string
        """
        positions_str = ", ".join(positions)

        prompt = f"""You are an expert golf instructor analyzing swing images. I'm providing {len(positions)} image(s) showing the following swing position(s): {positions_str}.

Please provide a comprehensive analysis with the following structure:

1. OVERALL ASSESSMENT
   - Rate the swing quality on a scale of 1-10
   - Provide a 2-3 sentence summary of the overall swing

2. POSITION ANALYSIS
   For each image provided ({positions_str}), analyze:
   - Key observations (posture, alignment, club position, body mechanics)
   - What's being done well
   - What needs improvement

3. SPECIFIC ISSUES
   List 2-4 specific technical problems in order of priority (most important first)

4. RECOMMENDATIONS
   Provide 3-4 actionable drills or changes to improve the swing

Please be specific, constructive, and focus on the most impactful improvements. Format your response clearly with headers for each section."""

        return prompt

    async def analyze_swing(
        self,
        images: Dict[str, str],
        positions: List[str]
    ) -> str:
        """
        Analyze golf swing using Claude Vision API.

        Args:
            images: Dictionary mapping position names to base64 encoded images
            positions: List of position names in order

        Returns:
            Analysis text from Claude

        Raises:
            Exception: If API call fails
        """
        try:
            # Build the prompt
            prompt = self._build_analysis_prompt(positions)

            # Build the message content with images
            content = []

            # Add images in the order specified by positions
            for position in positions:
                if position in images:
                    # Add position label
                    content.append({
                        "type": "text",
                        "text": f"[{position.upper()} POSITION]"
                    })

                    # Determine media type from base64 prefix if present, otherwise default to jpeg
                    base64_data = images[position]
                    media_type = "image/jpeg"

                    # Add image
                    content.append({
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": media_type,
                            "data": base64_data
                        }
                    })

            # Add the analysis prompt
            content.append({
                "type": "text",
                "text": prompt
            })

            # Call Claude API
            logger.info(f"Calling Claude API to analyze {len(positions)} swing positions")

            response = await self.client.messages.create(
                model=self.model,
                max_tokens=2048,
                messages=[{
                    "role": "user",
                    "content": content
                }]
            )

            # Extract text from response
            analysis_text = response.content[0].text

            logger.info("Successfully received analysis from Claude")

            return analysis_text

        except Exception as e:
            logger.error(f"Error calling Claude API: {str(e)}")
            raise Exception(f"Failed to analyze swing: {str(e)}")

    def parse_analysis(self, analysis_text: str) -> tuple:
        """
        Parse Claude's analysis to extract rating and summary.

        Args:
            analysis_text: Raw analysis text from Claude

        Returns:
            Tuple of (rating, summary) where rating is int or None, summary is str or None
        """
        rating = None
        summary = None

        try:
            # Extract rating (look for patterns like "8/10", "Rating: 7", "7 out of 10", etc.)
            rating_patterns = [
                r'(?:rate|rating|score).*?(\d+)(?:/10|\s*out\s*of\s*10)',
                r'(\d+)/10',
                r'(?:quality|overall).*?(\d+)(?:/10|\s*out\s*of\s*10)',
            ]

            for pattern in rating_patterns:
                match = re.search(pattern, analysis_text, re.IGNORECASE)
                if match:
                    rating = int(match.group(1))
                    if 1 <= rating <= 10:
                        break
                    else:
                        rating = None

            # Extract summary (look for overall assessment section)
            summary_patterns = [
                r'OVERALL ASSESSMENT.*?-\s*(.+?)(?:\n\n|\n2\.)',
                r'overall.*?summary.*?:\s*(.+?)(?:\n\n|\n)',
                r'summary.*?:\s*(.+?)(?:\n\n|\n)',
            ]

            for pattern in summary_patterns:
                match = re.search(pattern, analysis_text, re.IGNORECASE | re.DOTALL)
                if match:
                    summary = match.group(1).strip()
                    # Limit summary to 500 characters
                    if len(summary) > 500:
                        summary = summary[:497] + "..."
                    break

            # If no summary found, use first 500 chars
            if not summary:
                lines = analysis_text.split('\n')
                # Skip header lines
                content_lines = [line for line in lines if line.strip() and not line.strip().startswith('#')]
                if content_lines:
                    summary = ' '.join(content_lines[:3])
                    if len(summary) > 500:
                        summary = summary[:497] + "..."

        except Exception as e:
            logger.warning(f"Error parsing analysis: {str(e)}")

        return rating, summary


# Global instance
claude_service = ClaudeService()
