from fastapi import APIRouter, Depends
from core.dependencies import get_current_user
from schemas.user_schema import UserUpdate, UserDeactivate
from schemas.base_schema import BaseResponse
from models.user_model import UserModel
from services import user_service

router = APIRouter()


@router.get("/me", response_model=BaseResponse)
async def get_profile(current_user: UserModel = Depends(get_current_user)):
    data = await user_service.get_my_profile(current_user)
    return BaseResponse(data=data)


@router.put("/profile", response_model=BaseResponse)
async def update_profile(update_data: UserUpdate, current_user: UserModel = Depends(get_current_user)):
    await user_service.update_profile(update_data, current_user)
    return BaseResponse(data={})


@router.post("/deactivate", response_model=BaseResponse)
async def deactivate_account(pass_data: UserDeactivate, current_user: UserModel = Depends(get_current_user)):
    await user_service.deactivate_account(pass_data, current_user)
    return BaseResponse()