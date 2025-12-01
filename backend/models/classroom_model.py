from datetime import datetime, timezone
from typing import List
from beanie import Document, Link, Indexed
from pydantic import Field
from models.join_request_model import JoinRequestModel
from models.user_model import UserModel


class ClassroomModel(Document):
    name: str
    creator: Link[UserModel]
    class_code: str = Indexed(str, unique=True)
    members: List[Link[UserModel]] = Field(default_factory=list)
    join_requests: List[Link[JoinRequestModel]] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "classrooms"
