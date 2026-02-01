const errorMessages = {
    // Authentication errors
    'Missing token': 'Thiếu token xác thực',
    'Invalid token': 'Token không hợp lệ',
    'Invalid or expired token': 'Token không hợp lệ hoặc đã hết hạn',
    'Token expired': 'Token đã hết hạn',
    'Unauthorized': 'Không được phép truy cập',
    'Invalid credentials': 'Thông tin đăng nhập không chính xác',
    'Invalid username or password': 'Tên đăng nhập hoặc mật khẩu không đúng',
    'Email not verified': 'Email chưa được xác thực. Vui lòng xác thực email trước',
    'Account deactivated': 'Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ hỗ trợ để được hỗ trợ',
    'Account not activated': 'Tài khoản chưa được kích hoạt',
    'Session expired': 'Phiên đăng nhập đã hết hạn',

    // User errors
    'User not found': 'Không tìm thấy người dùng',
    'Account already exists': 'Tài khoản đã tồn tại',
    'Email already exists': 'Email đã được sử dụng',
    'Username already exists': 'Tên đăng nhập đã tồn tại',
    'Invalid user ID': 'ID người dùng không hợp lệ',
    'No data to update': 'Không có dữ liệu để cập nhật',
    'Current password is incorrect': 'Mật khẩu hiện tại không chính xác',
    'Incorrect password': 'Mật khẩu không chính xác',
    'Password mismatch': 'Mật khẩu không khớp',
    'Passwords do not match': 'Mật khẩu không khớp',

    // Permission errors
    'Admin access required': 'Yêu cầu quyền quản trị viên',
    'Teacher access required': 'Yêu cầu quyền giáo viên',
    'Access denied': 'Truy cập bị từ chối',
    'Permission denied': 'Không có quyền thực hiện',
    'Forbidden': 'Không có quyền truy cập',
    'Admin cannot delete their own account': 'Quản trị viên không thể xóa tài khoản của chính mình',
    'Cannot edit your own account': 'Không thể chỉnh sửa tài khoản của chính mình',
    'Cannot edit another admin account': 'Không thể chỉnh sửa tài khoản quản trị viên khác',
    'Cannot delete your own account': 'Không thể xóa tài khoản của chính mình',
    'Cannot delete another admin account': 'Không thể xóa tài khoản quản trị viên khác',
    'Cannot change your own account status': 'Không thể thay đổi trạng thái tài khoản của chính mình',
    'Cannot change admin account status': 'Không thể thay đổi trạng thái tài khoản quản trị viên',
    'Admin cannot create questions': 'Quản trị viên không thể tạo câu hỏi',

    // OTP errors
    'OTP not found or already used': 'Mã OTP không tồn tại hoặc đã được sử dụng',
    'OTP expired': 'Mã OTP đã hết hạn',
    'Invalid OTP': 'Mã OTP không đúng',
    'Too many attempts': 'Quá nhiều lần thử. Vui lòng yêu cầu mã OTP mới',
    'Email already registered and verified': 'Email đã được đăng ký và xác thực',
    'No account found with this email': 'Không tìm thấy tài khoản với email này',
    'Account already activated': 'Tài khoản đã được kích hoạt',

    // Classroom errors
    'Classroom not found': 'Không tìm thấy lớp học',
    'Invalid classroom ID': 'ID lớp học không hợp lệ',
    'Invalid class ID': 'ID lớp học không hợp lệ',
    'Class not found': 'Không tìm thấy lớp học',
    'Already a member': 'Đã là thành viên của lớp',
    'Not a member of this class': 'Không phải thành viên của lớp này',
    'You are not a member of this class': 'Bạn không phải thành viên của lớp này',
    'Request already sent': 'Đã gửi yêu cầu tham gia',
    'Join request not found': 'Không tìm thấy yêu cầu tham gia',
    'Cannot remove yourself': 'Không thể xóa chính mình khỏi lớp',
    'Cannot leave as owner': 'Chủ lớp không thể rời khỏi lớp',
    'Only owner can perform this action': 'Chỉ chủ lớp mới có thể thực hiện thao tác này',

    // Exam errors
    'Exam not found': 'Không tìm thấy bài kiểm tra',
    'Invalid exam ID': 'ID bài kiểm tra không hợp lệ',
    'Exam has not started': 'Bài kiểm tra chưa bắt đầu',
    'Exam has ended': 'Bài kiểm tra đã kết thúc',
    'Already submitted': 'Đã nộp bài',
    'You have already submitted this exam': 'Bạn đã nộp bài kiểm tra này',
    'Not enough questions': 'Không đủ câu hỏi trong ngân hàng',
    'You can only view your own personal exam results': 'Bạn chỉ có thể xem kết quả bài kiểm tra cá nhân của mình',
    'You do not have permission to view results of this exam': 'Bạn không có quyền xem kết quả của bài kiểm tra này',
    'You do not have permission to view results of this class': 'Bạn không có quyền xem kết quả của lớp này',

    // Question errors
    'Question not found': 'Không tìm thấy câu hỏi',
    'Invalid question ID': 'ID câu hỏi không hợp lệ',
    'No questions available': 'Không có câu hỏi khả dụng',
    'No replacement question available': 'Không có câu hỏi thay thế khả dụng',

    // Document errors
    'Document not found': 'Không tìm thấy tài liệu',
    'Invalid document ID': 'ID tài liệu không hợp lệ',
    'File too large': 'File quá lớn',
    'Invalid file type': 'Loại file không hợp lệ',
    'Only PDF and DOCX files are allowed': 'Chỉ chấp nhận file PDF hoặc DOCX',
    'AI service authentication failed. Please check system configuration.': 'Lỗi xác thực dịch vụ AI. Vui lòng kiểm tra cấu hình hệ thống',
    'AI service rate limit reached or quota exhausted. Please try again later.': 'Dịch vụ AI đã hết hạn mức hoặc quá tải. Vui lòng thử lại sau',
    'Could not connect to AI service. Please try again later.': 'Không thể kết nối với dịch vụ AI. Vui lòng thử lại sau',
    'AI service encountered an internal error. Please try again later.': 'Dịch vụ AI gặp lỗi nội bộ. Vui lòng thử lại sau',
    'Document is empty': 'Tài liệu trống',
    'Number of questions exceeds limit': 'Số lượng câu hỏi vượt quá giới hạn',
    'AI service failed to generate any questions after multiple attempts.': 'Dịch vụ AI không thể sinh câu hỏi sau nhiều lần thử. Vui lòng kiểm tra lại tài liệu hoặc thử lại sau',
    'Document content is not suitable for generating quiz questions.': 'Nội dung tài liệu không phù hợp để sinh câu hỏi trắc nghiệm',
    'Document content is not suitable for generating quiz questions. The AI could not extract meaningful questions from this content.': 'Nội dung tài liệu không phù hợp để sinh câu hỏi. AI không thể trích xuất câu hỏi có ý nghĩa từ nội dung này',
    "Generation mode is required. Please choose 'strict' or 'expanded'": "Vui lòng chọn chế độ sinh câu hỏi: 'Bám sát tài liệu' hoặc 'Mở rộng kiến thức'",

    // Result errors
    'Result not found': 'Không tìm thấy kết quả',
    'Invalid result ID': 'ID kết quả không hợp lệ',

    // General errors
    'Bad Request': 'Yêu cầu không hợp lệ',
    'Not Found': 'Không tìm thấy',
    'Internal Server Error': 'Lỗi máy chủ nội bộ',
    'Service Unavailable': 'Dịch vụ tạm thời không khả dụng',
    'Network Error': 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet',
    'Failed to fetch': 'Không thể kết nối đến máy chủ',
    'An error occurred': 'Đã xảy ra lỗi',
    'Something went wrong': 'Có lỗi xảy ra',
    'Request timeout': 'Yêu cầu hết thời gian chờ',
    'Too many requests': 'Quá nhiều yêu cầu. Vui lòng thử lại sau',

    // Notification Titles (Prefixes)
    'New exam:': 'Bài thi mới:',
    'Exam started:': 'Bắt đầu làm bài:',
    'Exam result:': 'Kết quả bài thi:',
    'Exam auto-submitted:': 'Bài thi tự động nộp:',
    'Document upload successful:': 'Tải tài liệu thành công:',
    'Document upload failed:': 'Tải tài liệu thất bại:',
    'Exam creation successful:': 'Tạo bài thi thành công:',
    'Exam ended:': 'Bài thi đã kết thúc:',

    // Log Actions
    'login': 'Đăng nhập',
    'register': 'Đăng ký',
    'create_user': 'Tạo người dùng',
    'update_user': 'Cập nhật người dùng',
    'delete_user': 'Xóa người dùng',
    'create_classroom': 'Tạo lớp học',
    'update_classroom': 'Cập nhật lớp học',
    'delete_classroom': 'Xóa lớp học',
    'create_question': 'Tạo câu hỏi',
    'update_question': 'Cập nhật câu hỏi',
    'delete_question': 'Xóa câu hỏi',
    'create_exam': 'Tạo bài thi',
    'submit_exam': 'Nộp bài thi',
    'delete_exam': 'Xóa bài thi',
    'upload_document': 'Tải tài liệu',
    'delete_document': 'Xóa tài liệu',
    'change_password': 'Đổi mật khẩu',
    'reset_password': 'Đặt lại mật khẩu',
    'otp_sent': 'Gửi mã OTP',
    'otp_verified': 'Xác thực mã OTP',
    'email_verified': 'Xác thực email',
    'account_reactivated': 'Kích hoạt lại tài khoản',
    'admin_update_user': 'Admin cập nhật người dùng',
    'admin_delete_user': 'Admin xóa người dùng',
    'admin_create_user': 'Admin tạo người dùng',
    'exam_result': 'Kết quả bài thi',
    'exam_statistics_available': 'Thống kê bài thi',
    'exam_ended': 'Bài thi đã kết thúc',
    'exam_created': 'Bài thi mới',
    'exam_creation_success': 'Tạo bài thi thành công',
    'document_upload_success': 'Tải tài liệu thành công',
    'document_upload_failed': 'Tải tài liệu thất bại',
    'system_error': 'Lỗi hệ thống',
    'system_warning': 'Cảnh báo hệ thống',
    'user_anomaly': 'Hoạt động bất thường',

    // Detailed Notification Messages
    'has created a new exam': 'đã tạo một bài kiểm tra mới',
    'in class': 'trong lớp',
    'Your document': 'Tài liệu của bạn',
    'Teacher': 'Giáo viên',
    'You have': 'Bạn có',
    'Exam starts at': 'Bắt đầu lúc',
    'and ends at': 'và kết thúc lúc',
    'You have started the exam': 'Bạn đã bắt đầu làm bài thi',
    'minutes to complete it. Good luck!': 'phút để hoàn thành. Chúc bạn may mắn!',
    'You have completed the exam': 'Bạn đã hoàn tất bài thi',
    'Score:': 'Điểm số:',
    'correct answers': 'câu trả lời đúng',
    'has been auto-submitted due to time limit': 'đã tự động nộp do hết thời gian',
    'has been uploaded and processed successfully': 'đã được tải lên và xử lý thành công',
    'questions have been generated': 'câu hỏi đã được tạo',
    'Could not upload or process document': 'Không thể tải lên hoặc xử lý tài liệu',
    'has been created successfully in class': 'đã được tạo thành công trong lớp',
    'There were': 'Có',
    'students participated. You can view the statistics now': 'học sinh tham gia. Bạn có thể xem thống kê ngay bây giờ',
    'Your practice exam': 'Bài thi thực hành của bạn',
    'has been created with': 'đã được tạo với',
    'questions. Duration:': 'câu hỏi. Thời gian:',
    'minutes. You can start practicing anytime!': 'phút. Bạn có thể bắt đầu luyện tập bất cứ lúc nào!',
    'Detect suspicious activity from user': 'Phát hiện hoạt động đáng ngờ từ người dùng',
    'Detect high error rate': 'Phát hiện tỷ lệ lỗi cao',
    'errors in the past': 'lỗi trong vòng',
    'Please check': 'Vui lòng kiểm tra',
};

