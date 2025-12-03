from enum import Enum


class StatusCode(int, Enum):
    # Mã Thành công (2xxx)
    SUCCESS = 2000
    CREATED = 2001

    # Lỗi Client/Xác thực (4xxx)
    BAD_REQUEST = 4000
    UNAUTHORIZED = 4001
    FORBIDDEN = 4003
    NOT_FOUND = 4004
    DUPLICATE_ENTRY = 4009
    UNSUPPORTED_TYPE = 4015
    VALIDATION_ERROR = 4220
    TOO_MANY_REQUESTS = 4290

    # Lỗi Nghiệp vụ (43xx)
    ALREADY_MEMBER = 4301
    NOT_A_MEMBER = 4302
    JOIN_REQUEST_EXISTS = 4303
    INVALID_CLASS_CODE = 4304
    DOCUMENT_ACCESS_DENIED = 4310

    # Lỗi Server/Hệ thống (5xxx)
    INTERNAL_SERVER_ERROR = 5000
    DATABASE_ERROR = 5001
    FILE_PROCESSING_ERROR = 5002
    EXTERNAL_API_ERROR = 5003


# Map các mã lỗi với thông báo mặc định
STATUS_MESSAGES = {
    StatusCode.SUCCESS: "Success",
    StatusCode.CREATED: "Success",

    StatusCode.BAD_REQUEST: "Invalid data",
    StatusCode.UNAUTHORIZED: "Auth Failed",
    StatusCode.FORBIDDEN: "Not have permission to action",
    StatusCode.NOT_FOUND: "No data found",
    StatusCode.DUPLICATE_ENTRY: "Data already exists",
    StatusCode.UNSUPPORTED_TYPE: "Unsupported type",

    StatusCode.INTERNAL_SERVER_ERROR: "Server error",
    StatusCode.DATABASE_ERROR: "Database error",
}