from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from datetime import date

from core.config import settings
from core.security import get_password_hash
from models.classroom_model import ClassroomModel
from models.document_model import DocumentModel
from models.exam_model import ExamModel
from models.join_request_model import JoinRequestModel
from models.log_model import LogModel
from models.message_model import MessageModel
from models.notification_model import NotificationModel
from models.otp_model import OTPModel
from models.question_model import QuestionModel
from models.result_model import ResultModel
from models.user_model import UserModel, UserRole



DEFAULT_ADMIN_EMAIL = "admin@learnassist.com"
DEFAULT_ADMIN_USERNAME = "admin"
DEFAULT_ADMIN_PASSWORD = "Admin@123"
DEFAULT_ADMIN_FULLNAME = "System Administrator"


async def create_default_admin():
    existing_admin = await UserModel.find_one(UserModel.role == UserRole.ADMIN)
    
    if existing_admin:
        return
    
    hashed = get_password_hash(DEFAULT_ADMIN_PASSWORD)
    
    admin_user = UserModel(
        username=DEFAULT_ADMIN_USERNAME.lower(),
        email=DEFAULT_ADMIN_EMAIL,
        full_name=DEFAULT_ADMIN_FULLNAME,
        hashed_password=hashed,
        role=UserRole.ADMIN,
        dob=date(2000, 1, 1),
        phone_number=None,
        email_verified=True,
        is_activate=True,
    )
    await admin_user.insert()


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
            MessageModel,
            NotificationModel,
            OTPModel,
        ]
    )

    await create_default_admin()

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

    try:
        await db.users.create_index(
            "verification_expires_at",
            expireAfterSeconds=0,
            partialFilterExpression={"email_verified": False, "verification_expires_at": {"$exists": True, "$ne": None}}
        )
    except Exception:
        pass