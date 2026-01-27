from datetime import datetime, timezone
from typing import List, Optional
from beanie import Document, Link
from pydantic import Field
from pymongo import IndexModel, ASCENDING, DESCENDING
from models.classroom_model import ClassroomModel
from models.question_model import QuestionModel
from models.user_model import UserModel

class ExamModel(Document):
    creator_id: Link[UserModel]
    class_id: Optional[Link[ClassroomModel]] = None
    title: str
    questions: List[Link[QuestionModel]] = Field(default_factory=list)
    duration: int
    start_at: datetime
    end_at: datetime
    is_personal: bool = Field(default=False)

    class Settings:
        name = "exam"
        indexes = [
            IndexModel([("class_id.$id", ASCENDING)], name="idx_class_id"),
            IndexModel([("creator_id.$id", ASCENDING)], name="idx_creator_id"),
            IndexModel([("is_personal", ASCENDING)], name="idx_is_personal"),
            IndexModel(
                [("class_id.$id", ASCENDING), ("start_at", DESCENDING)],
                name="idx_class_start"
            ),
            IndexModel(
                [("creator_id.$id", ASCENDING), ("is_personal", ASCENDING)],
                name="idx_creator_personal"
            ),
        ]