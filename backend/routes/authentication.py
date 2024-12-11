from typing import Annotated
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel

from jwt import InvalidTokenError

from backend.data.access_token import Token, TokenData, global_TokenManager
from backend.data.user_accounts import UserRole, global_UserAccounts

import json
from pathlib import Path

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
auth_router = APIRouter()

DATA_FILE = Path(__file__).parent.parent / "data" / "user-accounts.json"
# SESSION_COOKIE_NAME = "user_session"

async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:        
        payload = global_TokenManager.decodeToken(token)
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except InvalidTokenError:
        raise credentials_exception
    
    user_record = global_UserAccounts.getUserRecordByUserName(token_data.username)
    if user_record is None:
        raise credentials_exception
    return UserRole(role=user_record["role"], username=user_record["username"])


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

class LoginRequest(BaseModel):
    username: str
    password: str

@auth_router.post("/token")
async def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()],) -> Token:        
    user_record = global_UserAccounts.verifyUserPassword(form_data.username, form_data.password)
    if user_record is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = global_TokenManager.createAccessToken(data={"sub": user_record["username"]})

    return Token(access_token=access_token, token_type="bearer", username=user_record["username"], role=user_record["role"])

@auth_router.get("/users/me")
async def read_users_me(current_user: Annotated[UserRole, Depends(get_current_user)], ):    
    return current_user

# @auth_router.get("/logout")
# async def logout(response: Response):

#     response.delete_cookie(SESSION_COOKIE_NAME)
#     return JSONResponse(content={"message": "Logged out successfully"})