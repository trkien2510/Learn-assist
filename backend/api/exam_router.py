from fastapi import APIRouter, Depends
from core.dependencies import get_current_user
from models.user_model import UserModel
from schemas.base_schema import BaseResponse
from schemas.exam_schema import CreateExamSchema
from services import exam_service

router = APIRouter()

@router.post("/create", response_model=BaseResponse)
async def handle_create_exam(exam_data: CreateExamSchema, current_user: UserModel = Depends(get_current_user)):
    await exam_service.create_exam(exam_data, current_user)
    return BaseResponse(data={})

@router.delete("/delete/{exam_id}", response_model=BaseResponse)
async def handle_delete_exam(exam_id: str, current_user: UserModel = Depends(get_current_user)):
    await exam_service.delete_exam(exam_id, current_user)
    return BaseResponse()

@router.post("/start_exam/{exam_id}", response_model=BaseResponse)
async def handle_start_exam(exam_id: str, current_user: UserModel = Depends(get_current_user)):
    data = await exam_service.start_exam(exam_id, current_user)
    return BaseResponse(data=data)

@router.post("/submit/{exam_id}", response_model=BaseResponse)
async def handle_submit_exam(exam_id: str, answers: dict, current_user: UserModel = Depends(get_current_user)):
    data = await exam_service.submit_exam(exam_id, answers, current_user)
    return BaseResponse(data=data)