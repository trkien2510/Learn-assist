# Đặc Tả Yêu Cầu (Requirements Specification)

**Dự án:** Nghiên cứu xây dựng Website tự động tạo bộ câu hỏi ôn tập từ tài liệu hỗ trợ giáo viên kiểm tra sinh viên ôn luyện kèm hệ thống thống kê 

---

## 1. Tác Nhân Hệ Thống (Actors)

| Tác nhân | Mô tả |
|----------|-------|
| **Administrator (Admin)** | Người quản trị hệ thống, có toàn quyền truy cập dữ liệu người dùng và tài nguyên, xem nhật ký hoạt động. |
| **Teacher (Giáo viên)** | Người dùng có quyền tạo lớp, tạo đề thi, quản lý học sinh và sử dụng các tính năng AI. |
| **Student (Học sinh)** | Người dùng tham gia lớp học, làm bài kiểm tra và xem kết quả học tập. |

---

## 2. Danh Sách Use Cases (Use Case List)

### 2.1 Nhóm Chức Năng Xác Thực & Tài Khoản (UC-Auth)
*   **UC-01:** Đăng ký tài khoản mới (Register).
*   **UC-02:** Đăng nhập hệ thống (Login).
*   **UC-03:** Quản lý thông tin cá nhân (Profile Management).
*   **UC-04:** Vô hiệu hóa tài khoản (Deactivate).

### 2.2 Nhóm Chức Năng Lớp Học (UC-Class)
*   **UC-05:** Tạo lớp học mới (Create Class) - *Teacher only*.
*   **UC-06:** Tham gia lớp học bằng mã (Join by Code) - *Student*.
*   **UC-07:** Phê duyệt yêu cầu tham gia (Approve Requests) - *Teacher*.
*   **UC-08:** Quản lý thành viên lớp (Manage Members).

### 2.3 Nhóm Chức Năng Tài Liệu & AI (UC-Doc)
*   **UC-09:** Tải lên tài liệu học tập (Upload Document) - *Teacher*.
*   **UC-10:** Sinh câu hỏi tự động (Generate Questions) - *Teacher & AI*.
*   **UC-11:** Chỉnh sửa & Lưu câu hỏi (Review & Save) - *Teacher*.

### 2.4 Nhóm Chức Năng Thi Cử (UC-Exam)
*   **UC-12:** Tạo đề thi (Create Exam) - *Teacher*.
*   **UC-13:** Làm bài thi (Take Exam) - *Student*.
*   **UC-14:** Nộp bài & Chấm điểm tự động (Submit & Auto-grade).
*   **UC-15:** Xem kết quả thi (View Result).

### 2.5 Nhóm Chức Năng Báo Cáo & Quản Trị (UC-Admin)
*   **UC-16:** Xem Dashboard thống kê (View Statistics).
*   **UC-17:** Quản lý người dùng hệ thống (User Management) - *Admin*.
*   **UC-18:** Xem nhật ký hệ thống (View Logs) - *Admin*.

### 2.6 Nhóm Chức Năng Thông Báo (UC-Notification)
*   **UC-19:** Xem danh sách thông báo (View Notifications).
*   **UC-20:** Đánh dấu thông báo đã đọc (Mark as Read).
*   **UC-21:** Quản lý thông báo hệ thống (System Notifications) - *Admin*.

---

## 3. Đặc Tả Chi Tiết Yêu Cầu Chức Năng (Detailed Functional Requirements)

### 3.1 Upload & Xử Lý Tài Liệu
**Mô tả:** Cho phép giáo viên tải lên file tài liệu để hệ thống phân tích.
*   **Input:** File PDF hoặc DOCX.
*   **Xử lý:**
    1.  Hệ thống kiểm tra định dạng và kích thước file.
    2.  Trích xuất văn bản (Text Extraction) từ file binary.
    3.  Lưu metadata file vào database và nội dung text vào bộ nhớ tạm.
*   **Output:** Thông báo thành công và ID của tài liệu.
*   **Ngoại lệ:** Báo lỗi nếu File rỗng, sai định dạng hoặc mã hóa không hỗ trợ.

### 3.2 Sinh Câu Hỏi Trắc Nghiệm
**Mô tả:** Sử dụng AI để tạo bộ câu hỏi từ văn bản.
*   **Trigger:** Sau khi Upload tài liệu thành công.
*   **Tham số:** Số lượng câu hỏi (N), Mức độ khó (Easy/Medium/Hard).
*   **Xử lý:**
    1.  Tạo Prompt kỹ thuật chứa nội dung văn bản và các ràng buộc (format JSON).
    2.  Gởi request tới OpenAI API.
    3.  Nhận phản hồi, parse JSON thành danh sách object Câu hỏi.
*   **Output:** Danh sách câu hỏi (Nội dung, 4 đáp án, Đáp án đúng).

### 3.3 Tổ Chức Thi Trực Tuyến
**Mô tả:** Quản lý phiên làm bài của học sinh.
*   **Điều kiện tiên quyết:** Học sinh thuộc lớp học, Đề thi đang trong thời gian mở (Start At <= Now <= End At).
*   **Xử lý:**
    1.  Khi bắt đầu: Tạo bản ghi `Result` với trạng thái `In Progress`.
    2.  Trong khi làm: Đếm ngược thời gian (Client-side) và kiểm tra thời gian thực (Server-side).
    3.  Khi nộp bài: Nhận map câu trả lời `UserAnswers`.
*   **Logic Chấm Điểm:** So sánh `UserAnswers` với `CorrectAnswers` trong DB. Tính điểm trên thang 10. `Score = (Correct / Total) * 10`.
*   **Xử lý Sự cố:** Nếu mất kết nối, học sinh có thể vào lại để tiếp tục làm bài nếu còn thời gian (Resume capability).

### 3.4 Cơ Chế Tham Gia Lớp Học
**Mô tả:** Kiểm soát quyền truy cập vào lớp học.
*   **Luồng xử lý:**
    1.  Student nhập `ClassCode`.
    2.  Hệ thống tạo `JoinRequest`.
    3.  Teacher nhận thông báo, xem danh sách Pending.
    4.  Teacher chọn `Accept` -> Student được thêm vào danh sách `Members`.
    5.  Hoặc Teacher chọn `Reject` -> Xóa Request.

### 3.5 Hệ Thống Thông Báo Tự Động
**Mô tả:** Thông báo real-time cho người dùng về các sự kiện quan trọng.
*   **Loại thông báo theo vai trò:**
    *   **Student:**
        - Thông báo khi có đề thi mới trong lớp học.
        - Thông báo khi đề thi bắt đầu.
        - Thông báo khi kết quả thi có sẵn.
    *   **Teacher:**
        - Thông báo khi upload tài liệu thành công/thất bại.
        - Thông báo khi tạo đề thi thành công.
        - Thông báo khi đề thi kết thúc (kèm thống kê).
    *   **Admin:**
        - Cảnh báo hệ thống (lỗi, warning).
        - Phát hiện hành vi bất thường của người dùng.
        - Cảnh báo tỉ lệ lỗi API cao.
*   **Luồng xử lý:**
    1.  Hệ thống phát hiện sự kiện (exam created, document uploaded, etc.).
    2.  Tạo notification với `notification_type`, `title`, `message`.
    3.  Lưu vào DB với `is_read = false`.
    4.  Frontend poll hoặc WebSocket để hiển thị thông báo mới.