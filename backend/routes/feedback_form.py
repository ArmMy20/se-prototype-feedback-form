from fastapi import APIRouter, HTTPException
from typing import Dict, List, Union
import json

feedback_form_router = APIRouter()

feedback_criteria_file_path = "backend/data/feedback-form-criteria.json"
feedback_submission_file_path = "backend/data/feedback-submission-data.json"

def read_json(file_path) -> Dict[str, Union[str, int, List[Dict[str, Union[str, int]]]]]:
    try:
        with open(file_path, 'r') as file:
            return json.load(file)
        return data
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Assignments file not found")
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Invalid JSON format in assignments file")
    
feedback_criteria_data = read_json(feedback_criteria_file_path)
feedback_submission_data = read_json(feedback_submission_file_path)

def write_json(file_path, data: Dict[str, Union[str, int, List[Dict[str, Union[str, int]]]]]):
    if file_path == feedback_criteria_file_path:
        try:
            with open(file_path, 'w') as file:
                json.dump(feedback_criteria_data, file, indent=4)


        except Exception as e:
            raise HTTPException(status_code=500, detail="Failed to write to feedback-form-criteria file")
    else:
        try:
            with open(file_path, 'w') as file:
                json.dump(feedback_submission_data, file, indent=4)
            feedback_submission_data.append(data)
        except Exception as e:
            raise HTTPException(status_code=500, detail="Failed to write to feedback-submission-data file")

# POST /feedback-form = Save feedback forms created by module organisers
@feedback_form_router.post("/post-new-feedback-form", tags=["feedback"])
async def post_feedback_form(new_form: Dict[str, Union[str, int, List[Dict[str, Union[str, int]]]]]):
    required_fields = ["assignment_id", "criteria"]
    for field in required_fields:
        if field not in new_form:
            raise HTTPException(status_code=400, detail=f"Missing required field '{field}'")

    for form in feedback_criteria_data:
        if form["assignment_id"] == new_form["assignment_id"]:
            raise HTTPException(status_code=400, detail="Feedback form for this assignment already exists.")

    feedback_criteria_data.append(new_form)
    write_json(feedback_criteria_file_path, feedback_criteria_data)

    return {"message": "Feedback form saved successfully.", "feedback_form": new_form}


# POST /feedback-form = Save feedback forms submitted by markers
@feedback_form_router.post("/save-feedback", tags=["feedback"])
async def save_feedback(feedback: Dict[str, Union[str, int, List[Dict[str, Union[str, int]]]]]):
    required_fields = ["assignment_id", "student_id", "marker_id", "feedback", "overallMarks"]

    for field in required_fields:
        if field not in feedback:
            raise HTTPException(status_code=400, detail=f"Missing required field '{field}'")

    if not isinstance(feedback["assignment_id"], str):
        raise HTTPException(status_code=400, detail="Field 'assignment_id' must be a string")
    if not isinstance(feedback["student_id"], str):
        raise HTTPException(status_code=400, detail="Field 'student_id' must be a string")
    if not isinstance(feedback["marker_id"], str):
        raise HTTPException(status_code=400, detail="Field 'marker_id' must be a string")
    if not isinstance(feedback["overallMarks"], int):
        raise HTTPException(status_code=400, detail="Field 'overallMarks' must be an integer")
    if not isinstance(feedback["feedback"], list):
        raise HTTPException(status_code=400, detail="Field 'feedback' must be a list of dictionaries")
    
    if not any(form["assignment_id"] == feedback["assignment_id"] for form in feedback_criteria_data):
        raise HTTPException(status_code=400, detail=f"Assignment ID '{feedback['assignment_id']}' not found in feedback criteria")
    #check if assignment already in feedback-submission-data, if not, create new entry with no data to add feedback submission
    
    feedback_submission_data.append(feedback)
    write_json(feedback_submission_file_path, feedback_submission_data)
    return {"message": "Feedback saved successfully", "feedback": feedback}
