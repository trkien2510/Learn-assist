from fastapi import APIRouter, UploadFile, File, Depends

from core.dependencies import get_current_user
from models.user_model import UserModel
from schemas.base_schema import BaseResponse
from schemas.document_schema import ListQuestionSchema
from services import document_service

router = APIRouter()

ALLOWED_MIME_TYPES = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]

@router.get("/all", response_model=BaseResponse)
async def get_my_documents_list(current_user: UserModel = Depends(get_current_user)):
    data = await document_service.get_my_documents(current_user)
    return BaseResponse(data=data)

@router.post("/upload/{number_question}", response_model=BaseResponse)
async def handle_upload_file(number_question: int, file: UploadFile = File(...), current_user: UserModel = Depends(get_current_user)):
    data = await document_service.process_upload(number_question, file, current_user)
    return BaseResponse(data=data)

@router.post("/save-questions", response_model=BaseResponse)
async def handle_save_questions(list_question: ListQuestionSchema, current_user: UserModel = Depends(get_current_user)):
    return BaseResponse(data=list_question)

@router.delete("/{document_id}", response_model=BaseResponse)
async def handle_delete_document(document_id: str, current_user: UserModel = Depends(get_current_user)):
    await document_service.delete_document(document_id, current_user)
    return BaseResponse()