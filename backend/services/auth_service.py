from beanie import PydanticObjectId
from core.jwt import create_access_token, create_refresh_token, decode_token
from core.security import get_password_hash, verify_password
from models.user_model import UserModel
from schemas.base_schema import TokenResponse
from core.exception_handler import AppException
from core.status_code import StatusCode


async def register(user_in):
    exists = await UserModel.find_one({"email": user_in.email})
    if exists:
        raise AppException(StatusCode.BAD_REQUEST, "Tài khoản đã tồn tại")

    hashed = get_password_hash(user_in.password)
    user = UserModel(
        username=user_in.username,
        email=user_in.email,
        full_name=user_in.full_name,
        hashed_password=hashed,
        role=user_in.role,
        dob=user_in.dob,
        phone_number=user_in.phone_number,
    )
    await user.insert()
    return {}


async def login(login_data):
    identifier = login_data.login_identifier
    if "@" in identifier:
        query = {"email": identifier}
    else:
        query = {"username": identifier}

    user = await UserModel.find_one(query)

    if not user or not verify_password(login_data.password, user.hashed_password):
        raise AppException(StatusCode.UNAUTHORIZED, "Tài khoản hoặc mật khẩu không chính xác")

    access = create_access_token({"sub": str(user.id), "role": user.role})
    refresh = create_refresh_token({"sub": str(user.id)})

    return TokenResponse(access_token=access, refresh_token=refresh, role=user.role)


async def refresh_token(token: str):
    try:
        payload = decode_token(token)
        if payload.get("type") != "refresh":
            raise AppException(StatusCode.UNAUTHORIZED, "Token không hợp lệ")

        user_id = payload.get("sub")
        if not user_id:
            raise AppException(StatusCode.UNAUTHORIZED, "Token không hợp lệ")
    except Exception:
        raise AppException(StatusCode.UNAUTHORIZED, "Token không hợp lệ hoặc đã hết hạn")

    try:
        obj_id = PydanticObjectId(user_id)
    except:
        raise AppException(StatusCode.UNAUTHORIZED, "Token không hợp lệ")

    user = await UserModel.get(obj_id)
    if not user:
        raise AppException(StatusCode.UNAUTHORIZED, "Không tìm thấy người dùng")

    access = create_access_token({"sub": str(user.id), "role": user.role})
    return TokenResponse(access_token=access, refresh_token=token, role=user.role)
