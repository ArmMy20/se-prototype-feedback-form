from fastapi import APIRouter
from typing import List, Dict, Any
import json

module_organizer_router = APIRouter()

# Load feedback data from JSON
with open("feedback-submission-data.json") as f:
    feedback_data = json.load(f)

@module_organizer_router.get("/module_organizer/feedback", response_model=List[Dict[str, Any]])
async def get_all_feedback_for_module_organizer():
    """
    Retrieve all feedback data across all assignments and submissions.
    """
    all_feedback = []
    for assignment in feedback_data:
        for submission in assignment["submissions"]:
            all_feedback.append({
                "assignment_id": assignment["assignment_id"],
                "student_id": submission["studentId"],
                "marker_id": submission["markerId"],
                "feedback": submission["feedback"],
                "overall_marks": submission["overallMarks"]
            })

    if not all_feedback:
        return {"message": "No feedback data available yet"}

    return all_feedback
