from datetime import datetime, timezone
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
    role: UserRole = UserRole.STUDENT
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "users"