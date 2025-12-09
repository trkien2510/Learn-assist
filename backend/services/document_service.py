from fastapi import UploadFile
from utils.document_util import read_and_clean_uploaded_file
from services.ai_service import call_openai_for_questions, create_question_generation_prompt
from core.exception_handler import AppException
from core.status_code import StatusCode
from services import log_service, notification_service

from models.document_model import DocumentModel

import os


async def process_upload(number_question: int, file: UploadFile, current_user):
    if current_user.role.value != "teacher":
        raise AppException(StatusCode.FORBIDDEN, "Only teachers can upload documents")

    try:
        document_content = await read_and_clean_uploaded_file(file)

        if document_content is None:
            await notification_service.notify_teacher_document_upload_failed(
                user=current_user,
                document_name=file.filename,
                error_message="Unsupported file type or extraction error"
            )
            raise AppException(StatusCode.UNSUPPORTED_TYPE, "Unsupported file type or extraction error")

        if not document_content.strip():
            await notification_service.notify_teacher_document_upload_failed(
                user=current_user,
                document_name=file.filename,
                error_message="Document is empty or has no text content"
            )
            raise AppException(StatusCode.BAD_REQUEST, "Document is empty or has no text content")

        new_document = DocumentModel(
            name=os.path.splitext(file.filename)[0],
            creator=current_user,
            file_name=file.filename,
            file_path=file.filename,
            file_type=file.content_type or "application/octet-stream"
        )
        await new_document.insert()

        data = call_openai_for_questions(create_question_generation_prompt(document_content.strip(), number_question))

        await log_service.log_document("upload_document", str(new_document.id), current_user, {
            "filename": file.filename,
            "number_question": number_question
        })

        # Notify teacher about successful upload
        question_count = len(data) if isinstance(data, list) else 0
        await notification_service.notify_teacher_document_upload_success(
            user=current_user,
            document_name=new_document.name,
            document_id=str(new_document.id),
            question_count=question_count
        )

        return {
            "document_id": str(new_document.id),
            "document_name": new_document.name,
            "questions": data
        }
    except AppException:
        raise
    except Exception as e:
        # Notify teacher about failed upload
        await notification_service.notify_teacher_document_upload_failed(
            user=current_user,
            document_name=file.filename,
            error_message=str(e)
        )
        # Notify admins about potential system error
        await notification_service.notify_admins_system_error(
            error_type="Document Processing",
            error_message=str(e),
            details={"filename": file.filename, "user_id": str(current_user.id)}
        )
        raise AppException(StatusCode.FILE_PROCESSING_ERROR, f"Failed to process document: {str(e)}")


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


async def get_my_documents(page: int, page_size: int, current_user):
    if page < 1:
        page = 1
    if page_size < 1 or page_size > 100:
        page_size = 20

    skip = (page - 1) * page_size

    items = []
    total = 0

    if current_user.role.value == "admin":
        query = DocumentModel.find_all()
        total = await query.count()
        items = await query.skip(skip).limit(page_size).to_list()

    elif current_user.role.value == "teacher":
        query = DocumentModel.find({"creator.$id": current_user.id})
        total = await query.count()
        items = await query.skip(skip).limit(page_size).to_list()

    else:
        raise AppException(StatusCode.FORBIDDEN, "Students cannot view document list")

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


async def delete_document(document_id: str, current_user):
    from beanie import PydanticObjectId

    try:
        obj_id = PydanticObjectId(document_id)
    except:
        raise AppException(StatusCode.BAD_REQUEST, "Invalid document ID")

    document = await DocumentModel.get(obj_id)
    if not document:
        raise AppException(StatusCode.NOT_FOUND, "Document not found")

    if document.creator.ref.id != current_user.id and current_user.role.value != "admin":
        raise AppException(StatusCode.FORBIDDEN, "Permission denied")

    await log_service.log_document("delete_document", document_id, current_user)

    await document.delete()
    return {}


async def save_questions(list_question_data, current_user):
    from models.question_model import QuestionModel

    if current_user.role.value != "teacher":
        raise AppException(StatusCode.FORBIDDEN, "Only teachers can save questions")

    questions = list_question_data.questions
    if not questions:
        raise AppException(StatusCode.BAD_REQUEST, "Question list is empty")

    saved_questions = []
    for q in questions:
        new_question = QuestionModel(
            creator_id=current_user,
            content=q.content,
            options=q.options,
            answers=q.answer,
            difficulty=q.difficulty
        )
        await new_question.insert()
        saved_questions.append({
            "id": str(new_question.id),
            "content": new_question.content,
            "difficulty": new_question.difficulty
        })

    await log_service.log_document("save_questions", "", current_user, {
        "question_count": len(saved_questions)
    })

    return {
        "saved_count": len(saved_questions),
        "questions": saved_questions
    }
