from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException

from pydantic import ValidationError
from backend.data.json_data_file import JsonRecordFile
from backend.data.user_accounts import UserRole
from backend.models.assignment_model import Assignment
from backend.routes.authentication import get_current_user

assignment_router = APIRouter()
assignment_data = JsonRecordFile(file_path="backend/data/assignment-data.json")


def verify_new_assignment(usr_assignment: Assignment):
    cur_assignments = assignment_data.getRecords()
    for assignment in cur_assignments:
        if assignment["assignment_name"] == usr_assignment.assignment_name:
            raise Exception(
                f"Assignment {usr_assignment.assignment_name} already exists.")

    return True


def set_id_for_new_assignment(new_assignment: Assignment):
    cur_assignments = assignment_data.getRecords()
    last_assignment_id = cur_assignments[-1].get("assignment_id", "")
    num = int(last_assignment_id[1:])
    new_assignment.set_id(num+1)
    return new_assignment


# post method to add assignment to json
@assignment_router.post("/post-assignment", tags=["assignments"])
async def post_assignment(
        new_assignment: Assignment,
        current_user: Annotated[UserRole, Depends(get_current_user)]):
    try:
        verify_new_assignment(new_assignment)
        new_assignment = set_id_for_new_assignment(new_assignment)
        assignment_data.addRecord(new_assignment)
        return new_assignment
    except ValidationError as ve:
        raise HTTPException(status_code=500, details=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# get method to retrieve assignments
@assignment_router.get("/get-assignments", tags=["assignments"])
async def get_assignments(
        current_user: Annotated[UserRole, Depends(get_current_user)]):
    return assignment_data.getRecords()
