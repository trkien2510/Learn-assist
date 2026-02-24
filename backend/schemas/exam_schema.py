from datetime import datetime
from typing import List, Optional, Dict
from pydantic import BaseModel, Field

class CreateExamSchema(BaseModel):
    title: str
    class_code: str
    duration: int
    start_at: datetime
    end_at: datetime
    question_ids: List[str] = Field(default=[], max_length=50)


class CreatePersonalExamSchema(BaseModel):
    title: str
    duration: int
    question_ids: Optional[List[str]] = Field(default=[], max_length=50)
    num_questions: Optional[int] = Field(None, le=50)
    easy_count: Optional[int] = Field(None, ge=0)
    medium_count: Optional[int] = Field(None, ge=0)
    hard_count: Optional[int] = Field(None, ge=0)
    subject: Optional[str] = None
    document_ids: Optional[List[str]] = Field(default=[], max_length=10)


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
    document_ids: Optional[List[str]] = Field(default=[], max_length=10)


class ReplaceQuestionSchema(BaseModel):
    question_id: str
    excluded_ids: List[str] = []

