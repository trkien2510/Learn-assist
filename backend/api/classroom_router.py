from fastapi import APIRouter, Depends
from core.dependencies import get_current_user
from models.user_model import UserModel
from schemas.base_schema import BaseResponse
from schemas.classroom_schema import CreateClassroomSchema
from services import classroom_service

router = APIRouter()


@router.post("/create", response_model=BaseResponse)
async def create_classroom(classroom_data: CreateClassroomSchema, current_user: UserModel = Depends(get_current_user)):
    await classroom_service.create_classroom(classroom_data, current_user)
    return BaseResponse(data={})


@router.get("/all", response_model=BaseResponse)
async def get_all_classrooms(page: int = 1, page_size: int = 20, current_user: UserModel = Depends(get_current_user)):
    data = await classroom_service.get_classrooms(page, page_size, current_user)
    return BaseResponse(data=data)


@router.get("/{class_code}", response_model=BaseResponse)
async def get_classroom_detail(class_code: str, current_user: UserModel = Depends(get_current_user)):
    data = await classroom_service.get_classroom_detail(class_code, current_user)
    return BaseResponse(data=data)



@router.get("/{class_code}/members", response_model=BaseResponse)
async def get_classroom_members(class_code: str, current_user: UserModel = Depends(get_current_user)):
    data = await classroom_service.get_classroom_members(class_code, current_user)
    return BaseResponse(data=data)


@router.delete("/{class_code}", response_model=BaseResponse)
async def delete_classroom(class_code: str, current_user: UserModel = Depends(get_current_user)):
    await classroom_service.delete_classroom(class_code, current_user)
    return BaseResponse()


@router.get("/pending-requests", response_model=BaseResponse)
async def get_pending_requests(current_user: UserModel = Depends(get_current_user)):
    data = await classroom_service.get_my_pending_requests(current_user)
    return BaseResponse(data=data)


@router.post("/{class_code}/join-request", response_model=BaseResponse)
async def send_join_request(class_code: str, current_user: UserModel = Depends(get_current_user)):
    await classroom_service.request_join_classroom(class_code, current_user)
    return BaseResponse()


@router.post("/{class_code}/accept/{request_id}", response_model=BaseResponse)
async def accept_join_request(class_code: str, request_id: str, current_user: UserModel = Depends(get_current_user)):
    await classroom_service.accept_join_request(class_code, request_id, current_user)
    return BaseResponse(data={})


@router.post("/{class_code}/accept-all", response_model=BaseResponse)
async def accept_all_join_requests(class_code: str, current_user: UserModel = Depends(get_current_user)):
    data = await classroom_service.accept_all_join_requests(class_code, current_user)
    return BaseResponse(data=data)


@router.post("/{class_code}/reject/{request_id}", response_model=BaseResponse)
async def reject_join_request(class_code: str, request_id: str, current_user: UserModel = Depends(get_current_user)):
    await classroom_service.reject_join_request(class_code, request_id, current_user)
    return BaseResponse(data={})


@router.post("/{class_code}/reject-all", response_model=BaseResponse)
async def reject_all_join_requests(class_code: str, current_user: UserModel = Depends(get_current_user)):
    data = await classroom_service.reject_all_join_requests(class_code, current_user)
    return BaseResponse(data=data)


@router.post("/{class_code}/leave", response_model=BaseResponse)
async def leave_classroom(class_code: str, current_user: UserModel = Depends(get_current_user)):
    await classroom_service.leave_classroom(class_code, current_user)
    return BaseResponse()


@router.delete("/{class_code}/members/{member_id}", response_model=BaseResponse)
async def remove_member(class_code: str, member_id: str, current_user: UserModel = Depends(get_current_user)):
    await classroom_service.remove_member(class_code, member_id, current_user)
    return BaseResponse()