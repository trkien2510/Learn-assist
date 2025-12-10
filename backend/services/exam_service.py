from datetime import datetime, timezone
from beanie import PydanticObjectId
from core.exception_handler import AppException
from core.status_code import StatusCode
from models.exam_model import ExamModel
from models.classroom_model import ClassroomModel
from models.question_model import QuestionModel
from models.result_model import ResultModel
from services import log_service, notification_service


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

    await notification_service.notify_students_exam_created(
        exam=new_exam,
        classroom=classroom,
        creator_name=current_user.full_name
    )

    await notification_service.notify_teacher_exam_created(
        user=current_user,
        exam=new_exam,
        classroom_name=classroom.name,
        question_count=len(question_links)
    )

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

    await notification_service.notify_student_exam_started(
        user=current_user,
        exam=exam,
        classroom_name=classroom.name if classroom else "Unknown"
    )

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

    # Notify student about their result
    await notification_service.notify_student_exam_submitted(
        user=current_user,
        exam=exam,
        score=result.score,
        correct_count=correct_count,
        total_questions=total_questions
    )

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


async def create_personal_exam(exam_data, current_user):
    from datetime import timedelta
    
    question_links = []
    if exam_data.question_ids:
        for qid in exam_data.question_ids:
            try:
                q = await QuestionModel.get(PydanticObjectId(qid))
                if q:
                    if q.creator_id.ref.id == current_user.id:
                        question_links.append(q)
            except:
                pass

    if not question_links:
        raise AppException(StatusCode.BAD_REQUEST, "No valid questions provided")

    now = datetime.now(timezone.utc)
    new_exam = ExamModel(
        creator_id=current_user,
        class_id=None,
        title=exam_data.title,
        questions=question_links,
        duration=exam_data.duration,
        start_at=now,
        end_at=now + timedelta(hours=24),
        expiry_at=now + timedelta(hours=24),
        is_personal=True
    )
    await new_exam.insert()

    await log_service.log_exam("create_personal_exam", str(new_exam.id), current_user, {
        "title": exam_data.title,
        "question_count": len(question_links),
        "duration": exam_data.duration
    })

    await notification_service.notify_personal_exam_created(
        user=current_user,
        exam=new_exam,
        question_count=len(question_links)
    )

    return {
        "exam_id": str(new_exam.id),
        "title": new_exam.title,
        "question_count": len(question_links),
        "duration": new_exam.duration
    }


async def start_personal_exam(exam_id: str, current_user):
    """Start a personal practice exam"""
    try:
        obj_id = PydanticObjectId(exam_id)
    except:
        raise AppException(StatusCode.BAD_REQUEST, "Invalid exam ID")

    exam = await ExamModel.get(obj_id)
    if not exam:
        raise AppException(StatusCode.NOT_FOUND, "Exam not found")

    if not exam.is_personal:
        raise AppException(StatusCode.BAD_REQUEST, "This is not a personal exam")

    if exam.creator_id.ref.id != current_user.id:
        raise AppException(StatusCode.FORBIDDEN, "You can only take your own personal exams")

    now = datetime.now(timezone.utc)

    if now > exam.end_at:
        raise AppException(StatusCode.BAD_REQUEST, "Exam has expired")

    existing_result = await ResultModel.find_one({
        "exam_id.$id": obj_id,
        "user_id.$id": current_user.id
    })

    if existing_result:
        if existing_result.submitted:
            pass
        else:
            time_elapsed = (now - existing_result.started_at).total_seconds() / 60
            if time_elapsed > exam.duration:
                existing_result.submitted = True
                existing_result.ended_at = now
                await existing_result.save()
            else:
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

    await log_service.log_exam("start_personal_exam", exam_id, current_user, {
        "title": exam.title
    })

    return {
        "exam": exam,
        "result_id": str(new_result.id),
        "started_at": new_result.started_at,
        "time_remaining": exam.duration,
        "is_continuing": False
    }


async def get_my_personal_exams(page: int, page_size: int, current_user):
    """Get user's personal practice exams"""
    if page < 1:
        page = 1
    if page_size < 1 or page_size > 100:
        page_size = 20

    skip = (page - 1) * page_size

    query = ExamModel.find({
        "creator_id.$id": current_user.id,
        "is_personal": True
    })
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


