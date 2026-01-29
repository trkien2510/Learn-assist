from fastapi import APIRouter, BackgroundTasks

from schemas.base_schema import BaseResponse, TokenResponse
from schemas.user_schema import UserRegister, UserLogin
from schemas.otp_schema import (
    OTPRequest, 
    OTPVerify, 
    ForgotPasswordRequest, 
    ResetPasswordRequest
)
from services.auth_service import register as register_service, login as login_service, refresh_token as refresh_token_service
from services import otp_service

router = APIRouter()


@router.post("/register", response_model=BaseResponse[dict])
async def register(user_in: UserRegister, background_tasks: BackgroundTasks):
    data = await register_service(user_in, background_tasks)
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
async def request_registration_otp(request: OTPRequest, background_tasks: BackgroundTasks):
    data = await otp_service.request_registration_otp(request.email, background_tasks)
    return BaseResponse(data=data)


@router.post("/otp/verify", response_model=BaseResponse[dict])
async def verify_registration_otp(request: OTPVerify):
    data = await otp_service.verify_registration_otp(request.email, request.otp_code)
    return BaseResponse(data=data)


@router.post("/forgot-password", response_model=BaseResponse[dict])
async def forgot_password(request: ForgotPasswordRequest, background_tasks: BackgroundTasks):
    data = await otp_service.request_forgot_password_otp(request.email, background_tasks)
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
