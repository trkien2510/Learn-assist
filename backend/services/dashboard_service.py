from datetime import timezone
from models.user_model import UserModel
from models.classroom_model import ClassroomModel
from models.document_model import DocumentModel
from models.exam_model import ExamModel
from models.question_model import QuestionModel
from models.result_model import ResultModel
from models.log_model import LogModel
from beanie import PydanticObjectId


async def get_recent_activities(current_user: UserModel, limit: int = 20) -> list:
    """
    Get recent activities from logs
    - Admin: sees all activities (except auth)
    - Teacher/Student: sees only their own activities (except auth)
    """
    role = current_user.role
    user_id = str(current_user.id)
    
    # Build query based on role - EXCLUDE auth logs
    if role == "admin":
        # Admin sees all activities except auth
        query = LogModel.find({"resource_type": {"$ne": "auth"}})
    else:
        # Teacher/Student see only their own activities except auth
        query = LogModel.find({
            "user_id": user_id,
            "resource_type": {"$ne": "auth"}
        })
    
    # Get recent logs sorted by created_at desc
    logs = await query.sort([("created_at", -1)]).limit(limit).to_list()
    
    activities = []
    for log in logs:
        # Get user info
        user_name = "System"
        user_email = ""
        
        if log.user_id:
            try:
                user_obj_id = PydanticObjectId(log.user_id)
                user = await UserModel.get(user_obj_id)
                if user:
                    user_name = user.full_name or user.username
                    user_email = user.email
            except:
                pass
        
        # Extract resource name from details if available
        resource_name = log.details.get("resource_name") if log.details else None
        
        # Ensure resource_name is a string (not dict/object)
        if resource_name is not None:
            if isinstance(resource_name, dict):
                # If it's a dict, try to get filename or convert to string
                resource_name = resource_name.get("filename") or str(resource_name)
            elif not isinstance(resource_name, str):
                # Convert any other type to string
                resource_name = str(resource_name)
        
        # Map resource_type to frontend type
        activity_type = log.resource_type if log.resource_type else "system"
        
        activities.append({
            "id": str(log.id),
            "type": activity_type,
            "action": log.action,
            "resource_name": resource_name,
            "user": user_name,
            "user_email": user_email,
            "timestamp": log.created_at.replace(tzinfo=timezone.utc).isoformat(),
            "status": log.status
        })
    
    return activities


async def get_admin_dashboard() -> dict:
    total_users = await UserModel.count()
    total_classrooms = await ClassroomModel.count()
    total_documents = await DocumentModel.count()
    total_exams = await ExamModel.count()
    total_questions = await QuestionModel.count()

    return {
        "total_users": total_users,
        "total_classrooms": total_classrooms,
        "total_documents": total_documents,
        "total_exams": total_exams,
        "total_questions": total_questions
    }


async def get_teacher_dashboard(current_user: UserModel) -> dict:
    user_id = current_user.id

    total_classrooms = await ClassroomModel.find(
        {"$or": [
            {"creator.$id": user_id},
            {"members.$id": user_id}
        ]}
    ).count()

    total_documents = await DocumentModel.find(
        {"creator.$id": user_id}
    ).count()

    total_questions = await QuestionModel.find(
        {"creator_id.$id": user_id}
    ).count()

    total_exams = await ExamModel.find(
        {"creator_id.$id": user_id}
    ).count()

    classrooms = await ClassroomModel.find(
        {"creator.$id": user_id}
    ).to_list()

    unique_student_ids = set()

    for classroom in classrooms:
        for ref in classroom.members:
            member_id = ref.ref.id
            unique_student_ids.add(member_id)

    # Lọc chỉ lấy những user có role là student
    total_students = 0
    if unique_student_ids:
        students = await UserModel.find({
            "_id": {"$in": list(unique_student_ids)},
            "role": "student"
        }).count()
        total_students = students

    return {
        "total_classrooms": total_classrooms,
        "total_documents": total_documents,
        "total_questions": total_questions,
        "total_exams": total_exams,
        "total_students": total_students
    }


async def get_student_dashboard(current_user: UserModel) -> dict:
    user_id = current_user.id

    total_classrooms = await ClassroomModel.find(
        {"members.$id": user_id}
    ).count()

    results = await ResultModel.find(
        {"user_id.$id": user_id, "submitted": True}
    ).to_list()

    total_exams_taken = len(results)

    if total_exams_taken > 0:
        total_score = sum(result.score for result in results)
        average_score = round(total_score / total_exams_taken, 2)
    else:
        average_score = 0

    return {
        "total_classrooms": total_classrooms,
        "total_exams_taken": total_exams_taken,
        "average_score": average_score
    }


async def get_dashboard(current_user: UserModel) -> dict:
    role = current_user.role

    # Get stats based on role
    if role == "admin":
        stats = await get_admin_dashboard()
    elif role == "teacher":
        stats = await get_teacher_dashboard(current_user)
    else:
        stats = await get_student_dashboard(current_user)
    
    # Get recent activities for all roles
    recent_activities = await get_recent_activities(current_user, limit=20)
    
    # Combine stats and activities
    return {
        **stats,
        "recent_activities": recent_activities
    }