async def delete_personal_exam(exam_id: str, current_user):
    """Delete a personal exam"""
    try:
        obj_id = PydanticObjectId(exam_id)
    except:
        raise AppException(StatusCode.BAD_REQUEST, "Invalid exam ID")

    exam = await ExamModel.get(obj_id)
    if not exam:
        raise AppException(StatusCode.NOT_FOUND, "Exam not found")

    if not exam.is_personal:
        raise AppException(StatusCode.BAD_REQUEST, "This is not a personal exam")

    if exam.creator_id.ref.id != current_user.id:
        raise AppException(StatusCode.FORBIDDEN, "You can only delete your own personal exams")

    # Delete associated results
    await ResultModel.find({"exam_id.$id": obj_id}).delete()

    await log_service.log_exam("delete_personal_exam", exam_id, current_user, {
        "title": exam.title
    })

    await exam.delete()
    return {}


async def get_personal_exam_statistics(current_user):
    """Get statistics for user's personal practice exams"""
    # Get all personal exams created by user
    personal_exams = await ExamModel.find({
        "creator_id.$id": current_user.id,
        "is_personal": True
    }).to_list()

    exam_ids = [e.id for e in personal_exams]

    if not exam_ids:
        return {
            "total_exams": 0,
            "total_attempts": 0,
            "completed_attempts": 0,
            "average_score": 0,
            "highest_score": 0,
            "lowest_score": 0,
            "total_questions_answered": 0,
            "exams": []
        }

    # Get all results for personal exams
    results = await ResultModel.find({
        "exam_id.$id": {"$in": exam_ids},
        "user_id.$id": current_user.id
    }).to_list()

    completed_results = [r for r in results if r.submitted]
    scores = [r.score for r in completed_results]

    # Get per-exam statistics
    exam_stats = []
    for exam in personal_exams:
        exam_results = [r for r in results if r.exam_id.ref.id == exam.id]
        exam_completed = [r for r in exam_results if r.submitted]
        exam_scores = [r.score for r in exam_completed]

        exam_stats.append({
            "exam_id": str(exam.id),
            "title": exam.title,
            "question_count": len(exam.questions),
            "attempts": len(exam_results),
            "completed": len(exam_completed),
            "average_score": round(sum(exam_scores) / len(exam_scores), 2) if exam_scores else 0,
            "highest_score": max(exam_scores) if exam_scores else 0,
            "last_attempt": max([r.submit_at for r in exam_completed]) if exam_completed else None
        })

    return {
        "total_exams": len(personal_exams),
        "total_attempts": len(results),
        "completed_attempts": len(completed_results),
        "average_score": round(sum(scores) / len(scores), 2) if scores else 0,
        "highest_score": max(scores) if scores else 0,
        "lowest_score": min(scores) if scores else 0,
        "total_questions_answered": sum(len(r.answer_map) for r in completed_results),
        "exams": exam_stats
    }


async def get_user_document_statistics(current_user):
    """Get statistics for user's documents and questions"""
    from models.document_model import DocumentModel

    # Get all documents created by user
    documents = await DocumentModel.find({
        "creator.$id": current_user.id
    }).to_list()

    # Get all questions created by user
    questions = await QuestionModel.find({
        "creator_id.$id": current_user.id
    }).to_list()

    # Group questions by difficulty
    difficulty_stats = {}
    for q in questions:
        diff = q.difficulty.value if hasattr(q.difficulty, 'value') else str(q.difficulty)
        if diff not in difficulty_stats:
            difficulty_stats[diff] = 0
        difficulty_stats[diff] += 1

    # Get questions used in personal exams
    personal_exams = await ExamModel.find({
        "creator_id.$id": current_user.id,
        "is_personal": True
    }).to_list()

    questions_in_exams = set()
    for exam in personal_exams:
        for q_link in exam.questions:
            questions_in_exams.add(str(q_link.ref.id))

    return {
        "total_documents": len(documents),
        "total_questions": len(questions),
        "questions_by_difficulty": difficulty_stats,
        "questions_used_in_exams": len(questions_in_exams),
        "documents": [
            {
                "id": str(d.id),
                "name": d.name,
                "file_name": d.file_name,
                "upload_date": d.upload_date
            }
            for d in documents
        ]
    }

