from datetime import datetime, timezone
from typing import Any, Dict

from beanie import Document
from pydantic import Field

from models.user_model import UserModel


class LogModel(Document):
    user_id: UserModel
    action: str
    target_collection: str
    target_id: str
    details: Dict[str, Any] = Field(default_factory=dict)
    timestamp: datetime = Field(default_factory=datetime.now(timezone.utc))

    class Settings:
        name = "log"