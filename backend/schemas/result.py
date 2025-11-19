from datetime import datetime
from typing import List, Optional, Union
from pydantic import BaseModel
from .common import MongoDBModel, PyObjectId

class AnswerDetail(BaseModel):
    question_id: PyObjectId
    student_answer: Union[str, int, List[Union[str, int]]]
    is_correct: Optional[bool] = None
    points: Optional[int] = 0

class ResultModel(MongoDBModel):
    test_id: PyObjectId
    student_id: PyObjectId
    submission_time: datetime
    score: float = 0.0
    is_graded: bool = False
    answers: List[AnswerDetail]