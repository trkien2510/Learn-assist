from datetime import datetime, timezone
from beanie import Document, Link
from pydantic import Field

from models.user_model import UserModel


class JoinRequestModel(Document):
    user_id: Link[UserModel]
    request_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "join_request"