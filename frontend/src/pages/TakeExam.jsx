import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { examService } from '../services/apiServices';
import { ClockIcon, CheckIcon, ArrowLeftIcon, ArrowRightIcon } from '../components/icons/Icons';

const TakeExam = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [exam, setExam] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState(null);
    const [resultId, setResultId] = useState(null);
    const [examStarted, setExamStarted] = useState(false);

    useEffect(() => {
        startExam();
    }, [id]);

    useEffect(() => {
        if (examStarted && timeRemaining > 0) {
            const timer = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        handleSubmit(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [examStarted, timeRemaining]);

    const startExam = async () => {
        try {
            setLoading(true);
            const response = await examService.start(id);

            const data = response.data || response;
            const examData = data.exam;

            if (!examData) {
                throw new Error('Exam data not found in response');
            }

            setExam(examData);
            setQuestions(examData.questions || []);
            setResultId(data.result_id);
            setTimeRemaining(data.time_remaining || examData.duration * 60);
            setExamStarted(true);

            const initialAnswers = {};
            (examData.questions || []).forEach(q => {
                initialAnswers[q._id || q.id] = '';
            });
            setAnswers(initialAnswers);
        } catch (err) {
            setError(err.message || 'Không thể bắt đầu bài kiểm tra');
            setTimeout(() => navigate('/app/exams'), 3000);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (autoSubmit = false) => {
        if (!autoSubmit && !confirm('Bạn có chắc muốn nộp bài? Bạn sẽ không thể thay đổi sau khi nộp.')) {
            return;
        }

        try {
            setSubmitting(true);
            const response = await examService.submit(id, answers);
            const data = response.data || response;
            setResult(data);
            setExamStarted(false);
        } catch (err) {
            setError(err.message || 'Không thể nộp bài');
        } finally {
            setSubmitting(false);
        }
    };

    const handleAnswerChange = (questionId, answer) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: answer
        }));
    };

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        if (hours > 0) {
            return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getTimeColor = () => {
        if (timeRemaining > 300) return 'text-green-400';
        if (timeRemaining > 60) return 'text-yellow-400';
        return 'text-red-400 animate-pulse';
    };

    const goToQuestion = (index) => {
        setCurrentQuestion(index);
    };

    const nextQuestion = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        }
    };

    const prevQuestion = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    const getAnsweredCount = () => {
        return Object.values(answers).filter(a => a !== '').length;
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải đề kiểm tra...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="card-glass p-8 max-w-md text-center">
                    <div className="text-red-400 mb-4">{error}</div>
                    <button onClick={() => navigate('/app/exams')} className="btn-primary">
                        Quay lại
                    </button>
                </div>
            </div>
        );
    }

    if (result) {
        return (
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="card-glass p-8 text-center">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-linear-to-br/srgb from-green-500 to-emerald-500 flex items-center justify-center">
                        <CheckIcon className="w-12 h-12 text-gray-900" />
                    </div>
                    <h2 className="text-3xl font-bold gradient-text mb-4">Hoàn thành bài kiểm tra!</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="p-6 bg-white/5 rounded-xl">
                            <p className="text-gray-500 text-sm mb-2">Điểm số</p>
                            <p className="text-4xl font-bold text-gray-900">{result.score?.toFixed(2) || 0}</p>
                        </div>
                        <div className="p-6 bg-white/5 rounded-xl">
                            <p className="text-gray-500 text-sm mb-2">Số câu đúng</p>
                            <p className="text-4xl font-bold text-green-400">{result.correct_answers || 0}</p>
                        </div>
                        <div className="p-6 bg-white/5 rounded-xl">
                            <p className="text-gray-500 text-sm mb-2">Tổng số câu</p>
                            <p className="text-4xl font-bold text-blue-400">{result.total_questions || questions.length}</p>
                        </div>
                    </div>
                    <div className="flex gap-4 justify-center">
                        <button onClick={() => navigate('/app/results')} className="btn-primary">
                            Xem chi tiết kết quả
                        </button>
                        <button onClick={() => navigate('/app/exams')} className="btn-secondary">
                            Về danh sách đề kiểm tra
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const currentQ = questions[currentQuestion];

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="card-glass p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{exam?.title}</h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Câu {currentQuestion + 1} / {questions.length}
                        </p>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="text-center">
                            <p className="text-xs text-gray-500 mb-1">Đã trả lời</p>
                            <p className="text-lg font-bold text-gray-900">
                                {getAnsweredCount()} / {questions.length}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-gray-500 mb-1">Thời gian còn lại</p>
                            <div className={`text-2xl font-bold ${getTimeColor()} flex items-center gap-2`}>
                                <ClockIcon className="w-6 h-6" />
                                {formatTime(timeRemaining)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1">
                    <div className="card-glass p-4 sticky top-6">
                        <h3 className="font-semibold text-gray-900 mb-4">Danh sách câu hỏi</h3>
                        <div className="grid grid-cols-5 lg:grid-cols-4 gap-2">
                            {questions.map((q, idx) => (
                                <button
                                    key={q._id || q.id}
                                    onClick={() => goToQuestion(idx)}
                                    className={`aspect-square rounded-lg text-sm font-semibold transition-all ${idx === currentQuestion
                                        ? 'bg-linear-to-br/srgb from-blue-500 to-indigo-600 text-gray-900'
                                        : answers[q._id || q.id]
                                            ? 'bg-green-500/20 text-green-400 border-2 border-green-500/50'
                                            : 'bg-white/5 text-gray-500 hover:bg-white/10'
                                        }`}
                                >
                                    {idx + 1}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => handleSubmit(false)}
                            disabled={submitting}
                            className="w-full mt-6 btn-primary disabled:opacity-50"
                        >
                            {submitting ? 'Đang nộp bài...' : 'Nộp bài'}
                        </button>
                    </div>
                </div>

                <div className="lg:col-span-3">
                    <div className="card-glass p-8">
                        {currentQ && (
                            <div className="space-y-6">
                                <div>
                                    <span className="text-sm text-blue-400 font-semibold">
                                        Câu {currentQuestion + 1}
                                    </span>
                                    <h2 className="text-xl font-semibold text-gray-900 mt-2 mb-6">
                                        {currentQ.content}
                                    </h2>
                                </div>

                                <div className="space-y-3">
                                    {currentQ.options?.map((option, idx) => (
                                        <label
                                            key={idx}
                                            className={`block p-4 rounded-xl border-2 cursor-pointer transition-all ${answers[currentQ._id || currentQ.id] === option
                                                ? 'border-blue-500 bg-blue-500/10'
                                                : 'border-gray-200 hover:border-gray-300 bg-white/5'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="radio"
                                                    name={`question-${currentQ._id || currentQ.id}`}
                                                    value={option}
                                                    checked={answers[currentQ._id || currentQ.id] === option}
                                                    onChange={() => handleAnswerChange(currentQ._id || currentQ.id, option)}
                                                    className="w-5 h-5"
                                                />
                                                <span className="text-gray-900 font-medium">
                                                    {String.fromCharCode(65 + idx)}. {option}
                                                </span>
                                            </div>
                                        </label>
                                    ))}
                                </div>

                                <div className="flex gap-3 pt-6 border-t border-gray-200">
                                    <button
                                        onClick={prevQuestion}
                                        disabled={currentQuestion === 0}
                                        className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ArrowLeftIcon className="w-4 h-4" />
                                        Câu trước
                                    </button>
                                    <div className="flex-1"></div>
                                    {currentQuestion < questions.length - 1 ? (
                                        <button
                                            onClick={nextQuestion}
                                            className="btn-primary flex items-center gap-2"
                                        >
                                            Câu tiếp
                                            <ArrowRightIcon className="w-4 h-4" />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleSubmit(false)}
                                            className="btn-primary flex items-center gap-2"
                                        >
                                            Nộp bài
                                            <CheckIcon className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TakeExam;
