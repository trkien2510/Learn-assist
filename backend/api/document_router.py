from fastapi import APIRouter, UploadFile, File, Depends, HTTPException

from core.dependencies import get_current_user
from models.user_model import UserModel
from schemas.base_schema import BaseResponse
from services.document_service import read_and_clean_uploaded_file

router = APIRouter()

ALLOWED_MIME_TYPES = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]

@router.post("/upload", response_model=BaseResponse)
async def upload_files(file: UploadFile = File(...), current_user: UserModel = Depends(get_current_user)):
    if current_user.role.value != "teacher":
        raise HTTPException(403, "Chỉ giáo viên mới có quyền")

    document_content = await read_and_clean_uploaded_file(file)

    if document_content is None:
        raise HTTPException(415, "Loại file không được hỗ trợ hoặc lỗi trích xuất.")

    if not document_content.strip():
        raise HTTPException(400, "Tài liệu rỗng hoặc không có văn bản.")

    return BaseResponse(data={document_content})

@router.post("/save", response_model=BaseResponse)
async def save_document():

    return BaseResponse()

@router.post("/cancel", response_model=BaseResponse)
async def cancel_save_document():

    return BaseResponse()