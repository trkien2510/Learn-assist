from datetime import datetime
from typing import List, Optional, Dict
from pydantic import BaseModel, Field
from beanie import PydanticObjectId

class CreateExamSchema(BaseModel):
    title: str
    class_code: str
    duration: int
    start_at: datetime
    end_at: datetime
    question_ids: List[str] = []


class CreatePersonalExamSchema(BaseModel):
    title: str
    duration: int
    question_ids: List[str] = []


class ExamResponseSchema(BaseModel):
    id: PydanticObjectId = Field(alias="_id")
    title: str
    duration: int
    start_at: datetime
    end_at: datetime
    class_id: Optional[PydanticObjectId] = None
    creator_id: PydanticObjectId
    is_personal: bool = False


class SubmitExamSchema(BaseModel):
    answers: Dict[str, str] = Field(default_factory=dict)
