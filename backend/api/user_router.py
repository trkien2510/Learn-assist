from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends
from core.dependencies import get_current_user
from core.security import verify_password
from schemas.user_schema import UserUpdate
from schemas.base_schema import BaseResponse
from models.user_model import UserModel

router = APIRouter()

@router.get("/me", response_model=BaseResponse[dict])
async def my_profile(current_user: UserModel = Depends(get_current_user)):
    return BaseResponse(data={
        "full_name": current_user.full_name,
        "email": current_user.email,
        "dob": current_user.dob,
        "role": current_user.role,
        "phone_number": current_user.phone_number,
        "created_at": current_user.created_at
    })

@router.put("/update_profile", response_model=BaseResponse[dict])
async def update_my_profile(update_data: UserUpdate, current_user: UserModel = Depends(get_current_user)):
    update_dict = update_data.model_dump(exclude_unset=True)

    if not verify_password(update_data.current_password, current_user.hashed_password):
        raise HTTPException(
            401,
            "Mật khẩu hiện tại không chính xác."
        )

    if not update_dict:
        raise HTTPException(400, "Không có dữ liệu để cập nhật")

    update_dict.pop("role", None)

    for key, value in update_dict.items():
        setattr(current_user, key, value)

    current_user.updated_at =lambda :datetime.now(timezone.utc)

    await current_user.save()

    return BaseResponse(data={})