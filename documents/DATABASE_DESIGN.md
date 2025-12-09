# Thiết Kế Cơ Sở Dữ Liệu (Database Design Document)

**Dự án:** LearnAssist  
**Hệ quản trị CSDL:** MongoDB  
**Mô hình:** Document-Oriented  

---

## 1. Mô Hình Thực Thể Liên Kết (Conceptual Data Model)

Hệ thống được thiết kế dựa trên các thực thể chính sau:
- **Actor:** User (Admin, Teacher, Student)
- **Academic:** Classroom, Support (JoinRequest)
- **Content:** Document, Question
- **Assessment:** Exam, Result
- **System:** Log, Notification

Sơ đồ quan hệ tổng quát:

### Quan hệ chính (Core Relationships)
- **User** (1) ---- (n) **Classroom** (Creator - tạo lớp học)
- **User** (n) ---- (n) **Classroom** (Member - thành viên lớp học)
- **User** (1) ---- (n) **Document** (Uploader - người tải tài liệu)
- **Document** (1) ---- (n) **Question** (Source - nguồn sinh câu hỏi)
- **User** (1) ---- (n) **Question** (Creator - người tạo câu hỏi)

### Quan hệ thi cử (Assessment Relationships)
- **Classroom** (1) ---- (n) **Exam** (Exams thuộc lớp học)
- **User** (1) ---- (n) **Exam** (Creator - người tạo đề thi)
- **Exam** (n) ---- (n) **Question** (Question Bank Reference)
- **User** (1) ---- (n) **Result** (Candidate - người làm bài)
- **Exam** (1) ---- (n) **Result** (Kết quả của đề thi)

### Quan hệ yêu cầu tham gia (Join Request Relationships)
- **User** (1) ---- (n) **JoinRequest** (Student gửi yêu cầu)
- **Classroom** (1) ---- (n) **JoinRequest** (Yêu cầu vào lớp)

### Quan hệ thông báo (Notification Relationships)
- **User** (1) ---- (n) **Notification** (Người nhận thông báo)

### Quan hệ nhật ký (Log Relationships)
- **User** (1) ---- (n) **Log** (Hành động của người dùng)

---

## 2. Thiết Kế Schema Chi Tiết (Schema Specification)

Dưới đây là đặc tả chi tiết cho từng Collection trong MongoDB. Các trường dữ liệu đi kèm với kiểu dữ liệu và ràng buộc (Constraints).

### 2.1 Collection `users`
Lưu trữ thông tin người dùng hệ thống.
*   **Index:** `username` (unique), `email` (unique).
*   **Schema:**
    ```json
    {
      "_id": "ObjectId",
      "username": "String (Unique, Index)",
      "email": "String (Unique, Index, Format: Email)",
      "hashed_password": "String (Bcrypt Hash)",
      "full_name": "String",
      "dob": "Date",
      "phone_number": "String (Optional)",
      "role": "Enum ['admin', 'teacher', 'student']",
      "is_activate": "Boolean (Default: true)",
      "created_at": "DateTime",
      "updated_at": "DateTime"
    }
    ```

### 2.2 Collection `classrooms`
Quản lý không gian lớp học ảo.
*   **Index:** `class_code` (unique).
*   **Schema:**
    ```json
    {
      "_id": "ObjectId",
      "name": "String (Required)",
      "class_code": "String (Len: 8, Hex, Unique)",
      "description": "String",
      "subject": "String",
      "creator": "Link<UserModel>",
      "members": ["Link<UserModel>"],
      "created_at": "DateTime"
    }
    ```

### 2.3 Collection `document`
Quản lý tài liệu học tập được tải lên để sinh câu hỏi.
*   **Schema:**
    ```json
    {
      "_id": "ObjectId",
      "name": "String",
      "file_name": "String (Original Filename)",
      "file_path": "String (Storage Path)",
      "file_type": "String (MIME Type: PDF/DOCX)",
      "creator": "Link<UserModel>",
      "upload_date": "DateTime"
    }
    ```

### 2.4 Collection `question`
Ngân hàng câu hỏi trắc nghiệm.
*   **Schema:**
    ```json
    {
      "_id": "ObjectId",
      "content": "String (HTML/Text)",
      "options": ["String (Size: 4)"],
      "answers": "String (Must match one of options)",
      "difficulty": "Enum ['Easy', 'Medium', 'Hard']",
      "document_id": "Link<DocumentModel> (Optional - if generated from doc)",
      "creator_id": "Link<UserModel>"
    }
    ```

