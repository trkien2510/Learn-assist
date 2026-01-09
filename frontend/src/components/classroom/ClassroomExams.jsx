import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, ROLES } from '../../contexts/AuthContext';
import { examService } from '../../services/apiServices';
import { PlusIcon, ClockIcon, TrashIcon, EditIcon, CheckIcon } from '../icons/Icons';
import ExamCreationModal from './ExamCreationModal';

const ClassroomExams = ({ classCode, classroom, onRefresh }) => {
    const navigate = useNavigate();
    const { user, hasRole } = useAuth();
    const [exams, setExams] = useState([]);
    const [submittedExamIds, setSubmittedExamIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);

    const isTeacher = hasRole([ROLES.TEACHER]);
    const isAdmin = hasRole([ROLES.ADMIN]);
    const isCreator = classroom?.is_creator;

    useEffect(() => {
        if (classroom?.id) {
            fetchExams();
        }
    }, [classroom]);

    const fetchExams = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await examService.getByClass(classroom.id, 1, 50);
            const data = response.data || response;
            const examsData = data.items || [];

            if (examsData.length > 0) {

            }

            setExams(examsData);
            setSubmittedExamIds(data.submitted_exam_ids || []);
        } catch (err) {
            setError(err.message || 'Không thể tải danh sách bài kiểm tra');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteExam = async (examId) => {
        if (!confirm('Bạn có chắc muốn xóa bài kiểm tra này?')) return;

        try {
            await examService.delete(examId);
            await fetchExams();
        } catch (err) {
            setError(err.message || 'Không thể xóa bài kiểm tra');
        }
    };

    const formatDateTime = (dateString) => {
        let dateStr = dateString;
        if (!/Z|[+-]\d{2}:\d{2}$/.test(dateString)) {
            dateStr = dateString + 'Z';
        }

        const date = new Date(dateStr);
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getExamStatus = (exam) => {
        const now = new Date();

        let startStr = exam.start_at;
        let endStr = exam.end_at;
        if (!/Z|[+-]\d{2}:\d{2}$/.test(startStr)) startStr += 'Z';
        if (!/Z|[+-]\d{2}:\d{2}$/.test(endStr)) endStr += 'Z';

        const startDate = new Date(startStr);
        const endDate = new Date(endStr);

        if (now < startDate) {
            return { label: 'Sắp diễn ra', color: 'blue' };
        } else if (now >= startDate && now <= endDate) {
            return { label: 'Đang diễn ra', color: 'green' };
        } else {
            return { label: 'Đã kết thúc', color: 'gray' };
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">Bài kiểm tra</h3>
                    <p className="text-gray-500 text-sm mt-1">
                        {exams.length} bài kiểm tra
                    </p>
                </div>

                {isCreator && (
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="btn-primary flex items-center gap-2"
                    >
                        <PlusIcon className="w-4 h-4" />
                        Tạo bài kiểm tra
                    </button>
                )}
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="card-glass p-6 animate-pulse">
                            <div className="h-6 bg-gray-700 rounded mb-3"></div>
                            <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                        </div>
                    ))}
                </div>
            ) : exams.length === 0 ? (
                <div className="card-glass p-12 text-center">
                    <ClockIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Chưa có bài kiểm tra nào
                    </h3>
                    <p className="text-gray-500 mb-6">
                        {isCreator ? 'Tạo bài kiểm tra đầu tiên cho lớp học' : 'Chưa có bài kiểm tra nào được tạo'}
                    </p>
                    {isCreator && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="btn-primary"
                        >
                            Tạo bài kiểm tra
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {exams.map((exam) => {
                        const status = getExamStatus(exam);
                        return (
                            <div key={exam._id || exam.id} className="card-glass p-6 hover-scale">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-900 text-lg mb-2">
                                            {exam.title}
                                        </h4>
                                        <div className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${status.color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                                            status.color === 'green' ? 'bg-green-500/20 text-green-400' :
                                                'bg-gray-500/20 text-gray-400'
                                            }`}>
                                            {status.label}
                                        </div>
                                    </div>

                                    {isCreator && (
                                        <button
                                            onClick={() => handleDeleteExam(exam._id || exam.id)}
                                            className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <ClockIcon className="w-4 h-4" />
                                        <span>{exam.duration} phút</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <EditIcon className="w-4 h-4" />
                                        <span>{exam.questions?.length || 0} câu hỏi</span>
                                    </div>
                                    <div className="pt-2 border-t border-gray-200/10">
                                        <p className="text-gray-500 text-xs">
                                            Bắt đầu: {formatDateTime(exam.start_at)}
                                        </p>
                                        <p className="text-gray-500 text-xs">
                                            Kết thúc: {formatDateTime(exam.end_at)}
                                        </p>
                                    </div>

                                    {(isTeacher) && (
                                        <div className="flex gap-2 pt-3 border-t border-gray-200/10">
                                            <button
                                                onClick={() => navigate(`/app/exams/${exam._id || exam.id}/statistics`)}
                                                className="flex-1 btn-primary text-sm py-2"
                                            >
                                                Thống kê
                                            </button>
                                        </div>
                                    )}

                                    {!isTeacher && !isAdmin && (
                                        submittedExamIds.includes(exam._id || exam.id) ? (
                                            <div className="pt-3 border-t border-gray-200/10">
                                                <button
                                                    disabled
                                                    className="w-full btn-secondary text-sm py-2.5 bg-green-500/20 text-green-600 border-green-500/50 cursor-default flex items-center justify-center gap-2"
                                                >
                                                    <CheckIcon className="w-4 h-4" />
                                                    Đã nộp
                                                </button>
                                            </div>
                                        ) : status.color === 'green' && (
                                            <div className="pt-3 border-t border-gray-200/10">
                                                <button
                                                    onClick={() => navigate(`/app/take-exam/${exam._id || exam.id}`)}
                                                    className="w-full btn-primary text-sm py-2.5"
                                                >
                                                    Làm bài ngay
                                                </button>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {showCreateModal && (
                <ExamCreationModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    classCode={classCode}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        fetchExams();
                        if (onRefresh) onRefresh();
                    }}
                />
            )}
        </div>
    );
};

export default ClassroomExams;
