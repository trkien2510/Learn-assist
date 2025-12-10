from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from core.config import settings
from models.classroom_model import ClassroomModel
from models.document_model import DocumentModel
from models.exam_model import ExamModel
from models.join_request_model import JoinRequestModel
from models.log_model import LogModel
from models.notification_model import NotificationModel
from models.otp_model import OTPModel
from models.question_model import QuestionModel
from models.result_model import ResultModel
from models.user_model import UserModel


async def init_db():
    client = AsyncIOMotorClient(settings.MONGO_URI)
    db = client[settings.DATABASE_NAME]

    await init_beanie(
        database=db,
        document_models=[
            UserModel,
            ClassroomModel,
            JoinRequestModel,
            DocumentModel,
            QuestionModel,
            ExamModel,
            ResultModel,
            LogModel,
            NotificationModel,
            OTPModel,
        ]
    )

    try:
        await db.logs.create_index(
            "created_at",
            expireAfterSeconds=2592000
        )
    except Exception:
        pass

    try:
        await db.notifications.create_index(
            "created_at",
            expireAfterSeconds=604800
        )
    except Exception:
        pass

    try:
        await db.otps.create_index(
            "expires_at",
            expireAfterSeconds=600
        )
    except Exception:
        pass

    # TTL index for auto-deleting unverified users after 5 minutes
    try:
        await db.users.create_index(
            "verification_expires_at",
            expireAfterSeconds=0,
            partialFilterExpression={"email_verified": False, "verification_expires_at": {"$exists": True, "$ne": None}}
        )
    except Exception:
        pass