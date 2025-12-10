from enum import Enum


class StatusCode(int, Enum):
    # Success codes (2xxx)
    SUCCESS = 2000
    CREATED = 2001

    # Client/Authentication errors (4xxx)
    BAD_REQUEST = 4000
    UNAUTHORIZED = 4001
    FORBIDDEN = 4003
    NOT_FOUND = 4004
    DUPLICATE_ENTRY = 4009
    UNSUPPORTED_TYPE = 4015
    VALIDATION_ERROR = 4220
    TOO_MANY_REQUESTS = 4290

    # Business logic errors (43xx)
    ALREADY_MEMBER = 4301
    NOT_A_MEMBER = 4302
    JOIN_REQUEST_EXISTS = 4303
    INVALID_CLASS_CODE = 4304
    DOCUMENT_ACCESS_DENIED = 4310
    
    # OTP errors (44xx)
    OTP_INVALID = 4401
    OTP_EXPIRED = 4402

    # Server/System errors (5xxx)
    INTERNAL_SERVER_ERROR = 5000
    DATABASE_ERROR = 5001
    FILE_PROCESSING_ERROR = 5002
    EXTERNAL_API_ERROR = 5003


STATUS_MESSAGES = {
    StatusCode.SUCCESS: "Success",
    StatusCode.CREATED: "Created successfully",

    StatusCode.BAD_REQUEST: "Invalid request data",
    StatusCode.UNAUTHORIZED: "Authentication failed",
    StatusCode.FORBIDDEN: "Permission denied",
    StatusCode.NOT_FOUND: "Resource not found",
    StatusCode.DUPLICATE_ENTRY: "Resource already exists",
    StatusCode.UNSUPPORTED_TYPE: "Unsupported data type",
    StatusCode.VALIDATION_ERROR: "Validation error",
    StatusCode.TOO_MANY_REQUESTS: "Too many requests",

    StatusCode.ALREADY_MEMBER: "User is already a member of this class",
    StatusCode.NOT_A_MEMBER: "User is not a member of this class",
    StatusCode.JOIN_REQUEST_EXISTS: "Join request already exists",
    StatusCode.INVALID_CLASS_CODE: "Invalid class code",
    StatusCode.DOCUMENT_ACCESS_DENIED: "Document access denied",

    StatusCode.OTP_INVALID: "Invalid OTP code",
    StatusCode.OTP_EXPIRED: "OTP has expired",

    StatusCode.INTERNAL_SERVER_ERROR: "Internal server error",
    StatusCode.DATABASE_ERROR: "Database error",
    StatusCode.FILE_PROCESSING_ERROR: "File processing error",
    StatusCode.EXTERNAL_API_ERROR: "External API error",
}