const successMessages = {
    // Auth success
    'Registration successful': 'Đăng ký thành công',
    'Login successful': 'Đăng nhập thành công',
    'Logout successful': 'Đăng xuất thành công',
    'Password reset successful': 'Đặt lại mật khẩu thành công',
    'Password changed successfully': 'Đổi mật khẩu thành công',
    'Email verified successfully': 'Xác thực email thành công',
    'OTP sent successfully': 'Mã OTP đã được gửi đến email của bạn',
    'Account reactivated successfully': 'Kích hoạt lại tài khoản thành công',

    // User success
    'Profile updated successfully': 'Cập nhật thông tin thành công',
    'User created successfully': 'Tạo người dùng thành công',
    'User updated successfully': 'Cập nhật người dùng thành công',
    'User deleted successfully': 'Xóa người dùng thành công',
    'User activated successfully': 'Kích hoạt tài khoản thành công',
    'User deactivated successfully': 'Vô hiệu hóa tài khoản thành công',
    'Account deleted successfully': 'Xóa tài khoản thành công',

    // Classroom success
    'Classroom created successfully': 'Tạo lớp học thành công',
    'Classroom updated successfully': 'Cập nhật lớp học thành công',
    'Classroom deleted successfully': 'Xóa lớp học thành công',
    'Join request sent': 'Đã gửi yêu cầu tham gia',
    'Join request accepted': 'Đã chấp nhận yêu cầu tham gia',
    'Join request rejected': 'Đã từ chối yêu cầu tham gia',
    'Member removed successfully': 'Đã xóa thành viên',
    'Left classroom successfully': 'Đã rời khỏi lớp học',

    // Exam success
    'Exam created successfully': 'Tạo bài kiểm tra thành công',
    'Exam submitted successfully': 'Nộp bài thành công',
    'Exam deleted successfully': 'Xóa bài kiểm tra thành công',

    // Question success
    'Question created successfully': 'Tạo câu hỏi thành công',
    'Question updated successfully': 'Cập nhật câu hỏi thành công',
    'Question deleted successfully': 'Xóa câu hỏi thành công',
    'Questions saved successfully': 'Lưu câu hỏi thành công',

    // Document success
    'Document uploaded successfully': 'Upload tài liệu thành công',
    'Document deleted successfully': 'Xóa tài liệu thành công',
    'Questions generated successfully': 'Sinh câu hỏi thành công',
};

