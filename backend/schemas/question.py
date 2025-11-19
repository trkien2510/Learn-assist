from typing import List, Optional, Union
from .common import MongoDBModel, PyObjectId

class QuestionModel(MongoDBModel):
    document_id: PyObjectId
    question_type: str
    question_text: str
    options: Optional[List[str]] = None
    correct_answer: Union[str, int]
    difficulty: str
    generated_by_gpt: bool = True