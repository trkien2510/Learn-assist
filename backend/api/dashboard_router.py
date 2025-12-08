from fastapi import APIRouter, Depends
from core.dependencies import get_current_user
from models.user_model import UserModel
from schemas.base_schema import BaseResponse
from services import dashboard_service

router = APIRouter()


@router.get("", response_model=BaseResponse)
async def get_dashboard(current_user: UserModel = Depends(get_current_user)):
    data = await dashboard_service.get_dashboard(current_user)
    return BaseResponse(data=data)
