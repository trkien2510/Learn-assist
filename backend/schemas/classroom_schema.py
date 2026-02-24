from pydantic import BaseModel


class CreateClassroomSchema(BaseModel):
    name: str
    description: str | None = None
    subject: str
