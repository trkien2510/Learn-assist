from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.admin import admin_router
from core.config import settings
from db.mongodb import init_db
from api import user_router, classroom_router, auth_router, document_router, exam_router, question_router, \
    statistical_router, result_router, dashboard_router, notification_router, practice_router, message_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


from core.exception_handler import AppException, app_exception_handler

app = FastAPI(
    title=settings.PROJECT_NAME,
    lifespan=lifespan,
    openapi_url=f"{settings.API_PREFIX}/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler(AppException, app_exception_handler)

app.include_router(auth_router.router, prefix=f"{settings.API_PREFIX}/auth", tags=["Auth"])
app.include_router(dashboard_router.router, prefix=f"{settings.API_PREFIX}/dashboard", tags=["Dashboard"])
app.include_router(user_router.router, prefix=f"{settings.API_PREFIX}/user", tags=["User"])
app.include_router(classroom_router.router, prefix=f"{settings.API_PREFIX}/classroom", tags=["ClassRooms"])
app.include_router(document_router.router, prefix=f"{settings.API_PREFIX}/document", tags=["Documents"])
app.include_router(question_router.router, prefix=f"{settings.API_PREFIX}/question", tags=["Question"])
app.include_router(exam_router.router, prefix=f"{settings.API_PREFIX}/exam", tags=["Exam"])
app.include_router(practice_router.router, prefix=f"{settings.API_PREFIX}/practice", tags=["Practice"])
app.include_router(result_router.router, prefix=f"{settings.API_PREFIX}/result", tags=["Result"])
app.include_router(statistical_router.router, prefix=f"{settings.API_PREFIX}/statistics", tags=["Statistics"])
app.include_router(notification_router.router, prefix=f"{settings.API_PREFIX}/notifications", tags=["Notifications"])
app.include_router(message_router.router, prefix=f"{settings.API_PREFIX}/message", tags=["Messages"])
app.include_router(admin_router.router, prefix=f"{settings.API_PREFIX}/admin", tags=["Admin"])
