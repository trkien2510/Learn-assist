from datetime import datetime, timezone
from beanie import Document, Link
from pydantic import Field
from pymongo import IndexModel, ASCENDING

from models.classroom_model import ClassroomModel
from models.user_model import UserModel


class JoinRequestModel(Document):
    user_id: Link[UserModel]
    class_id: Link[ClassroomModel]
    request_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "join_request"
        indexes = [
            IndexModel([("class_id.$id", ASCENDING)], name="idx_class_id"),
            IndexModel([("user_id.$id", ASCENDING)], name="idx_user_id"),
            IndexModel(
                [("user_id.$id", ASCENDING), ("class_id.$id", ASCENDING)],
                unique=True,
                name="idx_unique_user_class"
            ),
        ]