from fastapi import APIRouter, Depends
from datetime import datetime, timedelta, timezone

from core.dependencies import get_current_admin
from core.status_code import StatusCode
from schemas.base_schema import BaseResponse
from services import notification_service
from models.log_model import LogModel

router = APIRouter()


@router.get("/system-notifications", response_model=BaseResponse)
async def get_system_notifications(
    page: int = 1,
    page_size: int = 20,
    current_admin=Depends(get_current_admin)
):
    """Get system notifications for admin."""
    result = await notification_service.get_user_notifications(
        current_user=current_admin,
        page=page,
        page_size=page_size,
        unread_only=False
    )
    
    items = []
    for notification in result["items"]:
        items.append({
            "id": str(notification.id),
            "notification_type": notification.notification_type.value,
            "title": notification.title,
            "message": notification.message,
            "related_id": notification.related_id,
            "related_type": notification.related_type,
            "is_read": notification.is_read,
            "created_at": notification.created_at.isoformat()
        })
    
    return ApiResponse(
        code=StatusCode.SUCCESS,
        data={
            "items": items,
            "total": result["total"],
            "unread_count": result["unread_count"],
            "page": result["page"],
            "page_size": result["page_size"],
            "total_pages": result["total_pages"],
            "has_next": result["has_next"],
            "has_previous": result["has_previous"]
        }
    )


@router.get("/system-health", response_model=BaseResponse)
async def get_system_health(current_admin=Depends(get_current_admin)):
    """Check system health and detect anomalies."""
    one_hour_ago = datetime.now(timezone.utc) - timedelta(hours=1)
    
    recent_errors = await LogModel.find({
        "status": "error",
        "created_at": {"$gte": one_hour_ago}
    }).count()
    
    total_logs = await LogModel.find({
        "created_at": {"$gte": one_hour_ago}
    }).count()
    
    error_rate = (recent_errors / total_logs * 100) if total_logs > 0 else 0
    
    health_status = "healthy"
    if error_rate > 10:
        health_status = "warning"
        if error_rate > 25:
            health_status = "critical"
            await notification_service.notify_admins_high_error_rate(
                error_count=recent_errors,
                time_period="1 hour",
                affected_service="API"
            )
    
    admin_unread = await notification_service.get_unread_count(current_admin)
    
    return ApiResponse(
        code=StatusCode.SUCCESS,
        data={
            "health_status": health_status,
            "error_count_last_hour": recent_errors,
            "total_requests_last_hour": total_logs,
            "error_rate_percent": round(error_rate, 2),
            "unread_notifications": admin_unread["unread_count"]
        }
    )


@router.post("/cleanup-notifications", response_model=BaseResponse)
async def cleanup_old_notifications(
    days: int = 30,
    current_admin=Depends(get_current_admin)
):
    """Cleanup old notifications older than specified days."""
    result = await notification_service.cleanup_old_notifications(days=days)
    return BaseResponse(code=StatusCode.SUCCESS, data=result)


@router.post("/test-notification", response_model=BaseResponse)
async def send_test_notification(
    current_admin=Depends(get_current_admin)
):
    """Send a test notification to verify the system is working."""
    await notification_service.notify_admins_system_warning(
        warning_type="Test Notification",
        warning_message="This is a test notification from the admin panel",
        details={"triggered_by": current_admin.email}
    )
    return BaseResponse(
        code=StatusCode.SUCCESS,
        data={"message": "Test notification sent successfully"}
    )
