# LearnAssist

> **Nghiên cứu xây dựng Website tự động tạo bộ câu hỏi ôn tập từ tài liệu hỗ trợ giáo viên kiểm tra sinh viên ôn luyện kèm hệ thống thống kê**
---

## Danh Mục Tài Liệu


| Mã tài liệu | Tên tài liệu | Mô tả nội dung | Đối tượng độc giả |
|---|---|---|---|
| **[SAD](documents/SYSTEM_OVERVIEW.md)** | **System Architecture Document** | **Đặc tả Kiến trúc Hệ thống:** Tổng quan bài toán, sơ đồ kiến trúc cao cấp, lựa chọn công nghệ (Tech Stack) và luồng xử lý chính. | Stakeholders, Architects |
| **[DDD](documents/DATABASE_DESIGN.md)** | **Database Design Document** | **Thiết kế Cơ sở Dữ liệu:** Mô hình thực thể liên kết (ER), chi tiết Schema MongoDB (NoSQL) và phân tích quan hệ dữ liệu. | Backend Dev, DBA |
| **[SRS](documents/FUNCTIONALITY_SPEC.md)** | **Software Requirements Spec** | **Đặc tả Yêu cầu Phần mềm:** Danh sách Actors, Use Cases chi tiết, và các yêu cầu chức năng (Functional Requirements). | PM, Developers, QA |
| **[DOG](documents/CONFIGURATION.md)** | **Deployment & Operations Guide** | **Hướng dẫn Triển khai & Vận hành:** Yêu cầu phần cứng, quy trình cài đặt, cấu hình Docker/Nginx và checklist bảo mật. | DevOps, SysAdmin |
| **[API](documents/ENDPOINTS_SUMMARY.md)** | **API Endpoints Summary** | **Danh sách API Endpoints:** Tổng hợp các endpoints, phương thức HTTP, và chức năng chi tiết của hệ thống. | Developers, Frontend Dev |

---

## 🛠️ Tổng Quan Kỹ Thuật

**LearnAssist** là hệ thống tích hợp AI để giải quyết bài toán tự động hóa soạn thảo đề thi.

### Stack Công Nghệ Chính
*   **Backend Core:** Python 3.12, FastAPI.
*   **Database:** MongoDB + Beanie ODM.
*   **AI Engine:** OpenAI GPT Models.
*   **Authentication:** JWT với thuật toán HS256/RS256.
*   **Frontend Core:** ReactJS, TaiwindCSS.

---

## 🚀 Khởi Chạy Nhanh (Quick Start)

Dành cho Developers muốn chạy thử môi trường phát triển cục bộ.

### Backend

1.  **Clone source code:**
    ```bash
    git clone <repo_url>
    cd LearnAssist/backend
    ```

2.  **Tạo môi trường ảo & cài đặt dependencies:**
    ```bash
    python -m venv .venv
    .venv\Scripts\activate      # Windows
    # source .venv/bin/activate # Linux/Mac
    pip install -r requirements.txt
    ```

3.  **Cấu hình & Chạy:**
    *   Tạo file `.env` (tham khảo `.env.template`).
    *   Chạy server:
        ```bash
        uvicorn main:app --reload
        ```
    *   Truy cập Swagger UI: `http://localhost:8000/docs`

### Frontend

1.  **Di chuyển đến thư mục frontend:**
    ```bash
    cd LearnAssist/frontend
    ```

2.  **Cài đặt dependencies:**
    ```bash
    npm install
    ```

3.  **Cấu hình & Chạy:**
    *   Tạo file `.env`:
        ```env
        VITE_API_URL=http://localhost:8000/api
        ```
    *   Chạy development server:
        ```bash
        npm run dev
        ```
    *   Truy cập: `http://localhost:3000`

### Chạy Đồng Thời

```bash
# Backend
cd backend && uvicorn main:app --reload

# Frontend
cd frontend && npm run dev
```