export const translateError = (error) => {
    if (!error) return 'Đã xảy ra lỗi không xác định';

    let errorMsg = '';
    if (typeof error === 'string') {
        errorMsg = error;
    } else if (error.response?.data?.detail) {
        errorMsg = error.response.data.detail;
    } else if (error.message) {
        errorMsg = error.message;
    } else {
        errorMsg = String(error);
    }

    if (errorMsg.includes('401')) return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại';
    if (errorMsg.includes('403')) return 'Bạn không có quyền thực hiện thao tác này';
    if (errorMsg.includes('404')) return 'Không tìm thấy tài nguyên yêu cầu';
    if (errorMsg.includes('429')) return 'Quá nhiều yêu cầu. Vui lòng thử lại sau';
    if (errorMsg.includes('500')) return 'Lỗi máy chủ. Vui lòng thử lại sau';
    if (errorMsg.includes('502') || errorMsg.includes('503') || errorMsg.includes('504')) return 'Dịch vụ tạm thời không khả dụng. Vui lòng thử lại sau';

    if (errorMessages[errorMsg]) return errorMessages[errorMsg];

    let translatedMsg = errorMsg;
    let hasMatch = false;

    const sortedKeys = Object.keys(errorMessages).sort((a, b) => b.length - a.length);

    for (const key of sortedKeys) {
        if (key.length < 3) continue;

        const lowerKey = key.toLowerCase();
        if (translatedMsg.toLowerCase().includes(lowerKey)) {
            const regex = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
            translatedMsg = translatedMsg.replace(regex, errorMessages[key]);
            hasMatch = true;
        }
    }

    return hasMatch ? translatedMsg : errorMsg;
};

