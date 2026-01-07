from fastapi import APIRouter, Depends
from core.dependencies import get_current_user
from models.user_model import UserModel
from schemas.base_schema import BaseResponse
from schemas.message_schema import SendMessageSchema
from services import message_service

router = APIRouter()


@router.post("/{class_code}/send", response_model=BaseResponse)
async def send_message(class_code: str, message: SendMessageSchema, current_user: UserModel = Depends(get_current_user)):
    data = await message_service.send_message(class_code, message.content, current_user)
    return BaseResponse(data=data)


@router.get("/{class_code}/messages", response_model=BaseResponse)
async def get_messages(class_code: str, page: int = 1, page_size: int = 50, current_user: UserModel = Depends(get_current_user)):
    data = await message_service.get_classroom_messages(class_code, page, page_size, current_user)
    return BaseResponse(data=data)

