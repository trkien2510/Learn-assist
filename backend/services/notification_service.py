from datetime import datetime, timezone
from typing import List, Optional, Dict, Any

from beanie import PydanticObjectId
from models.notification_model import NotificationModel, NotificationType
from models.user_model import UserModel, UserRole
from models.classroom_model import ClassroomModel
from models.exam_model import ExamModel
from core.exception_handler import AppException
from core.status_code import StatusCode


# ===== Core Functions =====

async def create_notification(
    user: UserModel,
    notification_type: NotificationType,
    title: str,
    message: str,
    related_id: str = None,
    related_type: str = None
):
    """Create a single notification for a user."""
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
    """Create notifications for multiple users."""
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
    """Get notifications for the current user."""
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
    
    # Get unread count
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
    """Mark notifications as read. If notification_ids is None, mark all as read."""
    if notification_ids is None:
        # Mark all as read
        result = await NotificationModel.find({
            "user_id.$id": current_user.id,
            "is_read": False
        }).update({"$set": {"is_read": True}})
        return {"marked_count": result.modified_count if result else 0}
    else:
        # Mark specific notifications as read
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
    """Delete a notification."""
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
    """Delete all notifications for the current user."""
    result = await NotificationModel.find({"user_id.$id": current_user.id}).delete()
    return {"deleted_count": result.deleted_count if result else 0}


async def get_unread_count(current_user: UserModel):
    """Get unread notification count."""
    count = await NotificationModel.find({
        "user_id.$id": current_user.id,
        "is_read": False
    }).count()
    return {"unread_count": count}


# ===== Student Notifications =====

async def notify_students_exam_created(exam: ExamModel, classroom: ClassroomModel, creator_name: str):
    """Notify all students in a classroom when a new exam is created."""
    students = []
    for member_link in classroom.members:
        member = await UserModel.get(member_link.ref.id)
        if member and member.role == UserRole.STUDENT:
            students.append(member)
    
    if students:
        await create_bulk_notifications(
            users=students,
            notification_type=NotificationType.EXAM_CREATED,
            title=f"New exam: {exam.title}",
            message=f"Teacher {creator_name} has created a new exam '{exam.title}' in class '{classroom.name}'. The exam starts at {exam.start_at.strftime('%Y-%m-%d %H:%M')} and ends at {exam.end_at.strftime('%Y-%m-%d %H:%M')}.",
            related_id=str(exam.id),
            related_type="exam"
        )
    
    return len(students)


async def notify_student_exam_started(user: UserModel, exam: ExamModel, classroom_name: str):
    """Notify a student that they have started an exam."""
    await create_notification(
        user=user,
        notification_type=NotificationType.EXAM_STARTED,
        title=f"Exam started: {exam.title}",
        message=f"You have started the exam '{exam.title}' in class '{classroom_name}'. You have {exam.duration} minutes to complete it. Good luck!",
        related_id=str(exam.id),
        related_type="exam"
    )


async def notify_student_exam_submitted(user: UserModel, exam: ExamModel, score: float, correct_count: int, total_questions: int):
    """Notify a student about their exam result after submission."""
    await create_notification(
        user=user,
        notification_type=NotificationType.EXAM_RESULT,
        title=f"Exam result: {exam.title}",
        message=f"You have completed the exam '{exam.title}'. Your score: {score}/10 ({correct_count}/{total_questions} correct answers).",
        related_id=str(exam.id),
        related_type="exam"
    )


# ===== Teacher Notifications =====

async def notify_teacher_document_upload_success(user: UserModel, document_name: str, document_id: str, question_count: int):
    """Notify teacher when document upload and question generation is successful."""
    await create_notification(
        user=user,
        notification_type=NotificationType.DOCUMENT_UPLOAD_SUCCESS,
        title=f"Document uploaded: {document_name}",
        message=f"Your document '{document_name}' has been uploaded and processed successfully. {question_count} questions have been generated.",
        related_id=document_id,
        related_type="document"
    )


async def notify_teacher_document_upload_failed(user: UserModel, document_name: str, error_message: str):
    """Notify teacher when document upload fails."""
    await create_notification(
        user=user,
        notification_type=NotificationType.DOCUMENT_UPLOAD_FAILED,
        title=f"Document upload failed: {document_name}",
        message=f"Failed to upload or process document '{document_name}'. Error: {error_message}",
        related_id=None,
        related_type="document"
    )