### 2.5 Collection `exam`
Đề thi được cấu hình từ ngân hàng câu hỏi.
*   **Schema:**
    ```json
    {
      "_id": "ObjectId",
      "title": "String",
      "duration": "Integer (Minutes)",
      "start_at": "DateTime",
      "end_at": "DateTime",
      "expiry_at": "DateTime",
      "class_id": "Link<ClassroomModel>",
      "creator_id": "Link<UserModel>",
      "questions": ["Link<QuestionModel>"]
    }
    ```
    *Ràng buộc:* `start_at` < `end_at`.

### 2.6 Collection `result`
Lưu trữ bài làm và kết quả của sinh viên.
*   **Index:** Compound Index `(exam_id, user_id)`.
*   **Schema:**
    ```json
    {
      "_id": "ObjectId",
      "exam_id": "Link<ExamModel>",
      "user_id": "Link<UserModel>",
      "started_at": "DateTime",
      "ended_at": "DateTime (Nullable)",
      "answer_map": "Map<QuestionID, AnswerString>",
      "submitted": "Boolean",
      "score": "Float (Scale: 2)",
      "submit_at": "DateTime"
    }
    ```

### 2.7 Collection `logs`
Ghi nhật ký hệ thống (Audit Trail).
*   **Index:** `created_at` (TTL Index: 30 days).
*   **Schema:**
    ```json
    {
      "_id": "ObjectId",
      "action": "String",
      "user_id": "String (Optional)",
      "resource_type": "String (Optional)",
      "resource_id": "String (Optional)",
      "details": "Object (Flexible)",
      "status": "String (Default: 'success')",
      "created_at": "DateTime (UTC)"
    }
    ```

### 2.8 Collection `notifications`
Quản lý thông báo cho người dùng và hệ thống.
*   **Index:** `user_id + created_at` (compound), `is_read`.
*   **Schema:**
    ```json
    {
      "_id": "ObjectId",
      "user_id": "Link<UserModel>",
      "notification_type": "Enum ['exam_created', 'exam_started', 'exam_ended', 'exam_result', 'document_upload_success', 'document_upload_failed', 'exam_creation_success', 'exam_statistics_available', 'system_error', 'system_warning', 'user_anomaly', 'high_error_rate']",
      "title": "String",
      "message": "String",
      "related_id": "String (Optional - ID of related resource)",
      "related_type": "String (Optional - Type of related resource)",
      "is_read": "Boolean (Default: false)",
      "created_at": "DateTime (UTC)"
    }
    ```

### 2.9 Collection `join_request`
Quản lý yêu cầu tham gia lớp học.
*   **Schema:**
    ```json
    {
      "_id": "ObjectId",
      "user_id": "Link<UserModel>",
      "class_id": "Link<ClassroomModel>",
      "request_at": "DateTime (UTC)"
    }
    ```

---

## 3. Phân Tích Quan Hệ Dữ Liệu

### 3.1 Quan Hệ Tham Chiếu (Reference)
MongoDB không hỗ trợ Foreign Key cứng như SQL, nhưng thiết kế sử dụng **DBRef (Link)** để duy trì quan hệ logic:
*   **Classroom - User:** Quan hệ N-N. Được xử lý bằng cách nhúng mảng `members (List[Link])` vào trong Document `Classroom`. Lý do: Số lượng thành viên trong một lớp học thường giới hạn (< 100), việc nhúng giúp truy vấn nhanh hơn.
*   **Exam - Question:** Quan hệ 1-N. Nhúng mảng `questions (List[Link])` trong Document `Exam`.
*   **Document - Question:** Quan hệ 1-N. `Question` tham chiếu ngược về `Document` thông qua `document_id`.

### 3.2 Chiến Lược Đánh Index
Để tối ưu hóa hiệu năng truy vấn cho các chức năng chính, các Index sau được đề xuất:
1.  **Authentication:** `users.email` và `users.username` để đảm bảo đăng nhập và đăng ký nhanh chóng.
2.  **Classroom Access:** `classrooms.class_code` phục vụ tính năng tìm kiếm lớp. `classrooms.members.$id` để sinh viên load danh sách lớp của mình (Reverse Lookup).
3.  **Analytics:** `results.exam_id` và `results.user_id` để tổng hợp điểm số.

---

## 4. Chính Sách Dữ Liệu

*   **Tính Vẹn Toàn:** Khi xóa `User`, các `Result` của user đó sẽ được giữ lại (không xóa cascade) để đảm bảo tính lịch sử của dữ liệu thi cử.
*   **Vòng Đời Dữ Liệu:** Logs sẽ tự động bị xóa sau 30 ngày nhờ TTL Index để tiết kiệm dung lượng lưu trữ.
*   **Định Dạng Thời Gian:** Tất cả `DateTime` đều được lưu dưới dạng UTC để đảm bảo tính nhất quán múi giờ.
