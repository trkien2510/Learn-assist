import re
from beanie import PydanticObjectId
from bson import ObjectId
from core.exception_handler import AppException
from core.status_code import StatusCode


def validate_object_id(value: str, field_name: str = "ID") -> PydanticObjectId:
    if not value:
        raise AppException(StatusCode.BAD_REQUEST, f"Invalid {field_name}: empty value")
    
    if not isinstance(value, str):
        raise AppException(StatusCode.BAD_REQUEST, f"Invalid {field_name}: must be string")
    
    value = value.strip()
    
    if not ObjectId.is_valid(value):
        raise AppException(StatusCode.BAD_REQUEST, f"Invalid {field_name} format")
    
    try:
        return PydanticObjectId(value)
    except Exception:
        raise AppException(StatusCode.BAD_REQUEST, f"Invalid {field_name}")


def sanitize_string(value: str, max_length: int = 1000) -> str:
    if not value:
        return ""
    
    if not isinstance(value, str):
        return str(value)
    
    value = value.strip()
    
    if len(value) > max_length:
        value = value[:max_length]
    
    dangerous_patterns = [
        r'\$where',
        r'\$regex',
        r'\$ne',
        r'\$gt',
        r'\$gte',
        r'\$lt',
        r'\$lte',
        r'\$in',
        r'\$nin',
        r'\$or',
        r'\$and',
        r'\$not',
        r'\$nor',
        r'\$exists',
        r'\$type',
        r'\$mod',
        r'\$text',
        r'\$expr',
    ]
    
    for pattern in dangerous_patterns:
        if re.search(pattern, value, re.IGNORECASE):
            value = re.sub(pattern, '', value, flags=re.IGNORECASE)
    
    return value


def sanitize_query_params(params: dict) -> dict:
    sanitized = {}
    for key, value in params.items():
        if isinstance(value, str):
            sanitized[key] = sanitize_string(value)
        elif isinstance(value, dict):
            sanitized[key] = sanitize_query_params(value)
        elif isinstance(value, list):
            sanitized[key] = [
                sanitize_string(v) if isinstance(v, str) else v 
                for v in value
            ]
        else:
            sanitized[key] = value
    return sanitized


def validate_pagination(page: int, page_size: int, max_page_size: int = 100) -> tuple:
    if page < 1:
        page = 1
    if page_size < 1:
        page_size = 10
    if page_size > max_page_size:
        page_size = max_page_size
    return page, page_size


def validate_email(email: str) -> str:
    email = email.strip().lower()
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_pattern, email):
        raise AppException(StatusCode.BAD_REQUEST, "Invalid email format")
    return email
