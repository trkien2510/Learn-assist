from typing import List
from pydantic import BaseModel, Field

class QuestionSchema(BaseModel):
    content: str
    options: List[str]
    answer: str
    difficulty: str

class ListQuestionSchema(BaseModel):
    questions: List[QuestionSchema] = Field(default_factory=list)
