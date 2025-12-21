import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../index.css';

const LandingPage = () => {
    const { isAuthenticated } = useAuth();

    return (
        <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-orange-50">
            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
                <div className="w-full px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16 mx-auto">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <span className="text-xl font-bold gradient-text">Learn Assist</span>
                        </div>
                        {!isAuthenticated && (
                            <div className="flex items-center gap-4">
                                <Link to="/login" className="text-gray-900 hover:text-blue-400 transition-colors">
                                    Đăng nhập
                                </Link>
                                <Link to="/register" className="btn-primary">
                                    Đăng ký ngay
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-24 pb-20 px-6 sm:px-8 lg:px-12 mt-16">
                <div className="mx-auto w-full">
                    <div className="text-center mb-16">
                        <h1 className="text-5xl md:text-7xl font-bold mb-6">
                            <span className="gradient-text">Hệ thống hỗ trợ học tập</span>
                        </h1>
                        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                            Hệ thống tự động tạo câu hỏi ôn tập từ tài liệu,
                            hỗ trợ giáo viên kiểm tra và sinh viên ôn luyện hiệu quả
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/register" className="btn-primary text-lg px-8 py-4">
                                Bắt đầu miễn phí
                            </Link>
                            <button className="btn-secondary text-lg px-8 py-4">
                                Tìm hiểu thêm
                            </button>
                        </div>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mt-20">
                        <div className="card-glass p-8 hover-scale">
                            <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-6"><svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">AI Sinh Câu Hỏi</h3>
                            <p className="text-gray-600">
                                Upload tài liệu PDF/DOCX và để AI tự động tạo bộ câu hỏi trắc nghiệm chất lượng cao
                            </p>
                        </div>

                        <div className="card-glass p-8 hover-scale">
                            <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-6"><svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Quản Lý Lớp Học</h3>
                            <p className="text-gray-600">
                                Tạo lớp học ảo, quản lý học viên, tạo và phân phối đề thi một cách dễ dàng
                            </p>
                        </div>

                        <div className="card-glass p-8 hover-scale">
                            <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-6"><svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Thống Kê Chi Tiết</h3>
                            <p className="text-gray-600">
                                Theo dõi tiến độ học tập, phân tích kết quả với biểu đồ trực quan và báo cáo đầy đủ
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20 px-6 sm:px-8 lg:px-12 bg-white/80">
                <div className=" mx-auto w-full">
                    <h2 className="text-4xl font-bold text-center mb-16">
                        <span className="gradient-text">Cách thức hoạt động</span>
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8">
                            <div className="flex gap-4">
                                <div className="shrink-0 w-12 h-12 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center text-blue-400 font-bold">
                                    1
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Đăng ký tài khoản</h3>
                                    <p className="text-gray-600">Chọn vai trò phù hợp: Giáo viên hoặc Học viên</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="shrink-0 w-12 h-12 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center text-blue-400 font-bold">
                                    2
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Upload tài liệu (Giáo viên)</h3>
                                    <p className="text-gray-600">Tải lên file PDF/DOCX và để AI tạo câu hỏi tự động</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="shrink-0 w-12 h-12 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center text-blue-400 font-bold">
                                    3
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Tạo đề thi</h3>
                                    <p className="text-gray-600">Chọn câu hỏi từ ngân hàng và tạo đề thi cho lớp học</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="shrink-0 w-12 h-12 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center text-blue-400 font-bold">
                                    4
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Làm bài & Xem kết quả</h3>
                                    <p className="text-gray-600">Học viên làm bài, hệ thống tự động chấm và thống kê</p>
                                </div>
                            </div>
                        </div>

                        <div className="card-glass p-8">
                            <div className="aspect-video bg-linear-to-br from-blue-500/20 to-indigo-600/20 rounded-2xl flex items-center justify-center">
                                <svg className="w-24 h-24 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-6 sm:px-8 lg:px-12">
                <div className="max-w-4xl mx-auto text-center w-full">
                    <div className="card-glass p-12">
                        <h2 className="text-4xl font-bold mb-6">
                            <span className="gradient-text">Sẵn sàng bắt đầu?</span>
                        </h2>
                        <Link to="/register" className="btn-primary text-lg px-12 py-4 inline-block">
                            Đăng ký miễn phí ngay
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
