from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import json
from pathlib import Path

auth_router = APIRouter()

DATA_FILE = Path(__file__).parent.parent / "data" / "user-accounts.json"

class LoginRequest(BaseModel):
    username: str
    password: str

def load_credentials():
    try:
        with open(DATA_FILE, "r") as file:
            return json.load(file)
    except Exception as e:
        raise RuntimeError("Error reading user-accounts.json") from e

def validate_user(username: str, password: str):
    credentials = load_credentials()
    for user in credentials:
        if user["username"] == username and user["password"] == password:
            return user
    return None

@auth_router.post("/login")
async def login(login_request: LoginRequest):
    user = validate_user(login_request.username, login_request.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    if user["role"] == "Module Organiser":
        return JSONResponse(content={"message": "Welcome Module Organizer!", "dashboard": "/module-organizer-dashboard"})
    elif user["role"] == "Marker":
        return JSONResponse(content={"message": "Welcome Marker!", "dashboard": "/marker-dashboard"})
    elif user["role"] == "Student":
        return JSONResponse(content={"message": "Welcome Student!", "dashboard": "/student-dashboard"})
    else:
        raise HTTPException(status_code=403, detail="Role not authorized")
