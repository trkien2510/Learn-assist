from datetime import datetime, timezone, date
from enum import Enum
from beanie import Document, Indexed
from pydantic import EmailStr, Field

class UserRole(str, Enum):
    ADMIN = "admin"
    TEACHER = "teacher"
    STUDENT = "student"

class UserModel(Document):
    username: str = Indexed(str, unique=True)
    email: EmailStr = Indexed(EmailStr)
    hashed_password: str
    full_name: str
    dob: date
    phone_number: str | None
    role: UserRole = UserRole.STUDENT
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_activate: bool = Field(default=True)

    class Settings:
        name = "users"