from fastapi import APIRouter, Depends, BackgroundTasks
from core.dependencies import get_current_user, get_current_admin
from models.user_model import UserModel
from schemas.base_schema import BaseResponse
from schemas.user_schema import UserUpdate, AdminCreateUser
from core.exception_handler import AppException
from core.status_code import StatusCode
from services import user_service
from pydantic import BaseModel

router = APIRouter()


class ToggleStatusRequest(BaseModel):
    is_activate: bool


@router.post("/create", response_model=BaseResponse)
async def create_user_admin(user_data: AdminCreateUser, current_user: UserModel = Depends(get_current_admin)):
    """Admin creates a new user, optionally bypassing email verification."""
    data = await user_service.create_user_by_admin(user_data, current_user)
    return BaseResponse(data=data)


@router.get("", response_model=BaseResponse)
async def get_all_users_admin(
    page: int = 1,
    page_size: int = 20,
    role: str = None,
    is_activate: str = None,
    search: str = None,
    current_user: UserModel = Depends(get_current_admin)
):
    data = await user_service.get_all_users(page, page_size, role, is_activate, search)
    return BaseResponse(data=data)


@router.get("/{user_id}", response_model=BaseResponse)
async def get_user_profile_admin(user_id: str, current_user: UserModel = Depends(get_current_admin)):
    data = await user_service.get_user_by_id(user_id)
    return BaseResponse(data=data)


@router.put("/{user_id}", response_model=BaseResponse)
async def update_user_admin(user_id: str, update_data: UserUpdate, current_user: UserModel = Depends(get_current_admin)):
    data = await user_service.update_user_by_admin(user_id, update_data, current_user)
    return BaseResponse(data=data)


@router.delete("/{user_id}", response_model=BaseResponse)
async def delete_user_admin(user_id: str, background_tasks: BackgroundTasks, current_user: UserModel = Depends(get_current_admin)):
    await user_service.delete_user_by_admin(user_id, current_user, background_tasks)
    return BaseResponse()


@router.patch("/{user_id}/status", response_model=BaseResponse)
async def toggle_user_status(user_id: str, request: ToggleStatusRequest, background_tasks: BackgroundTasks, current_user: UserModel = Depends(get_current_admin)):

    data = await user_service.toggle_user_status(user_id, request.is_activate, current_user, background_tasks)
    return BaseResponse(data=data)