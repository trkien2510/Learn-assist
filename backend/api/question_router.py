from fastapi import APIRouter, Depends
from core.dependencies import get_current_user
from models.user_model import UserModel
from schemas.base_schema import BaseResponse
from schemas.question_schema import CreateQuestionSchema, UpdateQuestionSchema
from services import question_service

router = APIRouter()



@router.post("/create", response_model=BaseResponse)
async def create_question(question_data: CreateQuestionSchema, current_user: UserModel = Depends(get_current_user)):
    data = await question_service.create_question(question_data, current_user)
    return BaseResponse(data=data)


@router.get("/all", response_model=BaseResponse)
async def get_all_questions(
    page: int = 1, 
    page_size: int = 20, 
    search: str = None, 
    difficulty: str = None, 
    current_user: UserModel = Depends(get_current_user)
):
    data = await question_service.get_my_questions(page, page_size, current_user, search, difficulty)
    return BaseResponse(data=data)


@router.get("/subject/list", response_model=BaseResponse)
async def get_subjects(current_user: UserModel = Depends(get_current_user)):
    data = await question_service.get_available_subjects()
    return BaseResponse(data=data)


@router.get("/{question_id}", response_model=BaseResponse)
async def get_question(question_id: str, current_user: UserModel = Depends(get_current_user)):
    data = await question_service.get_question_by_id(question_id)
    return BaseResponse(data=data)


@router.put("/{question_id}", response_model=BaseResponse)
async def update_question(question_id: str, update_data: UpdateQuestionSchema, current_user: UserModel = Depends(get_current_user)):
    data = await question_service.update_question(question_id, update_data, current_user)
    return BaseResponse(data=data)


@router.delete("/{question_id}", response_model=BaseResponse)
async def delete_question(question_id: str, current_user: UserModel = Depends(get_current_user)):
    await question_service.delete_question(question_id, current_user)
    return BaseResponse()