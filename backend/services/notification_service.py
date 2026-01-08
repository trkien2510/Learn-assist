from datetime import datetime, timezone
from typing import List, Optional, Dict, Any

from beanie import PydanticObjectId
from models.notification_model import NotificationModel, NotificationType
from models.user_model import UserModel, UserRole
from models.classroom_model import ClassroomModel
from models.exam_model import ExamModel
from core.exception_handler import AppException
from core.status_code import StatusCode

async def create_notification(
    user: UserModel,
    notification_type: NotificationType,
    title: str,
    message: str,
    related_id: str = None,
    related_type: str = None
):
    notification = NotificationModel(
        user_id=user,
        notification_type=notification_type,
        title=title,
        message=message,
        related_id=related_id,
        related_type=related_type
    )
    await notification.insert()
    return notification


async def create_bulk_notifications(
    users: List[UserModel],
    notification_type: NotificationType,
    title: str,
    message: str,
    related_id: str = None,
    related_type: str = None
):
    notifications = []
    for user in users:
        notification = NotificationModel(
            user_id=user,
            notification_type=notification_type,
            title=title,
            message=message,
            related_id=related_id,
            related_type=related_type
        )
        notifications.append(notification)
    
    if notifications:
        await NotificationModel.insert_many(notifications)
    return len(notifications)


async def get_user_notifications(
    current_user: UserModel,
    page: int = 1,
    page_size: int = 20,
    unread_only: bool = False
):
    if page < 1:
        page = 1
    if page_size < 1 or page_size > 100:
        page_size = 20
    
    skip = (page - 1) * page_size
    
    query_conditions = {"user_id.$id": current_user.id}
    if unread_only:
        query_conditions["is_read"] = False
    
    query = NotificationModel.find(query_conditions).sort([("created_at", -1)])
    
    total = await query.count()
    items = await query.skip(skip).limit(page_size).to_list()
    
    unread_count = await NotificationModel.find({
        "user_id.$id": current_user.id,
        "is_read": False
    }).count()
    
    total_pages = (total + page_size - 1) // page_size
    
    return {
        "items": items,
        "total": total,
        "unread_count": unread_count,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
        "has_next": page < total_pages,
        "has_previous": page > 1
    }


async def mark_as_read(current_user: UserModel, notification_ids: List[str] = None):
    if notification_ids is None:
        result = await NotificationModel.find({
            "user_id.$id": current_user.id,
            "is_read": False
        }).update({"$set": {"is_read": True}})
        return {"marked_count": result.modified_count if result else 0}
    else:
        obj_ids = []
        for nid in notification_ids:
            try:
                obj_ids.append(PydanticObjectId(nid))
            except:
                pass
        
        if obj_ids:
            result = await NotificationModel.find({
                "_id": {"$in": obj_ids},
                "user_id.$id": current_user.id
            }).update({"$set": {"is_read": True}})
            return {"marked_count": result.modified_count if result else 0}
        
        return {"marked_count": 0}


async def delete_notification(notification_id: str, current_user: UserModel):
    try:
        obj_id = PydanticObjectId(notification_id)
    except:
        raise AppException(StatusCode.BAD_REQUEST, "Invalid notification ID")
    
    notification = await NotificationModel.get(obj_id)
    if not notification:
        raise AppException(StatusCode.NOT_FOUND, "Notification not found")
    
    if notification.user_id.ref.id != current_user.id:
        raise AppException(StatusCode.FORBIDDEN, "Permission denied")
    
    await notification.delete()
    return {}


async def delete_all_notifications(current_user: UserModel):
    result = await NotificationModel.find({"user_id.$id": current_user.id}).delete()
    return {"deleted_count": result.deleted_count if result else 0}


async def get_unread_count(current_user: UserModel):
    count = await NotificationModel.find({
        "user_id.$id": current_user.id,
        "is_read": False
    }).count()
    return {"unread_count": count}

