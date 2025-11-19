from typing import Optional
from pydantic import BaseModel, Field

class PyObjectId(str):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not isinstance(v, str):
            raise ValueError('Not a valid ObjectId format')
        return cls(v)


class MongoDBModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias='_id', default=None)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {PyObjectId: str}