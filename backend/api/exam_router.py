from fastapi import APIRouter, Depends
from core.dependencies import get_current_user
from models.user_model import UserModel
from schemas.base_schema import BaseResponse
from schemas.exam_schema import CreateExamSchema, SubmitExamSchema
import schemas.exam_schema
from services import exam_service

router = APIRouter()


@router.post("/create", response_model=BaseResponse)
async def create_exam(exam_data: CreateExamSchema, current_user: UserModel = Depends(get_current_user)):
    await exam_service.create_exam(exam_data, current_user)
    return BaseResponse(data={})


@router.get("/all", response_model=BaseResponse)
async def get_all_exams(page: int = 1, page_size: int = 20, current_user: UserModel = Depends(get_current_user)):
    data = await exam_service.get_my_exams(page, page_size, current_user)
    return BaseResponse(data=data)


@router.get("/class/{class_id}", response_model=BaseResponse)
async def get_exams_by_class(class_id: str, page: int = 1, page_size: int = 20, current_user: UserModel = Depends(get_current_user)):
    data = await exam_service.get_exams_by_class(class_id, page, page_size, current_user)
    return BaseResponse(data=data)


@router.delete("/{exam_id}", response_model=BaseResponse)
async def delete_exam(exam_id: str, current_user: UserModel = Depends(get_current_user)):
    await exam_service.delete_exam(exam_id, current_user)
    return BaseResponse()


@router.get("/{exam_id}", response_model=BaseResponse)
async def get_exam_detail(exam_id: str, current_user: UserModel = Depends(get_current_user)):
    data = await exam_service.get_exam_detail(exam_id, current_user)
    return BaseResponse(data=data)


@router.post("/{exam_id}/start", response_model=BaseResponse)
async def start_exam(exam_id: str, current_user: UserModel = Depends(get_current_user)):
    data = await exam_service.start_exam(exam_id, current_user)
    return BaseResponse(data=data)


@router.post("/{exam_id}/submit", response_model=BaseResponse)
async def submit_exam(exam_id: str, submit_data: SubmitExamSchema, current_user: UserModel = Depends(get_current_user)):
    data = await exam_service.submit_exam(exam_id, submit_data, current_user)
    return BaseResponse(data=data)


@router.post("/preview", response_model=BaseResponse)
async def preview_exam_questions(
    preview_data: schemas.exam_schema.PreviewExamSchema,
    current_user: UserModel = Depends(get_current_user)
):
    data = await exam_service.preview_exam_questions(
        preview_data.class_code,
        preview_data.total_questions,
        preview_data.easy_count,
        preview_data.medium_count,
        preview_data.hard_count,
        current_user
    )
    return BaseResponse(data=data)


@router.post("/replace-question", response_model=BaseResponse)
async def replace_question(
    replace_data: schemas.exam_schema.ReplaceQuestionSchema,
    class_code: str,
    difficulty: str,
    current_user: UserModel = Depends(get_current_user)
):
    data = await exam_service.replace_question_in_preview(
        class_code,
        replace_data.question_id,
        replace_data.excluded_ids,
        difficulty,
        current_user
    )
    return BaseResponse(data=data)
