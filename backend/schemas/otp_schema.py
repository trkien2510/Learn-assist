from pydantic import BaseModel, EmailStr, Field
from models.otp_model import OTPPurpose


class OTPRequest(BaseModel):
    email: EmailStr
    purpose: OTPPurpose


class OTPVerify(BaseModel):
    email: EmailStr
    otp_code: str = Field(..., min_length=6, max_length=6)
    purpose: OTPPurpose


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp_code: str = Field(..., min_length=6, max_length=6)
    new_password: str = Field(..., min_length=8, max_length=64)
    confirm_password: str = Field(..., min_length=8, max_length=64)


class ReactivateAccountRequest(BaseModel):
    email: EmailStr


class ReactivateAccountVerify(BaseModel):
    email: EmailStr
    otp_code: str = Field(..., min_length=6, max_length=6)
