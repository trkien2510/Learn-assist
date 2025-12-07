from beanie import PydanticObjectId
from core.exception_handler import AppException
from core.status_code import StatusCode
from models.result_model import ResultModel
from models.exam_model import ExamModel
from models.classroom_model import ClassroomModel


async def get_results_by_exam_id(exam_id: str, page: int = 1, page_size: int = 20):
    try:
        obj_id = PydanticObjectId(exam_id)
    except:
        raise AppException(StatusCode.BAD_REQUEST, "ID bài thi không hợp lệ")

    if page < 1:
        page = 1
    if page_size < 1 or page_size > 100:
        page_size = 20

    skip = (page - 1) * page_size

    query = ResultModel.find(ResultModel.exam_id.id == obj_id)
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


async def get_results_by_class_id(class_id: str, page: int = 1, page_size: int = 20):
    try:
        obj_id = PydanticObjectId(class_id)
    except:
        raise AppException(StatusCode.BAD_REQUEST, "ID lớp học không hợp lệ")

    if page < 1:
        page = 1
    if page_size < 1 or page_size > 100:
        page_size = 20

    skip = (page - 1) * page_size

    exams = await ExamModel.find(ExamModel.class_id.id == obj_id).to_list()
    exam_ids = [e.id for e in exams]

    query = ResultModel.find(ResultModel.exam_id.id == {"$in": exam_ids})
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
        raise AppException(StatusCode.FORBIDDEN, "Không có quyền xóa")

    try:
        obj_id = PydanticObjectId(result_id)
    except:
        raise AppException(StatusCode.BAD_REQUEST, "ID kết quả không hợp lệ")

    result = await ResultModel.get(obj_id)
    if result:
        await result.delete()
    return {}
