import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { resultService } from '../services/apiServices';
import { CheckIcon, XIcon, SearchIcon } from '../components/icons/Icons';

const Results = () => {
    const [searchParams] = useSearchParams();
    const [results, setResults] = useState([]);
    const [selectedResult, setSelectedResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchResults();
    }, [searchParams]);

    const fetchResults = async () => {
        try {
            setLoading(true);
            const examId = searchParams.get('exam_id');
            const classId = searchParams.get('class_id');

            let data;
            if (examId) {
                data = await resultService.getByExam(examId);
            } else if (classId) {
                data = await resultService.getByClass(classId);
            } else {
                data = await resultService.getAll();
            }

            setResults(data.items || data || []);
        } catch (err) {
            setError(err.message || 'Không thể tải kết quả');
        } finally {
            setLoading(false);
        }
    };

    const viewDetail = async (result) => {
        setSelectedResult(result);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('vi-VN');
    };

    const getGradeColor = (score) => {
        if (score >= 8) return 'text-green-400';
        if (score >= 5) return 'text-yellow-400';
        return 'text-red-400';
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
                <h1 className="text-3xl font-bold gradient-text">Kết quả học tập</h1>
                <p className="text-gray-500 mt-2">Xem chi tiết điểm số và câu trả lời</p>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400">
                    {error}
                </div>
            )}

            {results.length === 0 ? (
                <div className="card-glass p-12 text-center">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có kết quả nào</h3>
                    <p className="text-gray-500">Hoàn thành bài thi để xem kết quả</p>
                </div>
            ) : selectedResult ? (
                // Detail View
                <div className="space-y-6">
                    <button onClick={() => setSelectedResult(null)} className="btn-secondary">
                        ← Quay lại
                    </button>

                    <div className="card-glass p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            {selectedResult.exam?.title || 'Chi tiết kết quả'}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <div className="p-6 bg-white/5 rounded-xl text-center">
                                <p className="text-gray-500 text-sm mb-2">Điểm số</p>
                                <p className={`text-4xl font-bold ${getGradeColor(selectedResult.score)}`}>
                                    {selectedResult.score?.toFixed(2)}
                                </p>
                            </div>
                            <div className="p-6 bg-white/5 rounded-xl text-center">
                                <p className="text-gray-500 text-sm mb-2">Số câu đúng</p>
                                <p className="text-3xl font-bold text-green-400">
                                    {Object.values(selectedResult.answer_map || {}).filter((ans, idx) =>
                                        ans === selectedResult.exam?.questions?.[idx]?.answers
                                    ).length}
                                </p>
                            </div>
                            <div className="p-6 bg-white/5 rounded-xl text-center">
                                <p className="text-gray-500 text-sm mb-2">Tổng câu hỏi</p>
                                <p className="text-3xl font-bold text-blue-400">
                                    {selectedResult.exam?.questions?.length || 0}
                                </p>
                            </div>
                            <div className="p-6 bg-white/5 rounded-xl text-center">
                                <p className="text-gray-500 text-sm mb-2">Ngày làm</p>
                                <p className="text-sm font-bold text-gray-900">
                                    {formatDate(selectedResult.submit_at || selectedResult.created_at)}
                                </p>
                            </div>
                        </div>

                        {/* Questions Review */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Chi tiết câu trả lời</h3>
                            {selectedResult.exam?.questions?.map((question, idx) => {
                                const userAnswer = selectedResult.answer_map?.[question._id || question.id];
                                const correctAnswer = question.answers;
                                const isCorrect = userAnswer === correctAnswer;

                                return (
                                    <div key={idx} className={`p-6 rounded-xl border-2 ${isCorrect ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'
                                        }`}>
                                        <div className="flex items-start gap-4">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isCorrect ? 'bg-green-500' : 'bg-red-500'
                                                }`}>
                                                {isCorrect ? <CheckIcon className="w-5 h-5 text-gray-900" /> : <XIcon className="w-5 h-5 text-gray-900" />}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-gray-900 font-semibold mb-3">
                                                    Câu {idx + 1}: {question.content}
                                                </p>
                                                <div className="space-y-2">
                                                    {question.options?.map((option, optIdx) => (
                                                        <div
                                                            key={optIdx}
                                                            className={`p-3 rounded-lg ${option === correctAnswer
                                                                    ? 'bg-green-500/20 border-2 border-green-500/50'
                                                                    : option === userAnswer
                                                                        ? 'bg-red-500/20 border-2 border-red-500/50'
                                                                        : 'bg-slate-800/50'
                                                                }`}
                                                        >
                                                            <span className="text-gray-900">
                                                                {String.fromCharCode(65 + optIdx)}. {option}
                                                                {option === correctAnswer && ' ✓ (Đáp án đúng)'}
                                                                {option === userAnswer && option !== correctAnswer && ' ✗ (Bạn chọn)'}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            ) : (
                // List View
                <div className="space-y-4">
                    {results.map((result) => (
                        <div key={result._id || result.id} className="card-glass p-6 hover-scale cursor-pointer" onClick={() => viewDetail(result)}>
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900 mb-2">
                                        {result.exam?.title || 'Bài thi'}
                                    </h3>
                                    <div className="flex gap-6 text-sm text-gray-500">
                                        <span>📅 {formatDate(result.submit_at || result.created_at)}</span>
                                        <span>📝 {result.exam?.questions?.length || 0} câu hỏi</span>
                                        <span>⏱️ {result.exam?.duration || 0} phút</span>
                                    </div>
                                </div>
                                <div className={`text-4xl font-bold ${getGradeColor(result.score)}`}>
                                    {result.score?.toFixed(2)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Results;
