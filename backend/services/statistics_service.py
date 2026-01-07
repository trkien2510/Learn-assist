from datetime import datetime, timezone, timedelta
from typing import Dict, List, Any, Optional
from collections import defaultdict
from beanie import PydanticObjectId

from models.result_model import ResultModel
from models.exam_model import ExamModel
from models.classroom_model import ClassroomModel
from models.question_model import QuestionModel
from models.document_model import DocumentModel
from models.user_model import UserModel, UserRole
from core.exception_handler import AppException
from core.status_code import StatusCode


def get_id_from_other(obj) -> PydanticObjectId:
    """Helper to get ID from either a Link or a Document object."""
    if hasattr(obj, "ref"):
        return obj.ref.id
    return obj.id


def calculate_score_distribution(scores: List[float]) -> Dict[str, int]:
    distribution = {
        "0-2": 0,
        "2-4": 0,
        "4-6": 0,
        "6-8": 0,
        "8-10": 0
    }
    for score in scores:
        if score < 2:
            distribution["0-2"] += 1
        elif score < 4:
            distribution["2-4"] += 1
        elif score < 6:
            distribution["4-6"] += 1
        elif score < 8:
            distribution["6-8"] += 1
        else:
            distribution["8-10"] += 1
    return distribution


def calculate_grade(score: float) -> str:
    if score >= 9:
        return "A+"
    elif score >= 8.5:
        return "A"
    elif score >= 8:
        return "B+"
    elif score >= 7:
        return "B"
    elif score >= 6.5:
        return "C+"
    elif score >= 5.5:
        return "C"
    elif score >= 5:
        return "D+"
    elif score >= 4:
        return "D"
    else:
        return "F"


def calculate_percentile(score: float, all_scores: List[float]) -> float:
    if not all_scores:
        return 0
    count_below = sum(1 for s in all_scores if s < score)
    return round((count_below / len(all_scores)) * 100, 2)


def get_time_period_label(dt: datetime) -> Dict[str, str]:
    return {
        "date": dt.strftime("%Y-%m-%d"),
        "week": dt.strftime("%Y-W%W"),
        "month": dt.strftime("%Y-%m"),
        "year": str(dt.year),
        "day_of_week": dt.strftime("%A"),
        "hour": dt.strftime("%H:00")
    }


