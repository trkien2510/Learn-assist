from fastapi import APIRouter, Depends

from core.dependencies import get_current_user
from models.user_model import UserModel
from schemas.base_schema import BaseResponse

router = APIRouter()


@router.get("/", response_model=BaseResponse)
async def get_questions_by_id(current_user: UserModel = Depends(get_current_user)):

    return BaseResponse()

@router.get("/subject", response_model=BaseResponse)
async def get_available_subjects(current_user: UserModel = Depends(get_current_user)):

    return BaseResponse()

@router.post("/create", response_model=BaseResponse)
async def create_question(current_user: UserModel = Depends(get_current_user)):

    return BaseResponse()

@router.put("/{question_id}", response_model=BaseResponse)
async def update_question(question_id: str, current_user: UserModel = Depends(get_current_user)):

    return BaseResponse()

@router.delete("/{question_id}", response_model=BaseResponse)
async def delete_question(question_id: str, current_user: UserModel = Depends(get_current_user)):

    return BaseResponse()