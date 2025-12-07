from typing import List, Optional
from pydantic import BaseModel
from models.question_model import Difficulty

class CreateQuestionSchema(BaseModel):
    content: str
    options: List[str]
    answers: str
    difficulty: Difficulty = Difficulty.MEDIUM
    document_id: Optional[str] = None

class UpdateQuestionSchema(BaseModel):
    content: Optional[str] = None
    options: Optional[List[str]] = None
    answers: Optional[str] = None
    difficulty: Optional[Difficulty] = None

class QuestionResponseSchema(BaseModel):
    id: str
    content: str
    options: List[str]
    answers: str
    difficulty: Difficulty
    creator_id: str
