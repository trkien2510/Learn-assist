# LearnAssist Frontend

Frontend application cho hệ thống LearnAssist - Hệ thống tự động tạo câu hỏi ôn tập từ tài liệu hỗ trợ giáo viên kiểm tra và sinh viên ôn luyện.

## 🚀 Công nghệ sử dụng

- **React** 19.2.0 - UI Framework
- **Vite** - Build tool & Development server
- **React Router** 7.9.6 - Client-side routing
- **Tailwind CSS** 4.1.17 - Styling framework
- **JavaScript (ES6+)** - Programming language

## 📋 Yêu cầu hệ thống

- Node.js >= 18.0.0
- npm >= 9.0.0

## 🛠️ Cài đặt và Chạy

### 1. Clone repository và di chuyển vào thư mục frontend

```bash
cd frontend
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Cấu hình biến môi trường

Tạo file `.env.local` từ template:

```bash
cp .env.example .env.local
```

Cập nhật các biến môi trường trong `.env.local`:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

### 4. Chạy development server

```bash
npm run dev
```

Ứng dụng sẽ chạy tại: `http://localhost:3000`

### 5. Build production

```bash
npm run build
```

Các file build sẽ được tạo trong thư mục `dist/`

### 6. Preview production build

```bash
npm run preview
```

## 📁 Cấu trúc dự án

```
frontend/
├── public/              # Static assets
├── src/
│   ├── assets/         # Images, fonts, etc.
│   ├── components/     # Reusable components
│   │   ├── icons/      # Icon components
│   │   ├── layout/     # Layout components (Sidebar, Header, etc.)
│   │   └── ProtectedRoute.jsx
│   ├── config/         # Configuration files
│   │   └── api.js      # API endpoints configuration
│   ├── contexts/       # React contexts
│   │   └── AuthContext.jsx
│   ├── pages/          # Page components
│   │   ├── LandingPage.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── OTPVerification.jsx
│   │   └── Dashboard.jsx
│   ├── services/       # API services
│   │   ├── httpClient.js
│   │   ├── authService.js
│   │   ├── apiServices.js
│   │   └── otherServices.js
│   ├── App.jsx         # Main app component
│   ├── main.jsx        # Entry point
│   └── index.css       # Global styles
├── .env.example        # Environment variables template
├── package.json        # Dependencies and scripts
└── vite.config.js      # Vite configuration
```

## 🎨 Features

### Trang công khai (Chưa đăng nhập)
- **Landing Page**: Trang giới thiệu hệ thống với thiết kế hiện đại
- **Login**: Đăng nhập với email và password
- **Register**: Đăng ký tài khoản mới (Teacher/Student)
- **OTP Verification**: Xác thực email qua mã OTP

### Dashboard theo vai trò

#### 👑 Admin
- Quản lý người dùng
- Quản lý lớp học
- Quản lý tài liệu
- Ngân hàng câu hỏi
- Quản lý đề thi
- Thống kê hệ thống
- Nhật ký hoạt động
- Thông báo hệ thống

#### 👨‍🏫 Teacher (Giảng viên)
- Dashboard tổng quan
- Quản lý lớp học
- Upload tài liệu & AI sinh câu hỏi
- Ngân hàng câu hỏi
- Tạo và quản lý đề thi
- Thống kê chi tiết
- Thông báo

#### 👨‍🎓 Student (Sinh viên)
- Dashboard cá nhân
- Tham gia lớp học
- Làm bài thi
- Xem kết quả học tập
- Tự luyện cá nhân
- Thông báo

## 🔐 Authentication & Authorization

### Authentication Flow

1. **Đăng ký**: User đăng ký → Nhận OTP qua email → Xác thực OTP → Tự động đăng nhập
2. **Đăng nhập**: Email & Password → Nhận access/refresh tokens → Lưu vào localStorage
3. **Token Refresh**: Khi access token hết hạn, tự động refresh bằng refresh token
4. **Đăng xuất**: Xóa tokens và redirect về landing page

### Route Protection

- **Public Routes**: Chỉ truy cập khi chưa đăng nhập (/, /login, /register)
- **Protected Routes**: Yêu cầu đăng nhập (/app/*)
- **Role-based Routes**: Yêu cầu quyền cụ thể (Admin, Teacher)

## 🎯 API Integration

Tất cả API calls được xử lý thông qua:

1. **httpClient.js**: HTTP client với auto token refresh và error handling
2. **Service layers**: Các module services cho từng chức năng
   - authService: Authentication
   - classroomService: Classroom management
   - documentService: Document & AI question generation
   - questionService: Question bank
   - examService: Exam management
   - resultService: Result tracking
   - statisticsService: Statistics & analytics
   - notificationService: Notifications
   - practiceService: Practice exams
   - adminService: Admin functions

## 🎨 Design System

### Colors
- **Primary**: Purple (#8B5CF6) to Pink (#EC4899) gradient
- **Secondary**: Blue (#3B82F6) to Cyan (#06B6D4)
- **Success**: Green (#10B981) to Emerald (#059669)
- **Background**: Slate 900 (#0F172A)
- **Glass Effects**: Backdrop blur with transparency

### Components
- **Buttons**: Primary, Secondary with hover effects
- **Cards**: Glass morphism design
- **Forms**: Modern input fields with icons
- **Animations**: Smooth transitions and micro-interactions

## 📝 Scripts

```bash
# Development
npm run dev          # Start dev server

# Production
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
```

## 🔧 Configuration

### Vite Config
- Port: 3000
- React plugin enabled
- Tailwind CSS integration

### Tailwind Config
- Custom color palette
- Glass morphism utilities
- Animation classes
- Responsive breakpoints

## 🐛 Troubleshooting

### Port already in use
```bash
# Change port in package.json or use:
vite --port 3001
```

### API connection issues
- Kiểm tra backend đang chạy tại `http://localhost:8000`
- Kiểm tra CORS được enable trong backend
- Xác nhận `VITE_API_BASE_URL` trong `.env.local`

### Build errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📚 TODO / Roadmap

### Trang đang phát triển
- [ ] Quản lý lớp học (full CRUD)
- [ ] Upload tài liệu và AI generation
- [ ] Ngân hàng câu hỏi (CRUD)
- [ ] Tạo đề thi từ question bank
- [ ] Làm bài thi với timer
- [ ] Xem kết quả chi tiết
- [ ] Thống kê và biểu đồ
- [ ] Tự luyện cá nhân
- [ ] Quản lý thông báo
- [ ] Hồ sơ cá nhân
- [ ] Cài đặt hệ thống

### Features nâng cao
- [ ] Real-time notifications (WebSocket)
- [ ] Dark/Light mode toggle
- [ ] Export results to PDF
- [ ] Advanced analytics dashboard
- [ ] Mobile responsive optimization
- [ ] PWA support
- [ ] Offline mode

## 👥 Đóng góp

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

© 2025 LearnAssist - trkien2510

## 📞 Liên hệ

- GitHub: [@trkien2510](https://github.com/trkien2510)
- Project Link: [LearnAssist](https://github.com/trkien2510/Learn-assist)
