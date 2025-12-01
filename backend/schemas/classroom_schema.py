from pydantic import BaseModel, Field

class ClassroomSchema(BaseModel):
    name: str