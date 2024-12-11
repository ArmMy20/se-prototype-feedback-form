from fastapi import APIRouter, Depends, HTTPException
from typing import Annotated, List, Dict, Any
from pathlib import Path
import json

from backend.data.user_accounts import UserRole
from backend.routes.authentication import get_current_user

marker_router = APIRouter()

DATA_FILE = Path(__file__).parent.parent / "data" / "feedback-submission-data.json"

try:
    with open(DATA_FILE, 'r') as f:
        feedback_data = json.load(f)
except FileNotFoundError:
    raise RuntimeError(f"Data file not found at {DATA_FILE}. Please ensure the file exists.")

@marker_router.get("/marker/feedback", response_model=List[Dict[str, Any]])
async def get_feedback_by_marker(
    assignment_id: str, 
    marker_id: str,
    current_user: Annotated[UserRole, Depends(get_current_user)]
):
    """
    Retrieve all feedback entered by a specific marker for a given assignment using query parameters.
    """

    assignment = next((a for a in feedback_data if a["assignment_id"] == assignment_id), None)
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    feedback_by_marker = [
        {
            "student_id": submission["studentId"],
            "feedback": submission["feedback"],
            "overall_marks": submission["overallMarks"]
        }
        for submission in assignment["submissions"] if submission["markerId"] == marker_id
    ]

    if not feedback_by_marker:
        raise HTTPException(
            status_code=404,
            detail=f"No feedback available for marker ID {marker_id} in assignment {assignment_id}"
        )

    return feedback_by_marker