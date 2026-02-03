import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, ROLES } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useDateFormat, useModal, useApi } from '../hooks';
import { examService, classroomService, questionService } from '../services/apiServices';
import { PlusIcon, ClockIcon, CalendarIcon, UsersIcon, BookIcon, CloseIcon, SearchIcon, EditIcon, RefreshIcon, CheckIcon } from '../components/icons/Icons';
import Portal from '../components/common/Portal';
import { translateError } from '../utils/errorMessages';

const Exams = () => {
    const { user, hasRole } = useAuth();
    const { showSuccess, showError } = useToast();
    const navigate = useNavigate();
    const [exams, setExams] = useState([]);
    const [submittedExamIds, setSubmittedExamIds] = useState([]);
    const [loading, setLoading] = useState(false);

    const createModal = useModal(false);
    const [classrooms, setClassrooms] = useState([]);
    const [step, setStep] = useState(1);
    const [previewQuestions, setPreviewQuestions] = useState([]);
    const [excludedIds, setExcludedIds] = useState([]);

    const examsApi = useApi(() => examService.getAll(1, 50));

    const [formData, setFormData] = useState({
        title: '',
        class_id: '',
        duration: 60,
        start_at: '',
        end_at: '',
        total_questions: 10,
        easy_count: 0,
        medium_count: 0,
        hard_count: 0
    });

    const isTeacher = hasRole([ROLES.TEACHER]);
    const isAdmin = hasRole([ROLES.ADMIN]);
    const isStudent = hasRole([ROLES.STUDENT]);
    const { formatDateTime, formatDateTimeWithOffset } = useDateFormat();

    useEffect(() => {
        fetchExams();
        if (isTeacher) {
            fetchClassrooms();
        }
    }, []);

    const fetchExams = async () => {
        try {
            const data = await examsApi.execute();
            const examsData = data.items || data || [];
            const submittedIds = data.submitted_exam_ids || [];

            setExams(examsData);
            setSubmittedExamIds(submittedIds);
        } catch (err) {

        }
    };

    const fetchClassrooms = async () => {
        try {
            const response = await classroomService.getAll(1, 50);
            const data = response.data || response;
            setClassrooms(data.items || data || []);
        } catch (err) {

        }
    };

    const validateConfig = () => {
        if (!formData.title.trim()) {
            showError('Vui lòng nhập tên bài kiểm tra');
            return false;
        }
        if (!formData.class_id) {
            showError('Vui lòng chọn lớp học');
            return false;
        }
        if (!formData.start_at || !formData.end_at) {
            showError('Vui lòng chọn thời gian bắt đầu và kết thúc');
            return false;
        }
        if (new Date(formData.start_at) >= new Date(formData.end_at)) {
            showError('Thời gian kết thúc phải sau thời gian bắt đầu');
            return false;
        }
        if (formData.total_questions < 1) {
            showError('Số câu hỏi phải lớn hơn 0');
            return false;
        }
        if (formData.easy_count + formData.medium_count + formData.hard_count !== formData.total_questions) {
            showError('Tổng số câu hỏi theo độ khó phải bằng tổng số câu hỏi');
            return false;
        }
        return true;
    };

    const handlePreview = async () => {
        if (!validateConfig()) return;

        try {
            setLoading(true);

            const selectedClassroom = classrooms.find(c => (c._id || c.id) === formData.class_id);
            if (!selectedClassroom) {
                showError('Không tìm thấy lớp học');
                return;
            }

            const response = await examService.previewQuestions(
                selectedClassroom.class_code,
                formData.total_questions,
                formData.easy_count,
                formData.medium_count,
                formData.hard_count
            );
            const data = response.data || response;
            setPreviewQuestions(data.questions || []);
            setExcludedIds(data.questions?.map(q => q.id) || []);
            setStep(2);
        } catch (err) {
            showError(translateError(err));
        } finally {
            setLoading(false);
        }
    };

    const handleReplaceQuestion = async (questionId, difficulty) => {
        try {
            const selectedClassroom = classrooms.find(c => (c._id || c.id) === formData.class_id);

            const response = await examService.replaceQuestion(
                selectedClassroom.class_code,
                questionId,
                excludedIds,
                difficulty
            );
            const newQuestion = response.data || response;

            setPreviewQuestions(prev =>
                prev.map(q => q.id === questionId ? newQuestion : q)
            );

            setExcludedIds(prev => [...prev.filter(id => id !== questionId), newQuestion.id]);
        } catch (err) {
            showError(translateError(err));
        }
    };

    const handleCreateExam = async () => {
        try {
            setLoading(true);

            const questionIds = previewQuestions.map(q => q.id);

            const selectedClassroom = classrooms.find(c => (c._id || c.id) === formData.class_id);
            if (!selectedClassroom) {
                showError('Không tìm thấy lớp học');
                return;
            }

            await examService.create({
                title: formData.title,
                class_code: selectedClassroom.class_code,
                duration: parseInt(formData.duration),
                start_at: formatDateTimeWithOffset(formData.start_at),
                end_at: formatDateTimeWithOffset(formData.end_at),
                question_ids: questionIds
            });

            showSuccess('Tạo bài kiểm tra thành công!');
            createModal.close();
            resetForm();
            fetchExams();
        } catch (err) {
            setError(translateError(err));
        } finally {
            setLoading(false);
        }
    };

    const handleStartExam = (exam) => {
        navigate(`/app/take-exam/${exam._id || exam.id}`);
    };

    const handleViewResults = (exam) => {
        navigate(`/app/results?exam_id=${exam._id || exam.id}`);
    };

    const handleTotalQuestionsChange = (value) => {
        const total = parseInt(value) || 0;
        setFormData(prev => ({
            ...prev,
            total_questions: total,
            easy_count: 0,
            medium_count: 0,
            hard_count: 0
        }));
    };

    const handleDifficultyChange = (type, value) => {
        const newValue = parseInt(value) || 0;
        const newFormData = { ...formData, [type]: newValue };

        const sum = newFormData.easy_count + newFormData.medium_count + newFormData.hard_count;
        if (sum <= newFormData.total_questions) {
            setFormData(newFormData);
        }
    };

    const getDifficultyBadgeClass = (difficulty) => {
        switch (difficulty) {
            case 'Easy':
                return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'Medium':
                return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'Hard':
                return 'bg-red-500/20 text-red-400 border-red-500/30';
            default:
                return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            class_id: '',
            duration: 60,
            start_at: '',
            end_at: '',
            total_questions: 10,
            easy_count: 0,
            medium_count: 0,
            hard_count: 0
        });
        setStep(1);
        setPreviewQuestions([]);
        setExcludedIds([]);
    };

    const formatDateLocal = (dateString) => {
        let dateStr = dateString;
        if (!/Z|[+-]\d{2}:\d{2}$/.test(dateString)) {
            dateStr = dateString + 'Z';
        }
        return new Date(dateStr).toLocaleString('vi-VN');
    };

    const getExamStatus = (exam) => {
        const now = new Date();

        let startStr = exam.start_at;
        let endStr = exam.end_at;
        if (!/Z|[+-]\d{2}:\d{2}$/.test(startStr)) startStr += 'Z';
        if (!/Z|[+-]\d{2}:\d{2}$/.test(endStr)) endStr += 'Z';

        const start = new Date(startStr);
        const end = new Date(endStr);

        if (now < start) return { text: 'Sắp diễn ra', color: 'bg-blue-500/20 text-blue-400' };
        if (now >= start && now <= end) return { text: 'Đang diễn ra', color: 'bg-green-500/20 text-green-400' };
        return { text: 'Đã kết thúc', color: 'bg-gray-500/20 text-gray-400' };
    };

    const canTakeExam = (exam) => {
        const now = new Date();

        let startStr = exam.start_at;
        let endStr = exam.end_at;
        if (!/Z|[+-]\d{2}:\d{2}$/.test(startStr)) startStr += 'Z';
        if (!/Z|[+-]\d{2}:\d{2}$/.test(endStr)) endStr += 'Z';

        const start = new Date(startStr);
        const end = new Date(endStr);
        return now >= start && now <= end;
    };

    const isExamNotStarted = (exam) => {
        const now = new Date();
        let startStr = exam.start_at;
        if (!/Z|[+-]\d{2}:\d{2}$/.test(startStr)) startStr += 'Z';
        const start = new Date(startStr);
        return now < start;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold gradient-text">
                        {isAdmin ? 'Quản lý bài kiểm tra' : isTeacher ? 'Quản lý bài kiểm tra' : 'Bài kiểm tra'}
                    </h1>
                    <p className="text-gray-500 mt-2">
                        {isAdmin ? 'Xem tất cả bài kiểm tra trong hệ thống (chỉ xem)' : isTeacher ? 'Tạo và quản lý bài kiểm tra cho lớp học' : 'Danh sách bài kiểm tra của bạn'}
                    </p>
                </div>
                {isTeacher && (
                    <button onClick={() => createModal.open()} className="btn-primary flex items-center gap-2">
                        <PlusIcon className="w-5 h-5" />
                        Tạo bài kiểm tra
                    </button>
                )}
            </div>

            {examsApi.loading && exams.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                    <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                    <p className="text-gray-500 animate-pulse font-medium">Đang tải danh sách bài kiểm tra...</p>
                </div>
            ) : exams.length === 0 ? (
                <div className="card-glass p-12 text-center">
                    <BookIcon className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {isTeacher ? 'Chưa có bài kiểm tra nào' : 'Chưa có bài kiểm tra nào'}
                    </h3>
                    <p className="text-gray-500 mb-6">
                        {isTeacher ? 'Tạo bài kiểm tra đầu tiên cho lớp học của bạn' : 'Đợi giáo viên tạo bài kiểm tra'}
                    </p>
                    {isTeacher && (
                        <button onClick={() => createModal.open()} className="btn-primary">
                            Tạo bài kiểm tra
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
                                        <span>{formatDateTime(exam.start_at)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <BookIcon className="w-4 h-4 text-gray-500" />
                                        <span>{exam.questions?.length || 0} câu hỏi</span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    {isStudent && canTakeExam(exam) ? (
                                        submittedExamIds.includes(exam._id || exam.id) ? (
                                            <button
                                                disabled
                                                className="flex-1 btn-secondary text-sm py-2 bg-green-500/20 text-green-600 border-green-500/50 cursor-default flex items-center justify-center gap-2"
                                            >
                                                <CheckIcon className="w-4 h-4" />
                                                Đã nộp
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleStartExam(exam)}
                                                className="flex-1 btn-primary text-sm py-2"
                                            >
                                                Làm bài
                                            </button>
                                        )
                                    ) : (isTeacher) ? (
                                        <>
                                            <button
                                                onClick={() => navigate(`/app/exams/${exam._id || exam.id}/statistics`)}
                                                className="flex-1 btn-primary text-sm py-2"
                                            >
                                                Thống kê
                                            </button>
                                        </>
                                    ) : isStudent && !canTakeExam(exam) && submittedExamIds.includes(exam._id || exam.id) ? (
                                        <button
                                            disabled
                                            className="flex-1 btn-secondary text-sm py-2 bg-green-500/20 text-green-600 border-green-500/50 cursor-default flex items-center justify-center gap-2"
                                        >
                                            <CheckIcon className="w-4 h-4" />
                                            Đã nộp
                                        </button>
                                    ) : isStudent && isExamNotStarted(exam) ? (
                                        <button
                                            disabled
                                            className="flex-1 btn-secondary text-sm py-2 bg-blue-500/10 text-blue-400 border-blue-500/30 cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            <ClockIcon className="w-4 h-4" />
                                            Chưa đến giờ làm bài
                                        </button>
                                    ) : (
                                        <button
                                            disabled
                                            className="flex-1 btn-secondary text-sm py-2 bg-gray-500/10 text-gray-400 border-gray-500/30 cursor-not-allowed"
                                        >
                                            Đã kết thúc
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {createModal.isOpen && (
                <Portal>
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-100 p-4">
                        <div className="card-glass p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-fadeIn relative">
                            <div className="flex items-center justify-between pb-1 border-b border-white/10">
                                <div>
                                    <h2 className="text-3xl font-black gradient-text">Thiết lập bài kiểm tra</h2>
                                    <p className="text-slate-400 font-medium">Bước {step}/2: {step === 1 ? 'Thông tin cơ bản' : 'Cấu hình câu hỏi'}</p>
                                </div>
                                <button
                                    onClick={() => createModal.close()}
                                    className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-xl transition-all group"
                                >
                                    <CloseIcon className="w-6 h-6 text-slate-400 group-hover:rotate-90 transition-transform" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                {step === 1 ? (
                                    <div className="space-y-2">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                Tên bài kiểm tra *
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                className="input-glass w-full"
                                                placeholder="VD: Kiểm tra giữa kỳ"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                Lớp học *
                                            </label>
                                            <select
                                                value={formData.class_id}
                                                onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                                                className="input-glass w-full"
                                            >
                                                <option value="">Chọn lớp học</option>
                                                {classrooms.map(cls => (
                                                    <option key={cls._id || cls.id} value={cls._id || cls.id}>
                                                        {cls.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                                    Thời lượng (phút) *
                                                </label>
                                                <input
                                                    type="number"
                                                    value={formData.duration}
                                                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                                    className="input-glass w-full"
                                                    min="1"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                                    Tổng số câu hỏi *
                                                </label>
                                                <input
                                                    type="number"
                                                    value={formData.total_questions}
                                                    onChange={(e) => handleTotalQuestionsChange(e.target.value)}
                                                    className="input-glass w-full"
                                                    min="1"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                                    Thời gian bắt đầu *
                                                </label>
                                                <input
                                                    type="datetime-local"
                                                    value={formData.start_at}
                                                    onChange={(e) => setFormData({ ...formData, start_at: e.target.value })}
                                                    className="input-glass w-full"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                                    Thời gian kết thúc *
                                                </label>
                                                <input
                                                    type="datetime-local"
                                                    value={formData.end_at}
                                                    onChange={(e) => setFormData({ ...formData, end_at: e.target.value })}
                                                    className="input-glass w-full"
                                                />
                                            </div>
                                        </div>

                                        <div className="card-glass p-4 bg-blue-500/5">
                                            <h3 className="font-semibold text-gray-900 mb-4">Phân bổ độ khó</h3>
                                            <div className="grid grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-green-400 mb-2">
                                                        Câu dễ
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={formData.easy_count}
                                                        onChange={(e) => handleDifficultyChange('easy_count', e.target.value)}
                                                        className="input-glass w-full"
                                                        min="0"
                                                        max={formData.total_questions}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-yellow-400 mb-2">
                                                        Câu trung bình
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={formData.medium_count}
                                                        onChange={(e) => handleDifficultyChange('medium_count', e.target.value)}
                                                        className="input-glass w-full"
                                                        min="0"
                                                        max={formData.total_questions}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-red-400 mb-2">
                                                        Câu khó
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={formData.hard_count}
                                                        onChange={(e) => handleDifficultyChange('hard_count', e.target.value)}
                                                        className="input-glass w-full"
                                                        min="0"
                                                        max={formData.total_questions}
                                                    />
                                                </div>
                                            </div>
                                            <div className="mt-3 text-sm">
                                                <span className="text-gray-500">Đã phân bổ: </span>
                                                <span className={`font-semibold ${formData.easy_count + formData.medium_count + formData.hard_count === formData.total_questions
                                                    ? 'text-green-400'
                                                    : 'text-red-400'
                                                    }`}>
                                                    {formData.easy_count + formData.medium_count + formData.hard_count} / {formData.total_questions}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {previewQuestions.length < formData.total_questions ? (
                                            <div className="p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-xl">
                                                <p className="text-yellow-400 font-medium mb-2">
                                                    Ngân hàng câu hỏi của bạn không đủ!
                                                </p>
                                                <p className="text-yellow-400/80 text-sm">
                                                    Yêu cầu: {formData.total_questions} câu hỏi | Hiện có: {previewQuestions.length} câu hỏi
                                                </p>
                                                <p className="text-gray-400 text-sm mt-2">
                                                    Vui lòng thêm câu hỏi vào ngân hàng hoặc điều chỉnh lại số lượng câu hỏi theo độ khó.
                                                </p>
                                            </div>
                                        ) : (
                                            <p className="text-gray-400 text-sm mb-4">
                                                {previewQuestions.length} câu hỏi đã được chọn. Click 🔄 để thay đổi câu hỏi.
                                            </p>
                                        )}
                                        {previewQuestions.map((question, index) => (
                                            <div key={question.id} className="card-glass p-4 hover:shadow-lg transition-shadow">
                                                <div className="flex items-start gap-4">
                                                    <div className="shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-semibold">
                                                        {index + 1}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${getDifficultyBadgeClass(question.difficulty)}`}>
                                                                {question.difficulty === 'Easy' ? 'Dễ' : question.difficulty === 'Medium' ? 'Trung bình' : 'Khó'}
                                                            </span>
                                                        </div>
                                                        <p className="text-gray-900 font-medium mb-3">{question.content}</p>
                                                        <div className="space-y-2">
                                                            {question.options?.map((option, optIdx) => (
                                                                <div
                                                                    key={optIdx}
                                                                    className={`p-2 rounded-lg text-sm ${option === question.answer
                                                                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                                        : 'bg-white/5 text-gray-600'
                                                                        }`}
                                                                >
                                                                    {String.fromCharCode(65 + optIdx)}. {option}
                                                                    {option === question.answer && (
                                                                        <CheckIcon className="w-4 h-4 inline ml-2" />
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleReplaceQuestion(question.id, question.difficulty)}
                                                        className="shrink-0 p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors"
                                                        title="Lấy câu hỏi khác"
                                                    >
                                                        <RefreshIcon className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between gap-3 p-6 border-t border-gray-200/10">
                                {step === 2 && (
                                    <button
                                        onClick={() => setStep(1)}
                                        className="btn-secondary"
                                    >
                                        ← Quay lại
                                    </button>
                                )}
                                <div className="flex gap-3 ml-auto">
                                    <button
                                        onClick={() => {
                                            createModal.close();
                                            resetForm();
                                        }}
                                        className="btn-secondary"
                                    >
                                        Hủy
                                    </button>
                                    {step === 1 ? (
                                        <button
                                            onClick={handlePreview}
                                            disabled={loading}
                                            className="btn-primary"
                                        >
                                            {loading ? 'Đang tải...' : 'Xem trước câu hỏi →'}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleCreateExam}
                                            disabled={loading || previewQuestions.length < formData.total_questions}
                                            className={`btn-primary ${previewQuestions.length < formData.total_questions ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            {loading ? 'Đang tạo...' : 'Tạo bài kiểm tra'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </Portal>
            )}
        </div>
    );
};

export default Exams;
