# Đặc Tả Kiến Trúc Hệ Thống (System Architecture Document)

**Đề tài:** Nghiên cứu xây dựng Website tự động tạo bộ câu hỏi ôn tập từ tài liệu hỗ trợ giáo viên kiểm tra sinh viên ôn luyện kèm hệ thống thống kê  

---

## 1. Giới Thiệu Dự Án

### 1.1 Mục Tiêu
Xây dựng nền tảng hỗ trợ giáo dục trực tuyến, tập trung vào việc tự động hóa quy trình tạo đề thi trắc nghiệm từ tài liệu học tập bằng công nghệ Trí tuệ nhân tạo (AI). Hệ thống giúp tiết kiệm thời gian cho giáo viên trong việc soạn thảo câu hỏi và cung cấp công cụ quản lý lớp học, làm bài kiểm tra hiệu quả.

### 1.2 Phạm Vi Dự Án
Hệ thống bao gồm các phân hệ chính:
- **Phân hệ Quản trị (Admin Dashboard):** Quản lý người dùng, tài nguyên hệ thống, theo dõi logs.
- **Phân hệ Giáo viên (Teacher Portal):** Quản lý lớp học, upload tài liệu, sinh câu hỏi AI, tổ chức kiểm tra, xem thống kê.
- **Phân hệ Học sinh (Student Portal):** Tham gia lớp học, làm bài kiểm tra, luyện tập cá nhân, xem kết quả.

---

## 2. Các Thành Phần Chính

1.  **Presentation Layer (Frontend ReactJS):** 
    *   Giao diện người dùng (Web) tương tác với hệ thống qua HTTP Requests.
    *   Sử dụng React 18+ với Vite làm build tool.
    *   State management với React Context API.
    *   Styling với Vanilla CSS và thiết kế Glassmorphism.
    
2.  **Application Layer (Backend API):**
    *   Xây dựng trên nền tảng **FastAPI** (Python) cho hiệu năng cao và khả năng xử lý bất đồng bộ (async).
    *   Đảm nhiệm xác thực (JWT), logic nghiệp vụ, xử lý dữ liệu.
    *   Hệ thống OTP để xác thực email.
    *   Hệ thống notification real-time.
    
3.  **Data Layer (Database):**
    *   Sử dụng **MongoDB** (NoSQL) để lưu trữ dữ liệu phi cấu trúc.
    *   Sử dụng **Beanie ODM** để ánh xạ dữ liệu object-document.
    *   TTL Index cho logs và OTP tự động expire.
    
4.  **Integration Layer (AI Service):**
    *   Tích hợp **OpenAI API** với Structured Outputs để sinh câu hỏi trắc nghiệm.
    *   Sử dụng GPT-4o-mini cho xử lý ngôn ngữ tự nhiên.

5.  **Email Service:**
    *   Sử dụng **FastAPI-Mail** để gửi email OTP.
    *   Hỗ trợ gửi email bất đồng bộ qua Background Tasks.

---

## 3. Lựa Chọn Công Nghệ (Technology Stack)

| Thành phần | Công nghệ | Lý do lựa chọn |
|------------|-----------|----------------|
| **Frontend Framework** | **React 18 + Vite** | Hot Module Replacement nhanh, build tối ưu. |
| **Backend Framework** | **FastAPI** | Hiệu năng cao, hỗ trợ Async IO, tự động sinh API Docs. |
| **Database** | **MongoDB** | Schema linh hoạt, khả năng scale tốt. |
| **ODM** | **Beanie** | Async driver, cú pháp Pythonic. |
| **Authentication** | **JWT (OAuth2)** | Chuẩn bảo mật stateless. |
| **Password Hashing** | **HMAC-SHA256 + Bcrypt** | Bảo mật cao với 12 rounds. |
| **AI Integration** | **OpenAI API (GPT-4o-mini)** | Structured Outputs, hiểu ngữ cảnh tiếng Việt tốt. |
| **Document Processing** | **PyPDF, Python-docx** | Xử lý văn bản đầu vào cho AI. |
| **Email Service** | **FastAPI-Mail** | Gửi email bất đồng bộ. |
| **Charts** | **Recharts** | Biểu đồ đẹp, responsive. |

