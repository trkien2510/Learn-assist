from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


class NotificationResponse(BaseModel):
    id: str
    notification_type: str
    title: str
    message: str
    related_id: Optional[str] = None
    related_type: Optional[str] = None
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


class NotificationListResponse(BaseModel):
    items: List[NotificationResponse]
    total: int
    unread_count: int
    page: int
    page_size: int
    total_pages: int
    has_next: bool
    has_previous: bool


class MarkReadRequest(BaseModel):
    notification_ids: Optional[List[str]] = None  # None means mark all as read
