from typing import Generic, TypeVar, Optional, List
from pydantic import BaseModel, Field
from core.status_code import StatusCode

T = TypeVar('T')

class BaseResponse(BaseModel, Generic[T]):
    code: StatusCode = Field(default=StatusCode.SUCCESS)
    success: bool = True
    message: str = "Thành công"
    data: Optional[T] = None

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    role: str