async def notify_students_exam_created(exam: ExamModel, classroom: ClassroomModel, creator_name: str):
    students = []
    for member_link in classroom.members:
        member = await UserModel.get(member_link.ref.id)
        if member and member.role == UserRole.STUDENT:
            students.append(member)
    
    if students:
        await create_bulk_notifications(
            users=students,
            notification_type=NotificationType.EXAM_CREATED,
            title=f"Bài thi mới: {exam.title}",
            message=f"Giáo viên {creator_name} đã tạo bài thi mới '{exam.title}' trong lớp '{classroom.name}'. Bài thi bắt đầu lúc {exam.start_at.strftime('%Y-%m-%d %H:%M')} và kết thúc lúc {exam.end_at.strftime('%Y-%m-%d %H:%M')}.",
            related_id=str(exam.id),
            related_type="exam"
        )
    
    return len(students)


async def notify_student_exam_started(user: UserModel, exam: ExamModel, classroom_name: str):
    await create_notification(
        user=user,
        notification_type=NotificationType.EXAM_STARTED,
        title=f"Bắt đầu làm bài: {exam.title}",
        message=f"Bạn đã bắt đầu làm bài thi '{exam.title}' trong lớp '{classroom_name}'. Bạn có {exam.duration} phút để hoàn thành. Chúc bạn làm bài tốt!",
        related_id=str(exam.id),
        related_type="exam"
    )


async def notify_student_exam_submitted(user: UserModel, exam: ExamModel, score: float, correct_count: int, total_questions: int):
    await create_notification(
        user=user,
        notification_type=NotificationType.EXAM_RESULT,
        title=f"Kết quả bài thi: {exam.title}",
        message=f"Bạn đã hoàn thành bài thi '{exam.title}'. Điểm số: {score}/10 ({correct_count}/{total_questions} câu đúng).",
        related_id=str(exam.id),
        related_type="exam"
    )


async def notify_student_exam_auto_submitted(user: UserModel, exam: ExamModel, score: float, correct_count: int, total_questions: int):
    await create_notification(
        user=user,
        notification_type=NotificationType.EXAM_RESULT,
        title=f"Bài thi tự động nộp: {exam.title}",
        message=f"Bài thi '{exam.title}' của bạn đã được tự động nộp do vượt quá thời gian làm bài. Điểm số: {score}/10 ({correct_count}/{total_questions} câu đúng).",
        related_id=str(exam.id),
        related_type="exam"
    )

async def notify_teacher_document_upload_success(user: UserModel, document_name: str, document_id: str, question_count: int):
    await create_notification(
        user=user,
        notification_type=NotificationType.DOCUMENT_UPLOAD_SUCCESS,
        title=f"Tải tài liệu thành công: {document_name}",
        message=f"Tài liệu '{document_name}' của bạn đã được tải lên và xử lý thành công. {question_count} câu hỏi đã được tạo.",
        related_id=document_id,
        related_type="document"
    )


async def notify_teacher_document_upload_failed(user: UserModel, document_name: str, error_message: str):
    await create_notification(
        user=user,
        notification_type=NotificationType.DOCUMENT_UPLOAD_FAILED,
        title=f"Tải tài liệu thất bại: {document_name}",
        message=f"Không thể tải lên hoặc xử lý tài liệu '{document_name}'. Lỗi: {error_message}",
        related_id=None,
        related_type="document"
    )


async def notify_document_upload_success(user: UserModel, document_name: str, document_id: str, question_count: int):
    await create_notification(
        user=user,
        notification_type=NotificationType.DOCUMENT_UPLOAD_SUCCESS,
        title=f"Tải tài liệu thành công: {document_name}",
        message=f"Tài liệu '{document_name}' của bạn đã được tải lên và xử lý thành công. {question_count} câu hỏi đã được tạo.",
        related_id=document_id,
        related_type="document"
    )


async def notify_document_upload_failed(user: UserModel, document_name: str, error_message: str):
    await create_notification(
        user=user,
        notification_type=NotificationType.DOCUMENT_UPLOAD_FAILED,
        title=f"Tải tài liệu thất bại: {document_name}",
        message=f"Không thể tải lên hoặc xử lý tài liệu '{document_name}'. Lỗi: {error_message}",
        related_id=None,
        related_type="document"
    )


async def notify_teacher_exam_created(user: UserModel, exam: ExamModel, classroom_name: str, question_count: int):
    await create_notification(
        user=user,
        notification_type=NotificationType.EXAM_CREATION_SUCCESS,
        title=f"Tạo bài thi thành công: {exam.title}",
        message=f"Bài thi '{exam.title}' của bạn đã được tạo thành công trong lớp '{classroom_name}' với {question_count} câu hỏi. Bài thi sẽ bắt đầu lúc {exam.start_at.strftime('%Y-%m-%d %H:%M')}.",
        related_id=str(exam.id),
        related_type="exam"
    )


