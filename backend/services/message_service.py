from beanie import PydanticObjectId
from core.exception_handler import AppException
from core.status_code import StatusCode
from models.message_model import MessageModel
from models.classroom_model import ClassroomModel
from models.user_model import UserModel


async def send_message(class_code: str, content: str, current_user: UserModel):
    classroom = await ClassroomModel.find_one(ClassroomModel.class_code == class_code)
    if not classroom:
        raise AppException(StatusCode.CLASSROOM_NOT_FOUND)
    
    is_creator = str(classroom.creator.ref.id) == str(current_user.id)
    is_member = any(str(member.ref.id) == str(current_user.id) for member in classroom.members)
    
    if not is_creator and not is_member:
        raise AppException(StatusCode.FORBIDDEN)
    
    message = MessageModel(
        classroom=classroom,
        sender=current_user,
        content=content
    )
    await message.save()
    
    await message.fetch_link(MessageModel.sender)
    
    return {
        "id": str(message.id),
        "classroom_id": str(classroom.id),
        "sender_id": str(current_user.id),
        "sender_name": current_user.full_name,
        "sender_email": current_user.email,
        "content": message.content,
        "created_at": message.created_at
    }


async def get_classroom_messages(class_code: str, page: int, page_size: int, current_user: UserModel):
    classroom = await ClassroomModel.find_one(ClassroomModel.class_code == class_code)
    if not classroom:
        raise AppException(StatusCode.CLASSROOM_NOT_FOUND)
    
    is_admin = current_user.role == "admin"
    is_creator = str(classroom.creator.ref.id) == str(current_user.id)
    is_member = any(str(member.ref.id) == str(current_user.id) for member in classroom.members)
    
    if not is_admin and not is_creator and not is_member:
        raise AppException(StatusCode.FORBIDDEN)
    
    query = MessageModel.find(MessageModel.classroom.id == classroom.id)
    total = await query.count()
    
    skip = (page - 1) * page_size
    messages = await query.sort(-MessageModel.created_at).skip(skip).limit(page_size).to_list()
    
    sender_ids = list(set([msg.sender.ref.id for msg in messages if msg.sender]))
    senders = await UserModel.find({"_id": {"$in": sender_ids}}).to_list()
    sender_map = {str(s.id): s for s in senders}
    
    message_list = []
    for msg in messages:
        sender_id_str = str(msg.sender.ref.id) if msg.sender else None
        sender = sender_map.get(sender_id_str) if sender_id_str else None
        
        message_list.append({
            "id": str(msg.id),
            "classroom_id": str(classroom.id),
            "sender_id": sender_id_str or "deleted_user",
            "sender_name": sender.full_name if sender else "Deleted User",
            "sender_email": sender.email if sender else "N/A",
            "content": msg.content,
            "created_at": msg.created_at
        })
    
    total_pages = (total + page_size - 1) // page_size if page_size > 0 else 1
    
    return {
        "items": message_list,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
        "has_next": page < total_pages,
        "has_previous": page > 1
    }



