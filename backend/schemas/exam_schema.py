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
    question_ids: Optional[List[str]] = []
    num_questions: Optional[int] = None
    difficulty: Optional[str] = None
    subject: Optional[str] = None


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


class SaveAnswersSchema(BaseModel):
    answers: Dict[str, str] = Field(default_factory=dict)


class PreviewExamSchema(BaseModel):
    class_code: str
    total_questions: int
    easy_count: int
    medium_count: int
    hard_count: int


class ReplaceQuestionSchema(BaseModel):
    question_id: str
    excluded_ids: List[str] = []

