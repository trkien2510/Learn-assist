import secrets
from beanie import PydanticObjectId
from core.exception_handler import AppException
from core.status_code import StatusCode
from models.classroom_model import ClassroomModel
from models.join_request_model import JoinRequestModel
from models.user_model import UserRole, UserModel
from services import log_service
from utils.query_helpers import batch_fetch_users_from_links, get_id_from_link


def generate_class_code() -> str:
    return secrets.token_hex(4).upper()


async def create_classroom(classroom_data, current_user):
    if current_user.role != "teacher":
        raise AppException(StatusCode.FORBIDDEN, "Permission denied")

    new_classroom = ClassroomModel(
        name=classroom_data.name,
        class_code=generate_class_code(),
        description=classroom_data.description,
        subject=classroom_data.subject,
        creator=current_user,
        members=[current_user]
    )
    await new_classroom.insert()

    await log_service.log_classroom("create_classroom", str(new_classroom.id), current_user, {
        "name": classroom_data.name,
        "class_code": new_classroom.class_code
    })

    return {}


async def get_classrooms(page: int, page_size: int, current_user: UserModel):
    if page < 1:
        page = 1
    if page_size < 1 or page_size > 100:
        page_size = 20

    skip = (page - 1) * page_size

    my_classes = []
    total = 0

    if current_user.role == "teacher":
        query = ClassroomModel.find(
            {"$or": [
                {"creator.$id": current_user.id},
                {"members.$id": current_user.id}
            ]}
        )
        total = await query.count()
        my_classes = await query.skip(skip).limit(page_size).to_list()

    elif current_user.role == "admin":
        total = await ClassroomModel.find_all().count()
        my_classes = await ClassroomModel.find_all().skip(skip).limit(page_size).to_list()

    elif current_user.role == "student":
        query = ClassroomModel.find({"members.$id": current_user.id})
        total = await query.count()
        my_classes = await query.skip(skip).limit(page_size).to_list()

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
        raise AppException(StatusCode.FORBIDDEN, "Only students and teachers can request to join")

    classroom = await ClassroomModel.find_one(ClassroomModel.class_code == class_code)
    if not classroom:
        raise AppException(StatusCode.NOT_FOUND, "Classroom not found")

    if any(m.ref.id == current_user.id for m in classroom.members):
        raise AppException(StatusCode.ALREADY_MEMBER, "You are already a member of this class")

    existing_request = await JoinRequestModel.find_one({
        "user_id.$id": current_user.id,
        "class_id.$id": classroom.id
    })
    if existing_request:
        raise AppException(StatusCode.JOIN_REQUEST_EXISTS, "Join request already exists and pending")

    new_request = JoinRequestModel(
        user_id=current_user.id,
        class_id=classroom.id,
    )
    await new_request.insert()

    await log_service.log_classroom("join_request", str(classroom.id), current_user, {
        "class_code": class_code,
        "class_name": classroom.name
    })

    return {}


async def accept_join_request(class_code: str, request_id: str, current_user):
    if current_user.role != UserRole.TEACHER:
        raise AppException(StatusCode.FORBIDDEN, "Chỉ giáo viên mới có quyền duyệt yêu cầu")

    classroom = await ClassroomModel.find_one(ClassroomModel.class_code == class_code)
    if not classroom:
        raise AppException(StatusCode.NOT_FOUND, "Không tìm thấy lớp học")

    try:
        request_obj_id = PydanticObjectId(request_id)
    except:
        raise AppException(StatusCode.BAD_REQUEST, "Invalid request ID")

    join_request = await JoinRequestModel.get(request_obj_id)
    if not join_request:
        raise AppException(StatusCode.NOT_FOUND, "Join request not found")

    if join_request.class_id.ref.id != classroom.id:
        raise AppException(StatusCode.BAD_REQUEST, "This request does not belong to this class")

    if any(m.ref.id == join_request.user_id.ref.id for m in classroom.members):
        await join_request.delete()
        raise AppException(StatusCode.ALREADY_MEMBER, "User is already a member of this class")

    classroom.members.append(join_request.user_id)
    await classroom.save()
    await join_request.delete()

    await log_service.log_classroom("accept_join_request", str(classroom.id), current_user, {
        "class_code": class_code,
        "accepted_user_id": str(join_request.user_id.ref.id)
    })

    return {}


