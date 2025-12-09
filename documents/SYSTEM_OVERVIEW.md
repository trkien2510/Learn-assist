# Đặc Tả Kiến Trúc Hệ Thống (System Architecture Document)

**Đề tài:** Nghiên cứu xây dựng Website tự động tạo bộ câu hỏi ôn tập từ tài liệu hỗ trợ giáo viên kiểm tra sinh viên ôn luyện kèm hệ thống thống kê
---

## 1. Giới Thiệu Dự Án

### 1.1 Mục Tiêu
Xây dựng nền tảng hỗ trợ giáo dục trực tuyến, tập trung vào việc tự động hóa quy trình tạo đề thi trắc nghiệm từ tài liệu học tập bằng công nghệ Trí tuệ nhân tạo (AI). Hệ thống giúp tiết kiệm thời gian cho giáo viên trong việc soạn thảo câu hỏi và cung cấp công cụ quản lý lớp học, làm bài kiểm tra hiệu quả.

### 1.2 Phạm Vi Dự Án
Hệ thống bao gồm các phân hệ chính:
- **Phân hệ Quản trị (Admin Dashboard):** Quản lý người dùng, tài nguyên hệ thống.
- **Phân hệ Giáo viên (Teacher Portal):** Quản lý lớp học, upload tài liệu, sinh câu hỏi AI, tổ chức kiểm tra.
- **Phân hệ Học sinh (Student Portal):** Tham gia lớp học, làm bài kiểm tra, xem kết quả.

---

## 2. Các Thành Phần Chính

1.  **Presentation Layer (Frontend ReactJS):** Giao diện người dùng (Web) tương tác với hệ thống qua HTTP Requests.
2.  **Application Layer (Backend API):**
    *   Xây dựng trên nền tảng **FastAPI** (Python) cho hiệu năng cao và khả năng xử lý bất đồng bộ (async).
    *   Đảm nhiệm xác thực, logic nghiệp vụ, xử lý dữ liệu.
3.  **Data Layer (Database):**
    *   Sử dụng **MongoDB** (NoSQL) để lưu trữ dữ liệu phi cấu trúc (đề thi, log, tài liệu) linh hoạt.
    *   Sử dụng **Beanie ODM** để ánh xạ dữ liệu object-document.
4.  **Integration Layer (AI Service):**
    *   Tích hợp **OpenAI API** để xử lý ngôn ngữ tự nhiên, trích xuất nội dung từ PDF/DOCX và sinh câu hỏi trắc nghiệm.

---

## 3. Lựa Chọn Công Nghệ (Technology Stack)

| Thành phần | Công nghệ Đề Xuất | Lý do lựa chọn |
|------------|-------------------|----------------|
| **Backend Framework** | **FastAPI** | Hiệu năng cao (ngang NodeJS/Go), hỗ trợ Async IO mạnh mẽ, tự động sinh API Docs, phù hợp với các tác vụ AI/Data. |
| **Database** | **MongoDB** | Schema linh hoạt phù hợp với cấu trúc đề thi đa dạng, khả năng scale tốt (Sharding/Replica Set). |
| **ODM** | **Beanie** | Tận dụng sức mạnh của Motor (Async driver), cú pháp Pythonic, hỗ trợ migration tốt. |
| **Authentication** | **JWT (OAuth2)** | Chuẩn bảo mật stateless, phù hợp cho mô hình RESTful API và Mobile App scaling. |
| **AI Integration** | **OpenAI API** | Mô hình LLM tiên tiến nhất hiện nay, khả năng hiểu ngữ cảnh tiếng Việt tốt để sinh câu hỏi chất lượng. |
| **Document Processing** | **PyPDF, Python-docx** | Thư viện native Python mạnh mẽ để xử lý văn bản đầu vào cho AI. |

---

## 4. Thiết Kế Luồng Xử Lý Chính (Workflow Design)

### 4.1 Quy Trình Sinh Câu Hỏi Tự Động
1.  **Upload:** Giáo viên tải lên file tài liệu (PDF/Word).
2.  **Pre-processing:** Hệ thống đọc file, làm sạch văn bản (remove noise), chia nhỏ văn bản nếu quá dài.
3.  **AI Processing:** Gửi văn bản đã xử lý kèm Prompt kỹ thuật (Prompt Engineering) tới OpenAI.
4.  **Parsing:** Nhận phản hồi JSON từ AI, validate cấu trúc, chuẩn hóa dữ liệu.
5.  **Review:** Hiển thị cho giáo viên kiểm tra, chỉnh sửa.
6.  **Storage:** Lưu câu hỏi vào Ngân hàng câu hỏi.

### 4.2 Quy Trình Tổ Chức Kiểm Tra
1.  **Setup:** Giáo viên tạo bài kiểm tra -> Chọn số lượng câu hỏi từ Ngân hàng -> Cấu hình thời gian.
2.  **Distribution:** Bài thi được gán cho Lớp học (Classroom).
3.  **Execution:** Sinh viên bắt đầu làm bài -> Hệ thống tạo phiên làm bài (Session) -> Đếm ngược thời gian.
4.  **Submission:** Sinh viên nộp bài hoặc hết giờ -> Hệ thống tự động chấm điểm.
5.  **Analytics:** Cập nhật bảng điểm và thống kê.

### 4.3 Quy Trình Thông Báo Tự Động
1.  **Trigger Event:** Hệ thống phát hiện sự kiện (exam created, document uploaded, exam ended, etc.).
2.  **Target Users:** Xác định người dùng cần nhận thông báo dựa trên vai trò và lớp học.
3.  **Create Notification:** Tạo notification với title, message, và related_id.
4.  **Delivery:** Lưu vào DB và hiển thị cho người dùng qua giao diện.
5.  **Tracking:** Theo dõi trạng thái đã đọc/chưa đọc.

**Các loại thông báo hệ thống:**
- **Student**: exam_created, exam_started, exam_result
- **Teacher**: document_upload_success/failed, exam_creation_success, exam_statistics_available
- **Admin**: system_error, system_warning, user_anomaly, high_error_rate

---

## 5. Yêu Cầu Phi Chức Năng (Non-functional Requirements)

*   **Bảo mật:** Mật khẩu phải được mã hóa (Bcrypt). API phải được bảo vệ bằng Token.
*   **Hiệu năng:** API phản hồi trung bình < 200ms. AI Processing < 30s cho tài liệu tiêu chuẩn. Với API dùng để sinh câu hỏi thì thời gian phản hồi có thể lâu hơn
*   **Độ tin cậy:** Hệ thống ghi log đầy đủ các thao tác quan trọng (Audit Log).
*   **Khả năng bảo trì:** Code phải tuân thủ chuẩn PEP-8, cấu trúc thư mục rõ ràng theo mô hình MVC/Service-Repository.
