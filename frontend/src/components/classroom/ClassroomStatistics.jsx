import React, { useState, useEffect } from 'react';
import { examService } from '../../services/apiServices';
import { ChartIcon, ClockIcon } from '../icons/Icons';

const ClassroomStatistics = ({ classCode, classroom }) => {
    const [view, setView] = useState('overall'); // 'overall' or 'by-exam'
    const [exams, setExams] = useState([]);
    const [selectedExamId, setSelectedExamId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (classroom?.id) {
            fetchExams();
        }
    }, [classroom]);

    const fetchExams = async () => {
        try {
            setLoading(true);
            const response = await examService.getByClass(classroom.id, 1, 100);
            const data = response.data || response;
            setExams(data.items || []);
            if (data.items?.length > 0) {
                setSelectedExamId(data.items[0]._id || data.items[0].id);
            }
        } catch (err) {
            setError(err.message || 'Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex gap-2">
                <button
                    onClick={() => setView('overall')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${view === 'overall'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'text-gray-500 hover:bg-white/5'
                        }`}
                >
                    Tổng quan
                </button>
                <button
                    onClick={() => setView('by-exam')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${view === 'by-exam'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'text-gray-500 hover:bg-white/5'
                        }`}
                >
                    Theo bài kiểm tra
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400">
                    {error}
                </div>
            )}

            {view === 'overall' ? (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="card-glass p-6 text-center">
                            <div className="text-4xl font-bold gradient-text mb-2">
                                {classroom.members_count || 0}
                            </div>
                            <div className="text-gray-500 text-sm">Tổng học sinh</div>
                        </div>
                        <div className="card-glass p-6 text-center">
                            <div className="text-4xl font-bold gradient-text mb-2">
                                {exams.length}
                            </div>
                            <div className="text-gray-500 text-sm">Tổng bài kiểm tra</div>
                        </div>
                        <div className="card-glass p-6 text-center">
                            <div className="text-4xl font-bold gradient-text mb-2">
                                --
                            </div>
                            <div className="text-gray-500 text-sm">Điểm trung bình</div>
                        </div>
                    </div>

                    <div className="card-glass p-6">
                        <h3 className="font-semibold text-gray-900 mb-4">Thống kê tổng quan</h3>
                        <div className="text-center py-12 text-gray-500">
                            <ChartIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                            <p>Dữ liệu thống kê sẽ được cập nhật khi có bài kiểm tra</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {exams.length === 0 ? (
                        <div className="card-glass p-12 text-center">
                            <ClockIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                            <p className="text-gray-500">Chưa có bài kiểm tra nào</p>
                        </div>
                    ) : (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Chọn bài kiểm tra
                                </label>
                                <select
                                    value={selectedExamId || ''}
                                    onChange={(e) => setSelectedExamId(e.target.value)}
                                    className="input-glass w-full md:w-96"
                                >
                                    {exams.map((exam) => (
                                        <option key={exam._id || exam.id} value={exam._id || exam.id}>
                                            {exam.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {selectedExamId && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div className="card-glass p-4 text-center">
                                            <div className="text-2xl font-bold text-green-400 mb-1">
                                                0
                                            </div>
                                            <div className="text-gray-500 text-xs">Đã hoàn thành</div>
                                        </div>
                                        <div className="card-glass p-4 text-center">
                                            <div className="text-2xl font-bold text-yellow-400 mb-1">
                                                {classroom.members_count || 0}
                                            </div>
                                            <div className="text-gray-500 text-xs">Chưa làm</div>
                                        </div>
                                        <div className="card-glass p-4 text-center">
                                            <div className="text-2xl font-bold text-blue-400 mb-1">
                                                --
                                            </div>
                                            <div className="text-gray-500 text-xs">Điểm cao nhất</div>
                                        </div>
                                        <div className="card-glass p-4 text-center">
                                            <div className="text-2xl font-bold text-purple-400 mb-1">
                                                --
                                            </div>
                                            <div className="text-gray-500 text-xs">Điểm trung bình</div>
                                        </div>
                                    </div>

                                    <div className="card-glass p-6">
                                        <h3 className="font-semibold text-gray-900 mb-4">Kết quả học sinh</h3>
                                        <div className="text-center py-12 text-gray-500">
                                            <p>Danh sách kết quả sẽ hiển thị khi có học sinh hoàn thành bài kiểm tra</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default ClassroomStatistics;