async def reject_join_request(class_code: str, request_id: str, current_user):
    if current_user.role != UserRole.TEACHER:
        raise AppException(StatusCode.FORBIDDEN, "Only teachers can reject requests")

    classroom = await ClassroomModel.find_one(ClassroomModel.class_code == class_code)
    if not classroom:
        raise AppException(StatusCode.NOT_FOUND, "Classroom not found")

    try:
        request_obj_id = PydanticObjectId(request_id)
        join_request = await JoinRequestModel.get(request_obj_id)
    except Exception:
        raise AppException(StatusCode.NOT_FOUND, "Invalid request ID or request not found")

    if join_request:
        await join_request.delete()

    return {}


async def get_classroom_by_id(class_id: str):
    try:
        obj_id = PydanticObjectId(class_id)
    except:
        raise AppException(StatusCode.BAD_REQUEST, "Invalid class ID")

    classroom = await ClassroomModel.get(obj_id)
    if not classroom:
        raise AppException(StatusCode.NOT_FOUND, "Classroom not found")
    return classroom


async def delete_classroom_by_admin(class_id: str):
    classroom = await get_classroom_by_id(class_id)
    await classroom.delete()
    return {}


async def update_classroom_by_admin(class_id: str, update_data):
    classroom = await get_classroom_by_id(class_id)

    if update_data.name:
        classroom.name = update_data.name
    if update_data.description:
        classroom.description = update_data.description
    if update_data.subject:
        classroom.subject = update_data.subject

    await classroom.save()
    return classroom


async def get_classroom_by_code(class_code: str):
    classroom = await ClassroomModel.find_one(ClassroomModel.class_code == class_code)
    if not classroom:
        raise AppException(StatusCode.NOT_FOUND, "Classroom not found")
    return classroom


async def get_classroom_detail(class_code: str, current_user):
    classroom = await get_classroom_by_code(class_code)
    
    is_admin = current_user.role == "admin"
    is_creator = classroom.creator.ref.id == current_user.id
    is_member = any(m.ref.id == current_user.id for m in classroom.members)
    
    if not is_admin and not is_creator and not is_member:
        raise AppException(StatusCode.FORBIDDEN, "You are not a member of this class")
    
    creator = await UserModel.get(classroom.creator.ref.id)
    
    pending_count = 0
    if is_creator:
        pending_count = await JoinRequestModel.find({"class_id.$id": classroom.id}).count()
    
    return {
        "id": str(classroom.id),
        "name": classroom.name,
        "description": classroom.description,
        "subject": classroom.subject,
        "class_code": classroom.class_code,
        "creator": {
            "id": str(creator.id),
            "full_name": creator.full_name,
            "email": creator.email
        },
        "members_count": len(classroom.members),
        "pending_requests_count": pending_count,
        "is_creator": is_creator,
        "is_admin": is_admin,
        "created_at": classroom.created_at
    }



async def accept_all_join_requests(class_code: str, current_user):
    if current_user.role != UserRole.TEACHER:
        raise AppException(StatusCode.FORBIDDEN, "Only teachers can approve requests")

    classroom = await get_classroom_by_code(class_code)

    if classroom.creator.ref.id != current_user.id:
        raise AppException(StatusCode.FORBIDDEN, "You are not the teacher of this class")

    join_requests = await JoinRequestModel.find({"class_id.$id": classroom.id}).to_list()

    accepted_count = 0
    member_ids = {m.ref.id for m in classroom.members}
    
    for jr in join_requests:
        user_id = jr.user_id.ref.id
        if user_id not in member_ids:
            user = await UserModel.get(user_id)
            if user:
                classroom.members.append(jr.user_id)
                member_ids.add(user_id)
                accepted_count += 1
        await jr.delete()

    if accepted_count > 0:
        await classroom.save()
    
    return {"accepted_count": accepted_count}


async def reject_all_join_requests(class_code: str, current_user):
    if current_user.role != UserRole.TEACHER:
        raise AppException(StatusCode.FORBIDDEN, "Only teachers can reject requests")

    classroom = await get_classroom_by_code(class_code)

    if classroom.creator.ref.id != current_user.id:
        raise AppException(StatusCode.FORBIDDEN, "You are not the teacher of this class")

    result = await JoinRequestModel.find({"class_id.$id": classroom.id}).delete()

    return {"rejected_count": result.deleted_count if result else 0}



async def leave_classroom(class_code: str, current_user):
    classroom = await get_classroom_by_code(class_code)

    if classroom.creator.ref.id == current_user.id:
        raise AppException(StatusCode.BAD_REQUEST, "Class creator cannot leave the class")

    member_ids = [m.ref.id for m in classroom.members]
    if current_user.id not in member_ids:
        raise AppException(StatusCode.BAD_REQUEST, "You are not a member of this class")

    classroom.members = [m for m in classroom.members if m.ref.id != current_user.id]
    await classroom.save()

    return {}


