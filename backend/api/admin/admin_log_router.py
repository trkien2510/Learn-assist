from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, Query
from core.dependencies import get_current_user, get_current_admin
from models.user_model import UserModel
from schemas.base_schema import BaseResponse
from core.exception_handler import AppException
from core.status_code import StatusCode
from services import log_service

router = APIRouter()


@router.get("", response_model=BaseResponse)
async def get_all_logs(
    page: int = 1,
    page_size: int = 20,
    action: Optional[str] = Query(None, description="Lọc theo action"),
    user_id: Optional[str] = Query(None, description="Lọc theo user_id"),
    resource_type: Optional[str] = Query(None, description="Lọc theo loại resource"),
    status: Optional[str] = Query(None, description="Lọc theo status (success/error)"),
    current_user: UserModel = Depends(get_current_admin)
):
    data = await log_service.get_logs(
        page=page,
        page_size=page_size,
        action=action,
        user_id=user_id,
        resource_type=resource_type,
        status=status
    )
    return BaseResponse(data=data)


@router.get("/statistics", response_model=BaseResponse)
async def get_log_statistics(current_user: UserModel = Depends(get_current_admin)):
    data = await log_service.get_log_statistics()
    return BaseResponse(data=data)


@router.get("/{log_id}", response_model=BaseResponse)
async def get_log_detail(log_id: str, current_user: UserModel = Depends(get_current_admin)):
    data = await log_service.get_log_by_id(log_id)
    return BaseResponse(data=data)


@router.delete("/cleanup", response_model=BaseResponse)
async def cleanup_old_logs(
    days: int = Query(30, description="Xóa log cũ hơn số ngày này"),
    current_user: UserModel = Depends(get_current_admin)
):
    data = await log_service.delete_old_logs(days)
    return BaseResponse(data=data)
