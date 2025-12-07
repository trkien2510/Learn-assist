from fastapi import UploadFile
from utils.document_util import read_and_clean_uploaded_file
from services.ai_service import call_openai_for_questions, create_question_generation_prompt
from core.exception_handler import AppException
from core.status_code import StatusCode

from models.document_model import DocumentModel


async def process_upload(number_question: int, file: UploadFile, current_user):
    if current_user.role.value != "teacher":
        raise AppException(StatusCode.FORBIDDEN, "Chỉ giáo viên mới có quyền")

    document_content = await read_and_clean_uploaded_file(file)

    if document_content is None:
        raise AppException(StatusCode.UNSUPPORTED_TYPE, "Loại file không được hỗ trợ hoặc lỗi trích xuất.")

    if not document_content.strip():
        raise AppException(StatusCode.BAD_REQUEST, "Tài liệu rỗng hoặc không có văn bản.")

    data = call_openai_for_questions(create_question_generation_prompt(document_content.strip(), number_question))
    return data


async def get_all_documents(page: int, page_size: int):
    if page < 1:
        page = 1
    if page_size < 1 or page_size > 100:
        page_size = 20

    skip = (page - 1) * page_size

    total = await DocumentModel.find_all().count()
    items = await DocumentModel.find_all().skip(skip).limit(page_size).to_list()

    total_pages = (total + page_size - 1) // page_size

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
        "has_next": page < total_pages,
        "has_previous": page > 1
    }


async def get_my_documents(current_user):
    if current_user.role.value != "teacher":
        raise AppException(StatusCode.FORBIDDEN, "Chỉ giáo viên mới có quyền xem danh sách tài liệu")

    items = await DocumentModel.find(DocumentModel.creator.id == current_user.id).to_list()

    return items


async def delete_document(document_id: str, current_user):
    from beanie import PydanticObjectId

    try:
        obj_id = PydanticObjectId(document_id)
    except:
        raise AppException(StatusCode.BAD_REQUEST, "ID tài liệu không hợp lệ")

    document = await DocumentModel.get(obj_id)
    if not document:
        raise AppException(StatusCode.NOT_FOUND, "Tài liệu không tồn tại")

    # Chỉ cho phép creator hoặc admin xóa
    if document.creator.id != current_user.id and current_user.role.value != "admin":
        raise AppException(StatusCode.FORBIDDEN, "Không có quyền xóa tài liệu này")

    await document.delete()
    return {}
