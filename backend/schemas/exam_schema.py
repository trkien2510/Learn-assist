from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field
from beanie import PydanticObjectId

class CreateExamSchema(BaseModel):
    title: str
    class_code: str
    duration: int
    strat_at: datetime
    end_at: datetime
    question_ids: List[str] = []

class ExamResponseSchema(BaseModel):
    id: PydanticObjectId = Field(alias="_id")
    title: str
    duration: int
    strat_at: datetime
    end_at: datetime
    class_id: PydanticObjectId
    creator_id: PydanticObjectId
