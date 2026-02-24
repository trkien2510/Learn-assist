import random
import string
from datetime import datetime, timezone, timedelta
from models.otp_model import OTPModel, OTPPurpose
from models.user_model import UserModel
from core.exception_handler import AppException
from core.status_code import StatusCode
from core.security import get_password_hash
from services.email_service import send_otp_email
from services import log_service


OTP_EXPIRY_MINUTES = 5
OTP_LENGTH = 6


def generate_otp_code() -> str:
    return ''.join(random.choices(string.digits, k=OTP_LENGTH))


async def invalidate_existing_otps(email: str, purpose: OTPPurpose):
    await OTPModel.find(
        OTPModel.email == email,
        OTPModel.purpose == purpose,
        OTPModel.is_used == False
    ).update({"$set": {"is_used": True}})


async def create_and_send_otp(email: str, purpose: OTPPurpose, full_name: str = None, background_tasks = None) -> dict:
    await invalidate_existing_otps(email, purpose)

    otp_code = generate_otp_code()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=OTP_EXPIRY_MINUTES)

    otp = OTPModel(
        email=email,
        otp_code=otp_code,
        purpose=purpose,
        expires_at=expires_at
    )
    await otp.insert()

    if background_tasks:
        background_tasks.add_task(send_otp_email, email, otp_code, purpose, full_name)
    else:
        await send_otp_email(email, otp_code, purpose, full_name)

    await log_service.create_log(
        action="otp_sent",
        resource_type="otp",
        details={"email": email, "purpose": purpose.value},
        status="success"
    )

    return {"message": "OTP sent successfully"}


async def verify_otp(email: str, otp_code: str, purpose: OTPPurpose) -> bool:
    otp = await OTPModel.find_one(
        OTPModel.email == email,
        OTPModel.purpose == purpose,
        OTPModel.is_used == False
    )

    if not otp:
        raise AppException(StatusCode.OTP_INVALID, "OTP not found or already used")

    expires_at = otp.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    
    if datetime.now(timezone.utc) > expires_at:
        otp.is_used = True
        await otp.save()
        raise AppException(StatusCode.OTP_EXPIRED, "OTP code has expired")

    if otp.attempts >= otp.max_attempts:
        otp.is_used = True
        await otp.save()
        raise AppException(StatusCode.TOO_MANY_REQUESTS, "Too many attempts")

    if otp.otp_code != otp_code:
        otp.attempts += 1
        await otp.save()
        remaining = otp.max_attempts - otp.attempts
        raise AppException(StatusCode.OTP_INVALID, f"Invalid OTP. Remaining attempts: {remaining}")

    otp.is_used = True
    await otp.save()

    await log_service.create_log(
        action="otp_verified",
        resource_type="otp",
        details={"email": email, "purpose": purpose.value},
        status="success"
    )

    return True


async def request_registration_otp(email: str, background_tasks = None) -> dict:
    existing_user = await UserModel.find_one({"email": email})
    if existing_user:
        if existing_user.email_verified:
            raise AppException(StatusCode.BAD_REQUEST, "Email already registered and verified")
        return await create_and_send_otp(email, OTPPurpose.REGISTRATION, existing_user.full_name, background_tasks)

    return await create_and_send_otp(email, OTPPurpose.REGISTRATION, background_tasks=background_tasks)


async def verify_registration_otp(email: str, otp_code: str) -> dict:
    await verify_otp(email, otp_code, OTPPurpose.REGISTRATION)
    
    user = await UserModel.find_one({"email": email})
    if user:
        user.email_verified = True
        user.verification_expires_at = None
        user.updated_at = datetime.now(timezone.utc)
        await user.save()
        
        await log_service.create_log(
            action="email_verified",
            user=user,
            resource_type="user",
            resource_id=str(user.id),
            details={"email": email},
            status="success"
        )
    
    return {"verified": True, "message": "Email verified successfully"}


async def request_forgot_password_otp(email: str, background_tasks = None) -> dict:
    success_message = {"message": "If the email exists, OTP has been sent"}
    
    user = await UserModel.find_one({"email": email})
    
    if not user or not user.is_activate:
        return success_message

    await create_and_send_otp(email, OTPPurpose.FORGOT_PASSWORD, user.full_name, background_tasks)
    return success_message


async def reset_password(email: str, otp_code: str, new_password: str, confirm_password: str) -> dict:
    if new_password != confirm_password:
        raise AppException(StatusCode.BAD_REQUEST, "Passwords do not match")

    await verify_otp(email, otp_code, OTPPurpose.FORGOT_PASSWORD)

    user = await UserModel.find_one({"email": email})
    if not user:
        raise AppException(StatusCode.NOT_FOUND, "User not found")

    user.hashed_password = get_password_hash(new_password)
    user.updated_at = datetime.now(timezone.utc)
    await user.save()

    await log_service.create_log(
        action="password_reset",
        user=user,
        resource_type="user",
        resource_id=str(user.id),
        details={"email": email},
        status="success"
    )

    return {"message": "Password reset successful"}



