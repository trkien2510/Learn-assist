import React, { useState, useEffect, useMemo } from 'react';
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { statisticsService } from '../services/apiServices';
import { useAuth, ROLES } from '../contexts/AuthContext';
import {
    ChartIcon, UsersIcon, BookIcon, ExamIcon,
    AwardIcon, TargetIcon,
    ArrowRightIcon, CalendarIcon
} from '../components/icons/Icons';
import { useNavigate } from 'react-router-dom';

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
                <p className="text-gray-300 text-xs mb-1 font-bold italic">{label}</p>
                {payload.map((entry, index) => {
                    const value = entry.dataKey === 'avgScore' && entry.payload.displayAvgScore
                        ? entry.payload.displayAvgScore
                        : entry.value;
                    return (
                        <p key={index} className="text-sm font-bold" style={{ color: entry.color }}>
                            {entry.name}: {value}
                            {entry.unit || ''}
                        </p>
                    );
                })}
            </div>
        );
    }
    return null;
};

const Statistics = () => {
    const { user, hasRole } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [timeRange, setTimeRange] = useState('daily');

    const isTeacher = hasRole([ROLES.TEACHER]);
    const isAdmin = hasRole([ROLES.ADMIN]);

    useEffect(() => {
        fetchStatistics();
    }, []);

    const fetchStatistics = async () => {
        try {
            setLoading(true);
            let response;
            if (hasRole([ROLES.ADMIN])) {
                response = await statisticsService.getPlatform();
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

    const chartData = useMemo(() => {
        if (!stats) return {};

        if (!isTeacher && !isAdmin) {
            const scoreDistribution = Object.entries(stats.performance?.score_distribution || {}).map(([range, count]) => ({
                range, count
            }));

            const gradeDistribution = Object.entries(stats.performance?.grade_distribution || {}).map(([grade, count]) => ({
                name: grade, value: count
            })).filter(g => g.value > 0);

            const classroomRadar = stats.classroom_performance?.map(c => ({
                subject: c.classroom_name,
                score: c.average_score,
                fullMark: 10
            })) || [];

            return { scoreDistribution, gradeDistribution, classroomRadar };
        } else if (isTeacher) {
            const classPerformance = stats.classrooms?.map(c => ({
                name: c.name,
                avgScore: c.average_score * 10,
                displayAvgScore: c.average_score,
                passRate: c.pass_rate
            })) || [];

            const gradeDistribution = Object.entries(stats.student_performance?.grade_distribution || {}).map(([grade, count]) => ({
                name: grade, value: count
            })).filter(g => g.value > 0);

            const difficultyData = Object.entries(stats.content_analytics?.questions_by_difficulty || {}).map(([diff, count]) => ({
                name: diff, value: count
            }));

            return { classPerformance, gradeDistribution, difficultyData };
        } else {
            const userDistribution = [
                { name: 'Học sinh', value: stats.users?.students || 0 },
                { name: 'Giáo viên', value: stats.users?.teachers || 0 },
                { name: 'Admin', value: stats.users?.admins || 0 }
            ];

            const activityTrend = stats.activity?.daily_trend || [];

            return { userDistribution, activityTrend };
        }
    }, [stats, isTeacher, isAdmin, timeRange]);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                    <p className="text-gray-500 animate-pulse font-medium">Đang phân tích dữ liệu...</p>
                </div>
            </div>
        );
    }

    const renderSummaryCards = () => {
        const items = [];
        if (!isTeacher && !isAdmin) {
            items.push(
                { label: 'Điểm trung bình', value: stats.summary?.average_score, icon: AwardIcon, color: 'from-blue-500 to-indigo-600', unit: '/10' },
                { label: 'Bài đã làm', value: stats.summary?.total_exams_taken, icon: ExamIcon, color: 'from-green-500 to-emerald-500' },
                { label: 'Câu đúng', value: stats.summary?.total_questions_answered, icon: TargetIcon, color: 'from-orange-500 to-amber-500' },
                { label: 'Thời gian học', value: Math.round(stats.summary?.total_time_spent_minutes), icon: CalendarIcon, color: 'from-purple-500 to-pink-500', unit: ' phút' }
            );
        } else if (isTeacher) {
            items.push(
                { label: 'Lớp học', value: stats.summary?.total_classrooms, icon: BookIcon, color: 'from-blue-500 to-indigo-600' },
                { label: 'Học sinh', value: stats.summary?.total_students, icon: UsersIcon, color: 'from-green-500 to-emerald-500' },
                { label: 'Bài kiểm tra', value: stats.summary?.total_exams_created, icon: ExamIcon, color: 'from-orange-500 to-amber-500' },
                { label: 'Ngân hàng câu hỏi', value: stats.summary?.total_questions, icon: ChartIcon, color: 'from-purple-500 to-pink-500' }
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {items.map((item, i) => (
                    <div key={i} className="card-glass p-6 group hover:shadow-2xl transition-all">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl bg-linear-to-br/srgb ${item.color} flex items-center justify-center text-gray-900 shrink-0 shadow-lg group-hover:scale-110 transition-transform`}>
                                <item.icon className="w-6 h-6" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-gray-500 text-sm truncate">{item.label}</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {item.value || 0}{item.unit || ''}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderStudentStats = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 card-glass p-6">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Xu hướng điểm số</h3>
                            <p className="text-sm text-gray-500">Điểm số trung bình qua thời gian</p>
                        </div>
                        <div className="flex bg-slate-800/50 p-1 rounded-xl">
                            {['daily', 'weekly', 'monthly'].map(range => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range)}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${timeRange === range ? 'bg-blue-500 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'
                                        }`}
                                >
                                    {range === 'daily' ? 'Ngày' : range === 'weekly' ? 'Tuần' : 'Tháng'}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="w-full">
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={chartData.trends}>
                                <defs>
                                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff0a" />
                                <XAxis
                                    dataKey={timeRange === 'daily' ? 'date' : timeRange === 'weekly' ? 'week' : 'month'}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    domain={[0, 10]}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="average_score"
                                    name="Điểm trung bình"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorScore)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card-glass p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Phân loại học tập</h3>
                    <p className="text-sm text-gray-500 mb-6">Tỉ lệ các cấp bậc điểm</p>
                    <div className="w-full relative">
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={chartData.gradeDistribution}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {chartData.gradeDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={GRADE_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-3xl font-bold text-gray-900">{stats.summary?.grade}</span>
                            <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">Grade</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-4">
                        {chartData.gradeDistribution.slice(0, 6).map((entry, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: GRADE_COLORS[entry.name] }}></div>
                                <span className="text-xs text-gray-500 font-medium">{entry.name}: {entry.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderTeacherStats = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 card-glass px-4 py-2">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Thành tích các lớp học</h3>
                    <p className="text-sm text-gray-500 mb-8">So sánh điểm trung bình và tỉ lệ đạt giữa các lớp</p>
                    <div className="w-full">
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={chartData.classPerformance} layout="vertical" margin={{ left: 0, right: 30 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#ffffff0a" />
                                <XAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} hide />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} width={100} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend verticalAlign="top" align="right" />
                                <Bar dataKey="avgScore" name="Điểm TB (x10)" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={15} />
                                <Bar dataKey="passRate" name="Tỉ lệ đạt (%)" fill="#10b981" radius={[0, 4, 4, 0]} barSize={15} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card-glass p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Ngân hàng câu hỏi</h3>
                    <p className="text-sm text-gray-500 mb-8">Phân bố theo độ khó</p>
                    <div className="w-full">
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie
                                    data={chartData.difficultyData}
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {chartData.difficultyData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-6 flex items-center justify-between p-4 bg-slate-800/10 rounded-2xl border border-white/5">
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Tổng số</p>
                            <p className="text-2xl font-black text-gray-900">{stats.summary?.total_questions}</p>
                        </div>
                        <button
                            onClick={() => navigate('/app/questions')}
                            className="p-2 hover:bg-blue-500/10 rounded-xl transition-colors text-blue-500"
                        >
                            <ArrowRightIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="card-glass overflow-hidden">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Chi tiết lớp học</h3>
                        <p className="text-sm text-gray-500">Thông số chi tiết từng lớp học của bạn</p>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-800/5 text-xs font-bold text-gray-500 uppercase tracking-widest">
                                <th className="px-6 py-4">Lớp học</th>
                                <th className="px-6 py-4">Học sinh</th>
                                <th className="px-6 py-4">Bản nộp</th>
                                <th className="px-6 py-4">Điểm TB</th>
                                <th className="px-6 py-4">Tỉ lệ đạt</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                            {stats.classrooms?.map(cls => (
                                <tr key={cls.classroom_id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-900">{cls.name}</div>
                                        <div className="text-xs text-gray-500">{cls.class_code}</div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{cls.student_count}</td>
                                    <td className="px-6 py-4 text-gray-600">{cls.total_submissions}</td>
                                    <td className="px-6 py-4">
                                        <span className={`font-bold ${cls.average_score >= 8 ? 'text-green-500' : cls.average_score >= 4 ? 'text-blue-500' : 'text-red-500'}`}>
                                            {cls.average_score.toFixed(2)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-1.5 bg-gray-500 rounded-full overflow-hidden min-w-[60px]">
                                                <div
                                                    className={`h-full transition-all duration-500 ${cls.pass_rate >= 70 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' :
                                                        cls.pass_rate >= 40 ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]' :
                                                            'bg-rose-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]'
                                                        }`}
                                                    style={{ width: `${cls.pass_rate}%` }}
                                                ></div>
                                            </div>
                                            <span className="font-medium text-gray-600">{cls.pass_rate}%</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderAdminStats = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 card-glass p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Hoạt động hệ thống</h3>
                    <div className="w-full">
                        <ResponsiveContainer width="100%" height={350}>
                            <LineChart data={chartData.activityTrend}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff0a" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Line type="monotone" dataKey="submissions" name="Bài kiểm tra" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} />
                                <Line type="monotone" dataKey="average_score" name="Điểm TB" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card-glass p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Cơ cấu người dùng</h3>
                    <div className="w-full">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={chartData.userDistribution}
                                    innerRadius={80}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {chartData.userDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="space-y-4 mt-6">
                        {chartData.userDistribution.map((entry, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                    <span className="text-sm font-medium text-gray-600">{entry.name}</span>
                                </div>
                                <span className="text-sm font-bold text-gray-900">{entry.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="pb-12 animate-fadeIn">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <ChartIcon className="w-8 h-8 text-blue-500" />
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Thống kê</h1>
                </div>
                <p className="text-gray-500 max-w-2xl font-medium">
                    {isTeacher ? 'Theo dõi và đánh giá hiệu suất của sinh viên và các lớp học của bạn.' :
                        isAdmin ? 'Tổng quan hoạt động và dữ liệu trên toàn hệ thống LearnAssist.' :
                            'Phân tích kết quả học tập và nhận gợi ý để cải thiện điểm số của bạn.'}
                </p>
            </div>

            {error && (
                <div className="p-4 mb-6 bg-red-500/10 border border-red-500/50 rounded-2xl text-red-500 font-medium flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white shrink-0">!</div>
                    {error}
                </div>
            )}

            <div className="mb-8">
                {renderSummaryCards()}
            </div>

            {isAdmin ? renderAdminStats() : isTeacher ? renderTeacherStats() : renderStudentStats()}
        </div>
    );
};

export default Statistics;
