import React from 'react';
import { BookIcon, UsersIcon, ClockIcon, ChartIcon } from '../icons/Icons';

const ClassroomOverview = ({ classroom, stats, loadingStats }) => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card-glass p-6 text-center hover-scale">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-linear-to-br/srgb from-blue-500 to-cyan-500 flex items-center justify-center">
                        <UsersIcon className="w-6 h-6 text-gray-900" />
                    </div>
                    <div className="text-3xl font-bold gradient-text mb-1">
                        {classroom.members_count || 0}
                    </div>
                    <div className="text-gray-500 text-sm">Thành viên</div>
                </div>

                <div className="card-glass p-6 text-center hover-scale">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-linear-to-br/srgb from-green-500 to-emerald-500 flex items-center justify-center">
                        <ClockIcon className="w-6 h-6 text-gray-900" />
                    </div>
                    <div className="text-3xl font-bold gradient-text mb-1">
                        {loadingStats ? (
                            <span className="inline-block w-8 h-8 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin"></span>
                        ) : (
                            stats?.classroom_info?.exam_count || 0
                        )}
                    </div>
                    <div className="text-gray-500 text-sm">Bài kiểm tra</div>
                </div>

                <div className="card-glass p-6 text-center hover-scale">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-linear-to-br/srgb from-purple-500 to-pink-500 flex items-center justify-center">
                        <ChartIcon className="w-6 h-6 text-gray-900" />
                    </div>
                    <div className="text-3xl font-bold gradient-text mb-1">
                        {loadingStats ? (
                            <span className="inline-block w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></span>
                        ) : (
                            stats?.overall_performance?.average_score !== undefined
                                ? stats.overall_performance.average_score.toFixed(1)
                                : '--'
                        )}
                    </div>
                    <div className="text-gray-500 text-sm">Điểm TB</div>
                </div>
            </div>

            {classroom.description && (
                <div className="card-glass p-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Mô tả</h3>
                    <p className="text-gray-600 whitespace-pre-wrap wrap-break-word overflow-hidden">{classroom.description}</p>
                </div>
            )}

            <div className="card-glass p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Thông tin lớp học</h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-gray-500">Mã lớp</span>
                        <span className="font-mono font-semibold text-blue-400">{classroom.class_code}</span>
                    </div>
                    {classroom.subject && (
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                            <span className="text-gray-500">Môn học</span>
                            <span className="font-semibold text-gray-900">{classroom.subject}</span>
                        </div>
                    )}
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-gray-500">Ngày tạo</span>
                        <span className="text-gray-900">
                            {(() => {
                                let dateStr = classroom.created_at;
                                if (!/Z|[+-]\d{2}:\d{2}$/.test(dateStr)) {
                                    dateStr = dateStr + 'Z';
                                }
                                return new Date(dateStr).toLocaleDateString('vi-VN');
                            })()}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClassroomOverview;
