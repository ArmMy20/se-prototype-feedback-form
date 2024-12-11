from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException

from pydantic import ValidationError

from backend.data.feedback_submission_data import FeedbackSubmissionData
from backend.data.json_data_file import JsonRecordFile
from backend.data.user_accounts import UserRole
from backend.models.feedback_form_models import FeedbackFormCriteria, FeedbackFormCriteriaEntry, Submission
from backend.routes.authentication import get_current_user

feedback_form_router = APIRouter()
feedback_criteria_data = JsonRecordFile(file_path="backend/data/feedback-form-criteria.json")
feedback_submission_data = FeedbackSubmissionData()

def validate_new_feedback_form(new_feedback_form: FeedbackFormCriteria):
    cur_feedback_form = feedback_criteria_data.getRecords()
    for feedback in cur_feedback_form:   #to ensure new assignment does not already exist in json file
        if feedback["assignment_id"] == new_feedback_form.assignment_id:
            raise Exception(f"Feedback form for {new_feedback_form.assignment_id} already exists.")
    
    return True


# POST /feedback-form = Save feedback forms created by module organisers
@feedback_form_router.post("/post-new-feedback-form", tags=["feedback"])
async def post_feedback_form(new_form: FeedbackFormCriteria, current_user: Annotated[UserRole, Depends(get_current_user)]):
    try:       
        # validate new_form (check whether feedback form for assignment already exists (fail safe))
        validate_new_feedback_form(new_form)
        # persist new_form in file
        feedback_criteria_data.addRecord(new_form)
        # return new_form
        return new_form
        # on exception, return details
    except ValidationError as ve:
        raise HTTPException(status_code=500, details=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def get_criteria_list_for_assignment(a_id: int):
    for criteria in feedback_criteria_data.getRecords():
        if a_id == criteria["assignment_id"]:
            return criteria["criteria"]

def get_criteria_with_name_from_criteria_list(criteria_list: list[FeedbackFormCriteriaEntry], criteria_name: str):
    for criteria in criteria_list:
        if criteria["name"] == criteria_name:
            return criteria

def validate_feedback_marks(submission: Submission):
    criteria_list = get_criteria_list_for_assignment(submission.assignment_id)
    for feedback in submission.submission.feedback:
        criteria_def = get_criteria_with_name_from_criteria_list(criteria_list, feedback.criteria)
        if feedback.marks > criteria_def["marks"]:
            raise Exception(f"Marks exceed maximum possible for {feedback.criteria}. Maximum is {criteria_def["marks"]}.")
        
def get_total_marks(a_id: int):
    for criteria in feedback_criteria_data.getRecords():
        if a_id == criteria["assignment_id"]:
            return criteria["totalMarks"]

def validate_submission_overall_marks(submission: Submission):
    total_marks = get_total_marks(submission.assignment_id)

    if submission.submission.overallMarks > total_marks:
        raise Exception (f"Overall marks exceed total possible mark of {total_marks}.")
    
def validate_all_criteria_present(submission: Submission):
    c_list = get_criteria_list_for_assignment(submission.assignment_id)
    criteria_name_list = [criteria["name"] for criteria in c_list]
    feedback_name_list = [feedback.criteria for feedback in submission.submission.feedback]
    for criteria_name in criteria_name_list:
        if not criteria_name in feedback_name_list:
            raise Exception(f"Missing criteria '{criteria_name}' in submission")

# POST /feedback-form = Save feedback forms submitted by markers
@feedback_form_router.post("/save-feedback", tags=["feedback"])
async def save_feedback(submission: Submission, current_user: Annotated[UserRole, Depends(get_current_user)]):
    try:
        #create function to validate each criteria's marks do not exceed each section's marks, and overall marks do not exceed total marks
        validate_all_criteria_present(submission)
        validate_feedback_marks(submission)
        validate_submission_overall_marks(submission)
        #add submission to feedback-submission-data json file
        feedback_submission_data.addSubmission(submission)
        return submission
    
    except ValidationError as ve:
        raise HTTPException(status_code=500, details=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

    # required_fields = ["assignment_id", "student_id", "marker_id", "feedback", "overallMarks"]

    # for field in required_fields:
    #     if field not in feedback:
    #         raise HTTPException(status_code=400, detail=f"Missing required field '{field}'")

    # if not isinstance(feedback["assignment_id"], str):
    #     raise HTTPException(status_code=400, detail="Field 'assignment_id' must be a string")
    # if not isinstance(feedback["student_id"], str):
    #     raise HTTPException(status_code=400, detail="Field 'student_id' must be a string")
    # if not isinstance(feedback["marker_id"], str):
    #     raise HTTPException(status_code=400, detail="Field 'marker_id' must be a string")
    # if not isinstance(feedback["overallMarks"], int):
    #     raise HTTPException(status_code=400, detail="Field 'overallMarks' must be an integer")
    # if not isinstance(feedback["feedback"], list):
    #     raise HTTPException(status_code=400, detail="Field 'feedback' must be a list of dictionaries")
    
    # assignment = next((item for item in feedback_submission_data if item["assignment_id"] == feedback["assignment_id"]), None)
    
    # if assignment:
    #     new_submission = {
    #         "studentId": feedback["student_id"],
    #         "markerId": feedback["marker_id"],
    #         "feedback": feedback["feedback"],
    #         "overallMarks": feedback["overallMarks"]
    #     }
    #     assignment["submissions"].append(new_submission)

    # else:
    #     new_assignment = {
    #         "assignment_id": feedback["assignment_id"],
    #         "submissions": [
    #             {
    #                 "studentId": feedback["student_id"],
    #                 "markerId": feedback["marker_id"],
    #                 "feedback": feedback["feedback"],
    #                 "overallMarks": feedback["overallMarks"]
    #             }
    #         ]
    #     }

    #     feedback_submission_data.append(new_assignment)
    
    # write_json(feedback_submission_file_path, feedback_submission_data)
    # return {"message": "Feedback saved successfully", "feedback": feedback}
