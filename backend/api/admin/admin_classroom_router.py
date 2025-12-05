from fastapi import APIRouter, Depends, HTTPException

from core.dependencies import get_current_user
from models.user_model import UserModel
from schemas.base_schema import BaseResponse

router = APIRouter()

#danh sách toàn bộ class
@router.get("", response_model=BaseResponse)
async def classroom(current_user: UserModel = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(401, "Unauthorized")

    return BaseResponse()

#thông tin class cụ thể
@router.get("/{classroom_id}", response_model=BaseResponse)
async def classroom(classroom_id:str, current_user: UserModel = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(401, "Unauthorized")

    return BaseResponse()

#chỉnh sửa thông tin class
@router.put("/{classroom_id}", response_model=BaseResponse)
async def classroom(classroom_id:str, current_user: UserModel = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(401, "Unauthorized")

    return BaseResponse()

@router.delete("/{classroom_id}", response_model=BaseResponse)
async def classroom(classroom_id:str, current_user: UserModel = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(401, "Unauthorized")

    return BaseResponse()