---

## 4. Cấu Trúc Dự Án

### 4.1 Frontend Structure
```
frontend/src/
├── components/
│   ├── common/           # UI components dùng chung
│   │   ├── LoadingSpinner.jsx
│   │   ├── Alert.jsx
│   │   ├── EmptyState.jsx
│   │   ├── Pagination.jsx
│   │   ├── ConfirmModal.jsx
│   │   ├── StatusBadge.jsx
│   │   └── Portal.jsx
│   ├── classroom/        # Components cho lớp học
│   ├── dashboard/        # Components cho dashboard
│   ├── icons/           # Icon components
│   ├── layout/          # Layout components
│   └── notifications/   # Notification components
├── hooks/               # Custom hooks
│   ├── useApi.js
│   ├── usePagination.js
│   ├── useModal.js
│   └── useDateFormat.js
├── services/            # API services
│   ├── apiServices.js   # All API service modules (classroom, document, question, exam, result, statistics, notification, practice, dashboard, admin)
│   ├── httpClient.js    # HTTP client with interceptors
│   ├── authService.js   # Authentication service
│   └── index.js         # Exports
├── contexts/            # React Context
├── pages/               # Page components
├── utils/              # Utilities
└── config/             # Configuration
```

### 4.2 Backend Structure
```
backend/
├── api/                 # API Routers
│   ├── admin/          # Admin endpoints
│   │   ├── admin_router.py
│   │   ├── admin_user_router.py
│   │   ├── admin_classroom_router.py
│   │   ├── admin_log_router.py
│   │   ├── admin_notification_router.py
│   │   └── admin_stats_router.py
│   ├── auth_router.py
│   ├── classroom_router.py
│   ├── dashboard_router.py
│   ├── document_router.py
│   ├── exam_router.py
│   ├── message_router.py
│   ├── notification_router.py
│   ├── practice_router.py
│   ├── question_router.py
│   ├── result_router.py
│   ├── statistical_router.py
│   └── user_router.py
├── core/               # Core modules
│   ├── config.py
│   ├── dependencies.py
│   ├── exception_handler.py
│   ├── jwt.py
│   ├── security.py
│   └── status_code.py
├── models/             # Database models
│   ├── user_model.py
│   ├── classroom_model.py
│   ├── document_model.py
│   ├── question_model.py
│   ├── exam_model.py
│   ├── result_model.py
│   ├── log_model.py
│   ├── notification_model.py
│   ├── otp_model.py
│   ├── message_model.py
│   └── join_request_model.py
├── schemas/            # Pydantic schemas
├── services/           # Business logic
│   ├── admin_service.py
│   ├── ai_service.py
│   ├── auth_service.py
│   ├── auto_submit_service.py
│   ├── classroom_service.py
│   ├── dashboard_service.py
│   ├── document_service.py
│   ├── email_service.py
│   ├── exam_service.py
│   ├── log_service.py
│   ├── message_service.py
│   ├── notification_service.py
│   ├── otp_service.py
│   ├── question_service.py
│   ├── result_service.py
│   ├── statistics_service.py
│   └── user_service.py
├── utils/              # Utilities
│   ├── document_util.py
│   └── validation.py
└── db/                 # Database connection
```

---

## 5. Thiết Kế Luồng Xử Lý Chính (Workflow Design)

### 5.1 Quy Trình Đăng Ký Với OTP
1.  **Request OTP:** User nhập email -> Hệ thống gửi mã OTP 6 số qua email.
2.  **Verify OTP:** User nhập OTP -> Hệ thống xác thực và kích hoạt tài khoản.
3.  **Expiry:** OTP hết hạn sau 5 phút, tối đa 3 lần nhập sai.

### 5.2 Quy Trình Sinh Câu Hỏi Tự Động
1.  **Upload:** Giáo viên tải lên file tài liệu (PDF/Word).
2.  **Pre-processing:** Hệ thống đọc file, làm sạch văn bản.
3.  **AI Processing:** Gửi văn bản tới OpenAI với Structured Outputs.
4.  **Parsing:** Nhận phản hồi JSON đã được validate.
5.  **Review:** Hiển thị cho giáo viên kiểm tra, chỉnh sửa.
6.  **Storage:** Lưu câu hỏi vào Ngân hàng câu hỏi.

