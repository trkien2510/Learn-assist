import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { practiceService, questionService } from '../services/apiServices';
import {
    ExamIcon,
    DocumentIcon,
    ChartIcon,
    ClockIcon,
    PlusIcon,
    TrashIcon,
    PlayIcon,
} from '../components/icons/Icons';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const Practice = () => {
    const navigate = useNavigate();
    const { showError } = useToast();
    const [activeTab, setActiveTab] = useState('exams');
    const [loading, setLoading] = useState(true);
    const [exams, setExams] = useState([]);
    const [stats, setStats] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        num_questions: 10,
        difficulty: '',
        duration: 30,
        subject: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [examsRes, statsRes, questionsRes] = await Promise.all([
                practiceService.getExams(1, 50),
                practiceService.getStats(),
                questionService.getMyQuestions(1, 100)
            ]);

            const examsData = examsRes.data || examsRes;
            setExams(examsData.items || []);
            setStats(statsRes.data || statsRes);

            const questionsData = questionsRes.data || questionsRes;
            setQuestions(questionsData.items || []);
        } catch (err) {
            showError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateExam = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);

            const examData = {
                title: formData.title || `Bài tự luyện ${new Date().toLocaleDateString('vi-VN')}`,
                num_questions: formData.num_questions,
                difficulty: formData.difficulty || null,
                duration: formData.duration,
                subject: formData.subject || null
            };

            const response = await practiceService.createExam(examData);
            const data = response.data || response;

            setShowCreateModal(false);
            setFormData({
                title: '',
                num_questions: 10,
                difficulty: '',
                duration: 30,
                subject: ''
            });

            await fetchData();

            if (data.exam_id || data.id) {
                navigate(`/app/take-exam/${data.exam_id || data.id}`, {
                    state: { isPersonal: true }
                });
            }
        } catch (err) {
            showError(err.message || 'Không thể tạo bài tự luyện. Hãy đảm bảo bạn có đủ câu hỏi trong ngân hàng.');
        } finally {
            setLoading(false);
        }
    };

    const handleStartExam = async (examId) => {
        try {
            navigate(`/app/take-exam/${examId}`, {
                state: { isPersonal: true }
            });
        } catch (err) {
            showError(err.message);
        }
    };

    const handleDeleteExam = async (examId) => {
        if (!confirm('Bạn có chắc muốn xóa bài tự luyện này?')) return;

        try {
            await practiceService.delete(examId);
            await fetchData();
        } catch (err) {
            showError(err.message);
        }
    };

    const tabs = [
        { id: 'exams', label: 'Bài tự luyện', icon: ExamIcon },
        { id: 'stats', label: 'Thống kê', icon: ChartIcon }
    ];

    if (loading && exams.length === 0) {
        return (
            <div className="space-y-6 animate-fadeIn">
                <div className="h-20 glass rounded-2xl animate-pulse"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-32 glass rounded-2xl animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold gradient-text">Tự luyện</h1>
                    <p className="text-gray-500 mt-1">Tạo và luyện tập với bài kiểm tra cá nhân</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="btn-primary flex items-center gap-2"
                        disabled={questions.length === 0}
                    >
                        <PlusIcon className="w-5 h-5" />
                        Tạo bài mới
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="card-glass p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Tổng câu hỏi</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{questions.length}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-linear-to-br/srgb from-blue-500 to-cyan-500">
                            <DocumentIcon className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>

                <div className="card-glass p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Bài đã luyện</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.total_exams || 0}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-linear-to-br/srgb from-green-500 to-emerald-500">
                            <ExamIcon className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>

                <div className="card-glass p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Điểm trung bình</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {stats?.average_score?.toFixed(1) || '0.0'}
                            </p>
                        </div>
                        <div className="p-3 rounded-xl bg-linear-to-br/srgb from-orange-500 to-amber-500">
                            <ChartIcon className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            {questions.length === 0 && (
                <div className="card-glass p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">📚</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Chưa có câu hỏi nào
                    </h3>
                    <p className="text-gray-500 mb-4">
                        Hãy upload tài liệu và sinh câu hỏi trước khi tạo bài tự luyện
                    </p>
                    <button
                        onClick={() => navigate('/app/documents')}
                        className="btn-primary"
                    >
                        Đi đến Tài liệu
                    </button>
                </div>
            )}

            {questions.length > 0 && (
                <div className="card-glass">
                    <div className="border-b border-gray-200/10">
                        <div className="flex gap-2 p-2">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === tab.id
                                            ? 'bg-blue-500/20 text-blue-500'
                                            : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-white/10'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="p-6">
                        {activeTab === 'exams' && (
                            <div className="space-y-4">
                                {exams.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                                            <ExamIcon className="w-8 h-8 text-blue-500" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                            Chưa có bài tự luyện
                                        </h3>
                                        <p className="text-gray-500 mb-4">
                                            Tạo bài tự luyện đầu tiên của bạn
                                        </p>
                                        <button
                                            onClick={() => setShowCreateModal(true)}
                                            className="btn-primary"
                                        >
                                            Tạo ngay
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {exams.map((exam) => (
                                            <div key={exam.id || exam._id} className="card-glass p-4 hover-scale">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-gray-900 dark:text-gray-900 truncate">
                                                            {exam.title}
                                                        </h4>
                                                        <p className="text-sm text-gray-500">
                                                            {exam.num_questions || exam.total_questions} câu hỏi
                                                        </p>
                                                    </div>
                                                    <span className={`px-2 py-1 text-xs rounded-full ${exam.status === 'completed'
                                                        ? 'bg-green-500/20 text-green-400'
                                                        : exam.status === 'in_progress'
                                                            ? 'bg-orange-500/20 text-orange-400'
                                                            : 'bg-blue-500/20 text-blue-400'
                                                        }`}>
                                                        {exam.status === 'completed' ? 'Đã hoàn thành' :
                                                            exam.status === 'in_progress' ? 'Đang làm' : 'Chưa làm'}
                                                    </span>
                                                </div>

                                                {exam.score !== undefined && exam.score !== null && (
                                                    <div className="mb-3 p-2 bg-gray-100 dark:bg-white/5 rounded-lg">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm text-gray-500">Điểm số</span>
                                                            <span className="font-bold text-lg text-gray-900 dark:text-white">
                                                                {exam.score?.toFixed(1)}/10
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                                                    <ClockIcon className="w-4 h-4" />
                                                    <span>{exam.duration || 30} phút</span>
                                                </div>

                                                <div className="flex gap-2">
                                                    {exam.status !== 'completed' && (
                                                        <button
                                                            onClick={() => handleStartExam(exam.id || exam._id)}
                                                            className="flex-1 btn-primary py-2 text-sm flex items-center justify-center gap-1"
                                                        >
                                                            <PlayIcon className="w-4 h-4" />
                                                            {exam.status === 'in_progress' ? 'Tiếp tục' : 'Bắt đầu'}
                                                        </button>
                                                    )}
                                                    {exam.status === 'completed' && (
                                                        <button
                                                            onClick={() => navigate(`/app/results/${exam.id || exam._id}`)}
                                                            className="flex-1 btn-secondary py-2 text-sm"
                                                        >
                                                            Xem kết quả
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDeleteExam(exam.id || exam._id)}
                                                        className="w-12 h-12 flex items-center justify-center text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                    >
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'stats' && (
                            <div className="space-y-8 animate-fadeIn">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                            Phân bố độ khó câu hỏi
                                        </h3>
                                        <div className="h-[250px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={[
                                                            { name: 'Dễ', value: questions.filter(q => q.difficulty?.toLowerCase() === 'easy' || q.difficulty?.toLowerCase() === 'dễ').length },
                                                            { name: 'Trung bình', value: questions.filter(q => q.difficulty?.toLowerCase() === 'medium' || q.difficulty?.toLowerCase() === 'trung bình').length },
                                                            { name: 'Khó', value: questions.filter(q => q.difficulty?.toLowerCase() === 'hard' || q.difficulty?.toLowerCase() === 'khó').length }
                                                        ].filter(i => i.value > 0)}
                                                        innerRadius={60}
                                                        outerRadius={80}
                                                        paddingAngle={5}
                                                        dataKey="value"
                                                    >
                                                        <Cell fill="#10b981" />
                                                        <Cell fill="#f59e0b" />
                                                        <Cell fill="#ef4444" />
                                                    </Pie>
                                                    <Tooltip />
                                                    <Legend />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                                            Tóm tắt thành tích
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {[
                                                { label: 'Bài đã hoàn thành', value: stats?.completed_exams || 0, color: 'text-blue-500' },
                                                { label: 'Điểm TB', value: stats?.average_score?.toFixed(1) || '0.0', color: 'text-emerald-500' },
                                                { label: 'Điểm cao nhất', value: stats?.highest_score?.toFixed(1) || '0.0', color: 'text-amber-500' },
                                                { label: 'Điểm thấp nhất', value: stats?.lowest_score?.toFixed(1) || '0.0', color: 'text-rose-500' }
                                            ].map((item, i) => (
                                                <div key={i} className="bg-slate-800/5 p-4 rounded-2xl border border-white/5">
                                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">{item.label}</p>
                                                    <p className={`text-2xl font-black ${item.color}`}>{item.value}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="card-glass max-w-md w-full p-6 animate-fadeIn">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Tạo bài tự luyện</h3>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleCreateExam} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                                    Tiêu đề (tùy chọn)
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="input-glass"
                                    placeholder="VD: Ôn tập Chương 1"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                                    Số câu hỏi (tối đa: {Math.min(questions.length, 50)})
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max={Math.min(questions.length, 50)}
                                    value={formData.num_questions}
                                    onChange={(e) => setFormData({ ...formData, num_questions: parseInt(e.target.value) || 1 })}
                                    className="input-glass"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                                    Thời gian (phút)
                                </label>
                                <input
                                    type="number"
                                    min="5"
                                    max="180"
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 30 })}
                                    className="input-glass"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                                    Độ khó (tùy chọn)
                                </label>
                                <select
                                    value={formData.difficulty}
                                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                                    className="input-glass"
                                >
                                    <option value="">Tất cả</option>
                                    <option value="easy">Dễ</option>
                                    <option value="medium">Trung bình</option>
                                    <option value="hard">Khó</option>
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 btn-secondary"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || formData.num_questions > questions.length}
                                    className="flex-1 btn-primary disabled:opacity-50"
                                >
                                    {loading ? 'Đang tạo...' : 'Tạo bài'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Practice;
