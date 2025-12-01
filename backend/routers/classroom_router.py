import secrets

from fastapi import APIRouter, HTTPException, Depends
from core.dependencies import get_current_user
from models.classroom_model import ClassroomModel
from models.user_model import UserModel
from schemas.base_schema import BaseResponse
from schemas.classroom_schema import ClassroomSchema

router = APIRouter()

def generate_class_code() -> str:
    return secrets.token_hex(4).upper()

@router.post("/create", response_model=BaseResponse)
async def createclassroom(classroom_data: ClassroomSchema, current_user: UserModel = Depends(get_current_user)):
    if current_user.role != "teacher":
        raise HTTPException(
            404,
            "Quền hạn không thể tạo"
        )

    creator = await UserModel.find_one({"username": current_user.username})
    new_classroom = ClassroomModel(
        name=classroom_data.name,
        class_code=generate_class_code(),
        creator=creator,
        members=[creator]
    )
    await new_classroom.insert()

    return BaseResponse(data={})

@router.get("/all", response_model=BaseResponse)
async def classrooms():

    return BaseResponse()