from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from core.config import settings
from models.classroom_model import ClassroomModel
from models.user_model import UserModel

async def init_db():
    client = AsyncIOMotorClient(settings.MONGO_URI)
    await init_beanie(
        database=client[settings.DATABASE_NAME],
        document_models=[
            UserModel,
            ClassroomModel,
        ]
    )