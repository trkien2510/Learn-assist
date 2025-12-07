from datetime import datetime, timezone
from beanie import PydanticObjectId
from core.exception_handler import AppException
from core.status_code import StatusCode
from models.exam_model import ExamModel
from models.classroom_model import ClassroomModel
from models.question_model import QuestionModel
from models.result_model import ResultModel


async def create_exam(exam_data, current_user):
    if current_user.role != "teacher":
        raise AppException(StatusCode.FORBIDDEN, "Chỉ giáo viên mới có quyền tạo bài thi")

    classroom = await ClassroomModel.find_one(ClassroomModel.class_code == exam_data.class_code)
    if not classroom:
        raise AppException(StatusCode.BAD_REQUEST, "Mã lớp không hợp lệ")

    if classroom.creator.id != current_user.id:  # Simplify checks
        raise AppException(StatusCode.FORBIDDEN, "Bạn không phải giáo viên của lớp này")

    question_links = []
    if exam_data.question_ids:
        for qid in exam_data.question_ids:
            try:
                q = await QuestionModel.get(PydanticObjectId(qid))
                if q:
                    question_links.append(q)
            except:
                pass

    new_exam = ExamModel(
        creator_id=current_user,
        class_id=classroom,
        title=exam_data.title,
        questions=question_links,
        duration=exam_data.duration,
        strat_at=exam_data.strat_at,
        end_at=exam_data.end_at,
        expiry_at=exam_data.end_at
    )
    await new_exam.insert()
    return {}


async def delete_exam(exam_id: str, current_user):
    try:
        obj_id = PydanticObjectId(exam_id)
    except:
        raise AppException(StatusCode.BAD_REQUEST, "ID bài thi không hợp lệ")

    exam = await ExamModel.get(obj_id)
    if not exam:
        raise AppException(StatusCode.NOT_FOUND, "Bài thi không tồn tại")

    if exam.creator_id.id != current_user.id:
        raise AppException(StatusCode.FORBIDDEN, "Không có quyền xóa")

    await exam.delete()
    return {}


async def start_exam(exam_id: str, current_user):
    try:
        obj_id = PydanticObjectId(exam_id)
    except:
        raise AppException(StatusCode.BAD_REQUEST, "ID bài thi không hợp lệ")

    exam = await ExamModel.get(obj_id)
    if not exam:
        raise AppException(StatusCode.NOT_FOUND, "Bài thi không tồn tại")

    now = datetime.now(timezone.utc)

    return exam


async def submit_exam(exam_id: str, answers: dict, current_user):
    try:
        obj_id = PydanticObjectId(exam_id)
    except:
        raise AppException(StatusCode.BAD_REQUEST, "ID bài thi không hợp lệ")

    exam = await ExamModel.get(obj_id)
    if not exam:
        raise AppException(StatusCode.NOT_FOUND, "Bài thi không tồn tại")

    return {}
