from fastapi import APIRouter, Depends, HTTPException
from typing import Annotated, List, Dict, Any
from pathlib import Path
import json

from backend.data.user_accounts import UserRole
from backend.routes.authentication import get_current_user

module_organizer_router = APIRouter()

# Define the path to the data file
DATA_FILE = Path(__file__).parent.parent / "data" / "feedback-submission-data.json"

# Load feedback data from JSON
try:
    with open(DATA_FILE, 'r') as f:
        feedback_data = json.load(f)
except FileNotFoundError:
    raise RuntimeError(f"Data file not found at {DATA_FILE}. Please ensure the file exists.")

@module_organizer_router.get("/module_organizer/feedback", response_model=List[Dict[str, Any]])
async def get_all_feedback_for_module_organizer(
    assignment_id: str,
    student_id: str,
    marker_id: str,
    current_user: Annotated[UserRole, Depends(get_current_user)]
):

    """
    Retrieve all feedback data across all assignments and submissions.
    Optional query parameters can filter feedback based on assignment ID, student ID, or marker ID.
    """
    all_feedback = []
    
    # Iterate through all feedback data and apply optional filters
    for assignment in feedback_data:
        # Skip assignments if a specific assignment_id filter is applied and doesn't match
        if assignment_id and assignment["assignment_id"] != assignment_id:
            continue
        
        for submission in assignment["submissions"]:
            # Skip submissions if student_id or marker_id filters are applied and don't match
            if student_id and submission["studentId"] != student_id:
                continue
            if marker_id and submission["markerId"] != marker_id:
                continue
            
            all_feedback.append({
                "assignment_id": assignment["assignment_id"],
                "student_id": submission["studentId"],
                "marker_id": submission["markerId"],
                "feedback": submission["feedback"],
                "overall_marks": submission["overallMarks"]
            })

    # Return a meaningful message if no feedback data matches the filters
    if not all_feedback:
        raise HTTPException(status_code=404, detail="No feedback data available for the given criteria")

    return all_feedback