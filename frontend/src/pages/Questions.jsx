import React, { useState, useEffect } from 'react';
import { questionService } from '../services/apiServices';
import { PlusIcon, EditIcon, TrashIcon, SearchIcon, CloseIcon } from '../components/icons/Icons';

const Questions = () => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDifficulty, setFilterDifficulty] = useState('');

    const [formData, setFormData] = useState({
        content: '',
        options: ['', '', '', ''],
        answers: '',
        difficulty: 'Medium'
    });

    useEffect(() => {
        fetchQuestions();
    }, [filterDifficulty]);

    const fetchQuestions = async () => {
        try {
            setLoading(true);
            const filters = {};
            if (filterDifficulty) filters.difficulty = filterDifficulty;

            const response = await questionService.getAll(1, 100, filters);
            const data = response.data || response;
            setQuestions(data.items || data || []);
        } catch (err) {
            setError(err.message || 'Không thể tải câu hỏi');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.content || !formData.answers) {
            setError('Vui lòng điền đầy đủ thông tin');
            return;
        }

        if (formData.options.some(opt => !opt.trim())) {
            setError('Vui lòng điền đầy đủ 4 đáp án');
            return;
        }

        try {
            setError('');

            const submitData = {
                content: formData.content,
                options: formData.options,
                answers: formData.answers,
                difficulty: formData.difficulty
            };

            if (editingQuestion) {
                await questionService.update(editingQuestion._id || editingQuestion.id, submitData);
                setSuccess('Cập nhật câu hỏi thành công!');
            } else {
                await questionService.create(submitData);
                setSuccess('Tạo câu hỏi thành công!');
            }

            setShowModal(false);
            resetForm();
            fetchQuestions();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message || 'Thao tác thất bại');
        }
    };

    const handleEdit = (question) => {
        setEditingQuestion(question);
        setFormData({
            content: question.content,
            options: question.options,
            answers: question.answers,
            difficulty: question.difficulty
        });
        setShowModal(true);
    };

    const handleDelete = async (questionId) => {
        if (!confirm('Bạn có chắc muốn xóa câu hỏi này?')) return;

        try {
            await questionService.delete(questionId);
            setSuccess('Đã xóa câu hỏi!');
            fetchQuestions();
            setTimeout(() => setSuccess(''), 2000);
        } catch (err) {
            setError(err.message || 'Không thể xóa câu hỏi');
        }
    };

    const resetForm = () => {
        setFormData({
            content: '',
            options: ['', '', '', ''],
            answers: '',
            difficulty: 'Medium'
        });
        setEditingQuestion(null);
    };

    const filteredQuestions = questions.filter(q =>
        q.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold gradient-text">Ngân hàng câu hỏi</h1>
                    <p className="text-gray-500 mt-2">Quản lý câu hỏi trắc nghiệm</p>
                </div>
                <button
                    onClick={() => {
                        resetForm();
                        setShowModal(true);
                    }}
                    className="btn-primary flex items-center gap-2"
                >
                    <PlusIcon className="w-5 h-5" />
                    Tạo câu hỏi
                </button>
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

            <div className="card-glass p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm câu hỏi..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-glass pl-10"
                        />
                    </div>
                    <select
                        value={filterDifficulty}
                        onChange={(e) => setFilterDifficulty(e.target.value)}
                        className="input-glass"
                    >
                        <option value="">Tất cả độ khó</option>
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="card-glass p-6 animate-pulse">
                            <div className="h-6 bg-slate-700 rounded mb-4"></div>
                            <div className="h-4 bg-slate-700 rounded"></div>
                        </div>
                    ))}
                </div>
            ) : filteredQuestions.length === 0 ? (
                <div className="card-glass p-12 text-center">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có câu hỏi nào</h3>
                    <p className="text-gray-500 mb-6">Tạo câu hỏi đầu tiên hoặc upload tài liệu</p>
                    <button onClick={() => setShowModal(true)} className="btn-primary">
                        Tạo câu hỏi
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredQuestions.map((question, index) => (
                        <div key={question._id || question.id} className="card-glass p-6 hover-scale">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="text-sm font-semibold text-blue-400">#{index + 1}</span>
                                        <span className={`text-xs px-2 py-1 rounded ${question.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                                            question.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                                'bg-red-500/20 text-red-400'
                                            }`}>
                                            {question.difficulty}
                                        </span>
                                    </div>
                                    <p className="text-gray-900 font-medium mb-4">{question.content}</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {question.options.map((option, idx) => {
                                            const isCorrect = option === question.answers;
                                            return (
                                                <div
                                                    key={idx}
                                                    className={`p-3 rounded-lg text-sm font-medium transition-all ${isCorrect
                                                        ? 'bg-green-500/30 text-green-900 border-2 border-green-500 shadow-md shadow-green-500/20'
                                                        : 'bg-slate-100 text-gray-700 border border-slate-200'
                                                        }`}
                                                >
                                                    <span className={isCorrect ? 'font-bold' : ''}>
                                                        {String.fromCharCode(65 + idx)}. {option}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div className="flex gap-2 ml-4">
                                    <button
                                        onClick={() => handleEdit(question)}
                                        className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors"
                                    >
                                        <EditIcon className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(question._id || question.id)}
                                        className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-100 p-4">
                    <div className="card-glass p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto scrollbar-hide animate-fadeIn">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold gradient-text">
                                {editingQuestion ? 'Chỉnh sửa câu hỏi' : 'Tạo câu hỏi mới'}
                            </h2>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    resetForm();
                                }}
                                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                            >
                                <CloseIcon className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-2">
                                    Nội dung câu hỏi *
                                </label>
                                <textarea
                                    required
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    className="input-glass min-h-[100px]"
                                    placeholder="Nhập nội dung câu hỏi..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-2">
                                    Các đáp án *
                                </label>
                                {formData.options.map((option, idx) => (
                                    <div key={idx} className="flex gap-2 mb-2">
                                        <span className="w-8 h-10 flex items-center justify-center text-gray-500">
                                            {String.fromCharCode(65 + idx)}.
                                        </span>
                                        <input
                                            required
                                            value={option}
                                            onChange={(e) => {
                                                const newOptions = [...formData.options];
                                                newOptions[idx] = e.target.value;
                                                setFormData({ ...formData, options: newOptions });
                                            }}
                                            className="input-glass flex-1"
                                            placeholder={`Đáp án ${String.fromCharCode(65 + idx)}`}
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">
                                        Đáp án đúng *
                                    </label>
                                    <select
                                        required
                                        value={formData.answers}
                                        onChange={(e) => setFormData({ ...formData, answers: e.target.value })}
                                        className="input-glass"
                                    >
                                        {formData.options.map((option, idx) => (
                                            <option key={idx} value={option}>
                                                {String.fromCharCode(65 + idx)}. {option || `Đáp án ${String.fromCharCode(65 + idx)}`}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">
                                        Độ khó
                                    </label>
                                    <select
                                        value={formData.difficulty}
                                        onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                                        className="input-glass"
                                    >
                                        <option value="Easy">Easy</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Hard">Hard</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        resetForm();
                                    }}
                                    className="flex-1 btn-secondary"
                                >
                                    Hủy
                                </button>
                                <button type="submit" className="flex-1 btn-primary">
                                    {editingQuestion ? 'Cập nhật' : 'Tạo câu hỏi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Questions;
