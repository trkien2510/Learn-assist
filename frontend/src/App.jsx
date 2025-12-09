import './index.css';
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

import MainLayout from './components/layout/MainLayout';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

const PlaceholderPage = ({ title }) => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="text-center card-glass p-12 max-w-md">
      <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold gradient-text mb-2">{title}</h2>
      <p className="text-slate-400">Trang này đang được phát triển...</p>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />

            <Route path="users" element={<PlaceholderPage title="Quản lý người dùng" />} />
            <Route path="classrooms" element={<PlaceholderPage title="Quản lý lớp học" />} />
            <Route path="logs" element={<PlaceholderPage title="Nhật ký hoạt động" />} />
            <Route path="documents" element={<PlaceholderPage title="Quản lý tài liệu" />} />
            <Route path="questions" element={<PlaceholderPage title="Ngân hàng câu hỏi" />} />
            <Route path="exams" element={<PlaceholderPage title="Quản lý đề thi" />} />
            <Route path="statistics" element={<PlaceholderPage title="Thống kê" />} />

            <Route path="my-classrooms" element={<PlaceholderPage title="Lớp học của tôi" />} />

            <Route path="my-exams" element={<PlaceholderPage title="Bài thi của tôi" />} />
            <Route path="my-results" element={<PlaceholderPage title="Kết quả học tập" />} />
            <Route path="library" element={<PlaceholderPage title="Thư viện tài liệu" />} />

            <Route path="profile" element={<PlaceholderPage title="Hồ sơ cá nhân" />} />
            <Route path="settings" element={<PlaceholderPage title="Cài đặt" />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
