from datetime import datetime, timezone
from enum import Enum
from typing import Optional

from beanie import Document, Link
from pydantic import Field

from models.user_model import UserModel


class NotificationType(str, Enum):
    EXAM_CREATED = "exam_created"
    EXAM_STARTED = "exam_started"
    EXAM_ENDED = "exam_ended"
    EXAM_RESULT = "exam_result"
    DOCUMENT_UPLOAD_SUCCESS = "document_upload_success"
    DOCUMENT_UPLOAD_FAILED = "document_upload_failed"
    EXAM_CREATION_SUCCESS = "exam_creation_success"
    EXAM_STATISTICS_AVAILABLE = "exam_statistics_available"
    SYSTEM_ERROR = "system_error"
    SYSTEM_WARNING = "system_warning"
    USER_ANOMALY = "user_anomaly"
    HIGH_ERROR_RATE = "high_error_rate"


class NotificationModel(Document):
    user_id: Link[UserModel]
    notification_type: NotificationType
    title: str
    message: str
    related_id: Optional[str] = None
    related_type: Optional[str] = None
    is_read: bool = Field(default=False)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "notifications"
        indexes = [
            [("user_id", 1), ("created_at", -1)],
            [("is_read", 1)],
        ]
