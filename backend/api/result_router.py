from fastapi import APIRouter, Depends
from core.dependencies import get_current_user
from models.user_model import UserModel
from schemas.base_schema import BaseResponse
from services import result_service

router = APIRouter()


@router.get("/all", response_model=BaseResponse)
async def get_all_results(page: int = 1, page_size: int = 20, exam_type: str = None, current_user: UserModel = Depends(get_current_user)):
    data = await result_service.get_my_results(page, page_size, current_user, exam_type)
    return BaseResponse(data=data)


@router.get("/exam/{exam_id}", response_model=BaseResponse)
async def get_results_by_exam(exam_id: str, page: int = 1, page_size: int = 20, current_user: UserModel = Depends(get_current_user)):
    data = await result_service.get_results_by_exam_id(exam_id, page, page_size, current_user)
    return BaseResponse(data=data)


@router.get("/class/{class_id}", response_model=BaseResponse)
async def get_results_by_class(class_id: str, page: int = 1, page_size: int = 20, current_user: UserModel = Depends(get_current_user)):
    data = await result_service.get_results_by_class_id(class_id, page, page_size, current_user)
    return BaseResponse(data=data)


@router.delete("/{result_id}", response_model=BaseResponse)
async def delete_result(result_id: str, current_user: UserModel = Depends(get_current_user)):
    await result_service.delete_result(result_id, current_user)
    return BaseResponse()