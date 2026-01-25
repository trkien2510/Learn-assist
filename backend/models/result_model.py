from datetime import datetime, timezone
from typing import Dict, Any, Optional

from beanie import Document, Link, Indexed
from pymongo import IndexModel, ASCENDING, DESCENDING
from pydantic import Field

from models.exam_model import ExamModel
from models.user_model import UserModel


class ResultModel(Document):
    exam_id: Link[ExamModel]
    user_id: Link[UserModel]
    started_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    ended_at: Optional[datetime] = None
    answer_map: Dict[str, Any] = Field(default_factory=dict)
    submitted: bool = Field(default=False)
    score: float = Field(default=0)
    submit_at: Optional[datetime] = None

    class Settings:
        name = "result"
        indexes = [
            IndexModel(
                [("exam_id.$id", ASCENDING), ("user_id.$id", ASCENDING)],
                unique=True,
                name="unique_exam_user"
            ),
            IndexModel([("exam_id.$id", ASCENDING)], name="idx_exam_id"),
            IndexModel([("user_id.$id", ASCENDING)], name="idx_user_id"),
            IndexModel([("user_id.$id", ASCENDING), ("submitted", ASCENDING)], name="idx_user_submitted"),
            IndexModel([("exam_id.$id", ASCENDING), ("submitted", ASCENDING)], name="idx_exam_submitted"),
            IndexModel([("submitted", ASCENDING), ("submit_at", DESCENDING)], name="idx_submitted_date"),
        ]