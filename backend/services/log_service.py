from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any

from beanie import PydanticObjectId
from models.log_model import LogModel


async def create_log(
    action: str,
    user=None,
    resource_type: str = None,
    resource_id: str = None,
    resource_name: str = None,
    details: Dict[str, Any] = None,
    status: str = "success"
):
    if details is None:
        details = {}
    
    if resource_name:
        details["resource_name"] = resource_name
    
    log = LogModel(
        action=action,
        user_id=str(user.id) if user else None,
        resource_type=resource_type,
        resource_id=resource_id,
        details=details,
        status=status
    )
    await log.insert()
    return log


async def get_logs(
    page: int = 1,
    page_size: int = 20,
    action: str = None,
    user_id: str = None,
    resource_type: str = None,
    status: str = None,
    from_date: datetime = None,
    to_date: datetime = None
):
    if page < 1:
        page = 1
    if page_size < 1 or page_size > 100:
        page_size = 20

    skip = (page - 1) * page_size

    query = LogModel.find_all()

    if action and action.strip():
        query = query.find({"action": {"$regex": action.strip(), "$options": "i"}})
    
    if user_id and user_id.strip():
        query = query.find(LogModel.user_id == user_id.strip())
        
    if resource_type and resource_type.strip():
        query = query.find(LogModel.resource_type == resource_type.strip())
        
    if status and status.strip():
        query = query.find(LogModel.status == status.strip())

    if from_date:
        query = query.find(LogModel.created_at >= from_date)
    
    if to_date:
        query = query.find(LogModel.created_at <= to_date)


    query = query.sort([("created_at", -1)])

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


async def get_log_by_id(log_id: str):
    from core.exception_handler import AppException
    from core.status_code import StatusCode

    try:
        obj_id = PydanticObjectId(log_id)
    except:
        raise AppException(StatusCode.BAD_REQUEST, "Invalid log ID")

    log = await LogModel.get(obj_id)
    if not log:
        raise AppException(StatusCode.NOT_FOUND, "Log not found")
    return log


async def delete_old_logs(days: int = 30):
    cutoff_date = datetime.now(timezone.utc) - timedelta(days=days)
    result = await LogModel.find(LogModel.created_at < cutoff_date).delete()
    return {"deleted_count": result.deleted_count if result else 0}


async def get_log_statistics():
    total_logs = await LogModel.find_all().count()

    success_logs = await LogModel.find(LogModel.status == "success").count()
    error_logs = await LogModel.find(LogModel.status == "error").count()

    yesterday = datetime.now(timezone.utc) - timedelta(hours=24)
    logs_24h = await LogModel.find(LogModel.created_at >= yesterday).count()

    week_ago = datetime.now(timezone.utc) - timedelta(days=7)
    logs_7d = await LogModel.find(LogModel.created_at >= week_ago).count()

    return {
        "total_logs": total_logs,
        "success_logs": success_logs,
        "error_logs": error_logs,
        "logs_last_24h": logs_24h,
        "logs_last_7d": logs_7d
    }


async def log_auth(action: str, user=None, status: str = "success"):
    return await create_log(
        action=action,
        user=user,
        resource_type="auth",
        status=status
    )


async def log_classroom(action: str, classroom_id: str, user=None, resource_name: str = None, details: dict = None, status: str = "success"):
    return await create_log(
        action=action,
        user=user,
        resource_type="classroom",
        resource_id=classroom_id,
        resource_name=resource_name,
        details=details,
        status=status
    )


async def log_exam(action: str, exam_id: str, user=None, resource_name: str = None, details: dict = None, status: str = "success"):
    return await create_log(
        action=action,
        user=user,
        resource_type="exam",
        resource_id=exam_id,
        resource_name=resource_name,
        details=details,
        status=status
    )


async def log_question(action: str, question_id: str, user=None, resource_name: str = None, details: dict = None, status: str = "success"):
    return await create_log(
        action=action,
        user=user,
        resource_type="question",
        resource_id=question_id,
        resource_name=resource_name,
        details=details,
        status=status
    )


async def log_document(action: str, document_id: str, user=None, resource_name: str = None, details: dict = None, status: str = "success"):
    return await create_log(
        action=action,
        user=user,
        resource_type="document",
        resource_id=document_id,
        resource_name=resource_name,
        details=details,
        status=status
    )


async def log_user(action: str, target_user_id: str, user=None, resource_name: str = None, details: dict = None, status: str = "success"):
    return await create_log(
        action=action,
        user=user,
        resource_type="user",
        resource_id=target_user_id,
        resource_name=resource_name,
        details=details,
        status=status
    )
