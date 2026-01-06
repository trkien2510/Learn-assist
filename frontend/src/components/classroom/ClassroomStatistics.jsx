import React, { useState, useEffect, useMemo } from 'react';
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { statisticsService } from '../../services/otherServices';
import { ChartIcon, UsersIcon, ExamIcon, AwardIcon, TrendingUpIcon } from '../icons/Icons';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];
const GRADE_COLORS = {
    'A+': '#10b981', 'A': '#10b981',
    'B+': '#3b82f6', 'B': '#3b82f6',
    'C+': '#f59e0b', 'C': '#f59e0b',
    'D+': '#ef4444', 'D': '#ef4444',
    'F': '#64748b'
};

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-gray-900/90 backdrop-blur-md border border-white/10 p-3 rounded-xl shadow-2xl">
                <p className="text-gray-300 text-xs mb-1 font-bold">{label}</p>
                {payload.map((entry, index) => (
                    <p key={index} className="text-sm" style={{ color: entry.color }}>
                        {entry.name}: <span className="font-bold">{entry.value}</span>
                        {entry.unit || ''}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const ClassroomStatistics = ({ classCode, classroom }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (classroom?._id || classroom?.id) {
            fetchClassStats();
        }
    }, [classroom]);

    const fetchClassStats = async () => {
        try {
            setLoading(true);
            const classId = classroom._id || classroom.id;
            const response = await statisticsService.getClassDetailed(classId);
            setStats(response.data || response);
        } catch (err) {
            setError(err.message || 'Không thể tải thống kê lớp học');
        } finally {
            setLoading(false);
        }
    };

    const chartData = useMemo(() => {
        if (!stats) return {};

        const gradeDistribution = Object.entries(stats.overall_performance?.grade_distribution || {}).map(([grade, count]) => ({
            name: grade, value: count
        })).filter(g => g.value > 0);

        const scoreDistribution = Object.entries(stats.overall_performance?.score_distribution || {}).map(([range, count]) => ({
            range, count
        }));

        return { gradeDistribution, scoreDistribution, trends: stats.trends || [] };
    }, [stats]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                <p className="text-gray-500 font-medium animate-pulse">Đang tải dữ liệu phân tích...</p>
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className="p-8 text-center bg-red-500/5 border border-red-500/20 rounded-2xl">
                <p className="text-red-500 font-medium mb-2">Đã xảy ra lỗi</p>
                <p className="text-gray-500 text-sm">{error}</p>
            </div>
        );
    }

    const { overall_performance, student_performance, exam_breakdown } = stats;

    return (
        <div className="space-y-8 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Điểm trung bình', value: overall_performance.average_score, icon: AwardIcon, color: 'from-blue-500 to-indigo-600' },
                    { label: 'Tỉ lệ đạt', value: `${overall_performance.pass_rate}%`, icon: TrendingUpIcon, color: 'from-green-500 to-emerald-500' },
                    { label: 'Học sinh giỏi', value: `${overall_performance.excellence_rate}%`, icon: UsersIcon, color: 'from-orange-500 to-amber-500' },
                    { label: 'Tổng lượt nộp', value: overall_performance.total_submissions, icon: ExamIcon, color: 'from-purple-500 to-pink-500' }
                ].map((item, i) => (
                    <div key={i} className="card-glass p-5 hover:-translate-y-0.5 transition-all">
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl bg-linear-to-br/srgb ${item.color} flex items-center justify-center text-gray-900 shrink-0`}>
                                <item.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-gray-500 text-[10px] uppercase font-black tracking-widest">{item.label}</p>
                                <p className="text-2xl font-black text-gray-900">{item.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card-glass p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Phân phổ điểm toàn lớp</h3>
                    <div className="w-full">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData.scoreDistribution}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff0a" />
                                <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="count" name="Số học sinh" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card-glass p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Xu hướng học tập</h3>
                    <div className="w-full">
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={chartData.trends}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff0a" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                <YAxis domain={[0, 10]} axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Line type="monotone" dataKey="average_score" name="Điểm TB" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="card-glass overflow-hidden">
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-slate-800/5">
                    <h3 className="text-lg font-bold text-gray-900">Thành tích cá nhân</h3>
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">{student_performance.length} Học sinh</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-white/5">
                                <th className="px-6 py-4">Hạng</th>
                                <th className="px-6 py-4">Học sinh</th>
                                <th className="px-6 py-4 text-center">Đã làm</th>
                                <th className="px-6 py-4 text-center">Điểm TB</th>
                                <th className="px-6 py-4 text-center">Điểm cao nhất</th>
                                <th className="px-6 py-4 text-right">Phân loại</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {student_performance.map((student, idx) => (
                                <tr key={student.student_id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${idx === 0 ? 'bg-amber-400 text-white' :
                                            idx === 1 ? 'bg-slate-300 text-white' :
                                                idx === 2 ? 'bg-orange-400 text-white' :
                                                    'bg-slate-100 text-slate-500'
                                            }`}>
                                            {idx + 1}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-900">{student.full_name}</div>
                                        <div className="text-xs text-gray-400">{student.email}</div>
                                    </td>
                                    <td className="px-6 py-4 text-center text-gray-600 font-medium">
                                        {student.exams_taken}/{student.exams_available}
                                        <div className="w-16 h-1 bg-slate-100 rounded-full mt-1 mx-auto overflow-hidden">
                                            <div className="h-full bg-blue-500" style={{ width: `${student.participation_rate}%` }}></div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`font-black text-lg ${student.average_score >= 8 ? 'text-emerald-500' :
                                            student.average_score >= 5 ? 'text-blue-500' : 'text-rose-500'
                                            }`}>
                                            {student.average_score.toFixed(2)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center text-gray-600 font-bold">
                                        {student.highest_score}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest" style={{
                                            backgroundColor: `${GRADE_COLORS[student.grade]}20`,
                                            color: GRADE_COLORS[student.grade]
                                        }}>
                                            {student.grade}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ClassroomStatistics;
