const errorMessages = {
    'Unauthorized': 'Thông tin đăng nhập không chính xác',
    'Invalid credentials': 'Tên đăng nhập hoặc mật khẩu không đúng',
    'User not found': 'Tài khoản không tồn tại',
    'Incorrect password': 'Mật khẩu không chính xác',
    'Account not activated': 'Tài khoản chưa được kích hoạt',
    'Account deactivated': 'Tài khoản đã bị vô hiệu hóa',
    'Email not verified': 'Email chưa được xác thực',
    'Session expired': 'Phiên đăng nhập đã hết hạn',
    'Token expired': 'Mã xác thực đã hết hạn',
    'Invalid token': 'Mã xác thực không hợp lệ',
    'Email already exists': 'Email đã được sử dụng',
    'Username already exists': 'Tên đăng nhập đã tồn tại',
    'Network Error': 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet',
    'Failed to fetch': 'Không thể kết nối đến máy chủ',
    'An error occurred': 'Đã xảy ra lỗi',
    'Bad Request': 'Yêu cầu không hợp lệ',
    'Internal Server Error': 'Lỗi máy chủ nội bộ',
    'Service Unavailable': 'Dịch vụ tạm thời không khả dụng'
};

export const translateError = (error) => {
    if (!error) return 'Đã xảy ra lỗi không xác định';

    const errorMsg = typeof error === 'string' ? error : error.message;

    if (errorMsg.includes('401')) {
        return 'Tên đăng nhập hoặc mật khẩu không đúng';
    }
    if (errorMsg.includes('403')) {
        return 'Bạn không có quyền truy cập';
    }
    if (errorMsg.includes('404')) {
        return 'Không tìm thấy tài nguyên';
    }
    if (errorMsg.includes('500')) {
        return 'Lỗi máy chủ. Vui lòng thử lại sau';
    }

    for (const [key, value] of Object.entries(errorMessages)) {
        if (errorMsg.includes(key)) {
            return value;
        }
    }

    return errorMsg;
};

export default { translateError, errorMessages };
