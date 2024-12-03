from fastapi import APIRouter, Depends, HTTPException, Cookie
from typing import Dict
import json

assignment_router = APIRouter()
file_path = "backend/data/assignment-data.json"

def read_json():
    try:
        with open(file_path, 'r') as file:
            data = json.load(file)
        return data
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Assignments file not found")
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Invalid JSON format in assignments file")

try:
    assignments = read_json()
except NameError:
    assignments = None

def verify_new_assignment(usr_assignment: Dict[str, str]):
    for field in usr_assignment:
        if not isinstance(usr_assignment[field], str):
            raise HTTPException(status_code=400, detail=f"Field '{field}' must be of type 'str'")
        
    required_fields = ["assignment_id", "assignment_name", "assignment_assigned_by", "assignment_tags"]

    for field in required_fields:
        if field not in usr_assignment:
            raise HTTPException(status_code=400, detail=f"Missing required field '{field}'")
        
    for assignment in assignments:   #to ensure new assignment does not already exist in json file
        if assignment["assignment_name"] == usr_assignment["assignment_name"]:
            raise HTTPException(status_code=400, detail=f"Assignment already exists. Please create a new one.")
        
    last_assignment_id = assignments[-1].get("assignment_id", "")
    prefix, num = last_assignment_id[:1], last_assignment_id[1:]

    # if not num.isdigit():
    #     raise HTTPException(status_code=400, detail="Invalid assignment_id format")
            
    new_id_num = int(num) + 1
    expected_new_id = f"{prefix}{new_id_num:03d}"

    if usr_assignment["assignment_id"] != expected_new_id:
        raise HTTPException(status_code=400, detail="assignment_id must be incremented correctly")
    
    return True

def write_json(new_assignment: Dict[str, str]):
    verify_new_assignment(new_assignment)
    try:        
        assignments.append(new_assignment)

        with open(file_path, 'w') as file:
            json.dump(assignments, file, indent=4)

    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to write to assignments file")


@assignment_router.post("/post-assignments", tags=["assignments"])
async def post_assignments(new_assignment_added: Dict[str, str]):
    if assignments == None:
        return {"message": "No assignments data available"}
    
    write_json(new_assignment_added)
    return {"Message": "Assignment added successfully.", "assignment": new_assignment_added}
    

@assignment_router.get("/get-assignments", tags=["assignments"])
async def get_assignments():
    return read_json()