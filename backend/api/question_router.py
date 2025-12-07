from fastapi import APIRouter, Depends
from core.dependencies import get_current_user
from models.user_model import UserModel
from schemas.base_schema import BaseResponse
from schemas.question_schema import CreateQuestionSchema, UpdateQuestionSchema
from services import question_service

router = APIRouter()

@router.get("/{question_id}", response_model=BaseResponse)
async def get_question_detail(question_id: str, current_user: UserModel = Depends(get_current_user)):
    data = await question_service.get_question_by_id(question_id)
    return BaseResponse(data=data)

@router.get("/subject/list", response_model=BaseResponse)
async def list_available_subjects(current_user: UserModel = Depends(get_current_user)):
    data = await question_service.get_available_subjects()
    return BaseResponse(data=data)

@router.post("/create", response_model=BaseResponse)
async def handle_create_question(question_data: CreateQuestionSchema, current_user: UserModel = Depends(get_current_user)):
    data = await question_service.create_question(question_data, current_user)
    return BaseResponse(data=data)

@router.put("/{question_id}", response_model=BaseResponse)
async def handle_update_question(question_id: str, update_data: UpdateQuestionSchema, current_user: UserModel = Depends(get_current_user)):
    data = await question_service.update_question(question_id, update_data, current_user)
    return BaseResponse(data=data)

@router.delete("/{question_id}", response_model=BaseResponse)
async def handle_delete_question(question_id: str, current_user: UserModel = Depends(get_current_user)):
    await question_service.delete_question(question_id, current_user)
    return BaseResponse()