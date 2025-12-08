from datetime import datetime, timezone
from typing import Optional, Dict, Any

from beanie import Document
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