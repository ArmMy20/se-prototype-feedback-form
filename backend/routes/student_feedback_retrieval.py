from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from pathlib import Path
import json

student_router = APIRouter()

# Define the path to the data file
file_path = "backend/data/feedback-submission-data.json"

def read_json():
    try:
        with open(file_path, 'r') as file:
            data = json.load(file)
        return data
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Assignments file not found")
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Invalid JSON format in assignments file")
    
student_feedback_data = read_json()

from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any

student_router = APIRouter()

@student_router.get("/student/feedback", response_model=Dict[str, Any])
async def get_student_feedback(
    assignment_id: str, 
    student_id: str
):

    """
    Retrieve feedback for a specific student for a given assignment using query parameters.
    """
    
    assignment = next((a for a in student_feedback_data if a["assignment_id"] == assignment_id), None)
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