### 5.3 Quy Trình Tổ Chức Kiểm Tra
1.  **Preview:** Giáo viên chọn số lượng câu hỏi theo độ khó -> Xem trước câu hỏi.
2.  **Replace:** Có thể thay thế câu hỏi không phù hợp.
3.  **Setup:** Cấu hình thời gian bắt đầu, kết thúc, thời lượng.
4.  **Distribution:** Bài thi được gán cho Lớp học.
5.  **Execution:** Sinh viên làm bài -> Hệ thống đếm ngược thời gian.
6.  **Submission:** Nộp bài hoặc hết giờ -> Chấm điểm tự động.
7.  **Analytics:** Cập nhật thống kê và thông báo.

### 5.4 Quy Trình Luyện Tập Cá Nhân
1.  **Create:** Học sinh tạo bài kiểm tra từ ngân hàng câu hỏi cá nhân.
2.  **Practice:** Làm bài không giới hạn số lần.
3.  **Review:** Xem kết quả và thống kê chi tiết.

### 5.5 Quy Trình Tự Động Nộp Bài (Auto-Submit)
1.  **Scheduler:** Hệ thống chạy background task mỗi 30 giây.
2.  **Check:** Kiểm tra các bài thi chưa nộp và đã hết thời gian.
3.  **Auto-Submit:** Tự động chấm điểm và nộp bài.
4.  **Notify:** Gửi thông báo cho học sinh về việc nộp bài tự động.
5.  **Log:** Ghi log hành động vào hệ thống.

### 5.6 Quy Trình Thông Báo Tự Động
1.  **Trigger Event:** Hệ thống phát hiện sự kiện.
2.  **Target Users:** Xác định người dùng cần nhận thông báo.
3.  **Create Notification:** Tạo notification với title, message, related_id.
4.  **Delivery:** Lưu vào DB và hiển thị cho người dùng.
5.  **Tracking:** Theo dõi trạng thái đã đọc/chưa đọc.

**Các loại thông báo hệ thống:**
- **Student:** exam_created, exam_started, exam_result, exam_submitted, exam_auto_submitted
- **Teacher:** document_upload_success/failed, exam_creation_success, exam_statistics_available
- **Admin:** system_error, system_warning, user_anomaly, high_error_rate
- **All:** personal_exam_created

---

## 6. Bảo Mật (Security)

### 6.1 Authentication & Authorization
*   **JWT Token:** Access token (30 phút) + Refresh token (7 ngày).
*   **Role-based Access Control:** Admin, Teacher, Student.
*   **OTP Verification:** Xác thực email khi đăng ký.

### 6.2 Password Security
*   Sử dụng HMAC-SHA256 với SECRET_KEY trước khi hash.
*   Bcrypt với 12 rounds.
*   Format: `hmac_sha256$12$<bcrypt_hash>`.

### 6.3 NoSQL Injection Prevention
*   Validate tất cả ObjectId inputs.
*   Sanitize string inputs.
*   Sử dụng Beanie ODM thay vì raw queries.

### 6.4 Input Validation
*   Pydantic schemas cho tất cả request bodies.
*   Validation utilities trong `utils/validation.py`.

---

## 7. Yêu Cầu Phi Chức Năng (Non-functional Requirements)

*   **Bảo mật:** Mật khẩu phải được mã hóa (HMAC + Bcrypt). API phải được bảo vệ bằng Token.
*   **Hiệu năng:** API phản hồi trung bình < 200ms. AI Processing < 30s cho tài liệu tiêu chuẩn.
*   **Độ tin cậy:** Hệ thống ghi log đầy đủ các thao tác quan trọng (Audit Log) với TTL 30 ngày.
*   **Khả năng bảo trì:** Code tuân thủ chuẩn PEP-8, cấu trúc thư mục rõ ràng theo mô hình Service-Repository.
*   **Responsive:** UI hoạt động tốt trên Desktop và Mobile.
