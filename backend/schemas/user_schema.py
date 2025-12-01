from datetime import datetime
from pydantic import BaseModel, EmailStr, Field
from models.user_model import UserRole

class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=64)
    full_name: str
    role: UserRole = UserRole.STUDENT

class UserLogin(BaseModel):
    login_identifier: str
    password: str

class UserProfile(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    role: UserRole
    created_at: datetime

class UserUpdate(BaseModel):
    current_password: str = Field(..., min_length=8, max_length=64)
    new_email: EmailStr = None
    new_password: str = Field(..., min_length=8, max_length=64)
    new_full_name: str = None
    confirm_password: str = Field(..., min_length=8, max_length=64)