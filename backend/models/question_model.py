from enum import Enum
from typing import List, Optional
from beanie import Document, Link
from pydantic import Field
from pymongo import IndexModel, ASCENDING, TEXT
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
        name = "question"
        indexes = [
            IndexModel([("creator_id.$id", ASCENDING)], name="idx_creator_id"),
            IndexModel([("document_id.$id", ASCENDING)], name="idx_document_id"),
            IndexModel([("difficulty", ASCENDING)], name="idx_difficulty"),
            IndexModel(
                [("creator_id.$id", ASCENDING), ("difficulty", ASCENDING)],
                name="idx_creator_difficulty"
            ),
            IndexModel(
                [("document_id.$id", ASCENDING), ("difficulty", ASCENDING)],
                name="idx_document_difficulty"
            ),
            IndexModel(
                [("content", TEXT), ("options", TEXT)],
                name="idx_text_search",
                default_language="none"
            ),
        ]