from fastapi import APIRouter, Depends
from core.dependencies import get_current_user
from models.user_model import UserModel
from schemas.base_schema import BaseResponse
from schemas.classroom_schema import CreateClassroomSchema
from core.exception_handler import AppException
from core.status_code import StatusCode
from services import classroom_service

router = APIRouter()


@router.get("/{classroom_id}", response_model=BaseResponse)
async def get_classroom_detail_admin(classroom_id: str, current_user: UserModel = Depends(get_current_user)):
    if current_user.role != "admin":
        raise AppException(StatusCode.FORBIDDEN, "Không có quyền truy cập")

    data = await classroom_service.get_classroom_by_id(classroom_id)
    return BaseResponse(data=data)


@router.put("/{classroom_id}", response_model=BaseResponse)
async def update_classroom_admin(classroom_id: str, update_data: CreateClassroomSchema, current_user: UserModel = Depends(get_current_user)):
    if current_user.role != "admin":
        raise AppException(StatusCode.FORBIDDEN, "Không có quyền truy cập")

    data = await classroom_service.update_classroom_by_admin(classroom_id, update_data)
    return BaseResponse(data=data)


@router.delete("/{classroom_id}", response_model=BaseResponse)
async def delete_classroom_admin(classroom_id: str, current_user: UserModel = Depends(get_current_user)):
    if current_user.role != "admin":
        raise AppException(StatusCode.FORBIDDEN, "Không có quyền truy cập")

    await classroom_service.delete_classroom_by_admin(classroom_id)
    return BaseResponse()