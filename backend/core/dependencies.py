from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from core.config import settings
from models.user_model import UserModel, UserRole
from bson import ObjectId

bearer_scheme = HTTPBearer(auto_error=False)

async def get_current_user(cred: HTTPAuthorizationCredentials = Depends(bearer_scheme)):
    if not cred:
        raise HTTPException(status_code=401, detail="Missing token")

    try:
        payload = jwt.decode(cred.credentials, settings.SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = await UserModel.get(ObjectId(user_id))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not user.is_activate:
        raise HTTPException(status_code=403, detail="Account deactivated")
        
    return user


async def get_current_admin(current_user: UserModel = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


async def get_current_teacher(current_user: UserModel = Depends(get_current_user)):
    if current_user.role not in [UserRole.ADMIN, UserRole.TEACHER]:
        raise HTTPException(status_code=403, detail="Teacher access required")
    return current_user