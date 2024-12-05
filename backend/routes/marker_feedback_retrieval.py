from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
import json

marker_router = APIRouter()

# Load feedback data from JSON
with open("feedback-submission-data.json") as f:
    feedback_data = json.load(f)

@marker_router.get("/marker/feedback/{assignment_id}/{marker_id}", response_model=List[Dict[str, Any]])
async def get_feedback_by_marker(assignment_id: str, marker_id: str):
    """
    Retrieve all feedback entered by a specific marker for a given assignment.
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
