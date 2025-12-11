from fastapi import APIRouter

from core.security import get_password_hash
from models.user_model import UserModel
from schemas.base_schema import BaseResponse, TokenResponse
from schemas.user_schema import UserRegister, UserLogin
from schemas.otp_schema import (
    OTPRequest, 
    OTPVerify, 
    ForgotPasswordRequest, 
    ResetPasswordRequest,
    ReactivateAccountRequest,
    ReactivateAccountVerify
)
from services.auth_service import register as register_service, login as login_service, refresh_token as refresh_token_service
from services import otp_service

router = APIRouter()


@router.post("/add-user/for-test", response_model=BaseResponse[dict])
async def add_user(user_in: UserRegister):
    hashed = get_password_hash(user_in.password)
    user = UserModel(
        username=user_in.username,
        email=user_in.email,
        full_name=user_in.full_name,
        hashed_password=hashed,
        role=user_in.role,
        dob=user_in.dob,
        phone_number=user_in.phone_number,
        email_verified=True,
        verification_expires_at=None,
    )
    await user.insert()
    return BaseResponse()

@router.post("/register", response_model=BaseResponse[dict])
async def register(user_in: UserRegister):
    data = await register_service(user_in)
    return BaseResponse(data=data)


@router.post("/login", response_model=BaseResponse[TokenResponse])
async def login(login_data: UserLogin):
    data = await login_service(login_data)
    return BaseResponse(data=data)


@router.post("/refresh-token", response_model=BaseResponse[TokenResponse])
async def refresh(refresh_data: str):
    data = await refresh_token_service(refresh_data)
    return BaseResponse(data=data)


@router.post("/otp/request", response_model=BaseResponse[dict])
async def request_registration_otp(request: OTPRequest):
    data = await otp_service.request_registration_otp(request.email)
    return BaseResponse(data=data)


@router.post("/otp/verify", response_model=BaseResponse[dict])
async def verify_registration_otp(request: OTPVerify):
    data = await otp_service.verify_registration_otp(request.email, request.otp_code)
    return BaseResponse(data=data)


@router.post("/forgot-password", response_model=BaseResponse[dict])
async def forgot_password(request: ForgotPasswordRequest):
    data = await otp_service.request_forgot_password_otp(request.email)
    return BaseResponse(data=data)


@router.post("/reset-password", response_model=BaseResponse[dict])
async def reset_password(request: ResetPasswordRequest):
    data = await otp_service.reset_password(
        request.email,
        request.otp_code,
        request.new_password,
        request.confirm_password
    )
    return BaseResponse(data=data)


@router.post("/reactivate/request", response_model=BaseResponse[dict])
async def reactivate_request(request: ReactivateAccountRequest):
    data = await otp_service.request_reactivate_otp(request.email)
    return BaseResponse(data=data)


@router.post("/reactivate/verify", response_model=BaseResponse[dict])
async def reactivate_verify(request: ReactivateAccountVerify):
    data = await otp_service.reactivate_account(request.email, request.otp_code)
    return BaseResponse(data=data)