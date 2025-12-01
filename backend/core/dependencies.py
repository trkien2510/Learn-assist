from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from jose import jwt, JWTError
from core.config import settings
from models.user_model import UserModel
from bson import ObjectId

bearer_scheme = HTTPBearer(auto_error=False)

async def get_current_user(cred: HTTPAuthorizationCredentials = Depends(bearer_scheme)):
    if not cred:
        raise HTTPException(status_code=401, detail="Thiếu token")

    try:
        payload = jwt.decode(cred.credentials, settings.SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Token sai hoặc hết hạn")

    user = await UserModel.get(ObjectId(user_id))
    if not user:
        raise HTTPException(status_code=404, detail="User không tồn tại")
    return user

async def require_admin(user: UserModel = Depends(get_current_user)):
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Chỉ admin mới có quyền")
    return user

async def require_owner_or_admin(user_id: str, current_user: UserModel = Depends(get_current_user)):
    if current_user.role == "admin" or str(current_user.id) == user_id:
        return current_user
    raise HTTPException(status_code=403, detail="Không có quyền")