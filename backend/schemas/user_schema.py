from datetime import date
from pydantic import BaseModel, EmailStr, Field, field_validator
from models.user_model import UserRole
import re

class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, description="Username (minimum 3 characters)")
    email: EmailStr = Field(..., description="Email address")
    password: str = Field(..., min_length=8, max_length=64, description="Password (8-64 characters)")
    full_name: str = Field(..., min_length=1, description="Full name")
    dob: date = Field(..., description="Date of birth")
    phone_number: str | None = Field(None, description="Phone number (optional, 10-11 digits)")
    role: UserRole = Field(default=UserRole.STUDENT, description="User role")
    
    @field_validator('phone_number')
    @classmethod
    def validate_phone_number(cls, v):
        if v is None or v == "":
            return None
        cleaned = re.sub(r'[\s\-\(\)]', '', v)
        if not re.match(r'^0\d{9,10}$', cleaned):
            raise ValueError('Phone number must be 10-11 digits and start with 0')
        return cleaned

class UserLogin(BaseModel):
    login_identifier: str
    password: str

class UserDeactivate(BaseModel):
    password: str


class UserUpdate(BaseModel):
    full_name: str | None = Field(None, min_length=1)
    phone_number: str | None = None
    dob: date | None = None

    @field_validator('phone_number')
    @classmethod
    def validate_phone_number(cls, v):
        if v is None or v == "":
            return None
        cleaned = re.sub(r'[\s\-\(\)]', '', v)
        if not re.match(r'^0\d{9,10}$', cleaned):
            raise ValueError('Phone number must be 10-11 digits and start with 0')
        return cleaned

class ChangePassword(BaseModel):
    old_password: str = Field(..., min_length=6, max_length=64, description="Current password")
    new_password: str = Field(..., min_length=6, max_length=64, description="New password")


class AdminCreateUser(BaseModel):
    username: str = Field(..., min_length=3, description="Username (minimum 3 characters)")
    email: EmailStr = Field(..., description="Email address")
    password: str = Field(..., min_length=8, max_length=64, description="Password (8-64 characters)")
    full_name: str = Field(..., min_length=1, description="Full name")
    dob: date = Field(..., description="Date of birth")
    phone_number: str | None = Field(None, description="Phone number (optional, 10-11 digits)")
    role: UserRole = Field(default=UserRole.STUDENT, description="User role")
    email_verified: bool = Field(default=True, description="Skip email verification")
    
    @field_validator('phone_number')
    @classmethod
    def validate_phone_number(cls, v):
        if v is None or v == "":
            return None
        cleaned = re.sub(r'[\s\-\(\)]', '', v)
        if not re.match(r'^0\d{9,10}$', cleaned):
            raise ValueError('Phone number must be 10-11 digits and start with 0')
        return cleaned