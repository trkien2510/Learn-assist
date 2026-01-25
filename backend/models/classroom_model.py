from datetime import datetime, timezone
from typing import List
from beanie import Document, Link, Indexed
from pydantic import Field
from pymongo import IndexModel, ASCENDING, DESCENDING
from models.user_model import UserModel


class ClassroomModel(Document):
    name: str
    description: str
    subject: str
    creator: Link[UserModel]
    class_code: str = Indexed(str, unique=True)
    members: List[Link[UserModel]] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "classrooms"
        indexes = [
            IndexModel([("creator.$id", ASCENDING)], name="idx_creator"),
            IndexModel([("members.$id", ASCENDING)], name="idx_members"),
            IndexModel(
                [("creator.$id", ASCENDING), ("created_at", DESCENDING)],
                name="idx_creator_created"
            ),
        ]
