import secrets

from beanie import PydanticObjectId
from fastapi import APIRouter, HTTPException, Depends
from core.dependencies import get_current_user
from models.classroom_model import ClassroomModel
from models.join_request_model import JoinRequestModel
from models.user_model import UserModel, UserRole
from schemas.base_schema import BaseResponse
from schemas.classroom_schema import ClassroomSchema, JoinRequestSchema

router = APIRouter()

def generate_class_code() -> str:
    return secrets.token_hex(4).upper()

@router.post("/create", response_model=BaseResponse)
async def create_classroom(classroom_data: ClassroomSchema, current_user: UserModel = Depends(get_current_user)):
    if current_user.role != "teacher":
        raise HTTPException(
            404,
            "Quền hạn không đủ"
        )

    new_classroom = ClassroomModel(
        name=classroom_data.name,
        class_code=generate_class_code(),
        description = classroom_data.description,
        subject = classroom_data.subject,
        creator=current_user,
        members=[current_user]
    )
    await new_classroom.insert()

    return BaseResponse(data={})

@router.get("/all", response_model=BaseResponse)
async def all_classrooms(current_user: UserModel = Depends(get_current_user)):
    if current_user.role == "admin":
        raise HTTPException(
            404,
            "admin khong dung endpoint nay :)"
        )

    my_classes = await ClassroomModel.find(
        ClassroomModel.creator.id == current_user.id
    ).to_list()

    return BaseResponse(data=my_classes)

@router.post("/join-request", response_model=BaseResponse)
async def classrooms(request_data: JoinRequestSchema, current_user: UserModel = Depends(get_current_user)):
    if current_user.role != UserRole.STUDENT and current_user.role != UserRole.TEACHER:
        raise HTTPException(
            403,
            "Chỉ người dùng có thể làm thành viên (Student/Teacher) mới có thể gửi yêu cầu."
        )

    classroom = await ClassroomModel.find_one(
        ClassroomModel.class_code == request_data.class_code
    )

    if current_user.id in classroom.members:
        raise HTTPException(
            400,
            "Bạn đã là thành viên của lớp học này."
        )

    if current_user.id in classroom.join_requests:
        raise HTTPException(
            400,
            "Yêu cầu đã gửi"
        )

    new_request = JoinRequestModel(
        user_id=current_user.id,
    )
    await new_request.insert()
    classroom.join_requests.append(new_request)
    await classroom.save()

    return BaseResponse()

@router.post("/{class_code}/accept/{request_id}", response_model=BaseResponse)
async def accept_joint_request(class_code: str, request_id: str, current_user: UserModel = Depends(get_current_user)):
    if current_user.role != UserRole.TEACHER:
        raise HTTPException(
            403,
            "Chỉ giáo viên mới có quyền phê duyệt."
        )

    classroom = await ClassroomModel.find_one(ClassroomModel.class_code == class_code)

    try:
        request_obj_id = PydanticObjectId(request_id)
        join_request = await JoinRequestModel.get(request_obj_id)

    except Exception:
        raise HTTPException(404, detail="ID yêu cầu không hợp lệ hoặc không tồn tại.")

    request_link_to_remove = next(
        (link for link in classroom.join_requests if link.id == request_obj_id),
        None
    )
    if not request_link_to_remove:
        raise HTTPException(404,
                            detail="Yêu cầu không nằm trong danh sách chờ duyệt của lớp này.")

    classroom.members.append(join_request.requester)
    classroom.join_requests.remove(request_link_to_remove)
    join_request.status = "accepted"
    await join_request.save()
    await classroom.save()

    return BaseResponse(data={})

@router.get("/{class_code}/members", response_model=BaseResponse)
async def members(class_code: str, current_user: UserModel = Depends(get_current_user)):

    return BaseResponse()

@router.delete("{class_code}/delete/{member_id}", response_model=BaseResponse)
async def members(class_code: str, member_id: str, current_user: UserModel = Depends(get_current_user)):

    return BaseResponse()

@router.delete("{class_code}/delete", response_model=BaseResponse)
async def del_classroom(class_code: str, current_user: UserModel = Depends(get_current_user)):

    return BaseResponse()