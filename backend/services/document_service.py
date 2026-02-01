from fastapi import UploadFile
from typing import Optional
from utils.document_util import read_and_clean_uploaded_file
from services.ai_service import (
    generate_questions,
    validate_document_content,
    GenerationMode
)
from core.exception_handler import AppException
from core.status_code import StatusCode
from services import log_service, notification_service

from models.document_model import DocumentModel

import os


async def process_upload(number_question: int, file: UploadFile, current_user, mode: str):
    if current_user.role.value == "admin":
        raise AppException(StatusCode.FORBIDDEN, "Admin cannot upload documents")
    
    if not mode or mode.lower() not in ["strict", "expanded"]:
        raise AppException(StatusCode.BAD_REQUEST, "Generation mode is required. Please choose 'strict' or 'expanded'")
    
    generation_mode = GenerationMode.STRICT if mode.lower() == "strict" else GenerationMode.EXPANDED
    
    try:
        document_content = await read_and_clean_uploaded_file(file)

        if document_content is None:
            await notification_service.notify_document_upload_failed(
                user=current_user,
                document_name=file.filename,
                error_message="Unsupported file type or extraction error"
            )
            raise AppException(StatusCode.UNSUPPORTED_TYPE, "Unsupported file type or extraction error")

        if not document_content.strip():
            await notification_service.notify_document_upload_failed(
                user=current_user,
                document_name=file.filename,
                error_message="Document is empty or has no text content"
            )
            raise AppException(StatusCode.BAD_REQUEST, "Document is empty or has no text content")

        validation = validate_document_content(document_content.strip(), number_question)
        
        if not validation.is_valid:
            await notification_service.notify_document_upload_failed(
                user=current_user,
                document_name=file.filename,
                error_message=validation.error_message
            )
            raise AppException(StatusCode.BAD_REQUEST, validation.error_message)

        file_extension = os.path.splitext(file.filename)[1].lower().replace('.', '')
        if not file_extension:
            if file.content_type == "application/pdf":
                file_extension = "pdf"
            elif file.content_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                file_extension = "docx"
            elif file.content_type == "application/msword":
                file_extension = "doc"

        new_document = DocumentModel(
            name=os.path.splitext(file.filename)[0],
            creator=current_user,
            file_name=file.filename,
            file_type=file_extension or "bin"
        )
        await new_document.insert()

        try:
            ai_result, error_message = await generate_questions(
                document_content.strip(), 
                number_question,
                generation_mode,
                user=current_user
            )
            
            if error_message:
                raise AppException(StatusCode.AI_GENERATION_FAILED, error_message)
            
            questions = ai_result.get("questions", [])
            chunks_processed = ai_result.get("chunks_processed", 1)
            total_tokens = ai_result.get("total_tokens", 0)
            reason = ai_result.get("reason", None)
            
            if not questions:
                await new_document.delete()
                error_msg = reason or "Document content is not suitable for generating quiz questions."
                await notification_service.notify_document_upload_failed(
                    user=current_user,
                    document_name=file.filename,
                    error_message=error_msg
                )
                raise AppException(StatusCode.AI_GENERATION_FAILED, error_msg)

            await log_service.log_document("upload_document", str(new_document.id), current_user, {
                "filename": file.filename,
                "number_question": number_question,
                "questions_generated": len(questions),
                "chunks_processed": chunks_processed,
                "total_tokens": total_tokens,
                "generation_mode": ai_result.get("generation_mode", "auto")
            })

            question_count = len(questions)
            await notification_service.notify_document_upload_success(
                user=current_user,
                document_name=new_document.name,
                document_id=str(new_document.id),
                question_count=question_count
            )

            return {
                "document_id": str(new_document.id),
                "document_name": new_document.name,
                "questions": questions,
                "metadata": {
                    "chunks_processed": chunks_processed,
                    "total_tokens": total_tokens,
                    "was_chunked": chunks_processed > 1,
                    "generation_mode": ai_result.get("generation_mode", mode.lower())
                }
            }
        except Exception as e:
            await new_document.delete()
            if isinstance(e, AppException):
                await notification_service.notify_document_upload_failed(
                    user=current_user,
                    document_name=file.filename,
                    error_message=e.message
                )
            raise e

    except AppException:
        raise
    except Exception as e:
        await notification_service.notify_document_upload_failed(
            user=current_user,
            document_name=file.filename,
            error_message=str(e)
        )
        await notification_service.notify_admins_system_error(
            error_type="Document Processing",
            error_message=str(e),
            details={"filename": file.filename, "user_id": str(current_user.id)}
        )
        raise AppException(StatusCode.FILE_PROCESSING_ERROR, f"Failed to process document: {str(e)}")


async def get_my_documents(page: int, page_size: int, current_user):
    if page < 1:
        page = 1
    if page_size < 1 or page_size > 100:
        page_size = 20

    skip = (page - 1) * page_size

    items = []
    total = 0

    if current_user.role.value == "admin":
        query = DocumentModel.find_all().sort([("upload_date", -1)])
        total = await DocumentModel.find_all().count()
        items = await query.skip(skip).limit(page_size).to_list()

    elif current_user.role.value == "teacher":
        query = DocumentModel.find({"creator.$id": current_user.id}).sort([("upload_date", -1)])
        total = await DocumentModel.find({"creator.$id": current_user.id}).count()
        items = await query.skip(skip).limit(page_size).to_list()

    else:
        query = DocumentModel.find({"creator.$id": current_user.id}).sort([("upload_date", -1)])
        total = await DocumentModel.find({"creator.$id": current_user.id}).count()
        items = await query.skip(skip).limit(page_size).to_list()

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


async def save_questions(list_question_data, document_id: str, current_user):
    if current_user.role.value == "admin":
        raise AppException(StatusCode.FORBIDDEN, "Admin cannot save questions")
    
    from models.question_model import QuestionModel
    from beanie import PydanticObjectId

    questions = list_question_data.questions
    if not questions:
        raise AppException(StatusCode.BAD_REQUEST, "Question list is empty")

    doc_ref = None
    if document_id:
        try:
            doc_obj_id = PydanticObjectId(document_id)
            doc = await DocumentModel.get(doc_obj_id)
            if doc:
                doc_ref = doc
        except:
            pass

    saved_questions = []
    for q in questions:
        raw_diff = q.difficulty.lower()
        if "dễ" in raw_diff or "easy" in raw_diff:
            diff_val = "Easy"
        elif "khó" in raw_diff or "hard" in raw_diff:
            diff_val = "Hard"
        else:
            diff_val = "Medium"

        new_question = QuestionModel(
            document_id=doc_ref,
            creator_id=current_user,
            content=q.content,
            options=q.options,
            answers=q.answer,
            difficulty=diff_val
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
