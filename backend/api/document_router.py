from fastapi import APIRouter, UploadFile, File, Depends, HTTPException

from core.dependencies import get_current_user
from models.user_model import UserModel
from schemas.base_schema import BaseResponse
from schemas.document_schema import ListQuestionSchema
from services.ai_service import call_openai_for_questions, create_question_generation_prompt
from services.document_service import read_and_clean_uploaded_file

router = APIRouter()

ALLOWED_MIME_TYPES = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]

@router.post("/upload/{number_question}", response_model=BaseResponse)
async def upload_files(number_question: int, file: UploadFile = File(...), current_user: UserModel = Depends(get_current_user)):
    if current_user.role.value != "teacher":
        raise HTTPException(403, "Chỉ giáo viên mới có quyền")

    document_content = await read_and_clean_uploaded_file(file)

    if document_content is None:
        raise HTTPException(415, "Loại file không được hỗ trợ hoặc lỗi trích xuất.")

    if not document_content.strip():
        raise HTTPException(400, "Tài liệu rỗng hoặc không có văn bản.")

    data = call_openai_for_questions(create_question_generation_prompt(document_content.strip(), number_question))

    return BaseResponse(data=data)

@router.post("/save-questions", response_model=BaseResponse)
async def save_question(list_question: ListQuestionSchema, current_user: UserModel = Depends(get_current_user)):

    return BaseResponse(data=list_question)