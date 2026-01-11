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
    CLASSROOM_NOT_FOUND = 4305
    MESSAGE_NOT_FOUND = 4306
    DOCUMENT_ACCESS_DENIED = 4310
    EXAM_DELETED = 4311
    
    # OTP errors (44xx)
    OTP_INVALID = 4401
    OTP_EXPIRED = 4402

    # Server/System errors (5xxx)
    INTERNAL_SERVER_ERROR = 5000
    DATABASE_ERROR = 5001
    FILE_PROCESSING_ERROR = 5002
    EXTERNAL_API_ERROR = 5003
    AI_GENERATION_FAILED = 5004

    # Document validation errors (45xx)
    DOCUMENT_TOO_SHORT = 4501
    DOCUMENT_INVALID_CONTENT = 4502
    DOCUMENT_INSUFFICIENT_FOR_QUESTIONS = 4503


STATUS_MESSAGES = {
    StatusCode.SUCCESS: "Thành công",
    StatusCode.CREATED: "Tạo thành công",

    StatusCode.BAD_REQUEST: "Dữ liệu yêu cầu không hợp lệ",
    StatusCode.UNAUTHORIZED: "Xác thực thất bại",
    StatusCode.FORBIDDEN: "Bạn không có quyền thực hiện hành động này",
    StatusCode.NOT_FOUND: "Không tìm thấy tài nguyên",
    StatusCode.DUPLICATE_ENTRY: "Tài nguyên đã tồn tại",
    StatusCode.UNSUPPORTED_TYPE: "Kiểu dữ liệu không được hỗ trợ",
    StatusCode.VALIDATION_ERROR: "Lỗi xác thực dữ liệu",
    StatusCode.TOO_MANY_REQUESTS: "Quá nhiều yêu cầu, vui lòng thử lại sau",

    StatusCode.ALREADY_MEMBER: "Người dùng đã là thành viên của lớp này",
    StatusCode.NOT_A_MEMBER: "Người dùng không phải là thành viên của lớp này",
    StatusCode.JOIN_REQUEST_EXISTS: "Yêu cầu tham gia đã tồn tại và đang chờ duyệt",
    StatusCode.INVALID_CLASS_CODE: "Mã lớp không hợp lệ",
    StatusCode.CLASSROOM_NOT_FOUND: "Không tìm thấy lớp học",
    StatusCode.MESSAGE_NOT_FOUND: "Context tin nhắn không tồn tại",
    StatusCode.DOCUMENT_ACCESS_DENIED: "Không có quyền truy cập tài liệu này",
    StatusCode.EXAM_DELETED: "Bài kiểm tra đã bị xóa bởi giáo viên",

    StatusCode.OTP_INVALID: "Mã OTP không hợp lệ",
    StatusCode.OTP_EXPIRED: "Mã OTP đã hết hạn",

    StatusCode.INTERNAL_SERVER_ERROR: "Lỗi máy chủ nội bộ",
    StatusCode.DATABASE_ERROR: "Lỗi cơ sở dữ liệu",
    StatusCode.FILE_PROCESSING_ERROR: "Lỗi xử lý tệp tin",
    StatusCode.EXTERNAL_API_ERROR: "Lỗi kết nối dịch vụ bên ngoài",
    StatusCode.AI_GENERATION_FAILED: "Không thể sinh câu hỏi từ tài liệu",

    StatusCode.DOCUMENT_TOO_SHORT: "Tài liệu quá ngắn để sinh câu hỏi",
    StatusCode.DOCUMENT_INVALID_CONTENT: "Nội dung tài liệu không hợp lệ để sinh câu hỏi",
    StatusCode.DOCUMENT_INSUFFICIENT_FOR_QUESTIONS: "Tài liệu không đủ nội dung để sinh số câu hỏi yêu cầu",
}