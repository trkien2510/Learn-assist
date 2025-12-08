from fastapi import APIRouter

from api.admin import admin_user_router, admin_classroom_router, admin_log_router

router = APIRouter()

router.include_router(admin_user_router.router, prefix="/users")
router.include_router(admin_classroom_router.router, prefix="/classroom")
router.include_router(admin_log_router.router, prefix="/logs")
