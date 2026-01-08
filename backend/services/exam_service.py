from datetime import datetime, timezone
from beanie import PydanticObjectId
from core.exception_handler import AppException
from core.status_code import StatusCode
from models.exam_model import ExamModel
from models.classroom_model import ClassroomModel
from models.question_model import QuestionModel
from models.result_model import ResultModel
from models.document_model import DocumentModel
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


    start_at = exam_data.start_at
    end_at = exam_data.end_at
    
    if start_at.tzinfo is None:
        start_at = start_at.replace(tzinfo=timezone.utc)
    else:
        start_at = start_at.astimezone(timezone.utc)
        
    if end_at.tzinfo is None:
        end_at = end_at.replace(tzinfo=timezone.utc)
    else:
        end_at = end_at.astimezone(timezone.utc)

    new_exam = ExamModel(
        creator_id=current_user,
        class_id=classroom,
        title=exam_data.title,
        questions=question_links,
        duration=exam_data.duration,
        start_at=start_at,
        end_at=end_at,
        expiry_at=end_at
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


async def get_exam_detail(exam_id: str, current_user):
    try:
        obj_id = PydanticObjectId(exam_id)
    except:
        raise AppException(StatusCode.BAD_REQUEST, "Invalid exam ID")

    exam = await ExamModel.get(obj_id)
    if not exam:
        raise AppException(StatusCode.NOT_FOUND, "Exam not found")

    questions_data = []
    for q_link in exam.questions:
        question = await QuestionModel.get(q_link.ref.id)
        if question:
            questions_data.append({
                "id": str(question.id),
                "_id": str(question.id),
                "content": question.content,
                "options": question.options,
                "answers": question.answers,
                "difficulty": question.difficulty
            })

    return {
        "exam": {
            "id": str(exam.id),
            "_id": str(exam.id),
            "title": exam.title,
            "duration": exam.duration,
            "start_at": exam.start_at,
            "end_at": exam.end_at,
            "questions": questions_data
        }
    }


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

    if current_user.role != "student":
        raise AppException(StatusCode.FORBIDDEN, "Chỉ sinh viên mới có thể làm bài kiểm tra")

    now = datetime.now(timezone.utc)
    
    exam_start = exam.start_at
    exam_end = exam.end_at
    
    if exam_start.tzinfo is None:
        exam_start = exam_start.replace(tzinfo=timezone.utc)
    else:
        exam_start = exam_start.astimezone(timezone.utc)
        
    if exam_end.tzinfo is None:
        exam_end = exam_end.replace(tzinfo=timezone.utc)
    else:
        exam_end = exam_end.astimezone(timezone.utc)

    if now < exam_start:
        raise AppException(StatusCode.BAD_REQUEST, "Exam has not started yet")

    if now > exam_end:
        raise AppException(StatusCode.BAD_REQUEST, "Exam has ended")

    existing_result = await ResultModel.find_one({
        "exam_id.$id": obj_id,
        "user_id.$id": current_user.id
    })

    if existing_result:
        if existing_result.submitted:
            raise AppException(StatusCode.BAD_REQUEST, "You have already submitted this exam")

        started_at = existing_result.started_at
        if started_at.tzinfo is None:
            started_at = started_at.replace(tzinfo=timezone.utc)
        else:
            started_at = started_at.astimezone(timezone.utc)

        time_elapsed = (now - started_at).total_seconds() / 60
        if time_elapsed > exam.duration:
            raise AppException(StatusCode.BAD_REQUEST, "Time limit exceeded")

        questions_data = []
        for q_link in exam.questions:
            question = await QuestionModel.get(q_link.ref.id)
            if question:
                questions_data.append({
                    "id": str(question.id),
                    "_id": str(question.id),
                    "content": question.content,
                    "options": question.options,
                    "answers": question.answers,
                    "difficulty": question.difficulty
                })

        time_remaining_minutes = max(0, exam.duration - time_elapsed)
        
        return {
            "exam": {
                "id": str(exam.id),
                "_id": str(exam.id),
                "title": exam.title,
                "duration": exam.duration,
                "start_at": exam.start_at,
                "end_at": exam.end_at,
                "questions": questions_data
            },
            "result_id": str(existing_result.id),
            "started_at": existing_result.started_at,
            "time_remaining": time_remaining_minutes * 60,
            "is_continuing": True
        }

    new_result = ResultModel(
        exam_id=exam,
        user_id=current_user,
        started_at=now
    )
    
    try:
        await new_result.insert()
    except Exception as e:
        if "duplicate key error" in str(e).lower() or "E11000" in str(e):
            existing_result = await ResultModel.find_one({
                "exam_id.$id": obj_id,
                "user_id.$id": current_user.id
            })
            
            if existing_result:
                if existing_result.submitted:
                    raise AppException(StatusCode.BAD_REQUEST, "You have already submitted this exam")
                
                started_at = existing_result.started_at
                if started_at.tzinfo is None:
                    started_at = started_at.replace(tzinfo=timezone.utc)
                else:
                    started_at = started_at.astimezone(timezone.utc)

                time_elapsed = (now - started_at).total_seconds() / 60
                if time_elapsed > exam.duration:
                    raise AppException(StatusCode.BAD_REQUEST, "Time limit exceeded")

                questions_data = []
                for q_link in exam.questions:
                    question = await QuestionModel.get(q_link.ref.id)
                    if question:
                        questions_data.append({
                            "id": str(question.id),
                            "_id": str(question.id),
                            "content": question.content,
                            "options": question.options,
                            "answers": question.answers,
                            "difficulty": question.difficulty
                        })

                time_remaining_minutes = max(0, exam.duration - time_elapsed)
                
                return {
                    "exam": {
                        "id": str(exam.id),
                        "_id": str(exam.id),
                        "title": exam.title,
                        "duration": exam.duration,
                        "start_at": exam.start_at,
                        "end_at": exam.end_at,
                        "questions": questions_data
                    },
                    "result_id": str(existing_result.id),
                    "started_at": existing_result.started_at,
                    "time_remaining": time_remaining_minutes * 60,
                    "is_continuing": True
                }
        raise

    try:
        await log_service.log_exam("start_exam", exam_id, current_user, {
            "title": exam.title
        })
    except Exception as e:
        print(f"Failed to log exam start: {e}")

    try:
        await notification_service.notify_student_exam_started(
            user=current_user,
            exam=exam,
            classroom_name=classroom.name if classroom else "Unknown"
        )
    except Exception as e:
        print(f"Failed to send notification: {e}")

    questions_data = []
    for q_link in exam.questions:
        question = await QuestionModel.get(q_link.ref.id)
        if question:
            questions_data.append({
                "id": str(question.id),
                "_id": str(question.id),
                "content": question.content,
                "options": question.options,
                "answers": question.answers,
                "difficulty": question.difficulty
            })

    return {
        "exam": {
            "id": str(exam.id),
            "_id": str(exam.id),
            "title": exam.title,
            "duration": exam.duration,
            "start_at": exam.start_at,
            "end_at": exam.end_at,
            "questions": questions_data
        },
        "result_id": str(new_result.id),
        "started_at": new_result.started_at,
        "time_remaining": exam.duration * 60,
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
        "user_id.$id": PydanticObjectId(current_user.id)
    })

    if not result:
        raise AppException(StatusCode.BAD_REQUEST, "You have not started this exam")

    if result.submitted:
        raise AppException(StatusCode.BAD_REQUEST, "You have already submitted this exam")

    started_at = result.started_at
    if started_at.tzinfo is None:
        started_at = started_at.replace(tzinfo=timezone.utc)
    else:
        started_at = started_at.astimezone(timezone.utc)

    time_elapsed = (now - started_at).total_seconds() / 60
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

    try:
        await log_service.log_exam("submit_exam", exam_id, current_user, {
            "title": exam.title,
            "score": result.score,
            "correct_count": correct_count,
            "total_questions": total_questions
        })
    except Exception as e:
        print(f"Failed to log exam submission: {e}")

    try:
        await notification_service.notify_student_exam_submitted(
            user=current_user,
            exam=exam,
            score=result.score,
            correct_count=correct_count,
            total_questions=total_questions
        )
    except Exception as e:
        print(f"Failed to send submission notification: {e}")

    return {
        "result_id": str(result.id),
        "score": result.score,
        "correct_answers": correct_count,
        "total_questions": total_questions,
        "submitted_at": result.submit_at
    }


