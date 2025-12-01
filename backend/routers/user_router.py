from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends
from core.dependencies import get_current_user
from schemas.user_schema import UserRegister, UserLogin, UserUpdate
from schemas.base_schema import BaseResponse, TokenResponse
from models.user_model import UserModel
from core.security import get_password_hash, verify_password
from core.jwt import create_access_token, create_refresh_token

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
        role=user_in.role
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

@router.get("/me", response_model=BaseResponse[dict])
async def my_profile(current_user: UserModel = Depends(get_current_user)):
    return BaseResponse(data={
        "full_name": current_user.full_name,
        "email": current_user.email,
        "created_at": current_user.created_at
    })

@router.put("/update_profile", response_model=BaseResponse[dict])
async def update_my_profile(update_data: UserUpdate, current_user: UserModel = Depends(get_current_user)):
    update_dict = update_data.model_dump(exclude_unset=True)

    if not update_dict:
        raise HTTPException(400, "Không có dữ liệu để cập nhật")

    update_dict.pop("role", None)

    for key, value in update_dict.items():
        setattr(current_user, key, value)

    current_user.updated_at =lambda :datetime.now(timezone.utc)

    await current_user.save()

    return BaseResponse(data={})