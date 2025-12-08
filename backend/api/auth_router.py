from fastapi import APIRouter
from schemas.base_schema import BaseResponse, TokenResponse
from schemas.user_schema import UserRegister, UserLogin
from services.auth_service import register as register_service, login as login_service, refresh_token as refresh_token_service

router = APIRouter()

@router.post("/register", response_model=BaseResponse[dict])
async def register(user_in: UserRegister):
    await register_service(user_in)
    return BaseResponse(data={})

@router.post("/login", response_model=BaseResponse[TokenResponse])
async def login(login_data: UserLogin):
    data = await login_service(login_data)
    return BaseResponse(data=data)

@router.post("/refresh-token", response_model=BaseResponse[TokenResponse])
async def refresh(refresh_data: str):
    data = await refresh_token_service(refresh_data)
    return BaseResponse(data=data)