"""Service for interacting with Claude API for swing analysis"""
import re
import traceback
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
        self.model = "claude-3-haiku-20240307"  # Claude 3 Haiku (supports vision)

    def _build_analysis_prompt(
        self,
        positions: List[str],
        annotation_context: Dict = None,
        swing_history: List = None
    ) -> str:
        """
        Build the prompt for Claude based on swing positions, annotation context, and history.

        Args:
            positions: List of swing positions (e.g., ['address', 'top', 'impact'])
            annotation_context: User-provided context (club, outcome, focus_area, notes)
            swing_history: List of previous swing analyses for comparison

        Returns:
            Formatted prompt string
        """
        positions_str = ", ".join(positions)

        # Build context section
        context_parts = []
        if annotation_context:
            if annotation_context.get('club'):
                context_parts.append(f"The golfer is using a {annotation_context['club']}")
            if annotation_context.get('shot_outcome'):
                context_parts.append(f"The shot outcome was: {annotation_context['shot_outcome']}")
            if annotation_context.get('focus_area'):
                context_parts.append(f"They were working on: {annotation_context['focus_area']}")
            if annotation_context.get('notes'):
                context_parts.append(f"Additional context: {annotation_context['notes']}")

        context_section = ""
        if context_parts:
            context_section = "\n\nCONTEXT:\n" + "\n".join(f"- {part}" for part in context_parts)

        # Build swing history section
        history_section = ""
        if swing_history and len(swing_history) > 0:
            history_lines = ["\n\nPREVIOUS SWING HISTORY:"]
            for i, swing in enumerate(swing_history, 1):
                date_str = swing.created_at.strftime("%B %d, %Y")
                club_info = f", Club: {swing.club}" if swing.club else ""
                outcome_info = f", Outcome: {swing.shot_outcome}" if swing.shot_outcome else ""
                rating_info = f"Rating: {swing.rating}/10" if swing.rating else "Not rated"
                summary = swing.summary[:100] + "..." if swing.summary and len(swing.summary) > 100 else swing.summary or "No summary"

                history_lines.append(f"{i}. Swing from {date_str}: {rating_info}{club_info}{outcome_info}")
                history_lines.append(f"   Summary: {summary}")

            history_section = "\n".join(history_lines)

        # Build comparison instructions if history exists
        comparison_instructions = ""
        if swing_history and len(swing_history) > 0:
            comparison_instructions = """

5. PROGRESSION ANALYSIS (Compare to previous swings)
   - What has improved since last time?
   - What issues are recurring across multiple swings?
   - What new issues have appeared?
   - Is the golfer progressing on what they said they were working on?
   - Provide specific feedback based on their progression pattern"""

        prompt = f"""You are an expert golf instructor analyzing swing images. I'm providing {len(positions)} image(s) showing the following swing position(s): {positions_str}.{context_section}{history_section}

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
   Provide 3-4 actionable drills or changes to improve the swing{comparison_instructions}

Please be specific, constructive, and focus on the most impactful improvements. Factor in the context and progression from previous swings when providing your analysis."""

        return prompt

    async def analyze_swing(
        self,
        images: Dict[str, str],
        positions: List[str],
        media_types: Dict[str, str] = None,
        annotation_context: Dict = None,
        db = None
    ) -> str:
        """
        Analyze golf swing using Claude Vision API.

        Args:
            images: Dictionary mapping position names to base64 encoded images
            positions: List of position names in order
            media_types: Dictionary mapping position names to media types (e.g., 'image/jpeg', 'image/png')
            annotation_context: User-provided context about the swing
            db: Database session for querying swing history

        Returns:
            Analysis text from Claude

        Raises:
            Exception: If API call fails
        """
        try:
            # Get recent swing history for comparison if db session provided
            swing_history = []
            if db:
                from app.services.swing_service import swing_service
                swing_history = await swing_service.get_recent_swings(db, limit=3)

            # Build the prompt with context and history
            prompt = self._build_analysis_prompt(positions, annotation_context, swing_history)

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

                    # Get base64 data and media type
                    base64_data = images[position]
                    media_type = media_types.get(position, "image/jpeg") if media_types else "image/jpeg"

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

            # Detailed logging before API call
            print(f"\n{'='*60}")
            print(f"PREPARING CLAUDE API CALL")
            print(f"{'='*60}")
            print(f"Model: {self.model}")
            print(f"Positions: {positions}")
            print(f"Number of content blocks: {len(content)}")
            print(f"Max tokens: 2048")
            print(f"API Key (first 20 chars): {settings.anthropic_api_key[:20]}...")
            print(f"{'='*60}\n")

            logger.info(f"Calling Claude API to analyze {len(positions)} swing positions")
            logger.info(f"Using model: {self.model}")
            logger.info(f"Content blocks: {len(content)}")

            # Call Claude API
            response = await self.client.messages.create(
                model=self.model,
                max_tokens=2048,
                messages=[{
                    "role": "user",
                    "content": content
                }]
            )

            # Detailed logging after API call
            print(f"\n{'='*60}")
            print(f"CLAUDE API RESPONSE RECEIVED")
            print(f"{'='*60}")
            print(f"Response ID: {response.id}")
            print(f"Model: {response.model}")
            print(f"Stop reason: {response.stop_reason}")
            print(f"Usage - Input tokens: {response.usage.input_tokens}")
            print(f"Usage - Output tokens: {response.usage.output_tokens}")
            print(f"Content blocks: {len(response.content)}")
            print(f"{'='*60}\n")

            # Extract text from response
            analysis_text = response.content[0].text

            logger.info("Successfully received analysis from Claude")
            logger.info(f"Response ID: {response.id}, Tokens used: {response.usage.input_tokens + response.usage.output_tokens}")

            return analysis_text

        except Exception as e:
            # Enhanced error logging
            print(f"\n{'='*60}")
            print(f"CLAUDE API ERROR")
            print(f"{'='*60}")
            print(f"Error type: {type(e).__name__}")
            print(f"Error message: {str(e)}")
            print(f"Full error details:")
            import traceback
            print(traceback.format_exc())
            print(f"{'='*60}\n")

            logger.error(f"Error calling Claude API: {str(e)}")
            logger.error(f"Error type: {type(e).__name__}")
            logger.error(f"Full traceback: {traceback.format_exc()}")

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

    async def test_connection(self) -> Dict:
        """
        Test Claude API connection with a minimal request.

        Returns:
            Dictionary with test results including success status and details
        """
        try:
            print(f"\n{'='*60}")
            print(f"TESTING CLAUDE API CONNECTION")
            print(f"{'='*60}")
            print(f"Model: {self.model}")
            print(f"API Key (first 20 chars): {settings.anthropic_api_key[:20]}...")
            print(f"Making test request to Claude...")
            print(f"{'='*60}\n")

            logger.info("Testing Claude API connection")

            # Make a simple test request
            response = await self.client.messages.create(
                model=self.model,
                max_tokens=50,
                messages=[{
                    "role": "user",
                    "content": "Say 'Hello, Golf Coach!' and nothing else."
                }]
            )

            print(f"\n{'='*60}")
            print(f"TEST SUCCESSFUL")
            print(f"{'='*60}")
            print(f"Response ID: {response.id}")
            print(f"Model: {response.model}")
            print(f"Stop reason: {response.stop_reason}")
            print(f"Input tokens: {response.usage.input_tokens}")
            print(f"Output tokens: {response.usage.output_tokens}")
            print(f"Response text: {response.content[0].text}")
            print(f"{'='*60}\n")

            logger.info(f"Test successful - Response ID: {response.id}")

            return {
                "success": True,
                "message": "Claude API connection successful",
                "response_id": response.id,
                "model": response.model,
                "usage": {
                    "input_tokens": response.usage.input_tokens,
                    "output_tokens": response.usage.output_tokens
                },
                "response_text": response.content[0].text
            }

        except Exception as e:
            print(f"\n{'='*60}")
            print(f"TEST FAILED")
            print(f"{'='*60}")
            print(f"Error type: {type(e).__name__}")
            print(f"Error message: {str(e)}")
            print(f"Full error details:")
            print(traceback.format_exc())
            print(f"{'='*60}\n")

            logger.error(f"Test failed: {str(e)}")
            logger.error(f"Error type: {type(e).__name__}")

            return {
                "success": False,
                "message": "Claude API connection failed",
                "error_type": type(e).__name__,
                "error_message": str(e),
                "traceback": traceback.format_exc()
            }


# Global instance
claude_service = ClaudeService()
