from fastapi import APIRouter, HTTPException, Depends, Response, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel

import json
from typing import Annotated
from pathlib import Path
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

auth_router = APIRouter()
oauth2_scheme_authentication = OAuth2PasswordBearer(tokenUrl="token")

DATA_FILE = Path(__file__).parent.parent / "data" / "user-accounts.json"
# SESSION_COOKIE_NAME = "user_session"

def load_credentials():
    try:
        with open(DATA_FILE, "r") as file:
            return json.load(file)
    except Exception as e:
        raise RuntimeError("Error reading user-accounts.json") from e
    
login_data = load_credentials()
    
class LoginRequest(BaseModel):
    username: str
    disabled: bool | None = None

class UserInDB(LoginRequest):
    hashed_password: str

def get_user(username: str):
    for user in login_data:
        if username == user["username"]:
            return user
    return None
    
def fake_decode_token(token: str):
    user = get_user(token)
    return user

async def get_current_user(token: Annotated[str, Depends(oauth2_scheme_authentication)]):
    user = fake_decode_token(token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
            )
    return user

async def get_current_active_user(current_user: Annotated[LoginRequest, Depends(get_current_user)]):
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

# def validate_user(username: str, password: str):
#     credentials = load_credentials()
#     for user in credentials:
#         if user["username"] == username and user["password"] == password:
#             return user
#     return None

def fake_hash_password(password: str):
    return "fakehashed" + password

@auth_router.post("/token")
async def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()]):
    user_dict = get_user(form_data.username)
    if not user_dict:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    user_dict["hashed_password"] = fake_hash_password(user_dict["password"])
    #del user_dict["password"]   #monitor if works, then modify/delete
    user = UserInDB(**user_dict)
    hashed_password = fake_hash_password(form_data.password)
    if not hashed_password == user.hashed_password:
        raise HTTPException(status_code=400, detail="Incorrect username or password")

    if user_dict["role"] == "Module Organiser":
        return JSONResponse(content={"message": "Welcome Module Organizer!", "dashboard": "/module-organizer-dashboard"})
    elif user_dict["role"] == "Marker":
        return JSONResponse(content={"message": "Welcome Marker!", "dashboard": "/marker-dashboard"})
    elif user_dict["role"] == "Student":
        return JSONResponse(content={"message": "Welcome Student!", "dashboard": "/student-dashboard"})
    else:
        raise HTTPException(status_code=403, detail="Role not authorized")

# @auth_router.get("/logout")
# async def logout(response: Response):

#     response.delete_cookie(SESSION_COOKIE_NAME)
#     return JSONResponse(content={"message": "Logged out successfully"})

@auth_router.get("/users/me")
async def read_users_me(
    current_user: Annotated[LoginRequest, Depends(get_current_active_user)],
):
    return current_user
