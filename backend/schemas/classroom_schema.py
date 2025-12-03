from pydantic import BaseModel, Field

class ClassroomSchema(BaseModel):
    name: str
    description: str | None = None
    subject: str

class JoinRequestSchema(BaseModel):
    class_code: str