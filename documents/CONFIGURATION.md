# Hướng Dẫn Triển Khai & Vận Hành (Deployment Guide)

**Dự án:** Nghiên cứu xây dựng Website tự động tạo bộ câu hỏi ôn tập từ tài liệu hỗ trợ giáo viên kiểm tra sinh viên ôn luyện kèm hệ thống thống kê  

---

## 1. Yêu Cầu Môi Trường (Prerequisites)

Để triển khai hệ thống LearnAssist, máy chủ cần đáp ứng các yêu cầu tối thiểu sau:

### 1.1 Phần Cứng (Hardware)
*   **CPU:** Tối thiểu 2 vCPU (Khuyên dùng 4 vCPU cho Production).
*   **RAM:** Tối thiểu 4GB (Khuyên dùng 8GB để xử lý tác vụ PDF nhanh hơn).
*   **Disk:** 50GB SSD (Lưu trữ Database và Logs).

### 1.2 Phần Mềm (Software)
*   **OS:** Ubuntu 22.04 LTS / CentOS 8+.
*   **Runtime:** Python 3.11+.
*   **Database:** MongoDB 6.0+ (Khuyến nghị dùng MongoDB Atlas cho Production).
*   **Process Manager:** Systemd hoặc Docker & Docker Compose.
*   **Web Server:** Nginx (Reverse Proxy).

---

## 2. Quy Trình Cài Đặt (Installation Steps)

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

### Phương Án A: Sử dụng Docker (Khuyên dùng)
Dễ dàng quản lý và đồng nhất môi trường.

1.  **Build Image:**
    ```bash
    docker-compose build
    ```
2.  **Start Services:**
    ```bash
    docker-compose up -d
    ```
3.  **Check Status:**
    ```bash
    docker-compose ps
    docker-compose logs -f app
    ```

### Phương Án B: Chạy Trực Tiếp (Systemd + Gunicorn)
Phù hợp cho Server vật lý hoặc VPS truyền thống.

1.  **Tạo Service File:** `/etc/systemd/system/learnassist.service`
    ```ini
    [Unit]
    Description=LearnAssist API Service
    After=network.target

    [Service]
    User=www-data
    WorkingDirectory=/opt/learnassist/backend
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

## 4. Cấu Hình Reverse Proxy (Nginx)

Sử dụng Nginx để xử lý SSL và chuyển hướng request.

```nginx
server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        
        # Tăng timeout cho tác vụ AI sinh câu hỏi (quan trọng)
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
    }
}
```

---

## 5. Vận Hành & Giám Sát (Operations & Monitoring)

### 5.1 Kiểm Tra Sức Khỏe Hệ Thống (Health Check)
*   API: `GET /health` (Cần implement endpoint này nếu chưa có).
*   DB: Kiểm tra kết nối MongoDB định kỳ.

### 5.2 Sao Lưu Dữ Liệu (Backup)
Thiết lập Cronjob để dump database hàng ngày.
```bash
0 3 * * * mongodump --uri="$MONGO_URI" --gzip --archive=/backup/db_$(date +\%Y\%m\%d).gz
```

### 5.3 Troubleshooting
*   **Lỗi 504 Gateway Timeout:** Thường do AI xử lý tài liệu quá lớn > Tăng `proxy_read_timeout` ở Nginx hoặc giảm kích thước file upload.
*   **Lỗi Connection Refused:** Kiểm tra service MongoDB hoặc Firewall.

---

## 6. Bảo Mật Check-list

- [ ] Đã tắt Debug mode (`DEBUG=False`).
- [ ] Đã đổi `SECRET_KEY` mặc định.
- [ ] MongoDB không expose port ra public internet.
- [ ] Đã cài đặt SSL/TLS certificate (Let's Encrypt).
- [ ] Rate Limiting được cấu hình để chống DDOS/Spam.
