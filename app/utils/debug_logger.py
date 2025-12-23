"""Debug logging utility for tracking request flow through all 15 steps"""
import logging
import time
import uuid
from typing import Dict, List, Optional, Any
from datetime import datetime
import json
from collections import deque

logger = logging.getLogger(__name__)


class DebugLogger:
    """
    Tracks detailed step-by-step execution flow for debugging.
    Stores recent debug sessions in memory for easy viewing.
    """

    # Store last 50 debug sessions
    _recent_sessions = deque(maxlen=50)

    STEPS = {
        1: "User uploads images",
        2: "FRONTEND compresses images (2MB max)",
        3: "User adds annotations (club, outcome, focus, notes)",
        4: "Frontend sends FormData to BACKEND",
        5: "BACKEND validates images (5MB max, MIME types)",
        6: "BACKEND converts to base64 + detects formats",
        7: "BACKEND fetches last 3 swings from DATABASE",
        8: "BACKEND builds intelligent prompt with history",
        9: "BACKEND calls Claude API (Haiku model)",
        10: "CLAUDE analyzes swing + compares to history",
        11: "BACKEND parses response (extract rating + summary)",
        12: "BACKEND saves complete record to DATABASE",
        13: "BACKEND returns structured response to FRONTEND",
        14: "FRONTEND updates SwingContext state",
        15: "FRONTEND displays AnalysisResults component"
    }

    def __init__(self, request_id: Optional[str] = None):
        """Initialize debug logger with unique request ID"""
        self.request_id = request_id or str(uuid.uuid4())
        self.start_time = time.time()
        self.steps: List[Dict[str, Any]] = []
        self.errors: List[Dict[str, Any]] = []
        self.metadata: Dict[str, Any] = {
            "request_id": self.request_id,
            "start_time": datetime.now().isoformat(),
            "steps_completed": 0,
            "total_duration_ms": 0,
            "status": "in_progress"
        }

        # Print header
        print(f"\n{'='*80}")
        print(f"DEBUG SESSION STARTED")
        print(f"{'='*80}")
        print(f"Request ID: {self.request_id}")
        print(f"Timestamp: {self.metadata['start_time']}")
        print(f"{'='*80}\n")

        logger.info(f"[DEBUG:{self.request_id}] Session started")

    def log_step(
        self,
        step_number: int,
        status: str = "completed",
        details: Optional[Dict[str, Any]] = None,
        error: Optional[str] = None
    ):
        """
        Log a step in the process.

        Args:
            step_number: Step number (1-15)
            status: 'started', 'completed', 'failed'
            details: Additional information about the step
            error: Error message if step failed
        """
        current_time = time.time()
        duration_ms = int((current_time - self.start_time) * 1000)

        step_info = {
            "step_number": step_number,
            "step_name": self.STEPS.get(step_number, f"Unknown step {step_number}"),
            "status": status,
            "timestamp": datetime.now().isoformat(),
            "duration_from_start_ms": duration_ms,
            "details": details or {},
            "error": error
        }

        self.steps.append(step_info)

        # Update metadata
        if status == "completed":
            self.metadata["steps_completed"] = step_number

        # Print step info
        status_symbol = {
            "started": "▶",
            "completed": "✓",
            "failed": "✗"
        }.get(status, "•")

        print(f"{status_symbol} Step {step_number}: {step_info['step_name']}")
        print(f"  Status: {status.upper()}")
        print(f"  Duration from start: {duration_ms}ms")

        if details:
            print(f"  Details: {json.dumps(details, indent=4)}")

        if error:
            print(f"  ERROR: {error}")

        print()

        # Log to file
        log_msg = f"[DEBUG:{self.request_id}] Step {step_number} ({status}): {step_info['step_name']}"
        if error:
            logger.error(f"{log_msg} - ERROR: {error}")
        else:
            logger.info(log_msg)

        # If step failed, record error
        if status == "failed" and error:
            self.errors.append({
                "step": step_number,
                "step_name": step_info['step_name'],
                "error": error,
                "timestamp": step_info['timestamp']
            })

    def finalize(self, success: bool = True):
        """Finalize the debug session"""
        end_time = time.time()
        total_duration = int((end_time - self.start_time) * 1000)

        self.metadata["status"] = "success" if success else "failed"
        self.metadata["total_duration_ms"] = total_duration
        self.metadata["end_time"] = datetime.now().isoformat()
        self.metadata["error_count"] = len(self.errors)

        # Print summary
        print(f"\n{'='*80}")
        print(f"DEBUG SESSION ENDED")
        print(f"{'='*80}")
        print(f"Request ID: {self.request_id}")
        print(f"Status: {self.metadata['status'].upper()}")
        print(f"Steps Completed: {self.metadata['steps_completed']}/15")
        print(f"Total Duration: {total_duration}ms")
        print(f"Errors: {len(self.errors)}")

        if self.errors:
            print(f"\nERRORS ENCOUNTERED:")
            for err in self.errors:
                print(f"  • Step {err['step']}: {err['error']}")

        print(f"{'='*80}\n")

        logger.info(f"[DEBUG:{self.request_id}] Session ended - Status: {self.metadata['status']}, Duration: {total_duration}ms")

        # Store session for later retrieval
        session_data = {
            "metadata": self.metadata,
            "steps": self.steps,
            "errors": self.errors
        }
        self._recent_sessions.append(session_data)

    def get_summary(self) -> Dict[str, Any]:
        """Get a summary of the debug session"""
        return {
            "metadata": self.metadata,
            "steps": self.steps,
            "errors": self.errors
        }

    @classmethod
    def get_recent_sessions(cls, limit: int = 10) -> List[Dict[str, Any]]:
        """Get recent debug sessions"""
        sessions = list(cls._recent_sessions)
        return sessions[-limit:]

    @classmethod
    def get_session_by_id(cls, request_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific session by request ID"""
        for session in cls._recent_sessions:
            if session["metadata"]["request_id"] == request_id:
                return session
        return None