async def get_classroom_members(class_code: str, current_user):
    classroom = await get_classroom_by_code(class_code)

    is_member = any(m.ref.id == current_user.id for m in classroom.members)
    if not is_member and current_user.role != "admin":
        raise AppException(StatusCode.FORBIDDEN, "You do not have permission to view members of this class")

    members_map = await batch_fetch_users_from_links(classroom.members)
    creator_id = get_id_from_link(classroom.creator)
    
    members_info = []
    for member_link in classroom.members:
        member_id = get_id_from_link(member_link)
        member = members_map.get(member_id)
        if member:
            members_info.append({
                "id": str(member.id),
                "full_name": member.full_name,
                "email": member.email,
                "role": member.role,
                "is_creator": member.id == creator_id
            })

    pending_requests = []
    if creator_id == current_user.id:
        join_requests = await JoinRequestModel.find({"class_id.$id": classroom.id}).to_list()
        
        if join_requests:
            request_user_ids = [get_id_from_link(jr.user_id) for jr in join_requests]
            from utils.query_helpers import batch_fetch_users
            users_map = await batch_fetch_users(request_user_ids)
            
            for jr in join_requests:
                user_id = get_id_from_link(jr.user_id)
                user = users_map.get(user_id)
                if user:
                    pending_requests.append({
                        "request_id": str(jr.id),
                        "user_id": str(user.id),
                        "full_name": user.full_name,
                        "email": user.email,
                        "created_at": jr.created_at if hasattr(jr, 'created_at') else None
                    })

    return {
        "class_code": classroom.class_code,
        "class_name": classroom.name,
        "members": members_info,
        "pending_requests": pending_requests,
        "total_members": len(members_info)
    }


async def remove_member(class_code: str, member_id: str, current_user):
    classroom = await get_classroom_by_code(class_code)

    if classroom.creator.ref.id != current_user.id and current_user.role != "admin":
        raise AppException(StatusCode.FORBIDDEN, "Only the class teacher can remove members")

    try:
        member_obj_id = PydanticObjectId(member_id)
    except:
        raise AppException(StatusCode.BAD_REQUEST, "Invalid member ID")

    if member_obj_id == classroom.creator.ref.id:
        raise AppException(StatusCode.BAD_REQUEST, "Cannot remove the class creator")

    member_ids = [m.ref.id for m in classroom.members]
    if member_obj_id not in member_ids:
        raise AppException(StatusCode.NOT_FOUND, "Member not found in this class")

    classroom.members = [m for m in classroom.members if m.ref.id != member_obj_id]
    await classroom.save()

    return {}


async def delete_classroom(class_code: str, current_user):
    classroom = await get_classroom_by_code(class_code)

    if classroom.creator.ref.id != current_user.id and current_user.role != "admin":
        raise AppException(StatusCode.FORBIDDEN, "Only the class teacher or admin can delete the class")

    await JoinRequestModel.find({"class_id.$id": classroom.id}).delete()
    await classroom.delete()

    return {}


async def get_my_pending_requests(current_user):
    if current_user.role != "teacher":
        raise AppException(StatusCode.FORBIDDEN, "Only teachers can access this endpoint")

    classrooms = await ClassroomModel.find({"creator.$id": current_user.id}).to_list()
    
    if not classrooms:
        return {
            "items": [],
            "total": 0
        }

    class_ids = [c.id for c in classrooms]
    class_map = {c.id: {"name": c.name, "class_code": c.class_code} for c in classrooms}

    join_requests = await JoinRequestModel.find(
        {"class_id.$id": {"$in": class_ids}}
    ).to_list()

    if not join_requests:
        return {
            "items": [],
            "total": 0
        }

    from utils.query_helpers import batch_fetch_users
    user_ids = [get_id_from_link(jr.user_id) for jr in join_requests]
    users_map = await batch_fetch_users(user_ids)
    
    items = []
    for jr in join_requests:
        user_id = get_id_from_link(jr.user_id)
        class_id = get_id_from_link(jr.class_id)
        user = users_map.get(user_id)
        class_info = class_map.get(class_id, {})
        
        if user:
            items.append({
                "request_id": str(jr.id),
                "class_code": class_info.get("class_code", ""),
                "class_name": class_info.get("name", ""),
                "user_id": str(user.id),
                "full_name": user.full_name,
                "email": user.email,
                "request_at": jr.request_at
            })

    return {
        "items": items,
        "total": len(items)
    }
