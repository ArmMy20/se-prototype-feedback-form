from fastapi import APIRouter, HTTPException
from typing import Dict, Any
import json

student_router = APIRouter()

# Load feedback data from JSON
with open("feedback-submission-data.json") as f:
    feedback_data = json.load(f)

@student_router.get("/student/feedback/{assignment_id}/{student_id}", response_model=Dict[str, Any])
async def get_student_feedback(assignment_id: str, student_id: str):
    """
    Retrieve feedback for a specific student for a given assignment.
    """
    assignment = next((a for a in feedback_data if a["assignment_id"] == assignment_id), None)
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    submission = next((s for s in assignment["submissions"] if s["studentId"] == student_id), None)
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    return {
        "assignment_id": assignment_id,
        "student_id": student_id,
        "marker_id": submission["markerId"],
        "feedback": submission["feedback"],
        "overall_marks": submission["overallMarks"]
    }
