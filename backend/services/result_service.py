from beanie import PydanticObjectId
from core.exception_handler import AppException
from core.status_code import StatusCode
from models.result_model import ResultModel
from models.exam_model import ExamModel
from models.classroom_model import ClassroomModel
from services import log_service


def get_id_from_other(obj) -> PydanticObjectId:
    if hasattr(obj, "ref"):
        return obj.ref.id
    return obj.id


async def get_results_by_exam_id(exam_id: str, page: int, page_size: int, current_user):
    try:
        obj_id = PydanticObjectId(exam_id)
    except:
        raise AppException(StatusCode.BAD_REQUEST, "Invalid exam ID")

    exam = await ExamModel.get(obj_id)
    if not exam:
        raise AppException(StatusCode.NOT_FOUND, "Exam not found")

    if page < 1:
        page = 1
    if page_size < 1 or page_size > 100:
        page_size = 20

    skip = (page - 1) * page_size

    items = []
    total = 0

    is_personal_exam = exam.is_personal if hasattr(exam, 'is_personal') else False

    if current_user.role == "admin":
        query = ResultModel.find({"exam_id.$id": obj_id}, fetch_links=True)
        total = await query.count()
        items = await query.skip(skip).limit(page_size).to_list()

    elif is_personal_exam:
        if get_id_from_other(exam.creator_id) != current_user.id:
            raise AppException(StatusCode.FORBIDDEN, "You can only view your own personal exam results")
        
        query = ResultModel.find({
            "exam_id.$id": obj_id,
            "user_id.$id": current_user.id
        }, fetch_links=True)
        total = await query.count()
        items = await query.skip(skip).limit(page_size).to_list()

    elif current_user.role == "teacher":
        if exam.class_id:
            classroom = await ClassroomModel.get(get_id_from_other(exam.class_id))
            if classroom:
                is_creator = get_id_from_other(classroom.creator) == current_user.id
                is_member = any(get_id_from_other(m) == current_user.id for m in classroom.members)

                if not is_creator and not is_member:
                    raise AppException(StatusCode.FORBIDDEN, "You do not have permission to view results of this exam")

        query = ResultModel.find({"exam_id.$id": obj_id}, fetch_links=True)
        total = await query.count()
        items = await query.skip(skip).limit(page_size).to_list()

    elif current_user.role == "student":
        query = ResultModel.find({
            "exam_id.$id": obj_id,
            "user_id.$id": current_user.id
        })
        total = await query.count()
        items = await query.skip(skip).limit(page_size).to_list()

    else:
        raise AppException(StatusCode.FORBIDDEN, "Access denied")

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


async def get_results_by_class_id(class_id: str, page: int, page_size: int, current_user):
    try:
        obj_id = PydanticObjectId(class_id)
    except:
        raise AppException(StatusCode.BAD_REQUEST, "Invalid class ID")

    classroom = await ClassroomModel.get(obj_id)
    if not classroom:
        raise AppException(StatusCode.NOT_FOUND, "Classroom not found")

    if page < 1:
        page = 1
    if page_size < 1 or page_size > 100:
        page_size = 20

    skip = (page - 1) * page_size

    exams = await ExamModel.find({"class_id.$id": obj_id}).to_list()
    exam_ids = [e.id for e in exams]

    items = []
    total = 0

    if not exam_ids:
        total_pages = 0
        return {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages,
            "has_next": False,
            "has_previous": page > 1
        }

    if current_user.role == "admin":
        query = ResultModel.find({"exam_id.$id": {"$in": exam_ids}}, fetch_links=True)
        total = await query.count()
        items = await query.skip(skip).limit(page_size).to_list()

    elif current_user.role == "teacher":
        is_creator = get_id_from_other(classroom.creator) == current_user.id
        is_member = any(get_id_from_other(m) == current_user.id for m in classroom.members)

        if not is_creator and not is_member:
            raise AppException(StatusCode.FORBIDDEN, "You do not have permission to view results of this class")

        query = ResultModel.find({"exam_id.$id": {"$in": exam_ids}}, fetch_links=True)
        total = await query.count()
        items = await query.skip(skip).limit(page_size).to_list()

    elif current_user.role == "student":
        is_member = any(get_id_from_other(m) == current_user.id for m in classroom.members)

        if not is_member:
            raise AppException(StatusCode.FORBIDDEN, "You are not a member of this class")

        query = ResultModel.find({
            "exam_id.$id": {"$in": exam_ids},
            "user_id.$id": current_user.id
        })
        total = await query.count()
        items = await query.skip(skip).limit(page_size).to_list()

    else:
        raise AppException(StatusCode.FORBIDDEN, "Access denied")

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


