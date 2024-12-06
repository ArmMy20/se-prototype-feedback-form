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
            feedback_criteria_data.append(data)     #causes trailing comma!!!!!
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
async def post_feedback_form(new_form: Dict[str, Union[str, int, List[Dict[str, Union[str, int]]]]]
):
    required_fields = ["assignment_id", "criteria"]
    for field in required_fields:
        if field not in new_form:
            raise HTTPException(status_code=400, detail=f"Missing required field '{field}'")

    # Ensure the assignment_id is unique
    for form in feedback_criteria_data:
        if form["assignment_id"] == new_form["assignment_id"]:
            raise HTTPException(status_code=400, detail="Feedback form for this assignment already exists.")

    # Append the new feedback form and save
    feedback_criteria_data.append(new_form)
    write_json(feedback_criteria_file_path, feedback_criteria_data)

    return {"message": "Feedback form saved successfully.", "feedback_form": new_form}