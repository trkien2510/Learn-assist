from datetime import datetime, timezone
from core.security import verify_password
from core.exception_handler import AppException
from core.status_code import StatusCode
from models.user_model import UserModel
from services import log_service


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
        raise AppException(StatusCode.UNAUTHORIZED, "Current password is incorrect")

    if not update_dict:
        raise AppException(StatusCode.BAD_REQUEST, "No data to update")

    update_dict.pop("role", None)
    update_dict.pop("current_password", None)

    for key, value in update_dict.items():
        setattr(current_user, key, value)

    current_user.updated_at = lambda: datetime.now(timezone.utc)
    await current_user.save()

    await log_service.log_user("update_profile", str(current_user.id), current_user, {
        "fields_updated": list(update_dict.keys())
    })

    return {}


async def deactivate_account(pass_data, current_user):
    if current_user.role.value == "admin":
        raise AppException(StatusCode.FORBIDDEN, "Admin cannot deactivate their own account")

    if not verify_password(pass_data.password, current_user.hashed_password):
        raise AppException(StatusCode.UNAUTHORIZED, "Incorrect password")

    current_user.is_activate = False
    current_user.updated_at = lambda: datetime.now(timezone.utc)
    await current_user.save()

    await log_service.log_user("deactivate_account", str(current_user.id), current_user)

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
        raise AppException(StatusCode.BAD_REQUEST, "Invalid user ID")

    user = await UserModel.get(oid)
    if not user:
        raise AppException(StatusCode.NOT_FOUND, "User not found")
    return user


async def update_user_by_admin(user_id: str, update_data, admin_user=None):
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

    await log_service.log_user("admin_update_user", user_id, admin_user, {
        "target_email": user.email,
        "fields_updated": list(update_dict.keys())
    })

    return user


async def delete_user_by_admin(user_id: str, admin_user=None):
    user = await get_user_by_id(user_id)

    await log_service.log_user("admin_delete_user", user_id, admin_user, {
        "target_email": user.email
    })

    await user.delete()
    return {}


async def toggle_user_status(user_id: str, is_active: bool, admin_user=None):
    user = await get_user_by_id(user_id)

    if user.role.value == "admin":
        raise AppException(StatusCode.FORBIDDEN, "Cannot change status of admin accounts")

    user.is_activate = is_active
    user.updated_at = lambda: datetime.now(timezone.utc)
    await user.save()

    action = "activate_user" if is_active else "deactivate_user"
    await log_service.log_user(action, user_id, admin_user, {
        "target_email": user.email,
        "new_status": "active" if is_active else "inactive"
    })

    return {
        "user_id": user_id,
        "is_active": is_active,
        "message": f"User {'activated' if is_active else 'deactivated'} successfully"
    }
