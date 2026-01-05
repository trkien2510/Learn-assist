import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
    SunIcon,
    MoonIcon,
    SparklesIcon,
    TeacherIcon,
    DocumentIcon,
    BookIcon,
    ChartPieIcon,
    BellIcon,
    AdminIcon,
    BriefcaseIcon,
    CheckIcon,
    ArrowRightSmallIcon,
    ArchiveIcon
} from '../components/icons/Icons';
import '../index.css';

const LandingPage = () => {
    const { isAuthenticated } = useAuth();
    const { theme, toggleTheme } = useTheme();

    const features = [
        {
            icon: <SparklesIcon className="w-8 h-8 text-white" />,
            title: 'AI Sinh Câu Hỏi Thông Minh',
            description: 'Upload tài liệu PDF/DOCX và để AI tự động phân tích, tạo bộ câu hỏi trắc nghiệm chất lượng cao. Hỗ trợ chọn số lượng câu hỏi mong muốn.',
            gradient: 'from-blue-500 to-indigo-600',
            badge: 'AI Powered'
        },
        {
            icon: <TeacherIcon className="w-8 h-8 text-white" />,
            title: 'Quản Lý Lớp Học Ảo',
            description: 'Tạo lớp học với mã riêng, quản lý học viên, duyệt yêu cầu tham gia, và giao tiếp qua hệ thống tin nhắn tích hợp.',
            gradient: 'from-purple-500 to-pink-500',
            badge: 'Classroom'
        },
        {
            icon: <DocumentIcon className="w-8 h-8 text-white" />,
            title: 'Tạo Đề Thi Linh Hoạt',
            description: 'Tạo đề thi từ ngân hàng câu hỏi, đặt thời gian, chọn lớp học. Hỗ trợ xem trước và thay thế câu hỏi trước khi phát đề.',
            gradient: 'from-orange-500 to-amber-500',
            badge: 'Exams'
        },
        {
            icon: <BookIcon className="w-8 h-8 text-white" />,
            title: 'Luyện Tập Cá Nhân',
            description: 'Học viên tự tạo đề ôn tập riêng từ tài liệu của mình, luyện tập không giới hạn và theo dõi tiến độ học tập.',
            gradient: 'from-cyan-500 to-teal-500',
            badge: 'Practice'
        },
        {
            icon: <ChartPieIcon className="w-8 h-8 text-white" />,
            title: 'Thống Kê Chi Tiết',
            description: 'Dashboard trực quan với biểu đồ phân tích kết quả học tập, điểm trung bình, và báo cáo chi tiết theo lớp/học viên.',
            gradient: 'from-green-500 to-emerald-500',
            badge: 'Analytics'
        },
        {
            icon: <BellIcon className="w-8 h-8 text-white" />,
            title: 'Thông Báo Thời Gian Thực',
            description: 'Nhận thông báo khi có bài thi mới, kết quả thi, yêu cầu tham gia lớp và các cập nhật quan trọng khác.',
            gradient: 'from-rose-500 to-red-500',
            badge: 'Real-time'
        }
    ];

    const userFlows = {
        teacher: [
            { step: 1, title: 'Đăng ký & Tạo lớp học', desc: 'Tạo tài khoản giáo viên và thiết lập lớp học với mã tham gia riêng' },
            { step: 2, title: 'Upload tài liệu', desc: 'Tải lên PDF/DOCX và chọn số lượng câu hỏi để AI tạo tự động' },
            { step: 3, title: 'Quản lý câu hỏi', desc: 'Xem, chỉnh sửa, phân loại câu hỏi theo chủ đề và độ khó' },
            { step: 4, title: 'Tạo đề thi', desc: 'Chọn câu hỏi, đặt thời gian, gán cho lớp học và phát đề' },
            { step: 5, title: 'Xem kết quả', desc: 'Theo dõi điểm số, phân tích thống kê chi tiết của học viên' }
        ],
        student: [
            { step: 1, title: 'Đăng ký & Tham gia lớp', desc: 'Tạo tài khoản học viên và gửi yêu cầu tham gia lớp bằng mã' },
            { step: 2, title: 'Làm bài thi', desc: 'Nhận thông báo, vào làm bài thi trong thời gian quy định' },
            { step: 3, title: 'Xem kết quả', desc: 'Xem điểm, đáp án đúng sau khi hoàn thành bài thi' },
            { step: 4, title: 'Luyện tập', desc: 'Tự upload tài liệu, tạo đề ôn tập cá nhân không giới hạn' },
            { step: 5, title: 'Theo dõi tiến độ', desc: 'Xem thống kê điểm số, tiến bộ qua các bài thi' }
        ]
    };

    return (
        <div className="min-h-screen bg-(--bg-color) text-(--text-color)">
            <nav className="fixed top-0 w-full z-50 bg-(--glass-bg) backdrop-blur-lg border-b border-(--glass-border)">
                <div className="w-full px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16 mx-auto max-w-7xl">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-linear-to-br/srgb from-blue-500 to-indigo-600 flex items-center justify-center">
                                <BookIcon className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold gradient-text">Learn Assist</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-xl hover:bg-white/10 transition-colors text-(--text-color)"
                                title={theme === 'light' ? 'Chế độ tối' : 'Chế độ sáng'}
                            >
                                {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
                            </button>
                            {!isAuthenticated ? (
                                <>
                                    <Link to="/login" className="text-(--text-color) hover:text-blue-500 transition-colors font-medium">
                                        Đăng nhập
                                    </Link>
                                    <Link to="/register" className="btn-primary">
                                        Đăng ký ngay
                                    </Link>
                                </>
                            ) : (
                                <Link to="/app/dashboard" className="btn-primary">
                                    Vào ứng dụng
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <section className="min-h-[calc(100dvh-4rem)] pt-40 pb-20 sm:px-8 lg:px-12 mt-16 relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
                </div>

                <div className="mx-auto max-w-7xl relative z-10">
                    <div className="text-center mb-16">
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                            <span className="gradient-text">Hệ thống hỗ trợ học tập</span>
                        </h1>
                        <p className="text-xl text-(--text-muted) mb-8 max-w-3xl mx-auto leading-relaxed">
                            Nền tảng tự động tạo câu hỏi trắc nghiệm từ tài liệu,
                            hỗ trợ giáo viên tạo bài kiểm tra và học viên ôn luyện hiệu quả.
                            Quản lý lớp học, theo dõi tiến độ với thống kê chi tiết.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/register" className="btn-primary text-lg px-8 py-4 flex items-center justify-center gap-2">
                                <span>Bắt đầu miễn phí</span>
                                <ArrowRightSmallIcon className="w-5 h-5" />
                            </Link>
                            <a href="#features" className="btn-secondary text-lg px-8 py-4">
                                Khám phá tính năng
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            <section id="features" className="py-20 px-6 sm:px-8 lg:px-12 bg-(--glass-bg)">
                <div className="mx-auto max-w-7xl">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">
                            <span className="gradient-text">Tính năng nổi bật</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                        {features.map((feature, idx) => (
                            <div key={idx} className="card-glass p-8 hover-scale group">
                                <div className="flex items-start justify-between mb-6">
                                    <div className={`w-16 h-16 rounded-2xl bg-linear-to-br/srgb ${feature.gradient} flex items-center justify-center transform group-hover:scale-110 transition-transform`}>
                                        {feature.icon}
                                    </div>
                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20">
                                        {feature.badge}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-(--text-color) mb-4">{feature.title}</h3>
                                <p className="text-(--text-muted) leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section id="how-it-works" className="py-20 px-6 sm:px-8 lg:px-12">
                <div className="mx-auto max-w-7xl">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">
                            <span className="gradient-text">Cách thức hoạt động</span>
                        </h2>
                        <p className="text-(--text-muted) text-lg max-w-2xl mx-auto">
                            Quy trình đơn giản, hiệu quả cho cả giáo viên và học viên
                        </p>
                    </div>

                    <div id="roles" className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <div className="card-glass p-8">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-14 h-14 rounded-2xl bg-linear-to-br/srgb from-purple-500 to-pink-500 flex items-center justify-center">
                                    <ArchiveIcon className="w-7 h-7 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-(--text-color)">Dành cho Giáo viên</h3>
                                    <p className="text-(--text-muted)">Tạo và quản lý nội dung học tập</p>
                                </div>
                            </div>
                            <div className="space-y-6">
                                {userFlows.teacher.map((item) => (
                                    <div key={item.step} className="flex gap-4">
                                        <div className="shrink-0 w-10 h-10 rounded-full bg-purple-500/20 border-2 border-purple-500 flex items-center justify-center text-purple-400 font-bold text-sm">
                                            {item.step}
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-semibold text-(--text-color) mb-1">{item.title}</h4>
                                            <p className="text-(--text-muted) text-sm">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="card-glass p-8">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-14 h-14 rounded-2xl bg-linear-to-br/srgb from-cyan-500 to-teal-500 flex items-center justify-center">
                                    <BookIcon className="w-7 h-7 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-(--text-color)">Dành cho Học viên</h3>
                                    <p className="text-(--text-muted)">Học tập và ôn luyện hiệu quả</p>
                                </div>
                            </div>
                            <div className="space-y-6">
                                {userFlows.student.map((item) => (
                                    <div key={item.step} className="flex gap-4">
                                        <div className="shrink-0 w-10 h-10 rounded-full bg-teal-500/20 border-2 border-teal-500 flex items-center justify-center text-teal-400 font-bold text-sm">
                                            {item.step}
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-semibold text-(--text-color) mb-1">{item.title}</h4>
                                            <p className="text-(--text-muted) text-sm">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-20 px-6 sm:px-8 lg:px-12 bg-(--glass-bg)">
                <div className="mx-auto max-w-7xl">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">
                            <span className="gradient-text">Phân quyền rõ ràng</span>
                        </h2>
                        <p className="text-(--text-muted) text-lg max-w-2xl mx-auto">
                            Hệ thống hỗ trợ 3 vai trò với quyền hạn và tính năng phù hợp
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="card-glass p-8 hover-scale relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl"></div>
                            <div className="w-16 h-16 rounded-2xl bg-linear-to-br/srgb from-red-500 to-rose-600 flex items-center justify-center mb-6 relative z-10">
                                <AdminIcon className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-(--text-color) mb-4">Quản trị viên</h3>
                            <ul className="space-y-3 text-(--text-muted)">
                                <li className="flex items-center gap-2">
                                    <CheckIcon className="w-5 h-5 text-green-500" />
                                    Quản lý toàn bộ người dùng
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckIcon className="w-5 h-5 text-green-500" />
                                    Xem log hoạt động hệ thống
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckIcon className="w-5 h-5 text-green-500" />
                                    Thống kê nền tảng tổng quan
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckIcon className="w-5 h-5 text-green-500" />
                                    Kiểm tra sức khỏe hệ thống
                                </li>
                            </ul>
                        </div>

                        <div className="card-glass p-8 hover-scale relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl"></div>
                            <div className="w-16 h-16 rounded-2xl bg-linear-to-br/srgb from-purple-500 to-indigo-600 flex items-center justify-center mb-6 relative z-10">
                                <BriefcaseIcon className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-(--text-color) mb-4">Giáo viên</h3>
                            <ul className="space-y-3 text-(--text-muted)">
                                <li className="flex items-center gap-2">
                                    <CheckIcon className="w-5 h-5 text-green-500" />
                                    Tạo và quản lý lớp học
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckIcon className="w-5 h-5 text-green-500" />
                                    Upload tài liệu, tạo đề thi
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckIcon className="w-5 h-5 text-green-500" />
                                    Quản lý ngân hàng câu hỏi
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckIcon className="w-5 h-5 text-green-500" />
                                    Xem kết quả và thống kê lớp
                                </li>
                            </ul>
                        </div>

                        <div className="card-glass p-8 hover-scale relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-2xl"></div>
                            <div className="w-16 h-16 rounded-2xl bg-linear-to-br/srgb from-teal-500 to-cyan-600 flex items-center justify-center mb-6 relative z-10">
                                <BookIcon className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-(--text-color) mb-4">Học viên</h3>
                            <ul className="space-y-3 text-(--text-muted)">
                                <li className="flex items-center gap-2">
                                    <CheckIcon className="w-5 h-5 text-green-500" />
                                    Tham gia lớp học bằng mã
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckIcon className="w-5 h-5 text-green-500" />
                                    Làm bài thi trực tuyến
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckIcon className="w-5 h-5 text-green-500" />
                                    Tự luyện tập, ôn bài
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckIcon className="w-5 h-5 text-green-500" />
                                    Xem kết quả và tiến độ
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-20 px-6 sm:px-8 lg:px-12">
                <div className="max-w-4xl mx-auto text-center w-full">
                    <div className="card-glass p-12 relative overflow-hidden">
                        <div className="absolute inset-0 bg-linear-to-br/srgb from-blue-500/5 to-purple-500/5"></div>
                        <div className="relative z-10">
                            <h2 className="text-4xl md:text-5xl font-bold mb-6">
                                <span className="gradient-text">Sẵn sàng bắt đầu?</span>
                            </h2>
                            <p className="text-(--text-muted) text-lg mb-8 max-w-xl mx-auto">
                                Đăng ký ngay để trải nghiệm hệ thống hỗ trợ học tập thông minh.
                                Hoàn toàn miễn phí cho mọi người dùng.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link to="/register" className="btn-primary text-lg px-12 py-4 inline-flex items-center justify-center gap-2">
                                    <span>Đăng ký miễn phí</span>
                                    <ArrowRightSmallIcon className="w-5 h-5" />
                                </Link>
                                <Link to="/login" className="btn-secondary text-lg px-12 py-4 inline-block">
                                    Đã có tài khoản? Đăng nhập
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
