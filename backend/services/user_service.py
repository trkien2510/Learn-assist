from datetime import datetime, timezone
from core.security import verify_password
from core.exception_handler import AppException
from core.status_code import StatusCode
from models.user_model import UserModel, UserRole
from services import log_service
from services.email_service import send_account_notification_email


async def get_my_profile(current_user):
    return {
        "id": str(current_user.id),  # <-- ADDED THIS!
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


async def delete_account(pass_data, current_user, background_tasks=None):
    """Delete user account and all related data"""
    if current_user.role == UserRole.ADMIN:
        raise AppException(StatusCode.FORBIDDEN, "Admin cannot delete their own account")

    if not verify_password(pass_data.password, current_user.hashed_password):
        raise AppException(StatusCode.UNAUTHORIZED, "Incorrect password")

    user_id = str(current_user.id)
    user_email = current_user.email
    user_name = current_user.full_name

    # Import models để xóa dữ liệu liên quan
    from models.document_model import DocumentModel
    from models.question_model import QuestionModel
    from models.exam_model import ExamModel
    from models.classroom_model import ClassroomModel
    from models.notification_model import NotificationModel
    from models.log_model import LogModel
    from models.otp_model import OTPModel
    from beanie import PydanticObjectId

    try:
        obj_id = PydanticObjectId(user_id)
        
        # Xóa tất cả documents của user
        await DocumentModel.find(DocumentModel.uploader.id == obj_id).delete()
        
        # Xóa tất cả questions của user
        await QuestionModel.find(QuestionModel.creator.id == obj_id).delete()
        
        # Xóa tất cả exams của user
        await ExamModel.find(ExamModel.creator_id.id == obj_id).delete()
        
        # Xóa tất cả classrooms mà user tạo
        await ClassroomModel.find(ClassroomModel.creator.id == obj_id).delete()
        
        # Xóa tất cả notifications của user
        await NotificationModel.find(NotificationModel.user_id == user_id).delete()
        
        # Xóa tất cả logs của user
        await LogModel.find(LogModel.user_id == user_id).delete()
        
        # Xóa tất cả OTP của user
        await OTPModel.find(OTPModel.email == user_email).delete()
        
    except Exception as e:
        print(f"Error deleting related data: {e}")

    # Log trước khi xóa user
    await log_service.create_log(
        action="delete_own_account",
        resource_type="user",
        resource_id=user_id,
        details={"email": user_email},
        status="success"
    )

    # Xóa user
    await current_user.delete()

    # Gửi email thông báo
    if background_tasks:
        background_tasks.add_task(
            send_account_notification_email,
            email=user_email,
            full_name=user_name,
            notification_type="self_deleted"
        )

    return {}


async def get_all_users(page: int = 1, page_size: int = 20, role: str = None, is_active: str = None, search: str = None):
    if page < 1:
        page = 1
    if page_size < 1 or page_size > 100:
        page_size = 20

    skip = (page - 1) * page_size

    query_conditions = []
    
    if role:
        try:
            role_enum = UserRole(role)
            query_conditions.append(UserModel.role == role_enum)
        except ValueError:
            # Nếu role truyền vào không hợp lệ trong Enum, có thể bỏ qua hoặc báo lỗi
            pass
    
    if is_active is not None and is_active != '':
        is_active_bool = is_active.lower() == 'true' if isinstance(is_active, str) else is_active
        query_conditions.append(UserModel.is_activate == is_active_bool)
    
    if search:
        from beanie.operators import Or, RegEx
        search_pattern = f".*{search}.*"
        query_conditions.append(Or(
            RegEx(UserModel.email, search_pattern, options="i"),
            RegEx(UserModel.full_name, search_pattern, options="i")
        ))
    
    if query_conditions:
        if len(query_conditions) == 1:
            query = UserModel.find(query_conditions[0])
        else:
            from beanie.operators import And
            query = UserModel.find(And(*query_conditions))
    else:
        query = UserModel.find_all()
    
    query = query.sort([("created_at", -1)])
    
    total = await query.count()
    items = await query.skip(skip).limit(page_size).to_list()

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

    if admin_user and str(user.id) == str(admin_user.id):
        raise AppException(StatusCode.FORBIDDEN, "Không thể chỉnh sửa tài khoản của chính mình")

    if user.role == "admin" or (hasattr(user.role, 'value') and user.role.value == "admin"):
        raise AppException(StatusCode.FORBIDDEN, "Không thể chỉnh sửa tài khoản admin khác")

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


async def delete_user_by_admin(user_id: str, admin_user=None, background_tasks=None):
    user = await get_user_by_id(user_id)

    if admin_user and str(user.id) == str(admin_user.id):
        raise AppException(StatusCode.FORBIDDEN, "Không thể xóa tài khoản của chính mình")

    if user.role == "admin" or (hasattr(user.role, 'value') and user.role.value == "admin"):
        raise AppException(StatusCode.FORBIDDEN, "Không thể xóa tài khoản admin khác")

    await log_service.log_user("admin_delete_user", user_id, admin_user, {
        "target_email": user.email
    })

    user_email = user.email
    user_name = user.full_name

    await user.delete()

    if background_tasks:
        background_tasks.add_task(
            send_account_notification_email,
            email=user_email,
            full_name=user_name,
            notification_type="account_deleted"
        )

    return {}


async def toggle_user_status(user_id: str, is_active: bool, admin_user=None, background_tasks=None):
    user = await get_user_by_id(user_id)

    if admin_user and str(user.id) == str(admin_user.id):
        raise AppException(StatusCode.FORBIDDEN, "Không thể thay đổi trạng thái tài khoản của chính mình")

    if user.role == "admin" or (hasattr(user.role, 'value') and user.role.value == "admin"):
        raise AppException(StatusCode.FORBIDDEN, "Không thể thay đổi trạng thái tài khoản admin")

    user.is_activate = is_active
    user.updated_at = datetime.now(timezone.utc)
    await user.save()

    action = "activate_user" if is_active else "deactivate_user"
    await log_service.log_user(action, user_id, admin_user, {
        "target_email": user.email,
        "new_status": "active" if is_active else "inactive"
    })

    if background_tasks:
        notification_type = "account_activated" if is_active else "account_deactivated"
        background_tasks.add_task(
            send_account_notification_email,
            email=user.email,
            full_name=user.full_name,
            notification_type=notification_type
        )

    return {
        "user_id": user_id,
        "is_active": is_active,
        "message": f"User {'activated' if is_active else 'deactivated'} successfully"
    }
