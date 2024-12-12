
# openssl rand -hex 32
from datetime import datetime, timedelta, timezone
import jwt
from pydantic import BaseModel


class Token(BaseModel):
    access_token: str
    token_type: str
    username: str
    role: str


class TokenData(BaseModel):
    username: str = ''


class TokenManager:

    SECRET_KEY = \
        "2ace576ed2b759a38aca8480d2d6914fb94a9bdbf0b93fd6efa40c6dab40ff4d"
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 15

    def __init__(self) -> None:
        pass

    def getExpiryDelta(self, expires_delta: int):
        expire = datetime.now(timezone.utc) + timedelta(minutes=expires_delta)
        return expire

    def createAccessToken(self, data: dict):
        to_encode = data.copy()
        expire = self.getExpiryDelta(self.ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(
            to_encode, self.SECRET_KEY, algorithm=self.ALGORITHM)
        return encoded_jwt

    def decodeToken(self, token):
        return jwt.decode(token, self.SECRET_KEY, algorithms=[self.ALGORITHM])


global_TokenManager = TokenManager()
