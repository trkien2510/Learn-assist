from fastapi import APIRouter, Depends
from core.dependencies import get_current_admin
from models.user_model import UserModel
from schemas.base_schema import BaseResponse
from services import admin_service

router = APIRouter()


@router.get("/statistics", response_model=BaseResponse)
async def get_admin_statistics(current_user: UserModel = Depends(get_current_admin)):
    """Get comprehensive admin statistics"""
    data = await admin_service.get_admin_statistics()
    return BaseResponse(data=data)


@router.get("/users/{user_id}/activity", response_model=BaseResponse)
async def get_user_activity_timeline(
    user_id: str,
    days: int = 30,
    current_user: UserModel = Depends(get_current_admin)
):
    """Get user activity timeline"""
    data = await admin_service.get_user_activity_timeline(user_id, days)
    return BaseResponse(data=data)


@router.get("/system/health", response_model=BaseResponse)
async def get_system_health(current_user: UserModel = Depends(get_current_admin)):
    """Get system health metrics"""
    data = await admin_service.get_system_health()
    return BaseResponse(data=data)


@router.get("/analytics/user-growth", response_model=BaseResponse)
async def get_user_growth_data(
    days: int = 30,
    current_user: UserModel = Depends(get_current_admin)
):
    """Get user growth analytics data"""
    data = await admin_service.get_user_growth_data(days)
    return BaseResponse(data=data)


@router.get("/analytics/activity-heatmap", response_model=BaseResponse)
async def get_activity_heatmap(
    days: int = 30,
    current_user: UserModel = Depends(get_current_admin)
):
    """Get activity heatmap data"""
    data = await admin_service.get_activity_heatmap(days)
    return BaseResponse(data=data)
