# Đặc Tả Yêu Cầu (Requirements Specification)

**Dự án:** Nghiên cứu xây dựng Website tự động tạo bộ câu hỏi ôn tập từ tài liệu hỗ trợ giáo viên kiểm tra sinh viên ôn luyện kèm hệ thống thống kê  

---

## 1. Tác Nhân Hệ Thống (Actors)

| Tác nhân | Mô tả |
|----------|-------|
| **Administrator (Admin)** | Người quản trị hệ thống, có toàn quyền truy cập dữ liệu người dùng và tài nguyên, xem nhật ký hoạt động, giám sát hệ thống. |
| **Teacher (Giáo viên)** | Người dùng có quyền tạo lớp, tạo đề thi, quản lý học sinh và sử dụng các tính năng AI để sinh câu hỏi. |
| **Student (Học sinh)** | Người dùng tham gia lớp học, làm bài kiểm tra, luyện tập cá nhân và xem kết quả học tập. |

---

## 2. Danh Sách Use Cases (Use Case List)

### 2.1 Nhóm Chức Năng Xác Thực & Tài Khoản (UC-Auth)
*   **UC-01:** Đăng ký tài khoản mới với xác thực OTP (Register with OTP).
*   **UC-02:** Đăng nhập hệ thống (Login).
*   **UC-03:** Quản lý thông tin cá nhân (Profile Management).
*   **UC-04:** Đổi mật khẩu (Change Password).
*   **UC-05:** Xóa tài khoản (Khi xóa tài khoản sẽ xóa toàn bộ dữ liệu liên quan: tin nhắn, lớp học, bài thi, kết quả...).
*   **UC-06:** Quên mật khẩu với OTP (Forgot Password).
*   **UC-07:** Đặt lại mật khẩu (Reset Password).

### 2.2 Nhóm Chức Năng Lớp Học (UC-Class)
*   **UC-08:** Tạo lớp học mới (Create Class) - *Teacher only*.
*   **UC-09:** Xem chi tiết lớp học (View Classroom Detail).
*   **UC-10:** Tham gia lớp học bằng mã (Join by Code) - *Student*.
*   **UC-11:** Phê duyệt yêu cầu tham gia (Approve/Reject Requests) - *Teacher*.
*   **UC-12:** Quản lý thành viên lớp (Manage Members).
*   **UC-13:** Rời khỏi lớp học (Leave Classroom) - *Student*.
*   **UC-14:** Xem danh sách lớp học (View Classrooms).

### 2.3 Nhóm Chức Năng Tài Liệu & AI (UC-Doc)
*   **UC-16:** Tải lên tài liệu học tập (Upload Document).
*   **UC-17:** Sinh câu hỏi tự động với AI (Generate Questions) - *Sử dụng AsyncOpenAI & Parallel Processing*.
*   **UC-18:** Chỉnh sửa & Lưu câu hỏi (Review & Save).
*   **UC-19:** Xóa tài liệu (Delete Document).

### 2.4 Nhóm Chức Năng Câu Hỏi (UC-Question)
*   **UC-20:** Tạo câu hỏi thủ công (Create Question).
*   **UC-21:** Chỉnh sửa câu hỏi (Edit Question).
*   **UC-22:** Xóa câu hỏi (Delete Question).
*   **UC-23:** Xem ngân hàng câu hỏi (View Question Bank).

### 2.5 Nhóm Chức Năng Thi Cử (UC-Exam)
*   **UC-24:** Xem trước câu hỏi (Preview Questions) - *Teacher*.
*   **UC-25:** Thay thế câu hỏi trong preview (Replace Question) - *Teacher*.
*   **UC-26:** Tạo đề thi (Create Exam) - *Teacher*.
*   **UC-27:** Xem chi tiết đề thi (View Exam Detail).
*   **UC-28:** Làm bài thi (Take Exam) - *Student*.
*   **UC-29:** Nộp bài & Chấm điểm tự động (Submit & Auto-grade).
*   **UC-30:** Xem kết quả thi (View Result).
*   **UC-31:** Tiếp tục làm bài (Resume Exam) - *Nếu còn thời gian*.
*   **UC-32:** Tự động nộp bài khi hết giờ (Auto-Submit Expired Exams) - *System*.

### 2.6 Nhóm Chức Năng Luyện Tập (UC-Practice)
*   **UC-33:** Tạo bài kiểm tra cá nhân (Create Personal Exam).
*   **UC-34:** Làm bài luyện tập (Take Practice Exam).
*   **UC-35:** Xem thống kê luyện tập (View Practice Statistics).
*   **UC-36:** Xóa bài kiểm tra cá nhân (Delete Personal Exam).

