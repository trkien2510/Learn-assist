from datetime import datetime
from pydantic import BaseModel, EmailStr
from .common import MongoDBModel

class UserBase(MongoDBModel):
    username: str
    email: EmailStr
    full_name: str
    role: str

class UserInDB(UserBase):
    password_hash: str
    created_at: datetime

class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: str