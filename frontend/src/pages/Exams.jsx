import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, ROLES } from '../contexts/AuthContext';
import { examService, classroomService, questionService } from '../services/apiServices';
import { PlusIcon, ClockIcon, CalendarIcon, UsersIcon, BookIcon, CloseIcon, SearchIcon, EditIcon } from '../components/icons/Icons';

const Exams = () => {
    const { user, hasRole } = useAuth();
    const navigate = useNavigate();
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [classrooms, setClassrooms] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [searchQuestion, setSearchQuestion] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        class_id: '',
        duration: 60,
        start_at: '',
        end_at: '',
        expiry_at: ''
    });

    const isTeacher = hasRole([ROLES.ADMIN, ROLES.TEACHER]);

    useEffect(() => {
        fetchExams();
        if (isTeacher) {
            fetchClassrooms();
        }
    }, []);

    const fetchExams = async () => {
        try {
            setLoading(true);
            const response = await examService.getAll(1, 50);
            const data = response.data || response;
            setExams(data.items || data || []);
        } catch (err) {
            setError(err.message || 'Không thể tải danh sách đề thi');
        } finally {
            setLoading(false);
        }
    };

    const fetchClassrooms = async () => {
        try {
            const response = await classroomService.getAll(1, 50);
            const data = response.data || response;
            setClassrooms(data.items || data || []);
        } catch (err) {
            console.error('Error fetching classrooms:', err);
        }
    };

    const fetchQuestions = async () => {
        try {
            const response = await questionService.getAll(1, 100);
            const data = response.data || response;
            setQuestions(data.items || data || []);
        } catch (err) {
            setError('Không thể tải câu hỏi');
        }
    };

    const handleCreateExam = async (e) => {
        e.preventDefault();

        if (selectedQuestions.length === 0) {
            setError('Vui lòng chọn ít nhất 1 câu hỏi');
            return;
        }

        try {
            const examData = {
                ...formData,
                questions: selectedQuestions.map(q => q._id || q.id)
            };

            await examService.create(examData);
            setSuccess('Tạo đề thi thành công!');
            setShowCreateModal(false);
            resetForm();
            fetchExams();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message || 'Không thể tạo đề thi');
        }
    };

    const handleStartExam = (exam) => {
        navigate(`/app/exams/${exam._id || exam.id}/take`);
    };

    const handleViewResults = (exam) => {
        navigate(`/app/results?exam_id=${exam._id || exam.id}`);
    };

    const toggleQuestionSelection = (question) => {
        if (selectedQuestions.find(q => (q._id || q.id) === (question._id || question.id))) {
            setSelectedQuestions(selectedQuestions.filter(q => (q._id || q.id) !== (question._id || question.id)));
        } else {
            setSelectedQuestions([...selectedQuestions, question]);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            class_id: '',
            duration: 60,
            start_at: '',
            end_at: '',
            expiry_at: ''
        });
        setSelectedQuestions([]);
        setSearchQuestion('');
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('vi-VN');
    };

    const getExamStatus = (exam) => {
        const now = new Date();
        const start = new Date(exam.start_at);
        const end = new Date(exam.end_at);

        if (now < start) return { text: 'Sắp diễn ra', color: 'bg-blue-500/20 text-blue-400' };
        if (now >= start && now <= end) return { text: 'Đang diễn ra', color: 'bg-green-500/20 text-green-400' };
        return { text: 'Đã kết thúc', color: 'bg-gray-500/20 text-gray-400' };
    };

    const canTakeExam = (exam) => {
        const now = new Date();
        const start = new Date(exam.start_at);
        const end = new Date(exam.end_at);
        return now >= start && now <= end;
    };

    const filteredQuestions = questions.filter(q =>
        q.content.toLowerCase().includes(searchQuestion.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold gradient-text">
                        {isTeacher ? 'Quản lý đề thi' : 'Bài thi'}
                    </h1>
                    <p className="text-gray-500 mt-2">
                        {isTeacher ? 'Tạo và quản lý đề thi cho lớp học' : 'Danh sách bài thi của bạn'}
                    </p>
                </div>
                {isTeacher && (
                    <button
                        onClick={() => {
                            setShowCreateModal(true);
                            fetchQuestions();
                        }}
                        className="btn-primary flex items-center gap-2"
                    >
                        <PlusIcon className="w-5 h-5" />
                        Tạo đề thi
                    </button>
                )}
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400">
                    {error}
                </div>
            )}

            {success && (
                <div className="p-4 bg-green-500/10 border border-green-500/50 rounded-xl text-green-400">
                    {success}
                </div>
            )}

            {/* Exams List */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="card-glass p-6 animate-pulse">
                            <div className="h-6 bg-slate-700 rounded mb-4"></div>
                            <div className="h-4 bg-slate-700 rounded"></div>
                        </div>
                    ))}
                </div>
            ) : exams.length === 0 ? (
                <div className="card-glass p-12 text-center">
                    <BookIcon className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {isTeacher ? 'Chưa có đề thi nào' : 'Chưa có bài thi nào'}
                    </h3>
                    <p className="text-gray-500 mb-6">
                        {isTeacher ? 'Tạo đề thi đầu tiên cho lớp học của bạn' : 'Đợi giáo viên tạo đề thi'}
                    </p>
                    {isTeacher && (
                        <button onClick={() => setShowCreateModal(true)} className="btn-primary">
                            Tạo đề thi
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {exams.map((exam) => {
                        const status = getExamStatus(exam);
                        return (
                            <div key={exam._id || exam.id} className="card-glass p-6 hover-scale">
                                <div className="flex items-start justify-between mb-4">
                                    <h3 className="font-bold text-gray-900 text-lg flex-1">{exam.title}</h3>
                                    <span className={`text-xs px-2 py-1 rounded ${status.color}`}>
                                        {status.text}
                                    </span>
                                </div>

                                <div className="space-y-2 text-sm text-gray-600 mb-4">
                                    <div className="flex items-center gap-2">
                                        <ClockIcon className="w-4 h-4 text-gray-500" />
                                        <span>{exam.duration} phút</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CalendarIcon className="w-4 h-4 text-gray-500" />
                                        <span>{formatDate(exam.start_at)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <BookIcon className="w-4 h-4 text-gray-500" />
                                        <span>{exam.questions?.length || 0} câu hỏi</span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    {!isTeacher && canTakeExam(exam) ? (
                                        <button
                                            onClick={() => handleStartExam(exam)}
                                            className="flex-1 btn-primary text-sm py-2"
                                        >
                                            Làm bài
                                        </button>
                                    ) : isTeacher ? (
                                        <>
                                            <button
                                                onClick={() => handleViewResults(exam)}
                                                className="flex-1 btn-secondary text-sm py-2"
                                            >
                                                Xem kết quả
                                            </button>
                                        </>
                                    ) : (
                                        <button disabled className="flex-1 btn-secondary text-sm py-2 opacity-50">
                                            Chưa đến giờ
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Create Exam Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="card-glass p-8 max-w-4xl w-full my-8 animate-fadeIn">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold gradient-text">Tạo đề thi mới</h2>
                            <button
                                onClick={() => {
                                    setShowCreateModal(false);
                                    resetForm();
                                }}
                                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                            >
                                <CloseIcon className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateExam} className="space-y-6">
                            {/* Basic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">
                                        Tiêu đề đề thi *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="input-glass"
                                        placeholder="VD: Kiểm tra giữa kỳ"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">
                                        Lớp học *
                                    </label>
                                    <select
                                        required
                                        value={formData.class_id}
                                        onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                                        className="input-glass"
                                    >
                                        <option value="">Chọn lớp học</option>
                                        {classrooms.map(cls => (
                                            <option key={cls._id || cls.id} value={cls._id || cls.id}>
                                                {cls.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">
                                        Thời gian làm bài (phút) *
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                                        className="input-glass"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">
                                        Thời gian bắt đầu *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={formData.start_at}
                                        onChange={(e) => setFormData({ ...formData, start_at: e.target.value })}
                                        className="input-glass"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">
                                        Thời gian kết thúc *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={formData.end_at}
                                        onChange={(e) => setFormData({ ...formData, end_at: e.target.value })}
                                        className="input-glass"
                                    />
                                </div>
                            </div>

                            {/* Question Selection */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-gray-900">
                                        Chọn câu hỏi ({selectedQuestions.length} đã chọn)
                                    </h3>
                                    <div className="relative w-64">
                                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <input
                                            type="text"
                                            placeholder="Tìm câu hỏi..."
                                            value={searchQuestion}
                                            onChange={(e) => setSearchQuestion(e.target.value)}
                                            className="input-glass pl-10 text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="max-h-96 overflow-y-auto space-y-2 p-4 bg-slate-800/30 rounded-xl">
                                    {filteredQuestions.length === 0 ? (
                                        <p className="text-gray-500 text-center py-8">Không có câu hỏi nào</p>
                                    ) : (
                                        filteredQuestions.map((question, idx) => (
                                            <div
                                                key={question._id || question.id}
                                                className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${selectedQuestions.find(q => (q._id || q.id) === (question._id || question.id))
                                                    ? 'border-blue-500 bg-blue-500/10'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                                onClick={() => toggleQuestionSelection(question)}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={!!selectedQuestions.find(q => (q._id || q.id) === (question._id || question.id))}
                                                        onChange={() => { }}
                                                        className="mt-1 w-4 h-4"
                                                    />
                                                    <div className="flex-1">
                                                        <p className="text-gray-900 text-sm font-medium mb-1">
                                                            {idx + 1}. {question.content}
                                                        </p>
                                                        <span className={`text-xs px-2 py-0.5 rounded ${question.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                                                            question.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                                                'bg-red-500/20 text-red-400'
                                                            }`}>
                                                            {question.difficulty}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        resetForm();
                                    }}
                                    className="flex-1 btn-secondary"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={selectedQuestions.length === 0}
                                    className="flex-1 btn-primary disabled:opacity-50"
                                >
                                    Tạo đề thi
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Exams;
