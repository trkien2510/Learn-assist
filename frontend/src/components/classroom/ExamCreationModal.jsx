import React, { useState } from 'react';
import { examService } from '../../services/apiServices';
import { CloseIcon, RefreshIcon, CheckIcon, AlertIcon } from '../icons/Icons';
import Portal from '../common/Portal';

const ExamCreationModal = ({ isOpen, onClose, classCode, onSuccess }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [config, setConfig] = useState({
        title: '',
        duration: 60,
        start_at: '',
        end_at: '',
        total_questions: 10,
        easy_count: 0,
        medium_count: 0,
        hard_count: 0
    });

    const [previewQuestions, setPreviewQuestions] = useState([]);
    const [excludedIds, setExcludedIds] = useState([]);

    if (!isOpen) return null;

    const validateConfig = () => {
        if (!config.title.trim()) {
            setError('Vui lòng nhập tên bài kiểm tra');
            return false;
        }
        if (!config.start_at || !config.end_at) {
            setError('Vui lòng chọn thời gian bắt đầu và kết thúc');
            return false;
        }
        if (new Date(config.start_at) >= new Date(config.end_at)) {
            setError('Thời gian kết thúc phải sau thời gian bắt đầu');
            return false;
        }
        if (config.total_questions < 1) {
            setError('Số câu hỏi phải lớn hơn 0');
            return false;
        }
        if (config.total_questions > 50) {
            setError('Số câu hỏi tối đa cho phép là 50 câu');
            return false;
        }
        if (config.easy_count + config.medium_count + config.hard_count !== config.total_questions) {
            setError('Tổng số câu hỏi theo độ khó phải bằng tổng số câu hỏi');
            return false;
        }
        return true;
    };

    const handlePreview = async () => {
        if (!validateConfig()) return;

        try {
            setLoading(true);
            setError('');
            const response = await examService.previewQuestions(
                classCode,
                config.total_questions,
                config.easy_count,
                config.medium_count,
                config.hard_count
            );
            const data = response.data || response;
            setPreviewQuestions(data.questions || []);
            setExcludedIds(data.questions?.map(q => q.id) || []);
            setStep(2);
        } catch (err) {
            setError(err.message || 'Không thể tải danh sách câu hỏi');
        } finally {
            setLoading(false);
        }
    };

    const handleReplaceQuestion = async (questionId, difficulty) => {
        try {
            setError('');
            const response = await examService.replaceQuestion(
                classCode,
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
            setError(err.message || 'Không thể thay thế câu hỏi');
        }
    };

    const handleCreateExam = async () => {
        try {
            setLoading(true);
            setError('');

            const questionIds = previewQuestions.map(q => q.id);

            const formatDateTimeWithOffset = (dateTimeStr) => {
                const date = new Date(dateTimeStr);
                const offset = -date.getTimezoneOffset();
                const offsetHours = String(Math.floor(Math.abs(offset) / 60)).padStart(2, '0');
                const offsetMins = String(Math.abs(offset) % 60).padStart(2, '0');
                const offsetSign = offset >= 0 ? '+' : '-';

                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                const seconds = '00';

                return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${offsetSign}${offsetHours}:${offsetMins}`;
            };

            await examService.create({
                title: config.title,
                class_code: classCode,
                duration: parseInt(config.duration),
                start_at: formatDateTimeWithOffset(config.start_at),
                end_at: formatDateTimeWithOffset(config.end_at),
                question_ids: questionIds
            });

            onSuccess();
        } catch (err) {
            setError(err.message || 'Không thể tạo bài kiểm tra');
        } finally {
            setLoading(false);
        }
    };

    const handleTotalQuestionsChange = (value) => {
        const total = parseInt(value) || 0;
        setConfig(prev => ({
            ...prev,
            total_questions: total,
            easy_count: 0,
            medium_count: 0,
            hard_count: 0
        }));
    };

    const handleDifficultyChange = (type, value) => {
        const newValue = parseInt(value) || 0;
        const newConfig = { ...config, [type]: newValue };

        const sum = newConfig.easy_count + newConfig.medium_count + newConfig.hard_count;
        if (sum <= newConfig.total_questions) {
            setConfig(newConfig);
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

    return (
        <Portal>
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-100 p-4">
                <div className="card-glass max-w-4xl w-full my-8 max-h-[90vh] overflow-hidden flex flex-col animate-fadeIn shadow-2xl">
                    <div className="flex items-center justify-between p-6 border-b border-gray-200/10">
                        <h2 className="text-2xl font-bold gradient-text">
                            {step === 1 ? 'Cấu hình bài kiểm tra' : 'Xem trước câu hỏi'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <CloseIcon className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    {error && (
                        <div className="mx-6 mt-4 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                        {step === 1 ? (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Tên bài kiểm tra *
                                    </label>
                                    <input
                                        type="text"
                                        value={config.title}
                                        onChange={(e) => setConfig({ ...config, title: e.target.value })}
                                        className="input-glass w-full"
                                        placeholder="VD: Kiểm tra giữa kỳ"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Thời lượng (phút) *
                                        </label>
                                        <input
                                            type="number"
                                            value={config.duration}
                                            onChange={(e) => setConfig({ ...config, duration: e.target.value })}
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
                                            value={config.total_questions}
                                            onChange={(e) => handleTotalQuestionsChange(e.target.value)}
                                            className="input-glass w-full"
                                            min="1"
                                            max="50"
                                        />
                                        <p className="text-[10px] text-gray-500 mt-1">* Tối đa 50 câu</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Thời gian bắt đầu *
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={config.start_at}
                                            onChange={(e) => setConfig({ ...config, start_at: e.target.value })}
                                            className="input-glass w-full"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Thời gian kết thúc *
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={config.end_at}
                                            onChange={(e) => setConfig({ ...config, end_at: e.target.value })}
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
                                                value={config.easy_count}
                                                onChange={(e) => handleDifficultyChange('easy_count', e.target.value)}
                                                className="input-glass w-full"
                                                min="0"
                                                max={config.total_questions}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-yellow-400 mb-2">
                                                Câu trung bình
                                            </label>
                                            <input
                                                type="number"
                                                value={config.medium_count}
                                                onChange={(e) => handleDifficultyChange('medium_count', e.target.value)}
                                                className="input-glass w-full"
                                                min="0"
                                                max={config.total_questions}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-red-400 mb-2">
                                                Câu khó
                                            </label>
                                            <input
                                                type="number"
                                                value={config.hard_count}
                                                onChange={(e) => handleDifficultyChange('hard_count', e.target.value)}
                                                className="input-glass w-full"
                                                min="0"
                                                max={config.total_questions}
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-3 text-sm">
                                        <span className="text-gray-500">Đã phân bổ: </span>
                                        <span className={`font-semibold ${config.easy_count + config.medium_count + config.hard_count === config.total_questions
                                            ? 'text-green-400'
                                            : 'text-red-400'
                                            }`}>
                                            {config.easy_count + config.medium_count + config.hard_count} / {config.total_questions}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {previewQuestions.length < config.total_questions ? (
                                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-xl">
                                        <p className="text-yellow-400 font-medium mb-2 flex items-center gap-2">
                                            <AlertIcon className="w-5 h-5" />
                                            Ngân hàng câu hỏi của bạn không đủ!
                                        </p>
                                        <p className="text-yellow-400/80 text-sm">
                                            Yêu cầu: {config.total_questions} câu hỏi | Hiện có: {previewQuestions.length} câu hỏi
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

                    {/* Footer */}
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
                            <button onClick={onClose} className="btn-secondary">
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
                                    disabled={loading || previewQuestions.length < config.total_questions}
                                    className={`btn-primary ${previewQuestions.length < config.total_questions ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {loading ? 'Đang tạo...' : 'Tạo bài kiểm tra'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Portal>
    );
};

export default ExamCreationModal;
