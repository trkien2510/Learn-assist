from beanie import PydanticObjectId
from core.exception_handler import AppException
from core.status_code import StatusCode
from models.question_model import QuestionModel
from models.document_model import DocumentModel
from models.classroom_model import ClassroomModel


async def get_question_by_id(question_id: str):
    try:
        q_id = PydanticObjectId(question_id)
    except:
        raise AppException(StatusCode.BAD_REQUEST, "ID câu hỏi không hợp lệ")

    question = await QuestionModel.get(q_id)
    if not question:
        raise AppException(StatusCode.NOT_FOUND, "Câu hỏi không tồn tại")
    return question


async def create_question(question_data, current_user):
    doc_link = None
    if question_data.document_id:
        try:
            doc_id = PydanticObjectId(question_data.document_id)
            doc_link = await DocumentModel.get(doc_id)
        except:
            pass

    new_question = QuestionModel(
        document_id=doc_link,
        creator_id=current_user,
        content=question_data.content,
        options=question_data.options,
        answers=question_data.answers,
        difficulty=question_data.difficulty
    )
    await new_question.insert()
    return new_question


async def update_question(question_id: str, update_data, current_user):
    question = await get_question_by_id(question_id)

    # Check permission? Assuming only creator or teacher can update
    if question.creator_id.id != current_user.id and current_user.role != "admin":  # simplified
        raise AppException(StatusCode.FORBIDDEN, "Không có quyền chỉnh sửa")

    update_dict = update_data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(question, key, value)

    await question.save()
    return question


async def delete_question(question_id: str, current_user):
    question = await get_question_by_id(question_id)

    # Check permission
    if question.creator_id.id != current_user.id and current_user.role != "admin":
        raise AppException(StatusCode.FORBIDDEN, "Không có quyền xóa")

    await question.delete()
    return {}


async def get_all_questions(page: int = 1, page_size: int = 20):
    if page < 1:
        page = 1
    if page_size < 1 or page_size > 100:
        page_size = 20

    skip = (page - 1) * page_size

    total = await QuestionModel.find_all().count()
    items = await QuestionModel.find_all().skip(skip).limit(page_size).to_list()

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


async def get_available_subjects():
    subjects = await ClassroomModel.distinct("subject")
    return subjects
