from datetime import datetime, timezone
from enum import Enum
from beanie import Document, Indexed
from pydantic import EmailStr, Field


class OTPPurpose(str, Enum):
    REGISTRATION = "registration"
    FORGOT_PASSWORD = "forgot_password"


class OTPModel(Document):
    email: EmailStr = Indexed(EmailStr)
    otp_code: str
    purpose: OTPPurpose
    is_used: bool = Field(default=False)
    attempts: int = Field(default=0)
    max_attempts: int = Field(default=5)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    expires_at: datetime

    class Settings:
        name = "otps"