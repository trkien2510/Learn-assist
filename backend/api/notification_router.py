from fastapi import APIRouter, Depends
from typing import Optional

from core.dependencies import get_current_user
from core.status_code import StatusCode
from schemas.base_schema import ApiResponse
from schemas.notification_schema import MarkReadRequest
from services import notification_service

router = APIRouter()


@router.get("/", response_model=ApiResponse)
async def get_notifications(
    page: int = 1,
    page_size: int = 20,
    unread_only: bool = False,
    current_user=Depends(get_current_user)
):
    """Get notifications for the current user."""
    result = await notification_service.get_user_notifications(
        current_user=current_user,
        page=page,
        page_size=page_size,
        unread_only=unread_only
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


@router.get("/unread-count", response_model=ApiResponse)
async def get_unread_count(current_user=Depends(get_current_user)):
    """Get the count of unread notifications."""
    result = await notification_service.get_unread_count(current_user)
    return ApiResponse(code=StatusCode.SUCCESS, data=result)


@router.post("/mark-read", response_model=ApiResponse)
async def mark_notifications_as_read(
    request: Optional[MarkReadRequest] = None,
    current_user=Depends(get_current_user)
):
    """Mark notifications as read. Send empty body or null notification_ids to mark all as read."""
    notification_ids = None
    if request and request.notification_ids:
        notification_ids = request.notification_ids
    
    result = await notification_service.mark_as_read(current_user, notification_ids)
    return ApiResponse(code=StatusCode.SUCCESS, data=result)


@router.delete("/{notification_id}", response_model=ApiResponse)
async def delete_notification(
    notification_id: str,
    current_user=Depends(get_current_user)
):
    """Delete a specific notification."""
    result = await notification_service.delete_notification(notification_id, current_user)
    return ApiResponse(code=StatusCode.SUCCESS, data=result)


@router.delete("/", response_model=ApiResponse)
async def delete_all_notifications(current_user=Depends(get_current_user)):
    """Delete all notifications for the current user."""
    result = await notification_service.delete_all_notifications(current_user)
    return ApiResponse(code=StatusCode.SUCCESS, data=result)
