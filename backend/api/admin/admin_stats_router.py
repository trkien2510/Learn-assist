from fastapi import APIRouter, Depends
from core.dependencies import get_current_user
from models.user_model import UserModel
from schemas.base_schema import BaseResponse
from core.exception_handler import AppException
from core.status_code import StatusCode
from services import admin_service

router = APIRouter()


@router.get("/statistics", response_model=BaseResponse)
async def get_admin_statistics(current_user: UserModel = Depends(get_current_user)):
    """Get comprehensive admin statistics"""
    if current_user.role != "admin":
        raise AppException(StatusCode.FORBIDDEN, "Không có quyền truy cập")

    data = await admin_service.get_admin_statistics()
    return BaseResponse(data=data)


@router.get("/users/{user_id}/activity", response_model=BaseResponse)
async def get_user_activity_timeline(
    user_id: str,
    days: int = 30,
    current_user: UserModel = Depends(get_current_user)
):
    """Get user activity timeline"""
    if current_user.role != "admin":
        raise AppException(StatusCode.FORBIDDEN, "Không có quyền truy cập")

    data = await admin_service.get_user_activity_timeline(user_id, days)
    return BaseResponse(data=data)


@router.get("/system/health", response_model=BaseResponse)
async def get_system_health(current_user: UserModel = Depends(get_current_user)):
    """Get system health metrics"""
    if current_user.role != "admin":
        raise AppException(StatusCode.FORBIDDEN, "Không có quyền truy cập")

    data = await admin_service.get_system_health()
    return BaseResponse(data=data)


@router.get("/analytics/user-growth", response_model=BaseResponse)
async def get_user_growth_data(
    days: int = 30,
    current_user: UserModel = Depends(get_current_user)
):
    """Get user growth analytics data"""
    if current_user.role != "admin":
        raise AppException(StatusCode.FORBIDDEN, "Không có quyền truy cập")

    data = await admin_service.get_user_growth_data(days)
    return BaseResponse(data=data)


@router.get("/analytics/activity-heatmap", response_model=BaseResponse)
async def get_activity_heatmap(
    days: int = 30,
    current_user: UserModel = Depends(get_current_user)
):
    """Get activity heatmap data"""
    if current_user.role != "admin":
        raise AppException(StatusCode.FORBIDDEN, "Không có quyền truy cập")

    data = await admin_service.get_activity_heatmap(days)
    return BaseResponse(data=data)
