from datetime import datetime, timezone
from beanie import Document, Link
from pydantic import Field
from models.user_model import UserModel
from models.classroom_model import ClassroomModel


class MessageModel(Document):
    classroom: Link[ClassroomModel]
    sender: Link[UserModel]
    content: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "messages"
