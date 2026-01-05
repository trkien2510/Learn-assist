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

    return {"message": "Mã OTP đã được gửi đến email của bạn"}


async def verify_otp(email: str, otp_code: str, purpose: OTPPurpose) -> bool:
    otp = await OTPModel.find_one(
        OTPModel.email == email,
        OTPModel.purpose == purpose,
        OTPModel.is_used == False
    )

    if not otp:
        raise AppException(StatusCode.BAD_REQUEST, "Mã OTP không tồn tại hoặc đã được sử dụng")

    expires_at = otp.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    
    if datetime.now(timezone.utc) > expires_at:
        otp.is_used = True
        await otp.save()
        raise AppException(StatusCode.BAD_REQUEST, "Mã OTP đã hết hạn")

    if otp.attempts >= otp.max_attempts:
        otp.is_used = True
        await otp.save()
        raise AppException(StatusCode.TOO_MANY_REQUESTS, "Quá nhiều lần nhập sai. Vui lòng yêu cầu mã OTP mới")

    if otp.otp_code != otp_code:
        otp.attempts += 1
        await otp.save()
        remaining = otp.max_attempts - otp.attempts
        raise AppException(StatusCode.BAD_REQUEST, f"Mã OTP không đúng. Còn {remaining} lần thử")

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
            raise AppException(StatusCode.BAD_REQUEST, "Email đã được đăng ký và xác thực")
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
    
    return {"verified": True, "message": "Xác thực email thành công. Bạn có thể đăng nhập ngay"}


async def request_forgot_password_otp(email: str, background_tasks = None) -> dict:
    success_message = {"message": "Nếu email tồn tại trong hệ thống, mã OTP đã được gửi đến email của bạn"}
    
    user = await UserModel.find_one({"email": email})
    
    if not user or not user.is_activate:
        return success_message

    await create_and_send_otp(email, OTPPurpose.FORGOT_PASSWORD, user.full_name, background_tasks)
    return success_message


async def reset_password(email: str, otp_code: str, new_password: str, confirm_password: str) -> dict:
    if new_password != confirm_password:
        raise AppException(StatusCode.BAD_REQUEST, "Mật khẩu không khớp")

    await verify_otp(email, otp_code, OTPPurpose.FORGOT_PASSWORD)

    user = await UserModel.find_one({"email": email})
    if not user:
        raise AppException(StatusCode.NOT_FOUND, "Không tìm thấy người dùng")

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

    return {"message": "Đặt lại mật khẩu thành công"}


async def request_reactivate_otp(email: str, background_tasks = None) -> dict:
    user = await UserModel.find_one({"email": email})
    if not user:
        raise AppException(StatusCode.NOT_FOUND, "No account found with this email")

    if user.is_activate:
        raise AppException(StatusCode.BAD_REQUEST, "Tài khoản đã được kích hoạt")

    return await create_and_send_otp(email, OTPPurpose.REACTIVATE_ACCOUNT, user.full_name, background_tasks)


async def reactivate_account(email: str, otp_code: str) -> dict:
    await verify_otp(email, otp_code, OTPPurpose.REACTIVATE_ACCOUNT)

    user = await UserModel.find_one({"email": email})
    if not user:
        raise AppException(StatusCode.NOT_FOUND, "User not found")

    user.is_activate = True
    user.updated_at = datetime.now(timezone.utc)
    await user.save()

    await log_service.create_log(
        action="account_reactivated",
        user=user,
        resource_type="user",
        resource_id=str(user.id),
        details={"email": email},
        status="success"
    )

    return {"message": "Kích hoạt lại tài khoản thành công"}


async def cleanup_expired_otps():
    await OTPModel.find(
        OTPModel.expires_at < datetime.now(timezone.utc)
    ).delete()
