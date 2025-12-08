from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from core.config import settings
from models.user_model import UserModel
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
    return user