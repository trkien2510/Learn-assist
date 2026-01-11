# Hướng Dẫn Triển Khai & Vận Hành (Deployment Guide)

**Dự án:** Nghiên cứu xây dựng Website tự động tạo bộ câu hỏi ôn tập từ tài liệu hỗ trợ giáo viên kiểm tra sinh viên ôn luyện kèm hệ thống thống kê  
**Cập nhật lần cuối:** 2026-01-11

---

## 1. Yêu Cầu Môi Trường (Prerequisites)

### 1.1 Phần Cứng (Hardware)
*   **CPU:** Tối thiểu 2 vCPU.
*   **RAM:** 2GB hoặc lớn hơn.
*   **Disk:** >= 5GB lưu trữ.

### 1.2 Phần Mềm (Software)
*   **OS:** Ubuntu 22.04 LTS / Windows 10+.
*   **Runtime:** Python 3.11+, Node.js 18+.
*   **Database:** MongoDB 6.0+.
*   **Web Server:** Nginx.

---

## 2. Cấu Hình Biến Môi Trường
### Bước 1: Chuẩn Bị Source Code
```bash
git clone https://github.com/your-repo/learn-assist.git
cd learn-assist/backend
```

### Bước 2: Thiết Lập Môi Trường Ảo Python
Khuyến nghị sử dụng `venv` để cách ly thư viện.
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

### Bước 3: Cấu Hình Biến Môi Trường
Tạo file `.env` từ template và cập nhật các giá trị bảo mật.
```bash
cp .env.template .env
nano .env
```
*Lưu ý:*
*   `SECRET_KEY`: Phải là chuỗi ngẫu nhiên dài (dùng `openssl rand -hex 32`).
*   `OPENAI_API_KEY`: Đảm bảo key có đủ quota và quyền truy cập model GPT.
*   `MONGO_URI`: Nên sử dụng connection string có xác thực (username/password).

---

## 3. Phương Án Triển Khai (Deployment Strategies)

### Phương Án A: Docker (Khuyên dùng)

1.  **Build và Start:**
    ```bash
    docker-compose build
    docker-compose up -d
    ```

2.  **Check Status:**
    ```bash
    docker-compose ps
    docker-compose logs -f app
    ```

### Phương Án B: Systemd + Gunicorn

1.  **Tạo Service File:** `/etc/systemd/system/learnassist.service`
    ```ini
    [Unit]
    Description=LearnAssist API Service
    After=network.target

    [Service]
    User=www-data
    WorkingDirectory=/opt/learnassist/backend
    Environment="PATH=/opt/learnassist/backend/.venv/bin"
    ExecStart=/opt/learnassist/backend/.venv/bin/gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:8000
    Restart=always

    [Install]
    WantedBy=multi-user.target
    ```

2.  **Start Service:**
    ```bash
    sudo systemctl daemon-reload
    sudo systemctl enable learnassist
    sudo systemctl start learnassist
    ```

---

## 4. Cấu Hình Reverse Proxy

```nginx
# /etc/nginx/sites-available/learnassist
server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        
        # Tăng timeout cho tác vụ AI sinh câu hỏi
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
    }
}

server {
    listen 80;
    server_name example.com www.example.com;

    root /opt/learnassist/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## 5. Cấu Hình Email

Để sử dụng Gmail gửi OTP:

1.  **Bật 2-Factor Authentication** cho tài khoản Gmail.
2.  **Tạo App Password:**
    - Vào Google Account → Security → 2-Step Verification → App passwords
    - Tạo password mới cho "Mail"
3.  **Cập nhật `.env`:**
    ```env
    MAIL_USERNAME=your-email@gmail.com
    MAIL_PASSWORD=xxxx-xxxx-xxxx-xxxx  # App password
    ```

---

## 6. Vận Hành & Giám Sát (Operations & Monitoring)

### 6.1 Kiểm Tra Sức Khỏe Hệ Thống
*   **API Docs:** `GET /docs` hoặc `/redoc`
*   **Admin Health Check:** `GET /api/admin/notifications/system-health`
*   **Admin System Health:** `GET /api/admin/stats/system/health`
*   **MongoDB:** Kiểm tra kết nối định kỳ

### 6.2 Sao Lưu Dữ Liệu
```bash
# Daily backup với cron
0 3 * * * mongodump --uri="$MONGO_URI" --gzip --archive=/backup/db_$(date +\%Y\%m\%d).gz
```

### 6.3 Dọn dẹp tự động & Background Tasks
Hệ thống tự động:
*   Xóa logs sau 30 ngày (TTL Index)
*   Xóa OTP hết hạn
*   **Auto-Submit Service:** Kiểm tra và tự động nộp bài thi hết hạn mỗi 30 giây
*   Admin có thể trigger cleanup thủ công qua API

### 6.4 Troubleshooting

| Lỗi | Nguyên nhân | Giải pháp |
|-----|-------------|-----------|
| 504 Gateway Timeout | AI xử lý tài liệu lớn | Tăng `proxy_read_timeout` |
| Connection Refused | MongoDB không chạy | Kiểm tra service MongoDB |
| OTP không tới | Sai cấu hình email | Kiểm tra MAIL_* variables |
| CORS Error | Sai FRONTEND_URL | Cập nhật FRONTEND_URL trong .env |
| JWT Invalid | SECRET_KEY thay đổi | Logout và login lại |

---

## 7. Bảo Mật Check-list

### Production Deployment
- [ ] Đã tắt Debug mode (`DEBUG=False`)
- [ ] Đã đổi `SECRET_KEY` mặc định
- [ ] MongoDB không expose port ra public internet
- [ ] Đã cài đặt SSL/TLS certificate (Let's Encrypt)
- [ ] CORS chỉ cho phép domain production
- [ ] Rate Limiting được cấu hình

### Email & OTP
- [ ] Sử dụng App Password thay vì password chính
- [ ] OTP expiry = 5 phút
- [ ] Max attempts = 5

### Database
- [ ] MongoDB có authentication enabled
- [ ] Regular backups đã được thiết lập
- [ ] TTL indexes hoạt động

---

## 7. Thông Tin Hỗ Trợ

### API Documentation
- Swagger UI: `/docs`
- ReDoc: `/redoc`

### Database Collections
- users, classrooms, documents, questions, exams, results, logs, notifications, otp, messages, join_request

### Version
- Backend: FastAPI
- Frontend: React 18 + Vite 6 + TailwindCSSv4
- Database: MongoDB Alast
- Python: 3.11+
- Node.js: 18+
