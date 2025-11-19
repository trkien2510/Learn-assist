from datetime import datetime
from typing import List, Union
from pydantic import BaseModel, Field
from .common import MongoDBModel, PyObjectId

class ScoreDistribution(BaseModel):
    low: Optional[int] = 0
    medium: Optional[int] = 0
    high: Optional[int] = 0

class TestSummary(BaseModel):
    total_submissions: int
    avg_score: float
    score_distribution: ScoreDistribution
    most_missed_questions: List[PyObjectId]

class ProgressTrend(BaseModel):
    test_id: PyObjectId
    score: float
    date: datetime

class UserSummary(BaseModel):
    tests_completed: int
    overall_avg_score: float
    progress_trend: List[ProgressTrend]

class StatisticModel(MongoDBModel):
    entity_type: str = Field(..., description="'test' hoặc 'user'")
    entity_id: PyObjectId
    summary: Union[TestSummary, UserSummary]
    last_updated: datetime = Field(default_factory=datetime.utcnow)