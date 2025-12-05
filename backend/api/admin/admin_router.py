from fastapi import APIRouter

from api.admin import admin_user_router, admin_document_router, admin_question_router, admin_classroom_router

router = APIRouter()

router.include_router(admin_user_router.router, prefix="/users")
router.include_router(admin_document_router.router, prefix="/document")
router.include_router(admin_question_router.router, prefix="/question")
router.include_router(admin_classroom_router.router, prefix="/classroom")
