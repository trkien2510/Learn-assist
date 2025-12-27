from datetime import datetime, timezone, timedelta
from typing import Optional
from models.user_model import UserModel
from models.log_model import LogModel
from models.classroom_model import ClassroomModel
from models.exam_model import ExamModel
from models.question_model import QuestionModel
from beanie import PydanticObjectId


async def get_admin_statistics():
    total_users = await UserModel.find_all().count()
    active_users = await UserModel.find(UserModel.is_activate == True).count()
    total_students = await UserModel.find(UserModel.role == "student").count()
    total_teachers = await UserModel.find(UserModel.role == "teacher").count()
    total_admins = await UserModel.find(UserModel.role == "admin").count()
    
    thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
    new_users_30d = await UserModel.find(UserModel.created_at >= thirty_days_ago).count()
    
    total_classrooms = await ClassroomModel.find_all().count()
    active_classrooms = await ClassroomModel.find(ClassroomModel.is_active == True).count()
    
    total_exams = await ExamModel.find_all().count()
    
    total_questions = await QuestionModel.find_all().count()
    
    total_logs = await LogModel.find_all().count()
    success_logs = await LogModel.find(LogModel.status == "success").count()
    error_logs = await LogModel.find(LogModel.status == "error").count()
    
    yesterday = datetime.now(timezone.utc) - timedelta(hours=24)
    logs_24h = await LogModel.find(LogModel.created_at >= yesterday).count()
    
    week_ago = datetime.now(timezone.utc) - timedelta(days=7)
    logs_7d = await LogModel.find(LogModel.created_at >= week_ago).count()
    
    return {
        "users": {
            "total": total_users,
            "active": active_users,
            "inactive": total_users - active_users,
            "students": total_students,
            "teachers": total_teachers,
            "admins": total_admins,
            "new_30d": new_users_30d
        },
        "classrooms": {
            "total": total_classrooms,
            "active": active_classrooms,
            "inactive": total_classrooms - active_classrooms
        },
        "exams": {
            "total": total_exams
        },
        "questions": {
            "total": total_questions
        },
        "logs": {
            "total": total_logs,
            "success": success_logs,
            "errors": error_logs,
            "last_24h": logs_24h,
            "last_7d": logs_7d
        }
    }


async def get_user_activity_timeline(user_id: str, days: int = 30):
    from core.exception_handler import AppException
    from core.status_code import StatusCode
    
    try:
        obj_id = PydanticObjectId(user_id)
    except:
        raise AppException(StatusCode.BAD_REQUEST, "Invalid user ID")
    
    user = await UserModel.get(obj_id)
    if not user:
        raise AppException(StatusCode.NOT_FOUND, "User not found")
    
    from_date = datetime.now(timezone.utc) - timedelta(days=days)
    logs = await LogModel.find(
        LogModel.user_id == user_id,
        LogModel.created_at >= from_date
    ).sort([("created_at", -1)]).to_list()
    
    return {
        "user": {
            "id": str(user.id),
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role
        },
        "timeline": logs,
        "days": days
    }


async def get_system_health():
    yesterday = datetime.now(timezone.utc) - timedelta(hours=24)
    
    total_logs_24h = await LogModel.find(LogModel.created_at >= yesterday).count()
    error_logs_24h = await LogModel.find(
        LogModel.created_at >= yesterday,
        LogModel.status == "error"
    ).count()
    
    error_rate = (error_logs_24h / total_logs_24h * 100) if total_logs_24h > 0 else 0
    
    recent_errors = await LogModel.find(
        LogModel.status == "error"
    ).sort([("created_at", -1)]).limit(10).to_list()
    
    if error_rate < 1:
        status = "healthy"
    elif error_rate < 5:
        status = "warning"
    else:
        status = "critical"
    
    return {
        "status": status,
        "error_rate_24h": round(error_rate, 2),
        "total_requests_24h": total_logs_24h,
        "total_errors_24h": error_logs_24h,
        "recent_errors": recent_errors
    }


async def get_user_growth_data(days: int = 30):
    from_date = datetime.now(timezone.utc) - timedelta(days=days)
    
    users = await UserModel.find(
        UserModel.created_at >= from_date
    ).sort([("created_at", 1)]).to_list()
    
    daily_data = {}
    for user in users:
        date_key = user.created_at.strftime("%Y-%m-%d")
        if date_key not in daily_data:
            daily_data[date_key] = {"total": 0, "students": 0, "teachers": 0, "admins": 0}
        
        daily_data[date_key]["total"] += 1
        if user.role == "student":
            daily_data[date_key]["students"] += 1
        elif user.role == "teacher":
            daily_data[date_key]["teachers"] += 1
        elif user.role == "admin":
            daily_data[date_key]["admins"] += 1
    
    dates = []
    totals = []
    students = []
    teachers = []
    
    current_date = from_date.date()
    end_date = datetime.now(timezone.utc).date()
    
    while current_date <= end_date:
        date_str = current_date.strftime("%Y-%m-%d")
        dates.append(date_str)
        
        if date_str in daily_data:
            totals.append(daily_data[date_str]["total"])
            students.append(daily_data[date_str]["students"])
            teachers.append(daily_data[date_str]["teachers"])
        else:
            totals.append(0)
            students.append(0)
            teachers.append(0)
        
        current_date += timedelta(days=1)
    
    return {
        "dates": dates,
        "totals": totals,
        "students": students,
        "teachers": teachers,
        "days": days
    }


async def get_activity_heatmap(days: int = 30):
    from_date = datetime.now(timezone.utc) - timedelta(days=days)
    
    logs = await LogModel.find(
        LogModel.created_at >= from_date
    ).to_list()
    
    heatmap = {}
    for hour in range(24):
        heatmap[hour] = {}
        for day in range(7):
            heatmap[hour][day] = 0
    
    for log in logs:
        hour = log.created_at.hour
        day = log.created_at.weekday()
        heatmap[hour][day] += 1
    
    return {
        "heatmap": heatmap,
        "days": days
    }
