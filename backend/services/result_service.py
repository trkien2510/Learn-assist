from beanie import PydanticObjectId
from core.exception_handler import AppException
from core.status_code import StatusCode
from models.result_model import ResultModel
from models.exam_model import ExamModel
from models.classroom_model import ClassroomModel
from services import log_service


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

    if current_user.role == "admin":
        query = ResultModel.find({"exam_id.$id": obj_id})
        total = await query.count()
        items = await query.skip(skip).limit(page_size).to_list()

    elif current_user.role == "teacher":
        classroom = await ClassroomModel.get(exam.class_id.ref.id)
        if classroom:
            is_creator = classroom.creator.ref.id == current_user.id
            is_member = any(m.ref.id == current_user.id for m in classroom.members)

            if not is_creator and not is_member:
                raise AppException(StatusCode.FORBIDDEN, "You do not have permission to view results of this exam")

        query = ResultModel.find({"exam_id.$id": obj_id})
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
        query = ResultModel.find({"exam_id.$id": {"$in": exam_ids}})
        total = await query.count()
        items = await query.skip(skip).limit(page_size).to_list()

    elif current_user.role == "teacher":
        is_creator = classroom.creator.ref.id == current_user.id
        is_member = any(m.ref.id == current_user.id for m in classroom.members)

        if not is_creator and not is_member:
            raise AppException(StatusCode.FORBIDDEN, "You do not have permission to view results of this class")

        query = ResultModel.find({"exam_id.$id": {"$in": exam_ids}})
        total = await query.count()
        items = await query.skip(skip).limit(page_size).to_list()

    elif current_user.role == "student":
        is_member = any(m.ref.id == current_user.id for m in classroom.members)

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
