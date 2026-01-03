from beanie import PydanticObjectId
from core.exception_handler import AppException
from core.status_code import StatusCode
from models.question_model import QuestionModel
from models.document_model import DocumentModel
from models.classroom_model import ClassroomModel
from services import log_service


async def get_question_by_id(question_id: str):
    try:
        q_id = PydanticObjectId(question_id)
    except:
        raise AppException(StatusCode.BAD_REQUEST, "Invalid question ID")

    question = await QuestionModel.get(q_id)
    if not question:
        raise AppException(StatusCode.NOT_FOUND, "Question not found")
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

    await log_service.log_question("create_question", str(new_question.id), current_user, {
        "difficulty": question_data.difficulty
    })

    return new_question


async def update_question(question_id: str, update_data, current_user):
    question = await get_question_by_id(question_id)

    if question.creator_id.ref.id != current_user.id and current_user.role != "admin":
        raise AppException(StatusCode.FORBIDDEN, "Permission denied")

    update_dict = update_data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(question, key, value)

    await question.save()

    await log_service.log_question("update_question", question_id, current_user, {
        "fields_updated": list(update_dict.keys())
    })

    return question


async def delete_question(question_id: str, current_user):
    question = await get_question_by_id(question_id)

    if question.creator_id.ref.id != current_user.id and current_user.role != "admin":
        raise AppException(StatusCode.FORBIDDEN, "Permission denied")

    await log_service.log_question("delete_question", question_id, current_user)

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


async def get_my_questions(page: int, page_size: int, current_user, search: str = None, difficulty: str = None):
    if page < 1:
        page = 1
    if page_size < 1 or page_size > 100:
        page_size = 20

    skip = (page - 1) * page_size

    query_conditions = []
    
    if current_user.role != "admin":
        query_conditions.append({"creator_id.$id": current_user.id})
    
    if search:
        from beanie.operators import RegEx, Or
        search_pattern = f".*{search}.*"
        query_conditions.append(Or(
            RegEx(QuestionModel.content, search_pattern, options="i")
        ))
    
    if difficulty:
        query_conditions.append({"difficulty": difficulty})

    if query_conditions:
        if len(query_conditions) == 1:
            query = QuestionModel.find(query_conditions[0])
            total = await QuestionModel.find(query_conditions[0]).count()
        else:
            from beanie.operators import And
            query = QuestionModel.find(And(*query_conditions))
            total = await QuestionModel.find(And(*query_conditions)).count()
    else:
        query = QuestionModel.find_all()
        total = await QuestionModel.find_all().count()

    items = await query.sort([("created_at", -1)]).skip(skip).limit(page_size).to_list()

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

