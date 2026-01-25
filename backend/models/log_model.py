from datetime import datetime, timezone
from typing import Optional, Dict, Any

from beanie import Document
from pymongo import IndexModel, ASCENDING, DESCENDING
from pydantic import Field


class LogModel(Document):
    action: str
    user_id: Optional[str] = None
    resource_type: Optional[str] = None
    resource_id: Optional[str] = None
    details: Dict[str, Any] = Field(default_factory=dict)
    status: str = "success"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "logs"
        indexes = [
            IndexModel([("created_at", DESCENDING)], name="idx_created_at"),
            IndexModel([("user_id", ASCENDING)], name="idx_user_id"),
            IndexModel([("status", ASCENDING)], name="idx_status"),
            IndexModel([("resource_type", ASCENDING)], name="idx_resource_type"),
            IndexModel([("user_id", ASCENDING), ("created_at", DESCENDING)], name="idx_user_created"),
            IndexModel([("status", ASCENDING), ("created_at", DESCENDING)], name="idx_status_created"),
        ]