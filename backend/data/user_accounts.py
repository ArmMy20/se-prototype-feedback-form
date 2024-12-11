
import bcrypt
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel

from backend.data.json_data_file import JsonRecordFile


class UserRole(BaseModel):    
    role: str
    username: str    


class UserAccounts(JsonRecordFile):

    oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
    
    def __init__(self):
        super().__init__("backend/data/user-accounts.json")    

    def getUserRecordByUserName(self, user_name: str):
        found_record = None
        if not self.all_records is None:
            for user_record in self.all_records:
                if user_record["username"] == user_name:
                    found_record = user_record
                    break
        return found_record

    def verifyUserPassword(self, user_name: str, user_password: str):
        user_record = self.getUserRecordByUserName(user_name)
        if not user_record is None:            
            if not self.verifyPassword(user_password, user_record["password"]):
                user_record = None
        return user_record

    
    def createPasswordHash(self, password: str):
        pwd_bytes = password.encode('utf-8')
        salt = bcrypt.gensalt()
        hashed_password = bcrypt.hashpw(password=pwd_bytes, salt=salt)
        string_password = hashed_password.decode('utf8')
        return string_password


    def verifyPassword(self, plain_password, hashed_password):
        password_byte_enc = plain_password.encode('utf-8')
        hashed_password = hashed_password.encode('utf-8')
        return bcrypt.checkpw(password_byte_enc, hashed_password)
    

global_UserAccounts = UserAccounts()