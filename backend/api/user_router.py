from fastapi import APIRouter, Depends
from core.dependencies import get_current_user
from schemas.user_schema import UserUpdate, UserDeactivate
from schemas.base_schema import BaseResponse
from models.user_model import UserModel
from services.user_service import get_my_profile, update_profile, deactivate_account

router = APIRouter()

@router.get("/me", response_model=BaseResponse[dict])
async def my_profile(current_user: UserModel = Depends(get_current_user)):
    data = await get_my_profile(current_user)
    return BaseResponse(data=data)

@router.put("/update_profile", response_model=BaseResponse[dict])
async def update_my_profile(update_data: UserUpdate, current_user: UserModel = Depends(get_current_user)):
    await update_profile(update_data, current_user)
    return BaseResponse(data={})

@router.post("/deactivate", response_model=BaseResponse)
async def deactivate(pass_data: UserDeactivate, current_user: UserModel = Depends(get_current_user)):
    await deactivate_account(pass_data, current_user)
    return BaseResponse()