async def notify_teacher_exam_ended(user: UserModel, exam: ExamModel, classroom_name: str, participant_count: int):
    await create_notification(
        user=user,
        notification_type=NotificationType.EXAM_STATISTICS_AVAILABLE,
        title=f"Bài thi đã kết thúc: {exam.title}",
        message=f"Bài thi '{exam.title}' trong lớp '{classroom_name}' đã kết thúc. Có {participant_count} học sinh tham gia. Bạn có thể xem thống kê ngay bây giờ.",
        related_id=str(exam.id),
        related_type="exam"
    )

async def notify_personal_exam_created(user: UserModel, exam: ExamModel, question_count: int):
    await create_notification(
        user=user,
        notification_type=NotificationType.EXAM_CREATION_SUCCESS,
        title=f"Tạo bài thi cá nhân thành công: {exam.title}",
        message=f"Bài thi thực hành cá nhân '{exam.title}' của bạn đã được tạo với {question_count} câu hỏi. Thời gian: {exam.duration} phút. Bạn có thể bắt đầu luyện tập bất cứ lúc nào!",
        related_id=str(exam.id),
        related_type="exam"
    )


async def notify_admins_system_error(error_type: str, error_message: str, details: Dict[str, Any] = None):
    admins = await UserModel.find(UserModel.role == UserRole.ADMIN).to_list()
    
    if admins:
        detail_str = ""
        if details:
            detail_str = " Chi tiết: " + str(details)
        
        await create_bulk_notifications(
            users=admins,
            notification_type=NotificationType.SYSTEM_ERROR,
            title=f"Lỗi hệ thống: {error_type}",
            message=f"Đã xảy ra lỗi hệ thống: {error_message}.{detail_str}",
            related_id=None,
            related_type="system"
        )
    
    return len(admins)


async def notify_admins_system_warning(warning_type: str, warning_message: str, details: Dict[str, Any] = None):
    admins = await UserModel.find(UserModel.role == UserRole.ADMIN).to_list()
    
    if admins:
        detail_str = ""
        if details:
            detail_str = " Chi tiết: " + str(details)
        
        await create_bulk_notifications(
            users=admins,
            notification_type=NotificationType.SYSTEM_WARNING,
            title=f"Cảnh báo hệ thống: {warning_type}",
            message=f"Cảnh báo: {warning_message}.{detail_str}",
            related_id=None,
            related_type="system"
        )
    
    return len(admins)


async def notify_admins_user_anomaly(user_id: str, anomaly_type: str, description: str):
    admins = await UserModel.find(UserModel.role == UserRole.ADMIN).to_list()
    
    if admins:
        await create_bulk_notifications(
            users=admins,
            notification_type=NotificationType.USER_ANOMALY,
            title=f"Phát hiện bất thường từ người dùng: {anomaly_type}",
            message=f"Phát hiện hoạt động đáng ngờ từ người dùng {user_id}: {description}",
            related_id=user_id,
            related_type="user"
        )
    
    return len(admins)


async def notify_admins_high_error_rate(error_count: int, time_period: str, affected_service: str = None):
    admins = await UserModel.find(UserModel.role == UserRole.ADMIN).to_list()
    
    if admins:
        service_str = f" trong {affected_service}" if affected_service else ""
        
        await create_bulk_notifications(
            users=admins,
            notification_type=NotificationType.HIGH_ERROR_RATE,
            title=f"Cảnh báo tỷ lệ lỗi cao",
            message=f"Phát hiện tỷ lệ lỗi cao{service_str}: {error_count} lỗi trong {time_period} vừa qua. Vui lòng kiểm tra.",
            related_id=None,
            related_type="system"
        )
    
    return len(admins)


async def cleanup_old_notifications(days: int = 30):
    from datetime import timedelta
    cutoff_date = datetime.now(timezone.utc) - timedelta(days=days)
    result = await NotificationModel.find(NotificationModel.created_at < cutoff_date).delete()
    return {"deleted_count": result.deleted_count if result else 0}
