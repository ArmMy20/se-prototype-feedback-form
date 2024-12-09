from fastapi import APIRouter, HTTPException

from pydantic import ValidationError
from backend.data.json_data_file import JsonRecordFile
from backend.models.assignment_model import Assignment

assignment_router = APIRouter()
assignment_data = JsonRecordFile(file_path = "backend/data/assignment-data.json")

def verify_new_assignment(usr_assignment: Assignment):
    cur_assignments = assignment_data.getRecords()
    for assignment in cur_assignments:   #to ensure new assignment does not already exist in json file
        if assignment["assignment_name"] == usr_assignment.assignment_name:
            raise Exception(f"Assignment {usr_assignment.assignment_name} already exists.")
    
    return True

def set_id_for_new_assignment(new_assignment: Assignment):
    cur_assignments = assignment_data.getRecords()    
    last_assignment_id = cur_assignments[-1].get("assignment_id", "")
    num = int(last_assignment_id[1:])
    new_assignment.set_id(num+1)    
    return new_assignment


#post method to add assignment to json
@assignment_router.post("/post-assignment", tags=["assignments"])
async def post_assignment(new_assignment: Assignment):  
    try:  
        verify_new_assignment(new_assignment)
        new_assignment = set_id_for_new_assignment(new_assignment)
        assignment_data.addRecord(new_assignment)
        return new_assignment
    except ValidationError as ve:
        raise HTTPException(status_code=500, details=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

#get method to retrieve assignments
@assignment_router.get("/get-assignments", tags=["assignments"])
async def get_assignments():
    return assignment_data.getRecords()