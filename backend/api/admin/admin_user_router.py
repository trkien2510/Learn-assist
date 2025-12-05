from fastapi import APIRouter, Depends, HTTPException

from core.dependencies import get_current_user
from models.user_model import UserModel
from schemas.base_schema import BaseResponse

router = APIRouter()

@router.get("", response_model=BaseResponse)
async def all_user(current_user: UserModel = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(401, "Unauthorized")

    return BaseResponse()

@router.get("/{id}", response_model=BaseResponse)
async def user_profile(current_user: UserModel = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(401, "Unauthorized")

    return BaseResponse()

@router.put("", response_model=BaseResponse)
async def user(current_user: UserModel = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(401, "Unauthorized")

    return BaseResponse()

@router.delete("", response_model=BaseResponse)
async def user(current_user: UserModel = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(401, "Unauthorized")

    return BaseResponse()