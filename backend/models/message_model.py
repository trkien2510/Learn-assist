from datetime import datetime, timezone
from beanie import Document, Link
from pymongo import IndexModel, ASCENDING, DESCENDING
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
        indexes = [
            IndexModel([("classroom.$id", ASCENDING), ("created_at", DESCENDING)], name="idx_classroom_created"),
            IndexModel([("sender.$id", ASCENDING)], name="idx_sender"),
        ]