async def get_student_comprehensive_statistics(current_user) -> Dict[str, Any]:
    all_results = await ResultModel.find({
        "user_id.$id": current_user.id,
        "submitted": True
    }).to_list()
    
    if not all_results:
        return {
            "summary": {
                "total_exams_taken": 0,
                "total_questions_answered": 0,
                "average_score": 0,
                "highest_score": 0,
                "lowest_score": 0,
                "grade": "N/A",
                "total_time_spent_minutes": 0
            },
            "performance": {},
            "trends": {},
            "classroom_performance": [],
            "personal_practice": {},
            "recommendations": []
        }
    
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
    
    all_scores = [r.score for r in all_results]
    total_time_spent = sum(
        (r.ended_at - r.started_at).total_seconds() / 60 
        for r in all_results 
        if r.ended_at and r.started_at
    )
    
    daily_scores = defaultdict(list)
    weekly_scores = defaultdict(list)
    monthly_scores = defaultdict(list)
    
    for r in all_results:
        if r.submit_at:
            labels = get_time_period_label(r.submit_at)
            daily_scores[labels["date"]].append(r.score)
            weekly_scores[labels["week"]].append(r.score)
            monthly_scores[labels["month"]].append(r.score)
    
    trends = {
        "daily": [
            {"date": date, "average_score": round(sum(scores)/len(scores), 2), "count": len(scores)}
            for date, scores in sorted(daily_scores.items())[-30:]
        ],
        "weekly": [
            {"week": week, "average_score": round(sum(scores)/len(scores), 2), "count": len(scores)}
            for week, scores in sorted(weekly_scores.items())[-12:]
        ],
        "monthly": [
            {"month": month, "average_score": round(sum(scores)/len(scores), 2), "count": len(scores)}
            for month, scores in sorted(monthly_scores.items())[-12:]
        ]
    }
    
    if len(all_results) >= 2:
        sorted_results = sorted(all_results, key=lambda x: x.submit_at or x.started_at)
        first_half = sorted_results[:len(sorted_results)//2]
        second_half = sorted_results[len(sorted_results)//2:]
        first_avg = sum(r.score for r in first_half) / len(first_half)
        second_avg = sum(r.score for r in second_half) / len(second_half)
        improvement = round(second_avg - first_avg, 2)
    else:
        improvement = 0
    
    classroom_performance = []
    classroom_ids = set()
    
    for r in classroom_results:
        exam = await ExamModel.get(get_id_from_other(r.exam_id))
        if exam and exam.class_id:
            classroom_ids.add(get_id_from_other(exam.class_id))
    
    for class_id in classroom_ids:
        classroom = await ClassroomModel.get(class_id)
        if classroom:
            class_results = []
            for r in classroom_results:
                exam = await ExamModel.get(get_id_from_other(r.exam_id))
                if exam and exam.class_id and get_id_from_other(exam.class_id) == class_id:
                    class_results.append(r)
            
            if class_results:
                class_scores = [r.score for r in class_results]
                classroom_performance.append({
                    "classroom_id": str(class_id),
                    "classroom_name": classroom.name,
                    "subject": classroom.subject if hasattr(classroom, 'subject') else None,
                    "exams_taken": len(class_results),
                    "average_score": round(sum(class_scores) / len(class_scores), 2),
                    "highest_score": max(class_scores),
                    "lowest_score": min(class_scores),
                    "grade": calculate_grade(sum(class_scores) / len(class_scores))
                })
    
    personal_scores = [r.score for r in personal_results]
    personal_stats = {
        "total_practice_sessions": len(personal_results),
        "total_personal_exams_created": len(personal_exams),
        "average_score": round(sum(personal_scores) / len(personal_scores), 2) if personal_scores else 0,
        "highest_score": max(personal_scores) if personal_scores else 0,
        "score_distribution": calculate_score_distribution(personal_scores),
        "improvement_rate": improvement
    }
    
    recommendations = []
    avg_score = sum(all_scores) / len(all_scores)
    
    if avg_score < 5:
        recommendations.append({
            "type": "critical",
            "message": "Your average score is below passing. Consider reviewing fundamental concepts.",
            "action": "Review basic materials and practice more"
        })
    elif avg_score < 7:
        recommendations.append({
            "type": "improvement",
            "message": "You're doing okay but there's room for improvement.",
            "action": "Focus on weak areas and practice regularly"
        })
    else:
        recommendations.append({
            "type": "excellent",
            "message": "Great performance! Keep up the good work.",
            "action": "Challenge yourself with harder questions"
        })
    
    if len(personal_results) < 5:
        recommendations.append({
            "type": "suggestion",
            "message": "Practice more with personal exams to improve retention.",
            "action": "Create more practice exams"
        })
    
    return {
        "summary": {
            "total_exams_taken": len(all_results),
            "classroom_exams": len(classroom_results),
            "personal_practice": len(personal_results),
            "total_questions_answered": sum(len(r.answer_map) for r in all_results),
            "average_score": round(avg_score, 2),
            "highest_score": max(all_scores),
            "lowest_score": min(all_scores),
            "grade": calculate_grade(avg_score),
            "total_time_spent_minutes": round(total_time_spent, 2),
            "score_improvement": improvement
        },
        "performance": {
            "score_distribution": calculate_score_distribution(all_scores),
            "grade_distribution": {
                grade: len([s for s in all_scores if calculate_grade(s) == grade])
                for grade in ["A+", "A", "B+", "B", "C+", "C", "D+", "D", "F"]
            },
            "pass_rate": round(len([s for s in all_scores if s >= 5]) / len(all_scores) * 100, 2),
            "excellence_rate": round(len([s for s in all_scores if s >= 8]) / len(all_scores) * 100, 2)
        },
        "trends": trends,
        "classroom_performance": classroom_performance,
        "personal_practice": personal_stats,
        "recommendations": recommendations
    }


async def get_teacher_comprehensive_statistics(current_user) -> Dict[str, Any]:
    classrooms = await ClassroomModel.find({
        "creator.$id": current_user.id
    }).to_list()
    
    if not classrooms:
        return {
            "summary": {
                "total_classrooms": 0,
                "total_students": 0,
                "total_exams_created": 0,
                "total_documents": 0,
                "total_questions": 0
            },
            "classrooms": [],
            "exam_analytics": {},
            "student_performance": {},
            "content_analytics": {}
        }
    
    classroom_ids = [c.id for c in classrooms]
    
    exams = await ExamModel.find({
        "class_id.$id": {"$in": classroom_ids},
        "is_personal": False
    }).to_list()
    
    exam_ids = [e.id for e in exams]
    
    all_results = await ResultModel.find({
        "exam_id.$id": {"$in": exam_ids}
    }).to_list() if exam_ids else []
    
    if all_results:
        unique_user_ids = list(set(get_id_from_other(r.user_id) for r in all_results))
        students = await UserModel.find({
            "_id": {"$in": unique_user_ids},
            "role": UserRole.STUDENT
        }).to_list()
        student_ids = {s.id for s in students}
        all_results = [r for r in all_results if get_id_from_other(r.user_id) in student_ids]

    documents = await DocumentModel.find({
        "creator.$id": current_user.id
    }).to_list()
    
    questions = await QuestionModel.find({
        "creator_id.$id": current_user.id
    }).to_list()
    
    unique_member_ids = set()
    for c in classrooms:
        for member in c.members:
            unique_member_ids.add(get_id_from_other(member))
    
    total_students = 0
    if unique_member_ids:
        total_students = await UserModel.find({
            "_id": {"$in": list(unique_member_ids)},
            "role": UserRole.STUDENT
        }).count()
    
    classroom_stats = []
    for classroom in classrooms:
        class_member_ids = [get_id_from_other(m) for m in classroom.members]
        class_students = await UserModel.find({
            "_id": {"$in": class_member_ids},
            "role": UserRole.STUDENT
        }).to_list()
        class_student_count = len(class_students)
        class_student_ids = {s.id for s in class_students}

        class_exams = [e for e in exams if e.class_id and get_id_from_other(e.class_id) == classroom.id]
        class_exam_ids = [e.id for e in class_exams]
        class_results = [r for r in all_results if get_id_from_other(r.exam_id) in class_exam_ids]
        
        class_scores = [r.score for r in class_results if r.submitted]
        
        classroom_stats.append({
            "classroom_id": str(classroom.id),
            "name": classroom.name,
            "class_code": classroom.class_code,
            "student_count": class_student_count,
            "exam_count": len(class_exams),
            "total_submissions": len(class_results),
            "average_score": round(sum(class_scores) / len(class_scores), 2) if class_scores else 0,
            "pass_rate": round(len([s for s in class_scores if s >= 5]) / len(class_scores) * 100, 2) if class_scores else 0,
            "score_distribution": calculate_score_distribution(class_scores)
        })
    
    exam_analytics = []
    for exam in exams:
        exam_results = [r for r in all_results if get_id_from_other(r.exam_id) == exam.id and r.submitted]
        exam_scores = [r.score for r in exam_results]
        
        if exam_scores:
            exam_analytics.append({
                "exam_id": str(exam.id),
                "title": exam.title,
                "duration": exam.duration,
                "question_count": len(exam.questions),
                "participation_count": len(exam_results),
                "average_score": round(sum(exam_scores) / len(exam_scores), 2),
                "highest_score": max(exam_scores),
                "lowest_score": min(exam_scores),
                "median_score": sorted(exam_scores)[len(exam_scores)//2],
                "pass_rate": round(len([s for s in exam_scores if s >= 5]) / len(exam_scores) * 100, 2),
                "score_distribution": calculate_score_distribution(exam_scores),
                "start_at": exam.start_at.isoformat() if exam.start_at else None,
                "end_at": exam.end_at.isoformat() if exam.end_at else None
            })
    
    all_scores = [r.score for r in all_results if r.submitted]
    student_performance = {}
    if all_scores:
        student_performance = {
            "total_submissions": len(all_results),
            "average_score": round(sum(all_scores) / len(all_scores), 2),
            "pass_rate": round(len([s for s in all_scores if s >= 5]) / len(all_scores) * 100, 2),
            "excellence_rate": round(len([s for s in all_scores if s >= 8]) / len(all_scores) * 100, 2),
            "score_distribution": calculate_score_distribution(all_scores),
            "grade_distribution": {
                grade: len([s for s in all_scores if calculate_grade(s) == grade])
                for grade in ["A+", "A", "B+", "B", "C+", "C", "D+", "D", "F"]
            }
        }
    
    question_analysis = []
    for question in questions[:20]:
        correct_count = 0
        total_answered = 0
        
        for exam in exams:
            if any(get_id_from_other(q) == question.id for q in exam.questions):
                for result in all_results:
                    if get_id_from_other(result.exam_id) == exam.id and str(question.id) in result.answer_map:
                        total_answered += 1
                        if result.answer_map[str(question.id)] == question.answers:
                            correct_count += 1
        
        if total_answered > 0:
            question_analysis.append({
                "question_id": str(question.id),
                "content_preview": question.content[:100] + "..." if len(question.content) > 100 else question.content,
                "difficulty": question.difficulty.value if hasattr(question.difficulty, 'value') else str(question.difficulty),
                "times_answered": total_answered,
                "correct_rate": round(correct_count / total_answered * 100, 2),
                "calculated_difficulty": "Hard" if correct_count/total_answered < 0.4 else ("Medium" if correct_count/total_answered < 0.7 else "Easy")
            })
    
    return {
        "summary": {
            "total_classrooms": len(classrooms),
            "total_students": total_students,
            "total_exams_created": len(exams),
            "total_documents": len(documents),
            "total_questions": len(questions),
            "total_submissions": len(all_results)
        },
        "classrooms": classroom_stats,
        "exam_analytics": exam_analytics,
        "student_performance": student_performance,
        "content_analytics": {
            "documents": len(documents),
            "questions_created": len(questions),
            "questions_by_difficulty": {
                diff: len([q for q in questions if (q.difficulty.value if hasattr(q.difficulty, 'value') else str(q.difficulty)) == diff])
                for diff in ["Easy", "Medium", "Hard"]
            },
            "question_analysis": question_analysis
        }
    }


async def get_exam_detailed_statistics(exam_id: str, current_user) -> Dict[str, Any]:
    try:
        obj_id = PydanticObjectId(exam_id)
    except:
        raise AppException(StatusCode.BAD_REQUEST, "Invalid exam ID")
    
    exam = await ExamModel.get(obj_id)
    if not exam:
        raise AppException(StatusCode.NOT_FOUND, "Exam not found")
    
    is_personal = exam.is_personal if hasattr(exam, 'is_personal') else False
    
    if is_personal:
        if get_id_from_other(exam.creator_id) != current_user.id:
            raise AppException(StatusCode.FORBIDDEN, "Access denied")
    else:
        if exam.class_id:
            classroom = await ClassroomModel.get(get_id_from_other(exam.class_id))
            if classroom and get_id_from_other(classroom.creator) != current_user.id and current_user.role != "admin":
                raise AppException(StatusCode.FORBIDDEN, "Access denied")
    
    results = await ResultModel.find({
        "exam_id.$id": obj_id,
        "submitted": True
    }).to_list()
    
    if results:
        unique_user_ids = list(set(get_id_from_other(r.user_id) for r in results))
        students = await UserModel.find({
            "_id": {"$in": unique_user_ids},
            "role": UserRole.STUDENT
        }).to_list()
        student_ids = {s.id for s in students}
        results = [r for r in results if get_id_from_other(r.user_id) in student_ids]

    if not results:
        return {
            "exam_info": {
                "id": str(exam.id),
                "title": exam.title,
                "duration": exam.duration,
                "question_count": len(exam.questions),
                "is_personal": is_personal,
                "start_at": exam.start_at.isoformat() if exam.start_at else None,
                "end_at": exam.end_at.isoformat() if exam.end_at else None
            },
            "participation": {
                "total_participants": 0,
                "completion_rate": 0
            },
            "scores": {
                "average": 0,
                "highest": 0,
                "lowest": 0,
                "distribution": {
                    "0-2": 0, "2-4": 0, "4-6": 0, "6-8": 0, "8-10": 0
                }
            },
            "questions": [],
            "time_analysis": {
                "average_time_minutes": 0,
                "fastest_time": 0,
                "slowest_time": 0,
                "median_time": 0
            },
            "participants": []
        }
    
    best_results_map = {}
    for r in results:
        uid = get_id_from_other(r.user_id)
        if uid not in best_results_map or r.score > best_results_map[uid].score:
            best_results_map[uid] = r
    results = list(best_results_map.values())
    
    scores = [r.score for r in results]
    
    completion_times = []
    for r in results:
        if r.ended_at and r.started_at:
            time_taken = (r.ended_at - r.started_at).total_seconds() / 60
            completion_times.append(time_taken)
    
    question_stats = []
    for q_link in exam.questions:
        question = await QuestionModel.get(get_id_from_other(q_link))
        if question:
            correct_count = 0
            answered_count = 0
            answer_distribution = defaultdict(int)
            
            for r in results:
                q_id_str = str(question.id)
                if q_id_str in r.answer_map:
                    answered_count += 1
                    user_answer = r.answer_map[q_id_str]
                    
                    answer_letter = None
                    for idx, option in enumerate(question.options):
                        if option == user_answer:
                            answer_letter = chr(65 + idx)
                            break
                    
                    if answer_letter:
                        answer_distribution[answer_letter] += 1
                    
                    if user_answer == question.answers:
                        correct_count += 1
            
            correct_answer_letter = None
            for idx, option in enumerate(question.options):
                if option == question.answers:
                    correct_answer_letter = chr(65 + idx)
                    break
            
            question_stats.append({
                "question_id": str(question.id),
                "content": question.content,
                "options": question.options,
                "correct_answer": correct_answer_letter or question.answers,
                "difficulty": question.difficulty.value if hasattr(question.difficulty, 'value') else str(question.difficulty),
                "answered_count": answered_count,
                "correct_count": correct_count,
                "correct_rate": round(correct_count / answered_count * 100, 2) if answered_count > 0 else 0,
                "answer_distribution": dict(answer_distribution),
                "is_difficult": correct_count / answered_count < 0.5 if answered_count > 0 else False
            })
    
    participants = []
    for r in results:
        user = await UserModel.get(get_id_from_other(r.user_id))
        if user:
            time_taken = 0
            if r.ended_at and r.started_at:
                time_taken = round((r.ended_at - r.started_at).total_seconds() / 60, 2)
            
            correct_answers = 0
            for q_link in exam.questions:
                q_id_str = str(get_id_from_other(q_link))
                if q_id_str in r.answer_map:
                    question = await QuestionModel.get(get_id_from_other(q_link))
                    if question and r.answer_map[q_id_str] == question.answers:
                        correct_answers += 1
            
            participants.append({
                "user_id": str(user.id),
                "full_name": user.full_name,
                "email": user.email,
                "score": r.score,
                "grade": calculate_grade(r.score),
                "time_taken_minutes": time_taken,
                "correct_answers": correct_answers,
                "submitted_at": r.submit_at.isoformat() if r.submit_at else None,
                "percentile": calculate_percentile(r.score, scores)
            })
    
    participants.sort(key=lambda x: x["score"], reverse=True)
    for i, p in enumerate(participants):
        p["rank"] = i + 1
    
    return {
        "exam_info": {
            "id": str(exam.id),
            "title": exam.title,
            "duration": exam.duration,
            "question_count": len(exam.questions),
            "is_personal": is_personal,
            "start_at": exam.start_at.isoformat() if exam.start_at else None,
            "end_at": exam.end_at.isoformat() if exam.end_at else None
        },
        "participation": {
            "total_participants": len(results),
            "completion_rate": 100
        },
        "scores": {
            "average": round(sum(scores) / len(scores), 2),
            "highest": max(scores),
            "lowest": min(scores),
            "median": sorted(scores)[len(scores)//2],
            "standard_deviation": round((sum((s - sum(scores)/len(scores))**2 for s in scores) / len(scores)) ** 0.5, 2),
            "pass_rate": round(len([s for s in scores if s >= 5]) / len(scores) * 100, 2),
            "excellence_rate": round(len([s for s in scores if s >= 8]) / len(scores) * 100, 2),
            "distribution": calculate_score_distribution(scores),
            "grade_distribution": {
                grade: len([s for s in scores if calculate_grade(s) == grade])
                for grade in ["A+", "A", "B+", "B", "C+", "C", "D+", "D", "F"]
            }
        },
        "questions": question_stats,
        "time_analysis": {
            "average_time_minutes": round(sum(completion_times) / len(completion_times), 2) if completion_times else 0,
            "fastest_time": round(min(completion_times), 2) if completion_times else 0,
            "slowest_time": round(max(completion_times), 2) if completion_times else 0,
            "median_time": round(sorted(completion_times)[len(completion_times)//2], 2) if completion_times else 0
        },
        "participants": participants
    }


async def get_classroom_detailed_statistics(class_id: str, current_user) -> Dict[str, Any]:
    try:
        obj_id = PydanticObjectId(class_id)
    except:
        raise AppException(StatusCode.BAD_REQUEST, "Invalid classroom ID")
    
    classroom = await ClassroomModel.get(obj_id)
    if not classroom:
        raise AppException(StatusCode.NOT_FOUND, "Classroom not found")
    
    if get_id_from_other(classroom.creator) != current_user.id and current_user.role != "admin":
        is_member = any(get_id_from_other(m) == current_user.id for m in classroom.members)
        if not is_member:
            raise AppException(StatusCode.FORBIDDEN, "Access denied")
    
    exams = await ExamModel.find({
        "class_id.$id": obj_id,
        "is_personal": False
    }).to_list()
    
    exam_ids = [e.id for e in exams]
    
    results = await ResultModel.find({
        "exam_id.$id": {"$in": exam_ids}
    }).to_list() if exam_ids else []
    
    submitted_results = []
    if results:
        unique_user_ids = list(set(get_id_from_other(r.user_id) for r in results))
        students = await UserModel.find({
            "_id": {"$in": unique_user_ids},
            "role": UserRole.STUDENT
        }).to_list()
        student_ids = {s.id for s in students}
        

        best_results_map = {}
        for r in results:
            if not r.submitted: continue
            uid = get_id_from_other(r.user_id)
            if uid not in student_ids: continue
            
            eid = get_id_from_other(r.exam_id)
            key = (uid, eid)
            if key not in best_results_map or r.score > best_results_map[key].score:
                best_results_map[key] = r
        submitted_results = list(best_results_map.values())

    scores = [r.score for r in submitted_results]

    member_ids = [get_id_from_other(m) for m in classroom.members]
    student_members = await UserModel.find({
        "_id": {"$in": member_ids},
        "role": UserRole.STUDENT
    }).to_list()
    student_count = len(student_members)

    student_stats = []
    for member in student_members:
        student_results = [r for r in submitted_results if get_id_from_other(r.user_id) == member.id]
        student_scores = [r.score for r in student_results]
        
        if student_scores:
            student_stats.append({
                "student_id": str(member.id),
                "full_name": member.full_name,
                "email": member.email,
                "exams_taken": len(student_results),
                "exams_available": len(exams),
                "participation_rate": round(len(student_results) / len(exams) * 100, 2) if exams else 0,
                "average_score": round(sum(student_scores) / len(student_scores), 2),
                "highest_score": max(student_scores),
                "lowest_score": min(student_scores),
                "grade": calculate_grade(sum(student_scores) / len(student_scores)),
                "percentile": calculate_percentile(sum(student_scores)/len(student_scores), scores) if scores else 0
            })
    
    student_stats.sort(key=lambda x: x["average_score"], reverse=True)
    for i, s in enumerate(student_stats):
        s["rank"] = i + 1
    
    exam_breakdown = []
    for exam in exams:
        exam_results = [r for r in submitted_results if r.exam_id.ref.id == exam.id]
        exam_scores = [r.score for r in exam_results]
        
        exam_breakdown.append({
            "exam_id": str(exam.id),
            "title": exam.title,
            "duration": exam.duration,
            "question_count": len(exam.questions),
            "start_at": exam.start_at.isoformat() if exam.start_at else None,
            "end_at": exam.end_at.isoformat() if exam.end_at else None,
            "participants": len(exam_results),
            "participation_rate": round(len(exam_results) / student_count * 100, 2) if student_count else 0,
            "average_score": round(sum(exam_scores) / len(exam_scores), 2) if exam_scores else 0,
            "pass_rate": round(len([s for s in exam_scores if s >= 5]) / len(exam_scores) * 100, 2) if exam_scores else 0
        })
    
    return {
        "classroom_info": {
            "id": str(classroom.id),
            "name": classroom.name,
            "class_code": classroom.class_code,
            "subject": classroom.subject if hasattr(classroom, 'subject') else None,
            "student_count": student_count,
            "exam_count": len(exams)
        },
        "overall_performance": {
            "total_submissions": len(submitted_results),
            "average_score": round(sum(scores) / len(scores), 2) if scores else 0,
            "pass_rate": round(len([s for s in scores if s >= 5]) / len(scores) * 100, 2) if scores else 0,
            "excellence_rate": round(len([s for s in scores if s >= 8]) / len(scores) * 100, 2) if scores else 0,
            "score_distribution": calculate_score_distribution(scores),
            "grade_distribution": {
                grade: len([s for s in scores if calculate_grade(s) == grade])
                for grade in ["A+", "A", "B+", "B", "C+", "C", "D+", "D", "F"]
            } if scores else {}
        },
        "student_performance": student_stats,
        "exam_breakdown": exam_breakdown
    }



async def get_admin_platform_statistics() -> Dict[str, Any]:    
    total_users = await UserModel.find_all().count()
    total_students = await UserModel.find(UserModel.role == UserRole.STUDENT).count()
    total_teachers = await UserModel.find(UserModel.role == UserRole.TEACHER).count()
    total_admins = await UserModel.find(UserModel.role == UserRole.ADMIN).count()
    
    total_classrooms = await ClassroomModel.find_all().count()
    total_exams = await ExamModel.find_all().count()
    total_personal_exams = await ExamModel.find({"is_personal": True}).count()
    total_classroom_exams = await ExamModel.find({"is_personal": False}).count()
    
    total_documents = await DocumentModel.find_all().count()
    total_questions = await QuestionModel.find_all().count()
    total_results = await ResultModel.find_all().count()
    
    thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
    
    recent_results = await ResultModel.find({
        "submit_at": {"$gte": thirty_days_ago}
    }).to_list()
    
    recent_scores = [r.score for r in recent_results if r.submitted]
    
    daily_activity = defaultdict(lambda: {"submissions": 0, "total_score": 0})
    for r in recent_results:
        if r.submit_at:
            date_key = r.submit_at.strftime("%Y-%m-%d")
            daily_activity[date_key]["submissions"] += 1
            if r.submitted:
                daily_activity[date_key]["total_score"] += r.score
    
    activity_trend = [
        {
            "date": date,
            "submissions": data["submissions"],
            "average_score": round(data["total_score"] / data["submissions"], 2) if data["submissions"] > 0 else 0
        }
        for date, data in sorted(daily_activity.items())
    ]
    
    return {
        "users": {
            "total": total_users,
            "students": total_students,
            "teachers": total_teachers,
            "admins": total_admins,
            "distribution": {
                "students": round(total_students / total_users * 100, 2) if total_users else 0,
                "teachers": round(total_teachers / total_users * 100, 2) if total_users else 0,
                "admins": round(total_admins / total_users * 100, 2) if total_users else 0
            }
        },
        "content": {
            "total_classrooms": total_classrooms,
            "total_exams": total_exams,
            "classroom_exams": total_classroom_exams,
            "personal_exams": total_personal_exams,
            "total_documents": total_documents,
            "total_questions": total_questions
        },
        "activity": {
            "total_submissions": total_results,
            "recent_submissions_30d": len(recent_results),
            "recent_average_score": round(sum(recent_scores) / len(recent_scores), 2) if recent_scores else 0,
            "recent_pass_rate": round(len([s for s in recent_scores if s >= 5]) / len(recent_scores) * 100, 2) if recent_scores else 0,
            "daily_trend": activity_trend
        },
        "overall_performance": {
            "score_distribution": calculate_score_distribution(recent_scores),
            "grade_distribution": {
                grade: len([s for s in recent_scores if calculate_grade(s) == grade])
                for grade in ["A+", "A", "B+", "B", "C+", "C", "D+", "D", "F"]
            } if recent_scores else {}
        }
    }
