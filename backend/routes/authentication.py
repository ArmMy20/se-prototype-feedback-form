from fastapi import APIRouter, HTTPException, Depends, Response, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from passlib.context import CryptContext
import jwt

import json
from datetime import datetime, timedelta
from typing import Annotated, List
from pathlib import Path
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

auth_router = APIRouter()
oauth2_scheme_authentication = OAuth2PasswordBearer(tokenUrl="token")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

DATA_FILE = Path(__file__).parent.parent / "data" / "user-accounts.json"
SECRET_KEY = "bee6fb63a084e820cac789bb0ff550d6a10ae4a0f21aab8e311aaaf1f93bb396"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

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

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now() + expires_delta
    else:
        expire = datetime.now() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_user(username: str):
    for user in login_data:
        if username == user["username"]:
            return user
    return None

async def get_current_user(token: str = Depends(oauth2_scheme_authentication)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = get_user(username)
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_current_active_user(current_user: dict = Depends(get_current_user)):
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

# def validate_user(username: str, password: str):
#     credentials = load_credentials()
#     for user in credentials:
#         if user["username"] == username and user["password"] == password:
#             return user
#     return None

@auth_router.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user_dict = get_user(form_data.username)
    if not user_dict:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    if not verify_password(form_data.password, user_dict["password"]):
        raise HTTPException(status_code=400, detail="Incorrect username or password")

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_dict["username"], "role": user_dict["role"]},
        expires_delta=access_token_expires,
    )

    message = f"Welcome {user_dict['role']}!"
    return {"message": message, "access_token": access_token, "token_type": "bearer"}


# @auth_router.get("/logout")
# async def logout(response: Response):

#     response.delete_cookie(SESSION_COOKIE_NAME)
#     return JSONResponse(content={"message": "Logged out successfully"})

@auth_router.get("/logout")
async def logout():
    """Logout endpoint (JWT can't be truly invalidated server-side)."""
    return JSONResponse(content={"message": "Logout successful"})



@auth_router.get("/users/me")
async def read_users_me(
    current_user: Annotated[LoginRequest, Depends(get_current_active_user)],
):
    return {
        "username": current_user["username"],
        "role": current_user["role"],
        "user_id": current_user.get("user_id"),
    }