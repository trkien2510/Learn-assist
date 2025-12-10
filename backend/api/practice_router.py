from fastapi import APIRouter, Depends
from core.dependencies import get_current_user
from models.user_model import UserModel
from schemas.base_schema import BaseResponse
from schemas.exam_schema import CreatePersonalExamSchema, SubmitExamSchema
from services import exam_service, statistics_service

router = APIRouter()


@router.post("/exam/create", response_model=BaseResponse)
async def create_personal_exam(exam_data: CreatePersonalExamSchema, current_user: UserModel = Depends(get_current_user)):
    data = await exam_service.create_personal_exam(exam_data, current_user)
    return BaseResponse(data=data)


@router.get("/exams", response_model=BaseResponse)
async def get_my_personal_exams(page: int = 1, page_size: int = 20, current_user: UserModel = Depends(get_current_user)):
    data = await exam_service.get_my_personal_exams(page, page_size, current_user)
    return BaseResponse(data=data)


@router.post("/exam/{exam_id}/start", response_model=BaseResponse)
async def start_personal_exam(exam_id: str, current_user: UserModel = Depends(get_current_user)):
    data = await exam_service.start_personal_exam(exam_id, current_user)
    return BaseResponse(data=data)


@router.post("/exam/{exam_id}/submit", response_model=BaseResponse)
async def submit_personal_exam(exam_id: str, submit_data: SubmitExamSchema, current_user: UserModel = Depends(get_current_user)):
    data = await exam_service.submit_exam(exam_id, submit_data, current_user)
    return BaseResponse(data=data)


@router.delete("/exam/{exam_id}", response_model=BaseResponse)
async def delete_personal_exam(exam_id: str, current_user: UserModel = Depends(get_current_user)):
    await exam_service.delete_personal_exam(exam_id, current_user)
    return BaseResponse()


@router.get("/statistics", response_model=BaseResponse)
async def get_personal_exam_statistics(current_user: UserModel = Depends(get_current_user)):
    data = await exam_service.get_personal_exam_statistics(current_user)
    return BaseResponse(data=data)


@router.get("/statistics/detailed", response_model=BaseResponse)
async def get_detailed_practice_statistics(current_user: UserModel = Depends(get_current_user)):
    data = await statistics_service.get_student_comprehensive_statistics(current_user)
    return BaseResponse(data={
        "summary": data.get("summary", {}),
        "personal_practice": data.get("personal_practice", {}),
        "trends": data.get("trends", {}),
        "performance": data.get("performance", {}),
        "recommendations": data.get("recommendations", [])
    })


@router.get("/exam/{exam_id}/statistics", response_model=BaseResponse)
async def get_personal_exam_detailed_statistics(exam_id: str, current_user: UserModel = Depends(get_current_user)):
    data = await statistics_service.get_exam_detailed_statistics(exam_id, current_user)
    return BaseResponse(data=data)


@router.get("/documents/statistics", response_model=BaseResponse)
async def get_document_statistics(current_user: UserModel = Depends(get_current_user)):
    data = await exam_service.get_user_document_statistics(current_user)
    return BaseResponse(data=data)

