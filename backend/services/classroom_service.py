import secrets
from beanie import PydanticObjectId
from core.exception_handler import AppException
from core.status_code import StatusCode
from models.classroom_model import ClassroomModel
from models.join_request_model import JoinRequestModel
from models.user_model import UserRole, UserModel


def generate_class_code() -> str:
    return secrets.token_hex(4).upper()


async def create_classroom(classroom_data, current_user):
    if current_user.role != "teacher":
        raise AppException(StatusCode.FORBIDDEN, "Quyền hạn không đủ")

    new_classroom = ClassroomModel(
        name=classroom_data.name,
        class_code=generate_class_code(),
        description=classroom_data.description,
        subject=classroom_data.subject,
        creator=current_user,
        members=[current_user]
    )
    await new_classroom.insert()
    return {}


async def get_my_classrooms(page: int, page_size: int, current_user: UserModel):
    if current_user.role != "teacher":
        raise AppException(StatusCode.FORBIDDEN, "Chỉ teacher mới được sử dụng tính năng này")

    if page < 1:
        page = 1
    if page_size < 1 or page_size > 100:
        page_size = 20

    skip = (page - 1) * page_size

    total = await ClassroomModel.find(ClassroomModel.creator.id == current_user.id).count()

    my_classes = await ClassroomModel.find(
        ClassroomModel.creator.id == current_user.id
    ).skip(skip).limit(page_size).to_list()

    total_pages = (total + page_size - 1) // page_size

    return {"items": my_classes,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages,
            "has_next": page < total_pages,
            "has_previous": page > 1
            }


async def get_all_classrooms_admin(page: int = 1, page_size: int = 20):
    if page < 1:
        page = 1
    if page_size < 1 or page_size > 100:
        page_size = 20

    skip = (page - 1) * page_size

    total = await ClassroomModel.find_all().count()
    items = await ClassroomModel.find_all().skip(skip).limit(page_size).to_list()

    total_pages = (total + page_size - 1) // page_size

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
        "has_next": page < total_pages,
        "has_previous": page > 1
    }


async def request_join_classroom(class_code: str, current_user):
    if current_user.role != UserRole.STUDENT and current_user.role != UserRole.TEACHER:
        raise AppException(StatusCode.FORBIDDEN,
                           "Chỉ người dùng có thể làm thành viên (Student/Teacher) mới có thể gửi yêu cầu.")

    classroom = await ClassroomModel.find_one(ClassroomModel.class_code == class_code)
    if not classroom:
        raise AppException(StatusCode.NOT_FOUND, "Lớp học không tồn tại.")

    if any(member.id == current_user.id for member in classroom.members):
        raise AppException(StatusCode.ALREADY_MEMBER, "Bạn đã là thành viên của lớp học này.")

    existing_request = await JoinRequestModel.find_one(
        (JoinRequestModel.user_id == current_user.id) &
        (JoinRequestModel.class_id == classroom.id)
    )
    if existing_request:
        raise AppException(StatusCode.JOIN_REQUEST_EXISTS, "Bạn đã gửi yêu cầu trước đó.")

    new_request = JoinRequestModel(
        user_id=current_user.id,
        class_id=classroom.id,
    )
    await new_request.insert()
    return {}


async def accept_join_request(class_code: str, request_id: str, current_user):
    if current_user.role != UserRole.TEACHER:
        raise AppException(StatusCode.FORBIDDEN, "Chỉ giáo viên mới có quyền phê duyệt.")

    classroom = await ClassroomModel.find_one(ClassroomModel.class_code == class_code)
    if not classroom:
        raise AppException(StatusCode.NOT_FOUND, "Lớp học không tồn tại.")

    try:
        request_obj_id = PydanticObjectId(request_id)
    except:
        raise AppException(StatusCode.BAD_REQUEST, "ID yêu cầu không hợp lệ.")

    join_request = await JoinRequestModel.get(request_obj_id)
    if not join_request:
        raise AppException(StatusCode.NOT_FOUND, "Yêu cầu tham gia không tồn tại.")

    if join_request.class_id.id != classroom.id:
        raise AppException(StatusCode.BAD_REQUEST, "Yêu cầu này không thuộc lớp học hiện tại.")

    if any(m.id == join_request.user_id.id for m in classroom.members):
        await join_request.delete()
        raise AppException(StatusCode.ALREADY_MEMBER, "Người dùng đã là thành viên của lớp.")

    classroom.members.append(join_request.user_id)
    await classroom.save()
    await join_request.delete()
    return {}


async def reject_join_request(class_code: str, request_id: str, current_user):
    if current_user.role != UserRole.TEACHER:
        raise AppException(StatusCode.FORBIDDEN, "Chỉ giáo viên mới có quyền từ chối.")

    classroom = await ClassroomModel.find_one(ClassroomModel.class_code == class_code)
    if not classroom:
        raise AppException(StatusCode.NOT_FOUND, "Lớp học không tồn tại.")

    try:
        request_obj_id = PydanticObjectId(request_id)
        join_request = await JoinRequestModel.get(request_obj_id)
    except Exception:
        raise AppException(StatusCode.NOT_FOUND, "ID yêu cầu không hợp lệ hoặc không tồn tại.")

    if join_request:
        await join_request.delete()

    return {}


async def get_classroom_by_id(class_id: str):
    try:
        obj_id = PydanticObjectId(class_id)
    except:
        raise AppException(StatusCode.BAD_REQUEST, "ID lớp học không hợp lệ")

    classroom = await ClassroomModel.get(obj_id)
    if not classroom:
        raise AppException(StatusCode.NOT_FOUND, "Lớp học không tồn tại")
    return classroom


async def delete_classroom_by_admin(class_id: str):
    classroom = await get_classroom_by_id(class_id)
    await classroom.delete()
    return {}
