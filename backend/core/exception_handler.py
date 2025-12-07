from fastapi import Request
from fastapi.responses import JSONResponse
from core.status_code import StatusCode, STATUS_MESSAGES


class AppException(Exception):
    def __init__(self, code: StatusCode, message: str = None):
        self.code = code
        self.message = message or STATUS_MESSAGES.get(code, "Lỗi không xác định")

    def to_response(self):
        return {
            "code": self.code,
            "message": self.message
        }


async def app_exception_handler(request: Request, exc: AppException):
    http_code_map = {
        StatusCode.SUCCESS: 200,
        StatusCode.CREATED: 201,
        StatusCode.BAD_REQUEST: 400,
        StatusCode.UNAUTHORIZED: 401,
        StatusCode.FORBIDDEN: 403,
        StatusCode.NOT_FOUND: 404,
        StatusCode.VALIDATION_ERROR: 422,
        StatusCode.TOO_MANY_REQUESTS: 429,
        StatusCode.INTERNAL_SERVER_ERROR: 500,
    }
    
    status_code = http_code_map.get(exc.code)
    
    if not status_code:
        if 4000 <= exc.code < 5000:
            status_code = 400
        elif 5000 <= exc.code < 6000:
            status_code = 500
        else:
            status_code = 400

    return JSONResponse(
        status_code=status_code,
        content=exc.to_response(),
    )
