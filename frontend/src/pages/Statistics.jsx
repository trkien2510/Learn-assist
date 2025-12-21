import React, { useState, useEffect } from 'react';
import { statisticsService } from '../services/otherServices';
import { useAuth, ROLES } from '../contexts/AuthContext';
import { ChartIcon, UsersIcon, BookIcon, ExamIcon } from '../components/icons/Icons';

const Statistics = () => {
    const { user, hasRole } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const isTeacher = hasRole([ROLES.ADMIN, ROLES.TEACHER]);

    useEffect(() => {
        fetchStatistics();
    }, []);

    const fetchStatistics = async () => {
        try {
            setLoading(true);
            let response;
            if (hasRole([ROLES.ADMIN])) {
                response = await statisticsService.getSystemStats();
            } else if (isTeacher) {
                response = await statisticsService.getTeacherStats();
            } else {
                response = await statisticsService.getStudentStats();
            }
            const data = response.data || response;
            setStats(data);
        } catch (err) {
            setError(err.message || 'Không thể tải thống kê');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold gradient-text">Thống kê</h1>
                <p className="text-gray-500 mt-2">
                    {isTeacher ? 'Thống kê hoạt động giảng dạy' : 'Thống kê học tập của bạn'}
                </p>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400">
                    {error}
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card-glass p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                            <BookIcon className="w-6 h-6 text-gray-900" />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">Lớp học</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {stats?.total_classrooms || stats?.classrooms_count || 0}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="card-glass p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                            <ExamIcon className="w-6 h-6 text-gray-900" />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">Bài thi</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {stats?.total_exams || stats?.exams_count || 0}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="card-glass p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-linear-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                            <ChartIcon className="w-6 h-6 text-gray-900" />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">Điểm trung bình</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {stats?.average_score?.toFixed(2) || '0.00'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="card-glass p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-linear-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                            <UsersIcon className="w-6 h-6 text-gray-900" />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">
                                {isTeacher ? 'Học sinh' : 'Bài đã làm'}
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                                {stats?.total_students || stats?.completed_exams || 0}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Additional Stats */}
            <div className="card-glass p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Chi tiết thống kê</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-white/5 rounded-xl">
                        <p className="text-gray-500 mb-2">Tổng số câu hỏi đã tạo</p>
                        <p className="text-3xl font-bold text-gray-900">
                            {stats?.total_questions || 0}
                        </p>
                    </div>
                    <div className="p-6 bg-white/5 rounded-xl">
                        <p className="text-gray-500 mb-2">Tổng số tài liệu</p>
                        <p className="text-3xl font-bold text-gray-900">
                            {stats?.total_documents || 0}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Statistics;