### 2.7 Nhóm Chức Năng Báo Cáo & Thống Kê (UC-Stats)
*   **UC-37:** Xem Dashboard thống kê (View Dashboard).
*   **UC-38:** Xem thống kê theo bài thi (Exam Statistics).
*   **UC-39:** Xem thống kê theo lớp học (Class Statistics).
*   **UC-40:** Xem thống kê nền tảng (Platform Statistics) - *Admin*.

### 2.8 Nhóm Chức Năng Thông Báo (UC-Notification)
*   **UC-41:** Xem danh sách thông báo (View Notifications).
*   **UC-42:** Đánh dấu thông báo đã đọc (Mark as Read).
*   **UC-43:** Xóa thông báo (Delete Notification).
*   **UC-44:** Quản lý thông báo hệ thống (System Notifications) - *Admin*.
*   **UC-45:** Nhận thông báo tự động nộp bài (Auto-Submit Notification) - *Student*.

### 2.9 Nhóm Chức Năng Tin Nhắn (UC-Message)
*   **UC-46:** Gửi tin nhắn trong lớp học (Send Message).
*   **UC-47:** Xem tin nhắn lớp học (View Messages). (Lưu ý: Chức năng xóa tin nhắn đã bị loại bỏ để đảm bảo tính minh bạch).

### 2.10 Nhóm Chức Năng Quản Trị (UC-Admin)
*   **UC-48:** Quản lý người dùng hệ thống (User Management).
*   **UC-49:** Kích hoạt/Vô hiệu hóa tài khoản (Activate/Deactivate User).
*   **UC-50:** Quản lý lớp học (Classroom Management).
*   **UC-51:** Xem nhật ký hệ thống (View Logs).
*   **UC-52:** Dọn dẹp logs và thông báo cũ (Cleanup).
*   **UC-53:** Kiểm tra sức khỏe hệ thống (System Health Check).
*   **UC-54:** Xem thống kê hoạt động người dùng (User Activity).

---

## 3. Đặc Tả Chi Tiết Yêu Cầu Chức Năng (Detailed Functional Requirements)

### 3.1 Đăng Ký Với Xác Thực OTP
**Mô tả:** Cho phép người dùng đăng ký tài khoản với xác thực email.
*   **Luồng xử lý:**
    1.  User nhập thông tin đăng ký.
    2.  Hệ thống gửi OTP 6 số qua email.
    3.  User nhập OTP để xác thực.
    4.  Tài khoản được kích hoạt.
*   **Ràng buộc:** OTP hết hạn sau 5 phút, tối đa 3 lần nhập sai.

### 3.2 Upload & Xử Lý Tài Liệu
**Mô tả:** Cho phép giáo viên tải lên file tài liệu để hệ thống phân tích.
*   **Input:** File PDF hoặc DOCX.
*   **Xử lý:**
    1.  Hệ thống kiểm tra định dạng và kích thước file.
    2.  Trích xuất văn bản (Text Extraction) từ file binary.
    3.  Lưu metadata file vào database.
*   **Output:** Thông báo thành công và ID của tài liệu.
*   **Ngoại lệ:** Báo lỗi nếu File rỗng, sai định dạng hoặc mã hóa không hỗ trợ.

### 3.3 Sinh Câu Hỏi Trắc Nghiệm
**Mô tả:** Sử dụng AI để tạo bộ câu hỏi từ văn bản.
*   **Trigger:** Sau khi Upload tài liệu thành công.
*   **Tham số:** Số lượng câu hỏi (N).
*   **Xử lý:**
    1.  Tạo Prompt kỹ thuật chứa nội dung văn bản.
    2.  Gởi request tới OpenAI API với Structured Outputs.
    3.  Nhận phản hồi JSON đã được validate.
*   **Output:** Danh sách câu hỏi (Nội dung, 4 đáp án, Đáp án đúng, Độ khó).

### 3.4 Tổ Chức Thi Trực Tuyến
**Mô tả:** Quản lý phiên làm bài của học sinh.
*   **Điều kiện tiên quyết:** Học sinh thuộc lớp học, Đề thi đang trong thời gian mở.
*   **Xử lý:**
    1.  Khi bắt đầu: Tạo bản ghi `Result` với trạng thái `In Progress`.
    2.  Trong khi làm: Đếm ngược thời gian (Client-side) và kiểm tra thời gian thực (Server-side).
    3.  Khi nộp bài: Nhận map câu trả lời `UserAnswers`.
