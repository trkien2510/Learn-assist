import React from 'react';
import { useAuth, ROLES } from '../contexts/AuthContext';
import {
    UsersIcon,
    BookIcon,
    ExamIcon,
    DocumentIcon,
    ChartIcon,
    ClockIcon,
    CheckIcon,
    ArrowRightIcon
} from '../components/icons/Icons';

const Dashboard = () => {
    const { user } = useAuth();

    const getStats = () => {
        switch (user?.role) {
            case ROLES.ADMIN:
                return [
                    { name: 'Tổng người dùng', value: '1,234', change: '+12%', icon: UsersIcon, color: 'from-purple-500 to-pink-500' },
                    { name: 'Lớp học', value: '56', change: '+5%', icon: BookIcon, color: 'from-blue-500 to-cyan-500' },
                    { name: 'Đề thi', value: '189', change: '+18%', icon: ExamIcon, color: 'from-green-500 to-emerald-500' },
                    { name: 'Tài liệu', value: '423', change: '+8%', icon: DocumentIcon, color: 'from-orange-500 to-amber-500' }
                ];
            case ROLES.TEACHER:
                return [
                    { name: 'Lớp học của tôi', value: '8', change: '+2', icon: BookIcon, color: 'from-blue-500 to-cyan-500' },
                    { name: 'Học sinh', value: '245', change: '+15', icon: UsersIcon, color: 'from-purple-500 to-pink-500' },
                    { name: 'Đề thi đã tạo', value: '34', change: '+5', icon: ExamIcon, color: 'from-green-500 to-emerald-500' },
                    { name: 'Tài liệu', value: '67', change: '+12', icon: DocumentIcon, color: 'from-orange-500 to-amber-500' }
                ];
            case ROLES.STUDENT:
                return [
                    { name: 'Lớp học đang học', value: '6', change: '', icon: BookIcon, color: 'from-blue-500 to-cyan-500' },
                    { name: 'Bài thi đã làm', value: '23', change: '+3', icon: ExamIcon, color: 'from-green-500 to-emerald-500' },
                    { name: 'Điểm trung bình', value: '8.5', change: '+0.3', icon: ChartIcon, color: 'from-purple-500 to-pink-500' },
                    { name: 'Xếp hạng', value: '#12', change: '↑3', icon: UsersIcon, color: 'from-orange-500 to-amber-500' }
                ];
            default:
                return [];
        }
    };

    const getRecentActivities = () => {
        switch (user?.role) {
            case ROLES.ADMIN:
                return [
                    { id: 1, action: 'Người dùng mới đăng ký', user: 'Nguyễn Văn A', time: '5 phút trước', type: 'user' },
                    { id: 2, action: 'Đề thi mới được tạo', user: 'GV Trần B', time: '1 giờ trước', type: 'exam' },
                    { id: 3, action: 'Lớp học mới được tạo', user: 'GV Lê C', time: '2 giờ trước', type: 'class' },
                    { id: 4, action: 'Tài liệu mới được upload', user: 'GV Phạm D', time: '3 giờ trước', type: 'document' }
                ];
            case ROLES.TEACHER:
                return [
                    { id: 1, action: 'Sinh viên nộp bài', user: 'Nguyễn Văn A', time: '10 phút trước', type: 'exam' },
                    { id: 2, action: 'Sinh viên mới tham gia lớp', user: 'Trần Thị B', time: '30 phút trước', type: 'user' },
                    { id: 3, action: 'Câu hỏi được thêm vào ngân hàng', user: 'Bạn', time: '1 giờ trước', type: 'question' },
                    { id: 4, action: 'Đề thi được công bố', user: 'Bạn', time: '2 giờ trước', type: 'exam' }
                ];
            case ROLES.STUDENT:
                return [
                    { id: 1, action: 'Hoàn thành bài thi Toán cao cấp', user: 'Bạn', time: '1 giờ trước', type: 'exam' },
                    { id: 2, action: 'Nhận điểm bài thi Vật lý', user: 'Bạn', time: '3 giờ trước', type: 'result' },
                    { id: 3, action: 'Tham gia lớp học mới', user: 'Bạn', time: '1 ngày trước', type: 'class' },
                    { id: 4, action: 'Hoàn thành bài thi Hóa học', user: 'Bạn', time: '2 ngày trước', type: 'exam' }
                ];
            default:
                return [];
        }
    };

    const getQuickActions = () => {
        switch (user?.role) {
            case ROLES.ADMIN:
                return [
                    { name: 'Thêm người dùng', description: 'Tạo tài khoản mới', href: '/users/new' },
                    { name: 'Tạo lớp học', description: 'Thiết lập lớp học mới', href: '/classrooms/new' },
                    { name: 'Xem báo cáo', description: 'Thống kê hệ thống', href: '/statistics' }
                ];
            case ROLES.TEACHER:
                return [
                    { name: 'Tạo đề thi', description: 'Tạo đề thi mới từ ngân hàng câu hỏi', href: '/exams/new' },
                    { name: 'Upload tài liệu', description: 'Thêm tài liệu học tập', href: '/documents/new' },
                    { name: 'Xem kết quả', description: 'Xem điểm của học sinh', href: '/statistics' }
                ];
            case ROLES.STUDENT:
                return [
                    { name: 'Làm bài thi', description: 'Xem các bài thi đang mở', href: '/my-exams' },
                    { name: 'Xem điểm', description: 'Kiểm tra kết quả học tập', href: '/my-results' },
                    { name: 'Thư viện', description: 'Xem tài liệu ôn tập', href: '/library' }
                ];
            default:
                return [];
        }
    };

    const upcomingExams = [
        { id: 1, name: 'Kiểm tra Toán cao cấp', class: 'Lớp Toán A1', date: '15/12/2024', time: '08:00', duration: '60 phút' },
        { id: 2, name: 'Bài thi Vật lý', class: 'Lớp Vật lý B2', date: '18/12/2024', time: '14:00', duration: '90 phút' },
        { id: 3, name: 'Kiểm tra Hóa học', class: 'Lớp Hóa C3', date: '20/12/2024', time: '10:00', duration: '45 phút' }
    ];

    const stats = getStats();
    const activities = getRecentActivities();
    const quickActions = getQuickActions();

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Chào buổi sáng';
        if (hour < 18) return 'Chào buổi chiều';
        return 'Chào buổi tối';
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white">
                        {getGreeting()}, <span className="gradient-text">{user?.name || 'User'}</span> 👋
                    </h1>
                    <p className="text-slate-400 mt-1">Chào mừng bạn trở lại! Đây là tổng quan hoạt động của bạn.</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                    <ClockIcon className="w-4 h-4" />
                    <span>{new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => {
                    const IconComponent = stat.icon;
                    return (
                        <div
                            key={stat.name}
                            className="card-glass group cursor-pointer"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-slate-400 text-sm">{stat.name}</p>
                                    <p className="text-2xl md:text-3xl font-bold text-white mt-1">{stat.value}</p>
                                    {stat.change && (
                                        <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
                                            <span>{stat.change}</span> so với tháng trước
                                        </p>
                                    )}
                                </div>
                                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} group-hover:scale-110 transition-transform`}>
                                    <IconComponent className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 card-glass">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-white">Hoạt động gần đây</h2>
                        <button className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors">
                            Xem tất cả <ArrowRightIcon className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {activities.map((activity, index) => (
                            <div
                                key={activity.id}
                                className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activity.type === 'user' ? 'bg-purple-500/20 text-purple-400' :
                                    activity.type === 'exam' ? 'bg-green-500/20 text-green-400' :
                                        activity.type === 'class' ? 'bg-blue-500/20 text-blue-400' :
                                            activity.type === 'result' ? 'bg-amber-500/20 text-amber-400' :
                                                'bg-orange-500/20 text-orange-400'
                                    }`}>
                                    {activity.type === 'user' && <UsersIcon className="w-5 h-5" />}
                                    {activity.type === 'exam' && <ExamIcon className="w-5 h-5" />}
                                    {activity.type === 'class' && <BookIcon className="w-5 h-5" />}
                                    {activity.type === 'document' && <DocumentIcon className="w-5 h-5" />}
                                    {activity.type === 'question' && <DocumentIcon className="w-5 h-5" />}
                                    {activity.type === 'result' && <ChartIcon className="w-5 h-5" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white">{activity.action}</p>
                                    <p className="text-xs text-slate-400">bởi {activity.user}</p>
                                </div>
                                <span className="text-xs text-slate-500">{activity.time}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card-glass">
                    <h2 className="text-lg font-semibold text-white mb-6">Thao tác nhanh</h2>

                    <div className="space-y-3">
                        {quickActions.map((action, index) => (
                            <button
                                key={action.name}
                                className="w-full p-4 rounded-xl border border-white/10 hover:border-purple-500/50 hover:bg-purple-500/10 transition-all text-left group"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-white group-hover:text-purple-300 transition-colors">{action.name}</p>
                                        <p className="text-sm text-slate-400 mt-0.5">{action.description}</p>
                                    </div>
                                    <ArrowRightIcon className="w-5 h-5 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {user?.role === ROLES.STUDENT && (
                <div className="card-glass">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-white">Bài thi sắp tới</h2>
                        <button className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors">
                            Xem tất cả <ArrowRightIcon className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {upcomingExams.map((exam, index) => (
                            <div
                                key={exam.id}
                                className="p-4 rounded-xl border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                        <ExamIcon className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="px-2 py-1 rounded-lg bg-amber-500/20 text-amber-400 text-xs font-medium">
                                        {exam.duration}
                                    </span>
                                </div>
                                <h3 className="font-medium text-white mb-1">{exam.name}</h3>
                                <p className="text-sm text-slate-400 mb-3">{exam.class}</p>
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <ClockIcon className="w-4 h-4" />
                                    <span>{exam.date} • {exam.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
