from fastapi import APIRouter, Depends

from core.dependencies import get_current_user
from models.user_model import UserModel
from schemas.base_schema import BaseResponse

router = APIRouter()

@router.post("/create", response_model=BaseResponse)
async def create_exam(current_user: UserModel = Depends(get_current_user)):

    return BaseResponse()

@router.delete("/delete", response_model=BaseResponse)
async def delete_exam(current_user: UserModel = Depends(get_current_user)):

    return BaseResponse()

@router.post("/start_exam", response_model=BaseResponse)
async def start_exam(current_user: UserModel = Depends(get_current_user)):

    return BaseResponse()

@router.post("/submit", response_model=BaseResponse)
async def submit_exam(current_user: UserModel = Depends(get_current_user)):

    return BaseResponse()