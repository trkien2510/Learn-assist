from pydantic import BaseModel


class SendMessageSchema(BaseModel):
    content: str
