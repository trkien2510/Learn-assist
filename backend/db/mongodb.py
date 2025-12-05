from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from core.config import settings
from models.classroom_model import ClassroomModel
from models.document_model import DocumentModel
from models.exam_model import ExamModel
from models.join_request_model import JoinRequestModel
from models.log_model import LogModel
from models.question_model import QuestionModel
from models.result_model import ResultModel
from models.user_model import UserModel

async def init_db():
    client = AsyncIOMotorClient(settings.MONGO_URI)
    await init_beanie(
        database=client[settings.DATABASE_NAME],
        document_models=[
            UserModel,
            ClassroomModel,
            JoinRequestModel,
            DocumentModel,
            QuestionModel,
            ExamModel,
            ResultModel,
            LogModel,
        ]
    )