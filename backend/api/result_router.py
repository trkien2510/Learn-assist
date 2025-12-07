from fastapi import APIRouter, Depends
from core.dependencies import get_current_user
from models.user_model import UserModel
from schemas.base_schema import BaseResponse
from services import result_service

router = APIRouter()

@router.get("/result/{exam_id}", response_model=BaseResponse)
async def get_result_by_exam_id(exam_id: str, page: int = 1, page_size: int = 20, current_user: UserModel = Depends(get_current_user)):
    data = await result_service.get_results_by_exam_id(exam_id, page, page_size)
    return BaseResponse(data=data)

@router.delete("/result/{result_id}", response_model=BaseResponse)
async def delete_result_by_id(result_id: str, current_user: UserModel = Depends(get_current_user)):
    await result_service.delete_result(result_id, current_user)
    return BaseResponse()