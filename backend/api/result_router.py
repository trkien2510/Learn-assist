from fastapi import APIRouter

from schemas.base_schema import BaseResponse

router = APIRouter()

@router.get("/result", response_model=BaseResponse)
async def get_result_by_exam_id():

    return BaseResponse()

@router.delete("/result", response_model=BaseResponse)
async def delete_result_by_exam_id():

    return BaseResponse()