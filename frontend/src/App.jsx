import './index.css';
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { ProtectedRoute, PublicRoute, RoleRoute } from './components/ProtectedRoute';
import { ROLES } from './contexts/AuthContext';

import MainLayout from './components/layout/MainLayout';

import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import OTPVerification from './pages/OTPVerification';
import ForgotPassword from './pages/ForgotPassword';

import Dashboard from './pages/Dashboard';
import Classrooms from './pages/Classrooms';
import Documents from './pages/Documents';
import Questions from './pages/Questions';
import Exams from './pages/Exams';
import TakeExam from './pages/TakeExam';
import Results from './pages/Results';
import Practice from './pages/Practice';
import Statistics from './pages/Statistics';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import ClassroomDetail from './pages/ClassroomDetail';

import AdminUsers from './pages/AdminUsers';
import AdminLogs from './pages/AdminLogs';
import ExamStatistics from './pages/ExamStatistics';


const PlaceholderPage = ({ title }) => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="text-center card-glass p-12 max-w-md">
      <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
        <svg className="w-8 h-8 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold gradient-text mb-2">{title}</h2>
      <p className="text-gray-500">Trang này đang được phát triển...</p>
    </div>
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <NotificationProvider>
            <Router>
              <Routes>
                <Route path="/" element={<LandingPage />} />

                <Route element={<PublicRoute />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                </Route>

                <Route path="/otp-verification" element={<OTPVerification />} />

                <Route element={<ProtectedRoute />}>
                  <Route path="/app" element={<MainLayout />}>
                    <Route index element={<Navigate to="/app/dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />

                    <Route element={<RoleRoute allowedRoles={[ROLES.ADMIN]} />}>
                      <Route path="users" element={<AdminUsers />} />
                      <Route path="logs" element={<AdminLogs />} />
                    </Route>

                    <Route element={<RoleRoute allowedRoles={[ROLES.ADMIN, ROLES.TEACHER]} />}>
                      <Route path="exams/create" element={<PlaceholderPage title="Tạo đề kiểm tra" />} />
                    </Route>

                    <Route path="documents" element={<Documents />} />
                    <Route path="questions" element={<Questions />} />
                    <Route path="classrooms" element={<Classrooms />} />
                    <Route path="classroom/:classCode" element={<ClassroomDetail />} />
                    <Route path="exams" element={<Exams />} />
                    <Route path="exams/:id" element={<PlaceholderPage title="Chi tiết bài kiểm tra" />} />
                    <Route path="exams/:id/statistics" element={<ExamStatistics />} />
                    <Route path="take-exam/:id" element={<TakeExam />} />
                    <Route path="statistics" element={<Statistics />} />

                    <Route path="results" element={<Results />} />
                    <Route path="results/:id" element={<Results />} />
                    <Route path="practice" element={<Practice />} />

                    <Route path="profile" element={<Profile />} />
                    <Route path="notifications" element={<Notifications />} />
                  </Route>
                </Route>

                <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Router>
          </NotificationProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
