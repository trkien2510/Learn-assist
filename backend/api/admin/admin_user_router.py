from fastapi import APIRouter, Depends
from core.dependencies import get_current_user
from models.user_model import UserModel
from schemas.base_schema import BaseResponse
from schemas.user_schema import UserUpdate
from core.exception_handler import AppException
from core.status_code import StatusCode

router = APIRouter()

@router.get("", response_model=BaseResponse)
async def get_all_users_admin(current_user: UserModel = Depends(get_current_user)):
    if current_user.role != "admin":
        raise AppException(StatusCode.FORBIDDEN, "Không có quyền truy cập")

    return BaseResponse()

@router.get("/{id}", response_model=BaseResponse)
async def get_user_profile_admin(id: str, current_user: UserModel = Depends(get_current_user)):
    if current_user.role != "admin":
        raise AppException(StatusCode.FORBIDDEN, "Không có quyền truy cập")

    return BaseResponse()

@router.put("/{id}", response_model=BaseResponse)
async def update_user_admin(id: str, update_data: UserUpdate, current_user: UserModel = Depends(get_current_user)):
    if current_user.role != "admin":
        raise AppException(StatusCode.FORBIDDEN, "Không có quyền truy cập")

    return BaseResponse()

@router.delete("/{id}", response_model=BaseResponse)
async def delete_user_admin(id: str, current_user: UserModel = Depends(get_current_user)):
    if current_user.role != "admin":
        raise AppException(StatusCode.FORBIDDEN, "Không có quyền truy cập")

    return BaseResponse()