export const translateSuccess = (message) => {
    if (!message) return 'Thành công';

    const msg = typeof message === 'string' ? message : String(message);

    if (successMessages[msg]) return successMessages[msg];

    const lowerMsg = msg.toLowerCase();
    for (const [key, value] of Object.entries(successMessages)) {
        if (lowerMsg.includes(key.toLowerCase())) return value;
    }

    return msg;
};

export const getActionMessage = (action, success = true) => {
    const messages = {
        login: success ? 'Đăng nhập thành công' : 'Đăng nhập thất bại',
        logout: success ? 'Đăng xuất thành công' : 'Đăng xuất thất bại',
        register: success ? 'Đăng ký thành công' : 'Đăng ký thất bại',
        create: success ? 'Tạo mới thành công' : 'Tạo mới thất bại',
        update: success ? 'Cập nhật thành công' : 'Cập nhật thất bại',
        delete: success ? 'Xóa thành công' : 'Xóa thất bại',
        save: success ? 'Lưu thành công' : 'Lưu thất bại',
        upload: success ? 'Upload thành công' : 'Upload thất bại',
        submit: success ? 'Nộp bài thành công' : 'Nộp bài thất bại',
        send: success ? 'Gửi thành công' : 'Gửi thất bại',
        join: success ? 'Tham gia thành công' : 'Tham gia thất bại',
        leave: success ? 'Rời khỏi thành công' : 'Rời khỏi thất bại',
        accept: success ? 'Chấp nhận thành công' : 'Chấp nhận thất bại',
        reject: success ? 'Từ chối thành công' : 'Từ chối thất bại',
        remove: success ? 'Xóa thành công' : 'Xóa thất bại',
        verify: success ? 'Xác thực thành công' : 'Xác thực thất bại',
        reset: success ? 'Đặt lại thành công' : 'Đặt lại thất bại',
        change: success ? 'Thay đổi thành công' : 'Thay đổi thất bại',
    };

    return messages[action] || (success ? 'Thành công' : 'Thất bại');
};

export default {
    translateError,
    translateSuccess,
    getActionMessage,
    errorMessages,
    successMessages
};
