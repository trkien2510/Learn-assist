from datetime import datetime, timezone
from core.security import verify_password
from core.exception_handler import AppException
from core.status_code import StatusCode
from models.user_model import UserModel


async def get_my_profile(current_user):
    return {
        "full_name": current_user.full_name,
        "email": current_user.email,
        "dob": current_user.dob,
        "role": current_user.role,
        "phone_number": current_user.phone_number,
        "created_at": current_user.created_at
    }


async def update_profile(update_data, current_user):
    update_dict = update_data.model_dump(exclude_unset=True)

    if not verify_password(update_data.current_password, current_user.hashed_password):
        raise AppException(StatusCode.UNAUTHORIZED, "Mật khẩu hiện tại không chính xác")

    if not update_dict:
        raise AppException(StatusCode.BAD_REQUEST, "Không có dữ liệu để cập nhật")

    update_dict.pop("role", None)
    update_dict.pop("current_password", None)

    for key, value in update_dict.items():
        setattr(current_user, key, value)

    current_user.updated_at = lambda: datetime.now(timezone.utc)
    await current_user.save()
    return {}


async def deactivate_account(pass_data, current_user):
    if not verify_password(pass_data.password, current_user.hashed_password):
        raise AppException(StatusCode.UNAUTHORIZED, "Mật khẩu không chính xác")

    current_user.is_activated = False
    current_user.updated_at = lambda: datetime.now(timezone.utc)
    await current_user.save()
    return {}


async def get_all_users(page: int = 1, page_size: int = 20):
    if page < 1:
        page = 1
    if page_size < 1 or page_size > 100:
        page_size = 20

    skip = (page - 1) * page_size

    total = await UserModel.find_all().count()
    items = await UserModel.find_all().skip(skip).limit(page_size).to_list()

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


async def get_user_by_id(user_id: str):
    try:
        from beanie import PydanticObjectId
        oid = PydanticObjectId(user_id)
    except:
        raise AppException(StatusCode.BAD_REQUEST, "ID người dùng không hợp lệ")

    user = await UserModel.get(oid)
    if not user:
        raise AppException(StatusCode.NOT_FOUND, "Người dùng không tồn tại")
    return user


async def update_user_by_admin(user_id: str, update_data):
    user = await get_user_by_id(user_id)

    update_dict = update_data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        if key == "password":
            from core.security import get_password_hash
            user.hashed_password = get_password_hash(value)
        else:
            setattr(user, key, value)

    user.updated_at = lambda: datetime.now(timezone.utc)
    await user.save()
    return user


async def delete_user_by_admin(user_id: str):
    user = await get_user_by_id(user_id)
    await user.delete()
    return {}
