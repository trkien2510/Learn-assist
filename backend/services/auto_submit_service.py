from datetime import datetime, timezone
from beanie import PydanticObjectId
from models.exam_model import ExamModel
from models.result_model import ResultModel
from models.question_model import QuestionModel
from services import log_service, notification_service
import asyncio
import logging

logger = logging.getLogger(__name__)


async def auto_submit_expired_exams():
    try:
        now = datetime.now(timezone.utc)
        
        unsubmitted_results = await ResultModel.find({
            "submitted": False
        }).to_list()
        
        auto_submitted_count = 0
        
        for result in unsubmitted_results:
            exam = await ExamModel.get(result.exam_id.ref.id)
            if not exam:
                continue
            
            started_at = result.started_at
            if started_at.tzinfo is None:
                started_at = started_at.replace(tzinfo=timezone.utc)
            else:
                started_at = started_at.astimezone(timezone.utc)
            
            time_elapsed = (now - started_at).total_seconds() / 60
            
            if time_elapsed > exam.duration + 1:
                answers = result.answer_map or {}
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
                
                result.submitted = True
                result.submit_at = now
                result.ended_at = now
                result.score = round(score, 2)
                await result.save()
                
                auto_submitted_count += 1
                
                try:
                    from models.user_model import UserModel
                    user = await UserModel.get(result.user_id.ref.id)
                    
                    if user:
                        await log_service.log_exam("auto_submit_exam", str(exam.id), user, {
                            "title": exam.title,
                            "score": result.score,
                            "correct_count": correct_count,
                            "total_questions": total_questions,
                            "reason": "Time limit exceeded - auto-submitted by system"
                        })
                        
                        await notification_service.notify_student_exam_auto_submitted(
                            user=user,
                            exam=exam,
                            score=result.score,
                            correct_count=correct_count,
                            total_questions=total_questions
                        )
                except Exception as log_error:
                    logger.error(f"Error logging auto-submission: {log_error}")
        
        if auto_submitted_count > 0:
            logger.info(f"Auto-submitted {auto_submitted_count} expired exam(s) at {now}")
        
        return auto_submitted_count
        
    except Exception as e:
        logger.error(f"Error in auto_submit_expired_exams: {e}")
        return 0


async def start_auto_submit_scheduler():
    logger.info("Auto-submit scheduler started")
    while True:
        try:
            await auto_submit_expired_exams()
        except Exception as e:
            logger.error(f"Error in auto-submit scheduler: {e}")
        
        await asyncio.sleep(30)

