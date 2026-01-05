import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, ROLES } from '../contexts/AuthContext';
import { dashboardService } from '../services/otherServices';
import StatsCard from '../components/dashboard/StatsCard';
import QuickActions from '../components/dashboard/QuickActions';
import RecentActivity from '../components/dashboard/RecentActivity';
import {
    UsersIcon,
    BookIcon,
    ExamIcon,
    DocumentIcon,
    ChartIcon,
    ClockIcon,
    ArrowRightIcon
} from '../components/icons/Icons';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await dashboardService.getDashboard();
                const data = response.data || response;
                setDashboardData(data);
            } catch (err) {
                console.error('Failed to fetch dashboard:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    const getStats = () => {
        if (!dashboardData) return [];

        switch (user?.role) {
            case ROLES.ADMIN:
                return [
                    {
                        name: 'Tổng người dùng',
                        value: dashboardData.total_users || 0,
                        icon: UsersIcon,
                        color: 'from-blue-500 to-indigo-600'
                    },
                    {
                        name: 'Lớp học',
                        value: dashboardData.total_classrooms || 0,
                        icon: BookIcon,
                        color: 'from-blue-500 to-cyan-500'
                    },
                    {
                        name: 'Bài kiểm tra',
                        value: dashboardData.total_exams || 0,
                        icon: ExamIcon,
                        color: 'from-green-500 to-emerald-500'
                    },
                    {
                        name: 'Câu hỏi',
                        value: dashboardData.total_questions || 0,
                        icon: DocumentIcon,
                        color: 'from-orange-500 to-amber-500'
                    }
                ];

            case ROLES.TEACHER:
                return [
                    {
                        name: 'Lớp học của tôi',
                        value: dashboardData.total_classrooms || 0,
                        icon: BookIcon,
                        color: 'from-blue-500 to-cyan-500'
                    },
                    {
                        name: 'Học sinh',
                        value: dashboardData.total_students || 0,
                        icon: UsersIcon,
                        color: 'from-blue-500 to-indigo-600'
                    },
                    {
                        name: 'Bài kiểm tra đã tạo',
                        value: dashboardData.total_exams || 0,
                        icon: ExamIcon,
                        color: 'from-green-500 to-emerald-500'
                    },
                    {
                        name: 'Câu hỏi',
                        value: dashboardData.total_questions || 0,
                        icon: DocumentIcon,
                        color: 'from-orange-500 to-amber-500'
                    }
                ];

            case ROLES.STUDENT:
                return [
                    {
                        name: 'Lớp học đang tham gia',
                        value: dashboardData.total_classrooms || 0,
                        icon: BookIcon,
                        color: 'from-blue-500 to-cyan-500'
                    },
                    {
                        name: 'Bài kiểm tra đã làm',
                        value: dashboardData.total_exams_taken || 0,
                        icon: ExamIcon,
                        color: 'from-green-500 to-emerald-500'
                    },
                    {
                        name: 'Điểm trung bình',
                        value: dashboardData.average_score?.toFixed(1) || '0.0',
                        icon: ChartIcon,
                        color: 'from-blue-500 to-indigo-600',
                        subtitle: 'Thang điểm 10'
                    }
                ];

            default:
                return [];
        }
    };

    const getRecentActivities = () => {
        if (!dashboardData || !dashboardData.recent_activities) return [];
        return dashboardData.recent_activities;
    };

    const getQuickActions = () => {
        switch (user?.role) {
            case ROLES.ADMIN:
                return [
                    { name: 'Quản lý người dùng', description: 'Xem và quản lý tài khoản', href: '/app/users' },
                    { name: 'Quản lý lớp học', description: 'Xem tất cả lớp học', href: '/app/classrooms' },
                    { name: 'Xem logs hệ thống', description: 'Theo dõi hoạt động', href: '/app/logs' },
                ];
            case ROLES.TEACHER:
                return [
                    { name: 'Tạo bài kiểm tra', description: 'Tạo bài kiểm tra mới từ ngân hàng câu hỏi', href: '/app/exams' },
                    { name: 'Upload tài liệu', description: 'Thêm tài liệu học tập', href: '/app/documents' },
                    { name: 'Ngân hàng câu hỏi', description: 'Quản lý câu hỏi', href: '/app/questions' }
                ];
            case ROLES.STUDENT:
                return [
                    { name: 'Làm bài kiểm tra', description: 'Xem các bài kiểm tra đang mở', href: '/app/exams' },
                    { name: 'Xem điểm', description: 'Kiểm tra kết quả học tập', href: '/app/results' },
                    { name: 'Luyện tập', description: 'Tạo bài kiểm tra thử', href: '/app/practice' }
                ];
            default:
                return [];
        }
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Chào buổi sáng';
        if (hour < 18) return 'Chào buổi chiều';
        return 'Chào buổi tối';
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-fadeIn">
                <div className="h-20 glass rounded-2xl animate-pulse"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-32 glass rounded-2xl animate-pulse"></div>
                    ))}
                </div>
                <div className="h-96 glass rounded-2xl animate-pulse"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">❌</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Không thể tải dữ liệu</h3>
                    <p className="text-gray-500 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-linear-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    const stats = getStats();
    const activities = getRecentActivities();
    const quickActions = getQuickActions();

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                        {getGreeting()}, <span className="gradient-text">{user?.full_name || 'User'}</span> 👋
                    </h1>
                    <p className="text-gray-500 mt-1">Chào mừng bạn trở lại! Đây là tổng quan hoạt động của bạn.</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <ClockIcon className="w-4 h-4" />
                    <span>{new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <StatsCard key={stat.name} stat={stat} index={index} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 card-glass">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-gray-900">Hoạt động gần đây</h2>
                        {user?.role === ROLES.ADMIN && (
                            <button
                                onClick={() => navigate('/app/logs')}
                                className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                            >
                                Xem tất cả <ArrowRightIcon className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                        <RecentActivity activities={activities} />
                    </div>
                </div>

                <QuickActions actions={quickActions} />
            </div>
        </div>
    );
};

export default Dashboard;
