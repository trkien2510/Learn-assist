from fastapi import APIRouter, UploadFile, File, Depends, Query
from core.dependencies import get_current_user
from models.user_model import UserModel
from schemas.base_schema import BaseResponse
from schemas.document_schema import ListQuestionSchema
from services import document_service

router = APIRouter()


@router.get("/all", response_model=BaseResponse)
async def get_all_documents(page: int = 1, page_size: int = 20, current_user: UserModel = Depends(get_current_user)):
    data = await document_service.get_my_documents(page, page_size, current_user)
    return BaseResponse(data=data)


@router.post("/upload/{number_question}", response_model=BaseResponse)
async def upload_document(
    number_question: int, 
    mode: str = Query(..., description="Generation mode: 'strict' (follow document content only) or 'expanded' (allow related knowledge)"),
    file: UploadFile = File(...), 
    current_user: UserModel = Depends(get_current_user)
):
    data = await document_service.process_upload(number_question, file, current_user, mode)
    return BaseResponse(data=data)


@router.post("/save-questions/{document_id}", response_model=BaseResponse)
async def save_questions(document_id: str, list_question: ListQuestionSchema, current_user: UserModel = Depends(get_current_user)):
    data = await document_service.save_questions(list_question, document_id, current_user)
    return BaseResponse(data=data)


@router.delete("/{document_id}", response_model=BaseResponse)
async def delete_document(document_id: str, current_user: UserModel = Depends(get_current_user)):
    data = await document_service.delete_document(document_id, current_user)
    return BaseResponse(data=data)


@router.get("/{document_id}/question-count", response_model=BaseResponse)
async def get_document_question_count(document_id: str, current_user: UserModel = Depends(get_current_user)):
    data = await document_service.get_document_question_count(document_id, current_user)
    return BaseResponse(data=data)