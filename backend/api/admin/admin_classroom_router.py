from fastapi import APIRouter, Depends
from core.dependencies import get_current_user
from models.user_model import UserModel
from schemas.base_schema import BaseResponse
from schemas.classroom_schema import CreateClassroomSchema
from core.exception_handler import AppException
from core.status_code import StatusCode

router = APIRouter()

#danh sách toàn bộ class
@router.get("", response_model=BaseResponse[dict])
async def get_all_classrooms_admin(current_user: UserModel = Depends(get_current_user)):
    if current_user.role != "admin":
        raise AppException(StatusCode.FORBIDDEN, "Không có quyền truy cập")

    return BaseResponse()

#thông tin class cụ thể
@router.get("/{classroom_id}", response_model=BaseResponse)
async def get_classroom_detail_admin(classroom_id:str, current_user: UserModel = Depends(get_current_user)):
    if current_user.role != "admin":
        raise AppException(StatusCode.FORBIDDEN, "Không có quyền truy cập")

    return BaseResponse()

#chỉnh sửa thông tin class
@router.put("/{classroom_id}", response_model=BaseResponse)
async def update_classroom_admin(classroom_id:str, update_data: CreateClassroomSchema, current_user: UserModel = Depends(get_current_user)):
    if current_user.role != "admin":
        raise AppException(StatusCode.FORBIDDEN, "Không có quyền truy cập")

    return BaseResponse()

@router.delete("/{classroom_id}", response_model=BaseResponse)
async def delete_classroom_admin(classroom_id:str, current_user: UserModel = Depends(get_current_user)):
    if current_user.role != "admin":
        raise AppException(StatusCode.FORBIDDEN, "Không có quyền truy cập")

    return BaseResponse()