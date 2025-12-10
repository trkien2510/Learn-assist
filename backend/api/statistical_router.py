from fastapi import APIRouter, Depends
from core.dependencies import get_current_user
from models.user_model import UserModel
from schemas.base_schema import BaseResponse
from services import result_service, statistics_service

router = APIRouter()


# ===== Basic Statistics =====

@router.get("/exam/{exam_id}", response_model=BaseResponse[dict])
async def get_exam_statistics(exam_id: str, page: int = 1, page_size: int = 20, current_user: UserModel = Depends(get_current_user)):
    data = await result_service.get_results_by_exam_id(exam_id, page, page_size, current_user)
    return BaseResponse(data=data)


@router.get("/class/{class_id}", response_model=BaseResponse[dict])
async def get_class_statistics(class_id: str, page: int = 1, page_size: int = 20, current_user: UserModel = Depends(get_current_user)):
    data = await result_service.get_results_by_class_id(class_id, page, page_size, current_user)
    return BaseResponse(data=data)


@router.get("/personal", response_model=BaseResponse[dict])
async def get_personal_practice_results(page: int = 1, page_size: int = 20, current_user: UserModel = Depends(get_current_user)):
    data = await result_service.get_personal_results(page, page_size, current_user)
    return BaseResponse(data=data)


# ===== Comprehensive Statistics =====

@router.get("/comprehensive", response_model=BaseResponse[dict])
async def get_comprehensive_statistics(current_user: UserModel = Depends(get_current_user)):
    if current_user.role.value == "student":
        data = await statistics_service.get_student_comprehensive_statistics(current_user)
    elif current_user.role.value == "teacher":
        data = await statistics_service.get_teacher_comprehensive_statistics(current_user)
    else:
        # Admin gets platform-wide statistics
        data = await statistics_service.get_admin_platform_statistics()
    return BaseResponse(data=data)


@router.get("/student/comprehensive", response_model=BaseResponse[dict])
async def get_student_statistics(current_user: UserModel = Depends(get_current_user)):
    data = await statistics_service.get_student_comprehensive_statistics(current_user)
    return BaseResponse(data=data)


@router.get("/teacher/comprehensive", response_model=BaseResponse[dict])
async def get_teacher_statistics(current_user: UserModel = Depends(get_current_user)):
    data = await statistics_service.get_teacher_comprehensive_statistics(current_user)
    return BaseResponse(data=data)


@router.get("/exam/{exam_id}/detailed", response_model=BaseResponse[dict])
async def get_exam_detailed_statistics(exam_id: str, current_user: UserModel = Depends(get_current_user)):
    data = await statistics_service.get_exam_detailed_statistics(exam_id, current_user)
    return BaseResponse(data=data)


@router.get("/class/{class_id}/detailed", response_model=BaseResponse[dict])
async def get_classroom_detailed_statistics(class_id: str, current_user: UserModel = Depends(get_current_user)):
    data = await statistics_service.get_classroom_detailed_statistics(class_id, current_user)
    return BaseResponse(data=data)


# ===== Platform Statistics (Admin) =====

@router.get("/platform", response_model=BaseResponse[dict])
async def get_platform_statistics(current_user: UserModel = Depends(get_current_user)):
    if current_user.role.value != "admin":
        from core.exception_handler import AppException
        from core.status_code import StatusCode
        raise AppException(StatusCode.FORBIDDEN, "Admin access required")
    
    data = await statistics_service.get_admin_platform_statistics()
    return BaseResponse(data=data)


@router.get("/overall", response_model=BaseResponse[dict])
async def get_overall_statistics(current_user: UserModel = Depends(get_current_user)):
    data = await result_service.get_user_overall_statistics(current_user)
    return BaseResponse(data=data)

