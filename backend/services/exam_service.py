from datetime import datetime, timezone
from beanie import PydanticObjectId
from core.exception_handler import AppException
from core.status_code import StatusCode
from models.exam_model import ExamModel
from models.classroom_model import ClassroomModel
from models.question_model import QuestionModel
from models.result_model import ResultModel
from services import log_service


async def create_exam(exam_data, current_user):
    if current_user.role != "teacher":
        raise AppException(StatusCode.FORBIDDEN, "Only teachers can create exams")

    classroom = await ClassroomModel.find_one(ClassroomModel.class_code == exam_data.class_code)
    if not classroom:
        raise AppException(StatusCode.BAD_REQUEST, "Invalid class code")

    if classroom.creator.ref.id != current_user.id:
        raise AppException(StatusCode.FORBIDDEN, "You are not the teacher of this class")

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
        start_at=exam_data.start_at,
        end_at=exam_data.end_at,
        expiry_at=exam_data.end_at
    )
    await new_exam.insert()

    await log_service.log_exam("create_exam", str(new_exam.id), current_user, {
        "title": exam_data.title,
        "class_code": exam_data.class_code,
        "question_count": len(question_links)
    })

    return {}


async def delete_exam(exam_id: str, current_user):
    try:
        obj_id = PydanticObjectId(exam_id)
    except:
        raise AppException(StatusCode.BAD_REQUEST, "Invalid exam ID")

    exam = await ExamModel.get(obj_id)
    if not exam:
        raise AppException(StatusCode.NOT_FOUND, "Exam not found")

    if exam.creator_id.ref.id != current_user.id:
        raise AppException(StatusCode.FORBIDDEN, "Permission denied")

    await log_service.log_exam("delete_exam", exam_id, current_user, {
        "title": exam.title
    })

    await exam.delete()
    return {}


async def start_exam(exam_id: str, current_user):
    try:
        obj_id = PydanticObjectId(exam_id)
    except:
        raise AppException(StatusCode.BAD_REQUEST, "Invalid exam ID")

    exam = await ExamModel.get(obj_id)
    if not exam:
        raise AppException(StatusCode.NOT_FOUND, "Exam not found")

    classroom = await ClassroomModel.get(exam.class_id.ref.id)
    if not classroom:
        raise AppException(StatusCode.NOT_FOUND, "Classroom not found")

    is_member = any(m.ref.id == current_user.id for m in classroom.members)
    if not is_member:
        raise AppException(StatusCode.FORBIDDEN, "You are not a member of this class")

    now = datetime.now(timezone.utc)

    if now < exam.start_at:
        raise AppException(StatusCode.BAD_REQUEST, "Exam has not started yet")

    if now > exam.end_at:
        raise AppException(StatusCode.BAD_REQUEST, "Exam has ended")

    existing_result = await ResultModel.find_one({
        "exam_id.$id": obj_id,
        "user_id.$id": current_user.id
    })

    if existing_result:
        if existing_result.submitted:
            raise AppException(StatusCode.BAD_REQUEST, "You have already submitted this exam")

        time_elapsed = (now - existing_result.started_at).total_seconds() / 60
        if time_elapsed > exam.duration:
            raise AppException(StatusCode.BAD_REQUEST, "Time limit exceeded")

        return {
            "exam": exam,
            "result_id": str(existing_result.id),
            "started_at": existing_result.started_at,
            "time_remaining": max(0, exam.duration - time_elapsed),
            "is_continuing": True
        }

    new_result = ResultModel(
        exam_id=exam,
        user_id=current_user,
        started_at=now
    )
    await new_result.insert()

    await log_service.log_exam("start_exam", exam_id, current_user, {
        "title": exam.title
    })

    return {
        "exam": exam,
        "result_id": str(new_result.id),
        "started_at": new_result.started_at,
        "time_remaining": exam.duration,
        "is_continuing": False
    }


