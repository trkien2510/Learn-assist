from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class SendMessageSchema(BaseModel):
    content: str


class MessageResponseSchema(BaseModel):
    id: str
    classroom_id: str
    sender_id: str
    sender_name: str
    sender_email: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True