async def get_my_results(page: int, page_size: int, current_user):
    if page < 1:
        page = 1
    if page_size < 1 or page_size > 100:
        page_size = 20

    skip = (page - 1) * page_size

    items = []
    total = 0

    if current_user.role == "admin":
        query = ResultModel.find_all()
        total = await query.count()
        items = await query.skip(skip).limit(page_size).to_list()

    elif current_user.role == "teacher":
        classrooms = await ClassroomModel.find(
            {"$or": [
                {"creator.$id": current_user.id},
                {"members.$id": current_user.id}
            ]}
        ).to_list()
        class_ids = [c.id for c in classrooms]

        if class_ids:
            exams = await ExamModel.find({"class_id.$id": {"$in": class_ids}}).to_list()
            exam_ids = [e.id for e in exams]

            if exam_ids:
                query = ResultModel.find({"exam_id.$id": {"$in": exam_ids}})
                total = await query.count()
                items = await query.skip(skip).limit(page_size).to_list()

    elif current_user.role == "student":
        query = ResultModel.find({"user_id.$id": current_user.id})
        total = await query.count()
        items = await query.skip(skip).limit(page_size).to_list()

    enriched_items = []
    for item in items:
        item_dict = item.model_dump(mode='json')
        
        try:
            exam_id = get_id_from_other(item.exam_id)
            if exam_id:
                exam = await ExamModel.get(exam_id)
                if exam:
                    item_dict['exam_title'] = exam.title
                    item_dict['question_count'] = len(exam.questions) if exam.questions else 0
                    item_dict['duration'] = exam.duration
                else:
                    item_dict['exam_title'] = "Bài kiểm tra"
                    item_dict['question_count'] = 0
                    item_dict['duration'] = 0
        except Exception:
            item_dict['exam_title'] = "Bài kiểm tra"
            item_dict['question_count'] = 0
            item_dict['duration'] = 0
        
        enriched_items.append(item_dict)

    total_pages = (total + page_size - 1) // page_size

    return {
        "items": enriched_items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
        "has_next": page < total_pages,
        "has_previous": page > 1
    }


async def delete_result(result_id: str, current_user):
    if current_user.role != "teacher" and current_user.role != "admin":
        raise AppException(StatusCode.FORBIDDEN, "Permission denied")

    try:
        obj_id = PydanticObjectId(result_id)
    except:
        raise AppException(StatusCode.BAD_REQUEST, "Invalid result ID")

    result = await ResultModel.get(obj_id)
    if result:
        await log_service.create_log(
            action="delete_result",
            user=current_user,
            resource_type="result",
            resource_id=result_id
        )
        await result.delete()
    return {}


async def get_personal_results(page: int, page_size: int, current_user):
    if page < 1:
        page = 1
    if page_size < 1 or page_size > 100:
        page_size = 20

    skip = (page - 1) * page_size

    personal_exams = await ExamModel.find({
        "creator_id.$id": current_user.id,
        "is_personal": True
    }).to_list()

    exam_ids = [e.id for e in personal_exams]

    items = []
    total = 0

    if exam_ids:
        query = ResultModel.find({
            "exam_id.$id": {"$in": exam_ids},
            "user_id.$id": current_user.id
        })
        total = await query.count()
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


async def get_user_overall_statistics(current_user):
    from models.question_model import QuestionModel
    from models.document_model import DocumentModel

    all_results = await ResultModel.find({
        "user_id.$id": current_user.id,
        "submitted": True
    }).to_list()

    personal_exams = await ExamModel.find({
        "creator_id.$id": current_user.id,
        "is_personal": True
    }).to_list()
    personal_exam_ids = set(str(e.id) for e in personal_exams)

    personal_results = []
    classroom_results = []

    for r in all_results:
        exam_id_str = str(get_id_from_other(r.exam_id))
        if exam_id_str in personal_exam_ids:
            personal_results.append(r)
        else:
            classroom_results.append(r)

    personal_scores = [r.score for r in personal_results]
    personal_stats = {
        "total_attempts": len(personal_results),
        "average_score": round(sum(personal_scores) / len(personal_scores), 2) if personal_scores else 0,
        "highest_score": max(personal_scores) if personal_scores else 0,
        "lowest_score": min(personal_scores) if personal_scores else 0,
        "total_questions_answered": sum(len(r.answer_map) for r in personal_results)
    }

    classroom_scores = [r.score for r in classroom_results]
    classroom_stats = {
        "total_attempts": len(classroom_results),
        "average_score": round(sum(classroom_scores) / len(classroom_scores), 2) if classroom_scores else 0,
        "highest_score": max(classroom_scores) if classroom_scores else 0,
        "lowest_score": min(classroom_scores) if classroom_scores else 0,
        "total_questions_answered": sum(len(r.answer_map) for r in classroom_results)
    }

    documents = await DocumentModel.find({"creator.$id": current_user.id}).to_list()
    questions = await QuestionModel.find({"creator_id.$id": current_user.id}).to_list()

    return {
        "personal_practice": personal_stats,
        "classroom_exams": classroom_stats,
        "total_documents_created": len(documents),
        "total_questions_created": len(questions),
        "total_personal_exams": len(personal_exams),
        "overall": {
            "total_exams_taken": len(all_results),
            "all_scores_average": round(sum(r.score for r in all_results) / len(all_results), 2) if all_results else 0
        }
    }