*   **Logic Chấm Điểm:** `Score = (Correct / Total) * 10`.
*   **Resume Capability:** Nếu mất kết nối, học sinh có thể vào lại nếu còn thời gian.

### 3.5 Xem Trước Câu Hỏi (Preview Questions)
**Mô tả:** Cho phép giáo viên xem trước câu hỏi trước khi tạo đề.
*   **Xử lý:**
    1.  Giáo viên chọn số lượng câu theo độ khó (Easy/Medium/Hard).
    2.  Hệ thống random câu hỏi từ ngân hàng.
    3.  Hiển thị danh sách để review.
    4.  Có thể thay thế câu hỏi không phù hợp.

### 3.6 Cơ Chế Tham Gia Lớp Học
**Mô tả:** Kiểm soát quyền truy cập vào lớp học.
*   **Luồng xử lý:**
    1.  Student nhập `ClassCode`.
    2.  Hệ thống tạo `JoinRequest`.
    3.  Teacher nhận thông báo, xem danh sách Pending.
    4.  Teacher chọn `Accept` hoặc `Reject`.

### 3.7 Luyện Tập Cá Nhân
**Mô tả:** Cho phép học sinh tự tạo bài kiểm tra để luyện tập.
*   **Luồng xử lý:**
    1.  Học sinh chọn câu hỏi từ ngân hàng câu hỏi cá nhân.
    2.  Cấu hình thời gian làm bài.
    3.  Làm bài không giới hạn số lần.
    4.  Xem thống kê chi tiết sau mỗi lần làm.

### 3.8 Hệ Thống Thông Báo Tự Động
**Mô tả:** Thông báo real-time cho người dùng về các sự kiện quan trọng.
*   **Loại thông báo theo vai trò:**
    *   **Student:**
        - Thông báo khi có đề thi mới trong lớp học.
        - Thông báo khi đề thi bắt đầu.
        - Thông báo khi kết quả thi có sẵn.
        - Thông báo khi nộp bài thành công.
        - Thông báo khi bài thi được tự động nộp do hết thời gian.
    *   **Teacher:**
        - Thông báo khi upload tài liệu thành công/thất bại.
        - Thông báo khi tạo đề thi thành công.
        - Thông báo khi đề thi kết thúc (kèm thống kê).
    *   **Admin:**
        - Cảnh báo hệ thống (lỗi, warning).
        - Phát hiện hành vi bất thường của người dùng.
        - Cảnh báo tỉ lệ lỗi API cao.

### 3.9 Tin Nhắn Trong Lớp Học
**Mô tả:** Cho phép thành viên lớp học giao tiếp.
*   **Luồng xử lý:**
    1.  Thành viên gửi tin nhắn.
    2.  Tất cả thành viên trong lớp có thể xem. (Lưu ý: Không thể xóa tin nhắn sau khi đã gửi để đảm bảo tính minh bạch và lưu vết).

---

## 4. Ma Trận Quyền (Permission Matrix)

| Chức năng | Admin | Teacher | Student |
|-----------|-------|---------|---------|
| Quản lý người dùng | ✓ | ✗ | ✗ |
| Tạo lớp học | ✓ | ✓ | ✗ |
| Tham gia lớp học | ✓ | ✓ | ✓ |
| Upload tài liệu | ✓ | ✓ | ✓ |
| Sinh câu hỏi AI | ✓ | ✓ | ✓ |
| Tạo đề thi lớp học | ✓ | ✓ | ✗ |
| Làm bài kiểm tra | ✗ | ✗ | ✓ |
| Luyện tập cá nhân | ✓ | ✓ | ✓ |
| Xem thống kê | ✓ | ✓ | ✓ (chỉ cá nhân) |
| Xem logs hệ thống | ✓ | ✗ | ✗ |
| Gửi tin nhắn | ✓ | ✓ | ✓ |

---

## 5. Tổng Kết Use Cases

| Nhóm | Số lượng |
|------|----------|
| Xác thực & Tài khoản | 8 |
| Lớp học | 7 |
| Tài liệu & AI | 4 |
| Câu hỏi | 4 |
| Thi cử | 9 |
| Luyện tập | 4 |
| Báo cáo & Thống kê | 4 |
| Thông báo | 5 |
| Tin nhắn | 2 |
| Quản trị | 7 |
| **Tổng** | **54** |
