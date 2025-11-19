from datetime import datetime
from typing import List
from .common import MongoDBModel, PyObjectId

class TestModel(MongoDBModel):
    test_name: str
    created_by: PyObjectId
    document_id: PyObjectId
    question_list: List[PyObjectId] # List ID các câu hỏi
    duration: int
    is_active: bool = True
    created_date: datetime