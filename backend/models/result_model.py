from _pydatetime import datetime
from typing import Dict, Any

from beanie import Document, Link
from pydantic import Field

from models.exam_model import ExamModel
from models.user_model import UserModel


class ResultModel(Document):
    exam_id: Link[ExamModel]
    student_id: Link[UserModel]
    started_at: datetime
    ended_at: datetime
    answer_map: Dict[str, Any] = Field(default_factory=dict)
    submitted: bool = Field(default=False)
    score: int = Field(default=0)
    submit_at: datetime

    class Settings:
        name="result"