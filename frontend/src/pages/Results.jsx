import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { resultService, examService, practiceService } from '../services/apiServices';
import { CheckIcon, XIcon, ArrowLeftIcon, CalendarIcon, EditIcon, ClockIcon, TrashIcon } from '../components/icons/Icons';

const Results = () => {
    const [searchParams] = useSearchParams();
    const { showError } = useToast();
    const [results, setResults] = useState([]);
    const [selectedResult, setSelectedResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isFetchingData, setIsFetchingData] = useState(false);
    const [activeTab, setActiveTab] = useState('regular');



    const fetchResults = async (isInitialLoad = false) => {
        try {
            if (isInitialLoad) setLoading(true);
            else setIsFetchingData(true);

            const examId = searchParams.get('exam_id');
            const classId = searchParams.get('class_id');

            let response;
            if (examId) {
                response = await resultService.getByExam(examId);
            } else if (classId) {
                response = await resultService.getByClass(classId);
            } else {
                response = await resultService.getAll(1, 100, activeTab);
            }

            const data = response?.data || response;
            const items = data?.items || data || [];
            setResults(Array.isArray(items) ? items : []);
        } catch (err) {

            showError(err.message || 'Không thể tải kết quả');
            setResults([]);
        } finally {
            setLoading(false);
            setIsFetchingData(false);
        }
    };

    useEffect(() => {
        // Only show full loading spinner on initial mount or when deep linking
        fetchResults(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    useEffect(() => {
        // Render smoothly when just switching tabs
        fetchResults(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    const viewDetail = async (result) => {
        try {
            setLoading(true);

            const examIdObj = result.exam?._id ||
                result.exam?.id ||
                result.exam_id?.ref?.id ||
                result.exam_id?.id ||
                result.exam_id?.$id ||
                result.exam_id;

            const examId = typeof examIdObj === 'object' ?
                (examIdObj?.$oid || examIdObj?.toString()) :
                examIdObj;



            if (examId && (!result.exam?.questions || result.exam.questions.length === 0)) {
                const examResponse = await examService.getById(examId);
                const examData = examResponse.data || examResponse;
                result.exam = examData.exam || examData;
            }

            setSelectedResult(result);
        } catch (err) {

            showError(err.message || 'Không thể tải chi tiết bài kiểm tra');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        let dateStr = dateString;
        if (!/Z|[+-]\d{2}:\d{2}$/.test(dateString)) {
            dateStr = dateString + 'Z';
        }
        return new Date(dateStr).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
    };

    const handleDeleteExam = async (e, result) => {
        e.stopPropagation();
        if (!window.confirm('Bạn có chắc chắn muốn xóa bài luyện tập này? Kết quả sẽ bị xóa vĩnh viễn.')) return;

        try {
            setLoading(true);
            const examIdObj = result.exam?._id || result.exam?.id || result.exam_id?.ref?.id || result.exam_id?.id || result.exam_id?.$id || result.exam_id;
            const examId = typeof examIdObj === 'object' ? (examIdObj?.$oid || examIdObj?.toString()) : examIdObj;

            await practiceService.delete(examId);
            showError('Đã xóa bài luyện tập thành công');
            fetchResults();
        } catch (err) {
            showError(err.message || 'Không thể xóa bài luyện tập');
            setLoading(false);
        }
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

            {!searchParams.get('exam_id') && !searchParams.get('class_id') && !selectedResult && (
                <div className="flex space-x-4 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('regular')}
                        className={`px-4 py-2 font-medium ${activeTab === 'regular'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Bài kiểm tra thường
                    </button>
                    <button
                        onClick={() => setActiveTab('personal')}
                        className={`px-4 py-2 font-medium ${activeTab === 'personal'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Kiểm tra tự luyện
                    </button>
                </div>
            )}

            {isFetchingData ? (
                <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                </div>
            ) : selectedResult ? (
                <div className="space-y-6">
                    <button
                        onClick={() => setSelectedResult(null)}
                        className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-blue-600 transition-colors"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                        Quay lại danh sách
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
                                    {(selectedResult.exam?.questions || []).filter(q =>
                                        selectedResult.answer_map?.[q._id || q.id] === q.answers
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
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isCorrect ? 'bg-green-500' : 'bg-red-500'
                                                }`}>
                                                {isCorrect ? <CheckIcon className="w-5 h-5 text-gray-900" /> : <XIcon className="w-5 h-5 text-gray-900" />}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-gray-900 font-semibold mb-3">
                                                    Câu {idx + 1}: {question.content}
                                                </p>
                                                <div className="space-y-2">
                                                    {question.options?.map((option, optIdx) => {
                                                        const optionLetter = String.fromCharCode(65 + optIdx);
                                                        const isUserChoice = userAnswer === optionLetter;
                                                        const isCorrectChoice = correctAnswer === optionLetter;

                                                        return (
                                                            <div
                                                                key={optIdx}
                                                                className={`p-3 rounded-lg border flex items-center justify-between ${isCorrectChoice
                                                                    ? 'bg-green-500/10 border-green-500/50'
                                                                    : isUserChoice
                                                                        ? 'bg-red-500/10 border-red-500/50'
                                                                        : 'bg-slate-800/10 border-slate-200'
                                                                    }`}
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${isCorrectChoice
                                                                        ? 'bg-green-500 text-white'
                                                                        : isUserChoice
                                                                            ? 'bg-red-500 text-white'
                                                                            : 'bg-slate-200 text-gray-700'
                                                                        }`}>
                                                                        {optionLetter}
                                                                    </span>
                                                                    <span className="text-gray-900">{option}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    {isCorrectChoice && (
                                                                        <span className="text-green-600 text-xs font-bold bg-green-100 px-2 py-1 rounded">ĐÁP ÁN ĐÚNG</span>
                                                                    )}
                                                                    {isUserChoice && !isCorrectChoice && (
                                                                        <span className="text-red-600 text-xs font-bold bg-red-100 px-2 py-1 rounded">BẠN CHỌN</span>
                                                                    )}
                                                                    {isUserChoice && isCorrectChoice && (
                                                                        <span className="text-green-600 text-xs font-bold bg-green-100 px-2 py-1 rounded">CHÍNH XÁC</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            ) : results.length === 0 ? (
                <div className="card-glass p-12 text-center">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có kết quả nào</h3>
                    <p className="text-gray-500">Hoàn thành bài kiểm tra để xem kết quả</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {results.map((result) => (
                        <div key={result._id || result.id} className="card-glass p-6 hover-scale cursor-pointer" onClick={() => viewDetail(result)}>
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900 mb-2">
                                        {result.exam_title || result.exam?.title || 'Bài kiểm tra'}
                                    </h3>
                                    <div className="flex gap-6 text-sm text-gray-500">
                                        <span className="flex items-center gap-1.5">
                                            <CalendarIcon className="w-4 h-4" />
                                            {formatDate(result.submit_at || result.created_at)}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <EditIcon className="w-4 h-4" />
                                            {result.question_count ?? result.exam?.questions?.length ?? 0} câu hỏi
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <ClockIcon className="w-4 h-4" />
                                            {result.duration ?? result.exam?.duration ?? 0} phút
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className={`text-4xl font-bold ${getGradeColor(result.score)}`}>
                                        {result.score?.toFixed(2)}
                                    </div>
                                    {activeTab === 'personal' && !selectedResult && (
                                        <button
                                            onClick={(e) => handleDeleteExam(e, result)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Xóa bài luyện tập"
                                        >
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    )}
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
