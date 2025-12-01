from datetime import datetime, timezone

from beanie import Document, Link
from pydantic import Field

from models.user_model import UserModel


class NotifyModel(Document):
    user_id: Link[UserModel]
    message: str
    is_read: bool = Field(default=False)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name="notify"