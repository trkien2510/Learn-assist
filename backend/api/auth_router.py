from fastapi import APIRouter

from fastapi import HTTPException

from core.jwt import create_access_token, create_refresh_token
from core.security import get_password_hash, verify_password
from models.user_model import UserModel
from schemas.base_schema import BaseResponse, TokenResponse
from schemas.user_schema import UserRegister, UserLogin

router = APIRouter()

@router.post("/register", response_model=BaseResponse[dict])
async def register(user_in: UserRegister):
    exists = await UserModel.find_one({"email": user_in.email})

    if exists:
        raise HTTPException(400, "Account already exists")

    hashed = get_password_hash(user_in.password)
    user = UserModel(
        username=user_in.username,
        email=user_in.email,
        full_name=user_in.full_name,
        hashed_password=hashed,
        role=user_in.role,
        dob = user_in.dob,
        phone_number=user_in.phone_number,
    )
    await user.insert()
    return BaseResponse(data={})


@router.post("/login", response_model=BaseResponse[TokenResponse])
async def login(login_data: UserLogin):
    identifier = login_data.login_identifier

    if "@" in identifier:
        query = {"email": identifier}
    else:
        query = {"username": identifier}

    user = await UserModel.find_one(query)

    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(401, "Invalid credentials")

    access = create_access_token({"sub": str(user.id), "role": user.role})
    refresh = create_refresh_token({"sub": str(user.id)})

    return BaseResponse(
        data=TokenResponse(access_token=access,
                           refresh_token=refresh,
                           role=user.role))

@router.post("/refresh-token", response_model=BaseResponse[TokenResponse])
async def refresh(refresh_data: TokenResponse):
    user = await UserModel.find_one({"id": refresh_data.user_id})
    if not user:
        raise HTTPException(401, "Invalid credentials")
    access = create_access_token({"sub": str(user.id), "role": user.role})
    refresh = create_refresh_token({"sub": str(user.id)})
    return BaseResponse(data=TokenResponse(access_token=access,refresh_token=refresh))

@router.post("/forgot-password-request", response_model=BaseResponse[TokenResponse])
async def forgot_password():
    return BaseResponse(data={})

@router.post("/reset-password", response_model=BaseResponse[TokenResponse])
async def reset_password():
    return BaseResponse(data={})