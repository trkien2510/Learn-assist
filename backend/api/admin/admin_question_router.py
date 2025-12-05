from fastapi import APIRouter, Depends, HTTPException

from core.dependencies import get_current_user
from models.user_model import UserModel
from schemas.base_schema import BaseResponse

router = APIRouter()

@router.get("", response_model=BaseResponse[dict])
async def questions(current_user: UserModel = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(401, "Unauthorized")

    return BaseResponse()