async def save_answers(exam_id: str, answer_data, current_user):
    try:
        obj_id = PydanticObjectId(exam_id)
    except:
        raise AppException(StatusCode.BAD_REQUEST, "Invalid exam ID")

    exam = await ExamModel.get(obj_id)
    if not exam:
        raise AppException(StatusCode.NOT_FOUND, "Exam not found")

    result = await ResultModel.find_one({
        "exam_id.$id": obj_id,
        "user_id.$id": PydanticObjectId(current_user.id)
    })

    if not result:
        raise AppException(StatusCode.BAD_REQUEST, "You have not started this exam")

    if result.submitted:
        raise AppException(StatusCode.BAD_REQUEST, "Exam already submitted")

    now = datetime.now(timezone.utc)
    started_at = result.started_at
    if started_at.tzinfo is None:
        started_at = started_at.replace(tzinfo=timezone.utc)
    else:
        started_at = started_at.astimezone(timezone.utc)

    time_elapsed = (now - started_at).total_seconds() / 60
    if time_elapsed > exam.duration + 1:
        raise AppException(StatusCode.BAD_REQUEST, "Time limit exceeded")

    answers = answer_data.answers if hasattr(answer_data, 'answers') else answer_data
    result.answer_map = answers
    await result.save()

    return {
        "message": "Lưu câu trả lời thành công",
        "saved_count": len(answers)
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

    submitted_exam_ids_list = []
    if current_user.role == "student" and exams:
        exam_ids = [e.id for e in exams]
        
        submitted_results = await ResultModel.find({
            "exam_id.$id": {"$in": exam_ids},
            "user_id.$id": current_user.id,
            "submitted": True
        }).to_list()
        
        for r in submitted_results:
            try:
                if hasattr(r.exam_id, 'ref') and r.exam_id.ref:
                    submitted_exam_ids_list.append(str(r.exam_id.ref.id))
                elif hasattr(r.exam_id, 'id'):
                    submitted_exam_ids_list.append(str(r.exam_id.id))
            except Exception:
                pass

    return {
        "items": exams,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
        "has_next": page < total_pages,
        "has_previous": page > 1,
        "submitted_exam_ids": submitted_exam_ids_list
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
        query = ExamModel.find_all().sort([("created_at", -1)])
        total = await ExamModel.find_all().count()
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
            query = ExamModel.find({"class_id.$id": {"$in": class_ids}}).sort([("created_at", -1)])
            total = await ExamModel.find({"class_id.$id": {"$in": class_ids}}).count()
            exams = await query.skip(skip).limit(page_size).to_list()

    elif current_user.role == "student":
        classrooms = await ClassroomModel.find(
            {"members.$id": current_user.id}
        ).to_list()
        class_ids = [c.id for c in classrooms]

        if class_ids:
            query = ExamModel.find({"class_id.$id": {"$in": class_ids}}).sort([("created_at", -1)])
            total = await ExamModel.find({"class_id.$id": {"$in": class_ids}}).count()
            exams = await query.skip(skip).limit(page_size).to_list()

    total_pages = (total + page_size - 1) // page_size

    submitted_exam_ids_list = []
    if current_user.role == "student" and exams:
        exam_ids = [e.id for e in exams]
        
        submitted_results = await ResultModel.find({
            "exam_id.$id": {"$in": exam_ids},
            "user_id.$id": current_user.id,
            "submitted": True
        }).to_list()
        
        for r in submitted_results:
            try:
                if hasattr(r.exam_id, 'ref') and r.exam_id.ref:
                    submitted_exam_ids_list.append(str(r.exam_id.ref.id))
                elif hasattr(r.exam_id, 'id'):
                    submitted_exam_ids_list.append(str(r.exam_id.id))
            except Exception:
                pass

    return {
        "items": exams,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
        "has_next": page < total_pages,
        "has_previous": page > 1,
        "submitted_exam_ids": submitted_exam_ids_list
    }


async def create_personal_exam(exam_data, current_user):
    if current_user.role.value == "admin":
        raise AppException(StatusCode.FORBIDDEN, "Admin cannot create personal exams")
    
    from datetime import timedelta
    import random
    
    question_links = []
    
    if exam_data.question_ids and len(exam_data.question_ids) > 0:
        for qid in exam_data.question_ids:
            try:
                q = await QuestionModel.get(PydanticObjectId(qid))
                if q:
                    if q.creator_id.ref.id == current_user.id:
                        question_links.append(q)
                    elif q.document_id:
                        document = await q.document_id.fetch()
                        if document and document.creator.ref.id == current_user.id:
                            question_links.append(q)
            except Exception as e:
                print(f"Error processing question {qid}: {e}")
                pass
    
    elif exam_data.num_questions and exam_data.num_questions > 0:
        query_filter = {
            "$or": [
                {"creator_id.$id": current_user.id}
            ]
        }
        
        if exam_data.difficulty:
            query_filter["difficulty"] = exam_data.difficulty.upper()
        
        available_questions = await QuestionModel.find(query_filter).to_list()
        
        if not exam_data.difficulty:
            user_docs = await DocumentModel.find({"creator.$id": current_user.id}).to_list()
            doc_ids = [doc.id for doc in user_docs]
            
            if doc_ids:
                doc_questions = await QuestionModel.find({
                    "document_id.$id": {"$in": doc_ids}
                }).to_list()
                existing_ids = {q.id for q in available_questions}
                for dq in doc_questions:
                    if dq.id not in existing_ids:
                        available_questions.append(dq)
        else:
            user_docs = await DocumentModel.find({"creator.$id": current_user.id}).to_list()
            doc_ids = [doc.id for doc in user_docs]
            
            if doc_ids:
                doc_questions = await QuestionModel.find({
                    "document_id.$id": {"$in": doc_ids},
                    "difficulty": exam_data.difficulty.upper()
                }).to_list()
                existing_ids = {q.id for q in available_questions}
                for dq in doc_questions:
                    if dq.id not in existing_ids:
                        available_questions.append(dq)
        
        if len(available_questions) < exam_data.num_questions:
            raise AppException(
                StatusCode.BAD_REQUEST, 
                f"Not enough questions available. You have {len(available_questions)} questions but requested {exam_data.num_questions}"
            )
        
        question_links = random.sample(available_questions, exam_data.num_questions)

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

    exam_end = exam.end_at
    if exam_end.tzinfo is None:
        exam_end = exam_end.replace(tzinfo=timezone.utc)
    else:
        exam_end = exam_end.astimezone(timezone.utc)

    if now > exam_end:
        raise AppException(StatusCode.BAD_REQUEST, "Exam has expired")

    existing_result = await ResultModel.find_one({
        "exam_id.$id": obj_id,
        "user_id.$id": current_user.id
    })

    if existing_result:
        if existing_result.submitted:
            pass
        else:
            started_at = existing_result.started_at
            if started_at.tzinfo is None:
                started_at = started_at.replace(tzinfo=timezone.utc)
            time_elapsed = (now - started_at).total_seconds() / 60
            if time_elapsed > exam.duration:
                existing_result.submitted = True
                existing_result.ended_at = now
                await existing_result.save()
            else:
                questions_data = []
                for q_link in exam.questions:
                    question = await QuestionModel.get(q_link.ref.id)
                    if question:
                        questions_data.append({
                            "id": str(question.id),
                            "_id": str(question.id),
                            "content": question.content,
                            "options": question.options,
                            "answers": question.answers,
                            "difficulty": question.difficulty
                        })
                
                time_remaining_minutes = max(0, exam.duration - time_elapsed)
                
                return {
                    "exam": {
                        "id": str(exam.id),
                        "_id": str(exam.id),
                        "title": exam.title,
                        "duration": exam.duration,
                        "start_at": exam.start_at,
                        "end_at": exam.end_at,
                        "questions": questions_data
                    },
                    "result_id": str(existing_result.id),
                    "started_at": existing_result.started_at,
                    "time_remaining": time_remaining_minutes * 60,
                    "is_continuing": True
                }

    new_result = ResultModel(
        exam_id=exam,
        user_id=current_user,
        started_at=now
    )
    
    try:
        await new_result.insert()
    except Exception as e:
        if "duplicate key error" in str(e).lower() or "E11000" in str(e):
            existing_result = await ResultModel.find_one({
                "exam_id.$id": obj_id,
                "user_id.$id": current_user.id
            })
            
            if existing_result:
                if existing_result.submitted:
                    pass
                else:
                    started_at = existing_result.started_at
                    if started_at.tzinfo is None:
                        started_at = started_at.replace(tzinfo=timezone.utc)
                    time_elapsed = (now - started_at).total_seconds() / 60
                    if time_elapsed > exam.duration:
                        existing_result.submitted = True
                        existing_result.ended_at = now
                        await existing_result.save()
                    else:
                        questions_data = []
                        for q_link in exam.questions:
                            question = await QuestionModel.get(q_link.ref.id)
                            if question:
                                questions_data.append({
                                    "id": str(question.id),
                                    "_id": str(question.id),
                                    "content": question.content,
                                    "options": question.options,
                                    "answers": question.answers,
                                    "difficulty": question.difficulty
                                })
                        
                        time_remaining_minutes = max(0, exam.duration - time_elapsed)
                        
                        return {
                            "exam": {
                                "id": str(exam.id),
                                "_id": str(exam.id),
                                "title": exam.title,
                                "duration": exam.duration,
                                "start_at": exam.start_at,
                                "end_at": exam.end_at,
                                "questions": questions_data
                            },
                            "result_id": str(existing_result.id),
                            "started_at": existing_result.started_at,
                            "time_remaining": time_remaining_minutes * 60,
                            "is_continuing": True
                        }
        raise

    await log_service.log_exam("start_personal_exam", exam_id, current_user, {
        "title": exam.title
    })

    questions_data = []
    for q_link in exam.questions:
        question = await QuestionModel.get(q_link.ref.id)
        if question:
            questions_data.append({
                "id": str(question.id),
                "_id": str(question.id),
                "content": question.content,
                "options": question.options,
                "answers": question.answers,
                "difficulty": question.difficulty
            })

    return {
        "exam": {
            "id": str(exam.id),
            "_id": str(exam.id),
            "title": exam.title,
            "duration": exam.duration,
            "start_at": exam.start_at,
            "end_at": exam.end_at,
            "questions": questions_data
        },
        "result_id": str(new_result.id),
        "started_at": new_result.started_at,
        "time_remaining": exam.duration * 60,
        "is_continuing": False
    }


async def get_my_personal_exams(page: int, page_size: int, current_user):
    if page < 1:
        page = 1
    if page_size < 1 or page_size > 100:
        page_size = 20

    skip = (page - 1) * page_size

    query = ExamModel.find({
        "creator_id.$id": current_user.id,
        "is_personal": True
    }).sort([("created_at", -1)])
    total = await ExamModel.find({
        "creator_id.$id": current_user.id,
        "is_personal": True
    }).count()
    exams = await query.skip(skip).limit(page_size).to_list()

    total_pages = (total + page_size - 1) // page_size

    exam_ids = [e.id for e in exams]
    results = await ResultModel.find({
        "exam_id.$id": {"$in": exam_ids},
        "user_id.$id": current_user.id
    }).to_list()

    result_map = {}
    for r in results:
        try:
            exam_ref_id = r.exam_id.ref.id if hasattr(r.exam_id, 'ref') else r.exam_id.id
            result_map[str(exam_ref_id)] = r
        except:
            pass

    exam_list = []
    for exam in exams:
        exam_data = {
            "id": str(exam.id),
            "_id": str(exam.id),
            "title": exam.title,
            "duration": exam.duration,
            "start_at": exam.start_at,
            "end_at": exam.end_at,
            "num_questions": len(exam.questions) if exam.questions else 0,
            "is_personal": True
        }
        
        result = result_map.get(str(exam.id))
        if result:
            if result.submitted:
                exam_data["status"] = "completed"
                exam_data["score"] = result.score
            else:
                exam_data["status"] = "in_progress"
        else:
            exam_data["status"] = "not_started"
        
        exam_list.append(exam_data)

    return {
        "items": exam_list,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
        "has_next": page < total_pages,
        "has_previous": page > 1
    }


async def delete_personal_exam(exam_id: str, current_user):
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

    await ResultModel.find({"exam_id.$id": obj_id}).delete()

    await log_service.log_exam("delete_personal_exam", exam_id, current_user, {
        "title": exam.title
    })

    await exam.delete()
    return {}


async def get_personal_exam_statistics(current_user):
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

    results = await ResultModel.find({
        "exam_id.$id": {"$in": exam_ids},
        "user_id.$id": current_user.id
    }).to_list()

    completed_results = [r for r in results if r.submitted]
    scores = [r.score for r in completed_results]

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
    from models.document_model import DocumentModel

    documents = await DocumentModel.find({
        "creator.$id": current_user.id
    }).to_list()

    questions = await QuestionModel.find({
        "creator_id.$id": current_user.id
    }).to_list()

    difficulty_stats = {}
    for q in questions:
        diff = q.difficulty.value if hasattr(q.difficulty, 'value') else str(q.difficulty)
        if diff not in difficulty_stats:
            difficulty_stats[diff] = 0
        difficulty_stats[diff] += 1

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


async def preview_exam_questions(class_code: str, total_questions: int, easy_count: int, medium_count: int, hard_count: int, current_user):
    from models.question_model import Difficulty
    import random
    
    classroom = await ClassroomModel.find_one(ClassroomModel.class_code == class_code)
    if not classroom:
        raise AppException(StatusCode.CLASSROOM_NOT_FOUND)
    
    if classroom.creator.ref.id != current_user.id:
        raise AppException(StatusCode.FORBIDDEN, "Only the classroom creator can create exams")
    
    if easy_count + medium_count + hard_count != total_questions:
        raise AppException(StatusCode.BAD_REQUEST, "Sum of difficulty counts must equal total questions")
    
    all_questions = await QuestionModel.find({"creator_id.$id": current_user.id}).to_list()
    
    questions_by_diff = {
        "Easy": [q for q in all_questions if q.difficulty == Difficulty.EASY],
        "Medium": [q for q in all_questions if q.difficulty == Difficulty.MEDIUM],
        "Hard": [q for q in all_questions if q.difficulty == Difficulty.HARD]
    }
    
    if len(questions_by_diff["Easy"]) < easy_count:
        raise AppException(StatusCode.BAD_REQUEST, f"Không đủ câu hỏi dễ. Hiện có: {len(questions_by_diff['Easy'])}, Yêu cầu: {easy_count}")
    if len(questions_by_diff["Medium"]) < medium_count:
        raise AppException(StatusCode.BAD_REQUEST, f"Không đủ câu hỏi trung bình. Hiện có: {len(questions_by_diff['Medium'])}, Yêu cầu: {medium_count}")
    if len(questions_by_diff["Hard"]) < hard_count:
        raise AppException(StatusCode.BAD_REQUEST, f"Không đủ câu hỏi khó. Hiện có: {len(questions_by_diff['Hard'])}, Yêu cầu: {hard_count}")
    
    selected_easy = random.sample(questions_by_diff["Easy"], easy_count) if easy_count > 0 else []
    selected_medium = random.sample(questions_by_diff["Medium"], medium_count) if medium_count > 0 else []
    selected_hard = random.sample(questions_by_diff["Hard"], hard_count) if hard_count > 0 else []
    
    all_selected = selected_easy + selected_medium + selected_hard
    random.shuffle(all_selected)
    
    questions_list = [
        {
            "id": str(q.id),
            "content": q.content,
            "options": q.options,
            "answer": q.answers,
            "difficulty": q.difficulty.value
        }
        for q in all_selected
    ]
    
    return {
        "questions": questions_list,
        "total": len(questions_list),
        "distribution": {
            "easy": easy_count,
            "medium": medium_count,
            "hard": hard_count
        }
    }


async def replace_question_in_preview(class_code: str, question_id: str, excluded_ids: list, difficulty: str, current_user):
    from models.question_model import Difficulty
    import random
    
    classroom = await ClassroomModel.find_one(ClassroomModel.class_code == class_code)
    if not classroom:
        raise AppException(StatusCode.CLASSROOM_NOT_FOUND)
    
    if classroom.creator.ref.id != current_user.id:
        raise AppException(StatusCode.FORBIDDEN, "Only the classroom creator can access this")
    
    diff_map = {
        "Easy": Difficulty.EASY,
        "Medium": Difficulty.MEDIUM,
        "Hard": Difficulty.HARD
    }
    
    difficulty_enum = diff_map.get(difficulty)
    if not difficulty_enum:
        raise AppException(StatusCode.BAD_REQUEST, "Invalid difficulty level")
    
    excluded_set = set(excluded_ids)
    
    available_questions = await QuestionModel.find({
        "creator_id.$id": current_user.id,
        "difficulty": difficulty_enum
    }).to_list()
    
    available_questions = [q for q in available_questions if str(q.id) not in excluded_set]
    
    if not available_questions:
        raise AppException(StatusCode.BAD_REQUEST, f"Không còn câu hỏi độ khó {difficulty} nào khả dụng")
    
    new_question = random.choice(available_questions)
    
    return {
        "id": str(new_question.id),
        "content": new_question.content,
        "options": new_question.options,
        "answer": new_question.answers,
        "difficulty": new_question.difficulty.value
    }


