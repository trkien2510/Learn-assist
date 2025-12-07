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
# Map các mã lỗi với thông báo mặc định
STATUS_MESSAGES = {
    StatusCode.SUCCESS: "Thành công",
    StatusCode.CREATED: "Tạo mới thành công",

    StatusCode.BAD_REQUEST: "Dữ liệu không hợp lệ",
    StatusCode.UNAUTHORIZED: "Xác thực thất bại",
    StatusCode.FORBIDDEN: "Không có quyền thực hiện hành động này",
    StatusCode.NOT_FOUND: "Không tìm thấy dữ liệu",
    StatusCode.DUPLICATE_ENTRY: "Dữ liệu đã tồn tại",
    StatusCode.UNSUPPORTED_TYPE: "Loại dữ liệu không hỗ trợ",
    StatusCode.VALIDATION_ERROR: "Lỗi xác thực dữ liệu",
    StatusCode.TOO_MANY_REQUESTS: "Gửi quá nhiều yêu cầu",

    StatusCode.ALREADY_MEMBER: "Người dùng đã là thành viên của lớp học",
    StatusCode.NOT_A_MEMBER: "Người dùng không phải là thành viên của lớp học",
    StatusCode.JOIN_REQUEST_EXISTS: "Yêu cầu tham gia đã tồn tại",
    StatusCode.INVALID_CLASS_CODE: "Mã lớp không hợp lệ",
    StatusCode.DOCUMENT_ACCESS_DENIED: "Không có quyền truy cập tài liệu",

    StatusCode.INTERNAL_SERVER_ERROR: "Lỗi hệ thống",
    StatusCode.DATABASE_ERROR: "Lỗi cơ sở dữ liệu",
    StatusCode.FILE_PROCESSING_ERROR: "Lỗi xử lý file",
    StatusCode.EXTERNAL_API_ERROR: "Lỗi API bên ngoài",
}