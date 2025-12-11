from datetime import datetime, timezone
from typing import List, Optional
from beanie import Document, Link
from pydantic import Field
from models.classroom_model import ClassroomModel
from models.question_model import QuestionModel
from models.user_model import UserModel

class ExamModel(Document):
    creator_id: Link[UserModel]
    class_id: Optional[Link[ClassroomModel]] = None
    title: str
    questions: List[Link[QuestionModel]] = Field(default_factory=list)
    duration: int
    expiry_at: datetime
    start_at: datetime
    end_at: datetime
    is_personal: bool = Field(default=False)

    class Settings:
        name="exam"