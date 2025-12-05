from datetime import datetime
from typing import List
from beanie import Link
from pydantic import BaseModel, Field
from models.user_model import UserModel


class CreateClassroomSchema(BaseModel):
    name: str
    description: str | None = None
    subject: str

class ResponseClassroomSchema(BaseModel):
    name: str
    creator: Link[UserModel]
    description: str | None = None
    subject: str
    members: List[Link[UserModel]] = Field(default_factory=list)
    create_at: datetime