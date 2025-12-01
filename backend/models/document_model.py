from datetime import datetime, timezone

from beanie import Document, Link
from pydantic import Field

from models.user_model import UserModel


class DocumentModel(Document):
    name: str
    creator: Link[UserModel]
    file_name: str
    file_path: str
    file_type: str
    upload_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name="document"
