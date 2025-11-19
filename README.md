# Nghiên cứu xây dựng Website tự động tạo bộ câu hỏi ôn tập từ tài liệu

## 1. Giới thiệu đề tài

Hệ thống hỗ trợ giáo viên tạo bộ câu hỏi ôn tập tự động từ tài liệu
PDF/DOCX, sử dụng AI (GPT), kết hợp giao diện ReactJS, backend FastAPI
và cơ sở dữ liệu MongoDB.

## 2. Chức năng chính

-   Upload tài liệu và trích xuất nội dung.
-   Sinh câu hỏi tự động bằng GPT.
-   Tạo bài kiểm tra cho sinh viên.
-   Sinh viên làm bài và hệ thống chấm điểm.
-   Thống kê kết quả học tập.

## 3. Công nghệ sử dụng

-   **Frontend:** ReactJS, TailwindCSS\
-   **Backend:** FastAPI, Python\
-   **Database:** MongoDB\
-   **AI:** GPT (OpenAI API)

## 4. Kiến trúc hệ thống

Frontend ↔ Backend (FastAPI) ↔ MongoDB\
Backend ↔ OpenAI GPT

## 5. Triển khai

-   FastAPI xử lý upload tài liệu, sinh câu hỏi, quản lý user.
-   ReactJS hiển thị UI và tương tác API.
-   MongoDB lưu users, documents, questions, tests, results.

## 6. Hướng phát triển

-   Cải thiện chất lượng sinh câu hỏi.
-   Thêm dạng bài nâng cao.
-   Phát triển mobile app.