async def submit_exam(exam_id: str, submit_data, current_user):
    try:
        obj_id = PydanticObjectId(exam_id)
    except:
        raise AppException(StatusCode.BAD_REQUEST, "Invalid exam ID")

    exam = await ExamModel.get(obj_id)
    if not exam:
        raise AppException(StatusCode.NOT_FOUND, "Exam not found")

    now = datetime.now(timezone.utc)

    result = await ResultModel.find_one({
        "exam_id.$id": obj_id,
        "user_id.$id": current_user.id
    })

    if not result:
        raise AppException(StatusCode.BAD_REQUEST, "You have not started this exam")

    if result.submitted:
        raise AppException(StatusCode.BAD_REQUEST, "You have already submitted this exam")

    time_elapsed = (now - result.started_at).total_seconds() / 60
    if time_elapsed > exam.duration + 1:
        result.submitted = True
        result.submit_at = now
        result.ended_at = now
        await result.save()
        raise AppException(StatusCode.BAD_REQUEST, "Time limit exceeded, exam auto-submitted")

    answers = submit_data.answers if hasattr(submit_data, 'answers') else submit_data
    correct_count = 0
    total_questions = len(exam.questions)

    for question_link in exam.questions:
        question = await QuestionModel.get(question_link.ref.id)
        if question:
            question_id_str = str(question.id)
            if question_id_str in answers:
                user_answer = answers[question_id_str]
                if user_answer == question.answers:
                    correct_count += 1

    score = (correct_count / total_questions * 10) if total_questions > 0 else 0

    result.answer_map = answers
    result.submitted = True
    result.submit_at = now
    result.ended_at = now
    result.score = round(score, 2)

    await result.save()

    await log_service.log_exam("submit_exam", exam_id, current_user, {
        "title": exam.title,
        "score": result.score,
        "correct_count": correct_count,
        "total_questions": total_questions
    })

    return {
        "result_id": str(result.id),
        "score": result.score,
        "correct_count": correct_count,
        "total_questions": total_questions,
        "submitted_at": result.submit_at
    }


async def get_exams_by_class(class_id: str, page: int, page_size: int, current_user):
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

    exams = []
    total = 0

    if current_user.role == "admin":
        query = ExamModel.find({"class_id.$id": obj_id})
        total = await query.count()
        exams = await query.skip(skip).limit(page_size).to_list()

    elif current_user.role == "teacher":
        is_creator = classroom.creator.ref.id == current_user.id
        is_member = any(m.ref.id == current_user.id for m in classroom.members)

        if not is_creator and not is_member:
            raise AppException(StatusCode.FORBIDDEN, "You do not have permission to view exams of this class")

        query = ExamModel.find({"class_id.$id": obj_id})
        total = await query.count()
        exams = await query.skip(skip).limit(page_size).to_list()

    elif current_user.role == "student":
        is_member = any(m.ref.id == current_user.id for m in classroom.members)

        if not is_member:
            raise AppException(StatusCode.FORBIDDEN, "You are not a member of this class")

        query = ExamModel.find({"class_id.$id": obj_id})
        total = await query.count()
        exams = await query.skip(skip).limit(page_size).to_list()

    else:
        raise AppException(StatusCode.FORBIDDEN, "Access denied")

    total_pages = (total + page_size - 1) // page_size

    return {
        "items": exams,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
        "has_next": page < total_pages,
        "has_previous": page > 1
    }


async def get_my_exams(page: int, page_size: int, current_user):
    if page < 1:
        page = 1
    if page_size < 1 or page_size > 100:
        page_size = 20

    skip = (page - 1) * page_size

    exams = []
    total = 0

    if current_user.role == "admin":
        query = ExamModel.find_all()
        total = await query.count()
        exams = await query.skip(skip).limit(page_size).to_list()

    elif current_user.role == "teacher":
        classrooms = await ClassroomModel.find(
            {"$or": [
                {"creator.$id": current_user.id},
                {"members.$id": current_user.id}
            ]}
        ).to_list()
        class_ids = [c.id for c in classrooms]

        if class_ids:
            query = ExamModel.find({"class_id.$id": {"$in": class_ids}})
            total = await query.count()
            exams = await query.skip(skip).limit(page_size).to_list()

    elif current_user.role == "student":
        classrooms = await ClassroomModel.find(
            {"members.$id": current_user.id}
        ).to_list()
        class_ids = [c.id for c in classrooms]

        if class_ids:
            query = ExamModel.find({"class_id.$id": {"$in": class_ids}})
            total = await query.count()
            exams = await query.skip(skip).limit(page_size).to_list()

    total_pages = (total + page_size - 1) // page_size

    return {
        "items": exams,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
        "has_next": page < total_pages,
        "has_previous": page > 1
    }
