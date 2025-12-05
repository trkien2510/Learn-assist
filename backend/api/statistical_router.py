from fastapi import APIRouter
from fastapi.params import Depends

from core.dependencies import get_current_user
from models.user_model import UserModel
from schemas.base_schema import BaseResponse

router = APIRouter()

@router.get("/{exam_id}", response_model=BaseResponse)
async def exam_result(exam_id: str, current_user: UserModel = Depends(get_current_user)):

    return BaseResponse()


@router.get("/{class_id}", response_model=BaseResponse)
async def exam_result(class_id: str, current_uer: UserModel = Depends(get_current_user)):

    return BaseResponse()