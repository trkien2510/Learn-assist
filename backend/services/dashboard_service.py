from models.user_model import UserModel
from models.classroom_model import ClassroomModel
from models.document_model import DocumentModel
from models.exam_model import ExamModel
from models.question_model import QuestionModel
from models.result_model import ResultModel


async def get_admin_dashboard() -> dict:
    total_users = await UserModel.count()
    total_classrooms = await ClassroomModel.count()
    total_documents = await DocumentModel.count()
    total_exams = await ExamModel.count()
    total_questions = await QuestionModel.count()

    return {
        "total_users": total_users,
        "total_classrooms": total_classrooms,
        "total_documents": total_documents,
        "total_exams": total_exams,
        "total_questions": total_questions
    }


async def get_teacher_dashboard(current_user: UserModel) -> dict:
    user_id = current_user.id

    total_classrooms = await ClassroomModel.find(
        {"$or": [
            {"creator.$id": user_id},
            {"members.$id": user_id}
        ]}
    ).count()

    total_documents = await DocumentModel.find(
        {"creator.$id": user_id}
    ).count()

    total_questions = await QuestionModel.find(
        {"creator_id.$id": user_id}
    ).count()

    total_exams = await ExamModel.find(
        {"creator_id.$id": user_id}
    ).count()

    classrooms = await ClassroomModel.find(
        {"creator.$id": user_id}
    ).to_list()

    unique_student_ids = set()

    for classroom in classrooms:
        for ref in classroom.members:
            member_id = ref.ref.id
            unique_student_ids.add(str(member_id))

    total_students = len(unique_student_ids)

    return {
        "total_classrooms": total_classrooms,
        "total_documents": total_documents,
        "total_questions": total_questions,
        "total_exams": total_exams,
        "total_students": total_students
    }


async def get_student_dashboard(current_user: UserModel) -> dict:
    user_id = current_user.id

    total_classrooms = await ClassroomModel.find(
        {"members.$id": user_id}
    ).count()

    results = await ResultModel.find(
        {"user_id.$id": user_id, "submitted": True}
    ).to_list()

    total_exams_taken = len(results)

    if total_exams_taken > 0:
        total_score = sum(result.score for result in results)
        average_score = round(total_score / total_exams_taken, 2)
    else:
        average_score = 0

    return {
        "total_classrooms": total_classrooms,
        "total_exams_taken": total_exams_taken,
        "average_score": average_score
    }


async def get_dashboard(current_user: UserModel) -> dict:
    role = current_user.role

    if role == "admin":
        return await get_admin_dashboard()
    elif role == "teacher":
        return await get_teacher_dashboard(current_user)
    else:
        return await get_student_dashboard(current_user)
