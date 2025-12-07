from fastapi import APIRouter, Depends
from core.dependencies import get_current_user
from models.user_model import UserModel
from schemas.base_schema import BaseResponse
from core.exception_handler import AppException
from core.status_code import StatusCode

router = APIRouter()

@router.get("", response_model=BaseResponse[dict])
async def get_all_questions_admin(current_user: UserModel = Depends(get_current_user)):
    if current_user.role != "admin":
        raise AppException(StatusCode.FORBIDDEN, "Không có quyền truy cập")

    return BaseResponse()