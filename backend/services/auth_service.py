from datetime import datetime, timezone, timedelta
from beanie import PydanticObjectId
from core.jwt import create_access_token, create_refresh_token, decode_token
from core.security import get_password_hash, verify_password
from models.user_model import UserModel
from models.otp_model import OTPPurpose
from schemas.base_schema import TokenResponse
from core.exception_handler import AppException
from core.status_code import StatusCode
from services import log_service
from services.email_service import send_otp_email
import random
import string


OTP_LENGTH = 6
OTP_EXPIRY_MINUTES = 5


def generate_otp_code() -> str:
    return ''.join(random.choices(string.digits, k=OTP_LENGTH))


async def register(user_in, background_tasks):
    exists = await UserModel.find_one({"email": user_in.email})
    if exists:
        raise AppException(StatusCode.BAD_REQUEST, "Account already exists")

    hashed = get_password_hash(user_in.password)
    verification_expires = datetime.now(timezone.utc) + timedelta(minutes=5)
    user = UserModel(
        username=user_in.username.lower(),
        email=user_in.email,
        full_name=user_in.full_name,
        hashed_password=hashed,
        role=user_in.role,
        dob=user_in.dob,
        phone_number=user_in.phone_number,
        email_verified=False,
        verification_expires_at=verification_expires,
    )
    await user.insert()

    await log_service.log_auth("register", user=user)

    from models.otp_model import OTPModel
    
    await OTPModel.find(
        OTPModel.email == user_in.email,
        OTPModel.purpose == OTPPurpose.REGISTRATION,
        OTPModel.is_used == False
    ).update({"$set": {"is_used": True}})
    
    otp_code = generate_otp_code()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=OTP_EXPIRY_MINUTES)
    
    otp = OTPModel(
        email=user_in.email,
        otp_code=otp_code,
        purpose=OTPPurpose.REGISTRATION,
        expires_at=expires_at
    )
    await otp.insert()
    
    background_tasks.add_task(send_otp_email, user_in.email, otp_code, OTPPurpose.REGISTRATION, user.full_name)

    return {"message": "Registration successful. Please check your email for OTP verification"}


async def login(login_data):
    identifier = login_data.login_identifier.lower()
    if "@" in identifier:
        query = {"email": identifier}
    else:
        query = {"username": identifier}

    user = await UserModel.find_one(query)

    if not user or not verify_password(login_data.password, user.hashed_password):
        raise AppException(StatusCode.UNAUTHORIZED, "Invalid username or password")

    if not user.email_verified:
        raise AppException(StatusCode.FORBIDDEN, "Email not verified")

    if not user.is_activate:
        raise AppException(StatusCode.FORBIDDEN, "Account deactivated")

    access = create_access_token({"sub": str(user.id), "role": user.role})
    refresh = create_refresh_token({"sub": str(user.id)})

    return TokenResponse(access_token=access, refresh_token=refresh, role=user.role)


async def refresh_token(token: str):
    try:
        payload = decode_token(token)
        if payload.get("type") != "refresh":
            raise AppException(StatusCode.UNAUTHORIZED, "Invalid token")

        user_id = payload.get("sub")
        if not user_id:
            raise AppException(StatusCode.UNAUTHORIZED, "Invalid token")
    except Exception:
        raise AppException(StatusCode.UNAUTHORIZED, "Invalid or expired token")

    try:
        obj_id = PydanticObjectId(user_id)
    except:
        raise AppException(StatusCode.UNAUTHORIZED, "Invalid token")

    user = await UserModel.get(obj_id)
    if not user:
        raise AppException(StatusCode.UNAUTHORIZED, "User not found")

    if not user.is_activate:
        raise AppException(StatusCode.FORBIDDEN, "Account deactivated")

    access = create_access_token({"sub": str(user.id), "role": user.role})
    return TokenResponse(access_token=access, refresh_token=token, role=user.role)
