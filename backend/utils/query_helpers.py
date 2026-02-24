from typing import List, Dict, Any, Set
from beanie import PydanticObjectId

from models.question_model import QuestionModel
from models.user_model import UserModel
from models.exam_model import ExamModel
from models.classroom_model import ClassroomModel
from models.result_model import ResultModel


def get_id_from_link(link_obj) -> PydanticObjectId:
    if hasattr(link_obj, 'ref') and link_obj.ref:
        return link_obj.ref.id
    elif hasattr(link_obj, 'id'):
        return link_obj.id
    return link_obj


async def batch_fetch_questions(question_links: List) -> Dict[PydanticObjectId, QuestionModel]:
    if not question_links:
        return {}
    
    question_ids = [get_id_from_link(q) for q in question_links]
    questions = await QuestionModel.find(
        {"_id": {"$in": question_ids}}
    ).to_list()
    
    return {q.id: q for q in questions}


async def batch_fetch_users(user_ids: List[PydanticObjectId]) -> Dict[PydanticObjectId, UserModel]:
    if not user_ids:
        return {}
    
    unique_ids = list(set(user_ids))
    users = await UserModel.find(
        {"_id": {"$in": unique_ids}}
    ).to_list()
    
    return {u.id: u for u in users}


async def batch_fetch_users_from_links(member_links: List) -> Dict[PydanticObjectId, UserModel]:
    if not member_links:
        return {}
    
    user_ids = [get_id_from_link(m) for m in member_links]
    return await batch_fetch_users(user_ids)


async def batch_fetch_exams(exam_ids: List[PydanticObjectId]) -> Dict[PydanticObjectId, ExamModel]:
    if not exam_ids:
        return {}
    
    unique_ids = list(set(exam_ids))
    exams = await ExamModel.find(
        {"_id": {"$in": unique_ids}}
    ).to_list()
    
    return {e.id: e for e in exams}


async def batch_fetch_classrooms(class_ids: List[PydanticObjectId]) -> Dict[PydanticObjectId, ClassroomModel]:
    if not class_ids:
        return {}
    
    unique_ids = list(set(class_ids))
    classrooms = await ClassroomModel.find(
        {"_id": {"$in": unique_ids}}
    ).to_list()
    
    return {c.id: c for c in classrooms}


def format_question_for_response(question: QuestionModel, include_answer: bool = True) -> Dict[str, Any]:
    result = {
        "id": str(question.id),
        "_id": str(question.id),
        "content": question.content,
        "options": question.options,
        "difficulty": question.difficulty.value if hasattr(question.difficulty, 'value') else str(question.difficulty)
    }
    if include_answer:
        result["answers"] = question.answers
    return result


async def get_questions_data_optimized(question_links: List, include_answer: bool = True) -> List[Dict[str, Any]]:
    if not question_links:
        return []
    
    questions_map = await batch_fetch_questions(question_links)
    
    questions_data = []
    for q_link in question_links:
        q_id = get_id_from_link(q_link)
        question = questions_map.get(q_id)
        if question:
            questions_data.append(format_question_for_response(question, include_answer))
    
    return questions_data


async def get_submitted_exam_ids_for_user(exam_ids: List[PydanticObjectId], user_id: PydanticObjectId) -> Set[str]:
    if not exam_ids:
        return set()
    
    submitted_results = await ResultModel.find({
        "exam_id.$id": {"$in": exam_ids},
        "user_id.$id": user_id,
        "submitted": True
    }).to_list()
    
    return {
        str(get_id_from_link(r.exam_id)) 
        for r in submitted_results
    }
