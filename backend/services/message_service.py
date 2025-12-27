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
    
    is_creator = str(classroom.creator.ref.id) == str(current_user.id)
    is_member = any(str(member.ref.id) == str(current_user.id) for member in classroom.members)
    
    if not is_creator and not is_member:
        raise AppException(StatusCode.FORBIDDEN)
    
    all_messages = await MessageModel.find_all().sort(-MessageModel.created_at).to_list()
    
    classroom_messages = [msg for msg in all_messages if msg.classroom.ref.id == classroom.id]
    total = len(classroom_messages)

    skip = (page - 1) * page_size
    messages = classroom_messages[skip:skip + page_size]

    for message in messages:
        sender = await UserModel.get(message.sender.ref.id)
        message._sender_data = sender
    
    message_list = [
        {
            "id": str(msg.id),
            "classroom_id": str(classroom.id),
            "sender_id": str(msg._sender_data.id),
            "sender_name": msg._sender_data.full_name,
            "sender_email": msg._sender_data.email,
            "content": msg.content,
            "created_at": msg.created_at
        }
        for msg in messages
    ]
    
    total_pages = (total + page_size - 1) // page_size
    
    return {
        "items": message_list,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
        "has_next": page < total_pages,
        "has_previous": page > 1
    }



async def delete_message(message_id: str, current_user: UserModel):
    message = await MessageModel.get(PydanticObjectId(message_id))
    if not message:
        raise AppException(StatusCode.MESSAGE_NOT_FOUND)
    
    await message.fetch_all_links()
    
    is_sender = str(message.sender.id) == str(current_user.id)
    is_creator = str(message.classroom.creator.ref.id) == str(current_user.id)
    
    if not is_sender and not is_creator:
        raise AppException(StatusCode.FORBIDDEN)
    
    await message.delete()