async def notify_teacher_exam_created(user: UserModel, exam: ExamModel, classroom_name: str, question_count: int):
    """Notify teacher that exam was created successfully."""
    await create_notification(
        user=user,
        notification_type=NotificationType.EXAM_CREATION_SUCCESS,
        title=f"Exam created: {exam.title}",
        message=f"Your exam '{exam.title}' has been created successfully in class '{classroom_name}' with {question_count} questions. It will start at {exam.start_at.strftime('%Y-%m-%d %H:%M')}.",
        related_id=str(exam.id),
        related_type="exam"
    )


async def notify_teacher_exam_ended(user: UserModel, exam: ExamModel, classroom_name: str, participant_count: int):
    """Notify teacher when their exam has ended and statistics are available."""
    await create_notification(
        user=user,
        notification_type=NotificationType.EXAM_STATISTICS_AVAILABLE,
        title=f"Exam ended: {exam.title}",
        message=f"The exam '{exam.title}' in class '{classroom_name}' has ended. {participant_count} students participated. You can now view the statistics.",
        related_id=str(exam.id),
        related_type="exam"
    )


# ===== Admin Notifications =====

async def notify_admins_system_error(error_type: str, error_message: str, details: Dict[str, Any] = None):
    """Notify all admins about a system error."""
    admins = await UserModel.find(UserModel.role == UserRole.ADMIN).to_list()
    
    if admins:
        detail_str = ""
        if details:
            detail_str = " Details: " + str(details)
        
        await create_bulk_notifications(
            users=admins,
            notification_type=NotificationType.SYSTEM_ERROR,
            title=f"System Error: {error_type}",
            message=f"A system error has occurred: {error_message}.{detail_str}",
            related_id=None,
            related_type="system"
        )
    
    return len(admins)


async def notify_admins_system_warning(warning_type: str, warning_message: str, details: Dict[str, Any] = None):
    """Notify all admins about a system warning."""
    admins = await UserModel.find(UserModel.role == UserRole.ADMIN).to_list()
    
    if admins:
        detail_str = ""
        if details:
            detail_str = " Details: " + str(details)
        
        await create_bulk_notifications(
            users=admins,
            notification_type=NotificationType.SYSTEM_WARNING,
            title=f"System Warning: {warning_type}",
            message=f"Warning: {warning_message}.{detail_str}",
            related_id=None,
            related_type="system"
        )
    
    return len(admins)


async def notify_admins_user_anomaly(user_id: str, anomaly_type: str, description: str):
    """Notify admins about user anomaly (suspicious activity)."""
    admins = await UserModel.find(UserModel.role == UserRole.ADMIN).to_list()
    
    if admins:
        await create_bulk_notifications(
            users=admins,
            notification_type=NotificationType.USER_ANOMALY,
            title=f"User Anomaly Detected: {anomaly_type}",
            message=f"Suspicious activity detected for user {user_id}: {description}",
            related_id=user_id,
            related_type="user"
        )
    
    return len(admins)


async def notify_admins_high_error_rate(error_count: int, time_period: str, affected_service: str = None):
    """Notify admins when error rate is high."""
    admins = await UserModel.find(UserModel.role == UserRole.ADMIN).to_list()
    
    if admins:
        service_str = f" in {affected_service}" if affected_service else ""
        
        await create_bulk_notifications(
            users=admins,
            notification_type=NotificationType.HIGH_ERROR_RATE,
            title=f"High Error Rate Alert",
            message=f"High error rate detected{service_str}: {error_count} errors in the last {time_period}. Please investigate.",
            related_id=None,
            related_type="system"
        )
    
    return len(admins)


# ===== Cleanup Functions =====

async def cleanup_old_notifications(days: int = 30):
    """Delete notifications older than specified days."""
    from datetime import timedelta
    cutoff_date = datetime.now(timezone.utc) - timedelta(days=days)
    result = await NotificationModel.find(NotificationModel.created_at < cutoff_date).delete()
    return {"deleted_count": result.deleted_count if result else 0}
