import bcrypt
import hmac
import hashlib
from core.config import settings

def get_password_hash(password: str) -> str:
    pw_bytes = password.encode("utf-8")

    pre_hash = hmac.new(settings.SECRET_KEY.encode("utf-8"), pw_bytes, hashlib.sha256).digest()
    assert len(pre_hash) == 32

    salt = bcrypt.gensalt(rounds=12)
    bcrypt_hash = bcrypt.hashpw(pre_hash, salt)

    return f"hmac_sha256$12${bcrypt_hash.decode('ascii')}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    pw_bytes = plain_password.encode("utf-8")

    if hashed_password.startswith("hmac_sha256$"):
        parts = hashed_password.split("$", 3)
        if len(parts) != 4:
            return False
        bcrypt_part = parts[3]

        to_check = hmac.new(settings.SECRET_KEY.encode("utf-8"), pw_bytes, hashlib.sha256).digest()
        bcrypt_hash_bytes = f"${bcrypt_part}".encode("ascii")
    else:
        return False

    return bcrypt.checkpw(to_check, bcrypt_hash_bytes)