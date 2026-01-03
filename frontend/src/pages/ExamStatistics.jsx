import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    AreaChart, Area, ComposedChart
} from 'recharts';
import { statisticsService } from '../services/otherServices';
import { useAuth, ROLES } from '../contexts/AuthContext';
import {
    ChartIcon, UsersIcon, ClockIcon, BookIcon,
    ArrowLeftIcon, DownloadIcon, HelpCircleIcon,
    CheckIcon, XIcon, TrendingUpIcon, TargetIcon
} from '../components/icons/Icons';

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

const ExamStatistics = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, hasRole } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        fetchExamStats();
    }, [id]);

    const fetchExamStats = async () => {
        try {
            setLoading(true);
            const response = await statisticsService.getExamDetailed(id);
            setStats(response.data || response);
        } catch (err) {
            setError(err.message || 'Không thể tải thống kê bài thi');
        } finally {
            setLoading(false);
        }
    };

    const chartData = useMemo(() => {
        if (!stats) return {};

        const scoreDistribution = Object.entries(stats.scores?.distribution || {}).map(([range, count]) => ({
            range, count
        }));

        const gradeDistribution = Object.entries(stats.scores?.grade_distribution || {}).map(([grade, count]) => ({
            name: grade, value: count
        })).filter(g => g.value > 0);

        const questionPerformance = stats.questions?.map((q, i) => ({
            name: `Câu ${i + 1}`,
            correctRate: q.correct_rate,
            difficulty: q.difficulty
        })) || [];

        return { scoreDistribution, gradeDistribution, questionPerformance };
    }, [stats]);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
                    <p className="text-gray-500 animate-pulse font-medium">Đang tổng hợp dữ liệu bài thi...</p>
                </div>
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className="max-w-md mx-auto mt-12 text-center p-8 card-glass border-red-500/20">
                <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <HelpCircleIcon className="w-10 h-10" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Đã xảy ra lỗi</h2>
                <p className="text-gray-500 mb-6">{error || 'Không tìm thấy dữ liệu'}</p>
                <button onClick={() => navigate(-1)} className="btn-secondary w-full"> Quay lại</button>
            </div>
        );
    }

    const { exam_info, participation, scores, questions, time_analysis, participants } = stats;

    return (
        <div className="pb-20 animate-fadeIn">
            {/* Breadcrumbs & Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <button
                    onClick={() => navigate('/app/exams')}
                    className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors font-medium group"
                >
                    <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-blue-50 transition-colors">
                        <ArrowLeftIcon className="w-4 h-4" />
                    </div>
                    Quay lại danh sách bài thi
                </button>
            </div>

            {/* Exam Header Card */}
            <div className="card-glass p-8 mb-8 bg-linear-to-br from-slate-900 via-slate-900 to-indigo-950/20 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    <ChartIcon className="w-64 h-64" />
                </div>

                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
                        <div className="w-20 h-20 rounded-3xl bg-emerald-500 flex items-center justify-center text-gray-900 shadow-xl shadow-emerald-500/20">
                            <ExamIcon className="w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-none mb-3">
                                {exam_info.title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-4 text-slate-400 text-sm">
                                <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                                    <ClockIcon className="w-4 h-4" /> {exam_info.duration} phút
                                </span>
                                <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                                    <BookIcon className="w-4 h-4" /> {exam_info.question_count} câu hỏi
                                </span>
                                <span className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20">
                                    <UsersIcon className="w-4 h-4" /> {participation.total_participants} học sinh tham gia
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Summary Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {[
                            { label: 'Điểm TB', value: scores.average, color: 'text-blue-400' },
                            { label: 'Điểm cao nhất', value: scores.highest, color: 'text-emerald-400' },
                            { label: 'Điểm thấp nhất', value: scores.lowest, color: 'text-rose-400' },
                            { label: 'Tỉ lệ đạt', value: `${scores.pass_rate}%`, color: 'text-amber-400' },
                            { label: 'Giỏi & Xuất sắc', value: `${scores.excellence_rate}%`, color: 'text-purple-400' },
                            { label: 'Thời gian TB', value: `${Math.round(time_analysis.average_time_minutes)}p`, color: 'text-indigo-400' }
                        ].map((stat, i) => (
                            <div key={i} className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/5 hover:bg-white/10 transition-colors">
                                <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-1">{stat.label}</p>
                                <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 mb-8 bg-gray-100 p-1.5 rounded-2xl w-fit">
                {[
                    { id: 'overview', label: 'Tổng quan', icon: ChartIcon },
                    { id: 'questions', label: 'Phân tích câu hỏi', icon: HelpCircleIcon },
                    { id: 'participants', label: 'Danh sách nộp bài', icon: UsersIcon }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id
                            ? 'bg-white text-blue-600 shadow-lg shadow-blue-500/10'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Score Distribution Chart */}
                        <div className="card-glass p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-6">Phổ điểm bài thi</h3>
                            <div className="w-full">
                                <ResponsiveContainer width="100%" height={350}>
                                    <ComposedChart data={chartData.scoreDistribution}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff0a" />
                                        <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="count" name="Số lượng" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Grade Pie Chart */}
                        <div className="card-glass p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-6">Phân loại học lực</h3>
                            <div className="w-full shadow-inner">
                                <ResponsiveContainer width="100%" height={350}>
                                    <PieChart>
                                        <Pie
                                            data={chartData.gradeDistribution}
                                            cx="50%" cy="50%"
                                            innerRadius={80}
                                            outerRadius={120}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {chartData.gradeDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={GRADE_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Question Performance Trend */}
                        <div className="card-glass p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <TargetIcon className="w-5 h-5 text-emerald-500" />
                                Tỉ lệ trả lời đúng theo câu hỏi
                            </h3>
                            <div className="w-full">
                                <ResponsiveContainer width="100%" height={350}>
                                    <AreaChart data={chartData.questionPerformance}>
                                        <defs>
                                            <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff0a" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} unit="%" />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area type="monotone" dataKey="correctRate" name="Tỉ lệ đúng" stroke="#10b981" strokeWidth={3} fill="url(#colorRate)" unit="%" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Completion Time Table */}
                        <div className="card-glass p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <ClockIcon className="w-5 h-5 text-indigo-500" />
                                Phân tích thời gian làm bài
                            </h3>
                            <div className="space-y-4">
                                {[
                                    { label: 'Nhanh nhất', value: `${time_analysis.fastest_time.toFixed(1)} phút`, sub: 'Chiếm ưu thế tốc độ' },
                                    { label: 'Chậm nhất', value: `${time_analysis.slowest_time.toFixed(1)} phút`, sub: 'Thời gian tối đa sử dụng' },
                                    { label: 'Trung bình', value: `${time_analysis.average_time_minutes.toFixed(1)} phút`, sub: 'Thời gian hoàn thành tiêu chuẩn' },
                                    { label: 'Median', value: `${time_analysis.median_time.toFixed(1)} phút`, sub: 'Mốc thời gian cân bằng' }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-slate-800/5 rounded-2xl border border-white/5 hover:translate-x-1 transition-transform">
                                        <div>
                                            <p className="font-bold text-gray-900">{item.label}</p>
                                            <p className="text-xs text-gray-500">{item.sub}</p>
                                        </div>
                                        <div className="text-lg font-black text-indigo-600">{item.value}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'questions' && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-bold text-gray-900">Chi tiết hiệu quả câu hỏi</h3>
                        <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div> Dễ (Tỉ lệ {'>'} 70%)</span>
                            <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-rose-500"></div> Khó (Tỉ lệ {'<'} 40%)</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {questions.map((q, i) => (
                            <div key={q.question_id} className={`card-glass p-6 border-l-4 ${q.correct_rate >= 70 ? 'border-l-emerald-500' : q.correct_rate <= 40 ? 'border-l-rose-500' : 'border-l-blue-500'}`}>
                                <div className="flex flex-col md:flex-row gap-8">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-black text-gray-600">#{i + 1}</span>
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${q.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-600' :
                                                q.difficulty === 'Medium' ? 'bg-amber-100 text-amber-600' :
                                                    'bg-rose-100 text-rose-600'
                                                }`}>
                                                Độ khó: {q.difficulty === 'Easy' ? 'Dễ' : q.difficulty === 'Medium' ? 'Trung bình' : 'Khó'}
                                            </span>
                                            {q.is_difficult && (
                                                <span className="bg-rose-500 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest animate-pulse">
                                                    Câu hỏi gây khó khăn
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-gray-900 font-bold text-lg mb-6 leading-relaxed">
                                            {q.content}
                                        </p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {q.options.map((opt, idx) => {
                                                const label = String.fromCharCode(65 + idx);
                                                const isCorrect = label === q.correct_answer;
                                                const popularity = q.answer_distribution[label] || 0;
                                                const popularityRate = q.answered_count > 0 ? (popularity / q.answered_count * 100).toFixed(0) : 0;

                                                return (
                                                    <div key={idx} className={`p-4 rounded-2xl border transition-all ${isCorrect
                                                        ? 'bg-emerald-50 border-emerald-500/30'
                                                        : 'bg-white/5 border-white/5 grayscale-50 opacity-80'
                                                        }`}>
                                                        <div className="flex items-center justify-between mb-1">
                                                            <div className="flex items-center gap-3">
                                                                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black ${isCorrect ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-gray-600'}`}>
                                                                    {label}
                                                                </span>
                                                                <span className={`text-sm ${isCorrect ? 'text-emerald-700 font-bold' : 'text-gray-500'}`}>{opt}</span>
                                                            </div>
                                                            {isCorrect && <CheckIcon className="w-5 h-5 text-emerald-500" />}
                                                        </div>
                                                        <div className="mt-2 w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                                                            <div className={`h-full ${isCorrect ? 'bg-emerald-500' : 'bg-slate-400'}`} style={{ width: `${popularityRate}%` }}></div>
                                                        </div>
                                                        <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-widest">{popularityRate}% học sinh chọn</p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <div className="w-full md:w-64 flex flex-col justify-center items-center bg-slate-800/10 rounded-3xl p-6 border border-white/5">
                                        <div className="text-center mb-6">
                                            <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-1">Tỉ lệ đúng</p>
                                            <p className={`text-5xl font-black ${q.correct_rate >= 70 ? 'text-emerald-500' : q.correct_rate <= 40 ? 'text-rose-500' : 'text-blue-500'}`}>
                                                {q.correct_rate}%
                                            </p>
                                        </div>
                                        <div className="w-full space-y-3">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-gray-500 font-bold">Số câu đúng:</span>
                                                <span className="text-gray-900 font-black">{q.correct_count}</span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-gray-500 font-bold">Số lần nộp:</span>
                                                <span className="text-gray-900 font-black">{q.answered_count}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'participants' && (
                <div className="card-glass overflow-hidden">
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Chi tiết bảng điểm</h3>
                            <p className="text-sm text-gray-500">Danh sách tất cả học sinh đã nộp bài</p>
                        </div>
                        <button className="btn-secondary flex items-center gap-2 text-sm py-2">
                            <DownloadIcon className="w-4 h-4" /> Xuất Excel
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-800/5">
                                <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    <th className="px-6 py-4">Hạng</th>
                                    <th className="px-6 py-4">Sinh viên</th>
                                    <th className="px-6 py-4">Thời gian</th>
                                    <th className="px-6 py-4">Số câu đúng</th>
                                    <th className="px-6 py-4">Điểm số</th>
                                    <th className="px-6 py-4 text-right">Phần trăm</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {participants.map(p => (
                                    <tr key={p.user_id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${p.rank === 1 ? 'bg-amber-400 text-white shadow-lg shadow-amber-400/20' :
                                                p.rank === 2 ? 'bg-slate-300 text-white shadow-lg' :
                                                    p.rank === 3 ? 'bg-orange-400 text-white shadow-lg' :
                                                        'bg-slate-100 text-slate-500'
                                                }`}>
                                                {p.rank}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{p.full_name}</div>
                                            <div className="text-xs text-slate-400 italic font-medium">{p.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-gray-600 font-medium">
                                                <ClockIcon className="w-3 h-3" />
                                                {p.time_taken_minutes} phút
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-black text-slate-500">{p.correct_answers}</span>
                                            <span className="text-slate-400">/{exam_info.question_count}</span>
                                        </td>
                                        <td className="px-6 py-4 text-lg">
                                            <span className={`font-black ${p.score >= 8 ? 'text-emerald-500' :
                                                p.score >= 5 ? 'text-blue-500' : 'text-rose-500'
                                                }`}>
                                                {p.score.toFixed(2)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="text-xs font-black text-slate-400 bg-slate-100 dark:bg-slate-800 w-fit ml-auto px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                                                Top {100 - p.percentile}%
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExamStatistics;
