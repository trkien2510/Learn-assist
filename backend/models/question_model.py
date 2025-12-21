from enum import Enum
from typing import List, Optional
from beanie import Document, Link
from models.document_model import DocumentModel
from models.user_model import UserModel

class Difficulty(str, Enum):
    EASY = "Easy"
    MEDIUM = "Medium"
    HARD = "Hard"

class QuestionModel(Document):
    document_id: Optional[Link[DocumentModel]] = None
    creator_id: Link[UserModel]
    content: str
    options: List[str]
    answers: str
    difficulty: Difficulty = Difficulty.MEDIUM

    class Settings:
        name="question"