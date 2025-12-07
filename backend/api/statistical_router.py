from fastapi import APIRouter, Depends
from core.dependencies import get_current_user
from models.user_model import UserModel
from schemas.base_schema import BaseResponse
from services import result_service

router = APIRouter()

@router.get("/{exam_id}", response_model=BaseResponse[dict])
async def get_exam_statistics(exam_id: str, page: int = 1, page_size: int = 20, current_user: UserModel = Depends(get_current_user)):
    data = await result_service.get_results_by_exam_id(exam_id, page, page_size)
    return BaseResponse(data=data)


@router.get("/class/{class_id}", response_model=BaseResponse[dict])
async def get_class_statistics(class_id: str, page: int = 1, page_size: int = 20, current_user: UserModel = Depends(get_current_user)):
    data = await result_service.get_results_by_class_id(class_id, page, page_size)
    return BaseResponse(data=data)