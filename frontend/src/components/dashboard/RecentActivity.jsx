import React from 'react';
import {
    UsersIcon,
    ExamIcon,
    BookIcon,
    DocumentIcon,
    ChartIcon,
    QuestionIcon
} from '../icons/Icons';

const RecentActivity = ({ activities }) => {
    const getActivityIcon = (type) => {
        switch (type) {
            case 'user':
                return UsersIcon;
            case 'exam':
                return ExamIcon;
            case 'class':
            case 'classroom':
                return BookIcon;
            case 'document':
                return DocumentIcon;
            case 'question':
                return QuestionIcon;
            case 'result':
                return ChartIcon;
            default:
                return ChartIcon;
        }
    };

    const getActivityColor = (type) => {
        switch (type) {
            case 'user':
                return 'bg-blue-500/20 text-blue-400';
            case 'exam':
                return 'bg-green-500/20 text-green-400';
            case 'class':
            case 'classroom':
                return 'bg-cyan-500/20 text-cyan-400';
            case 'document':
                return 'bg-orange-500/20 text-orange-400';
            case 'question':
                return 'bg-purple-500/20 text-purple-400';
            case 'result':
                return 'bg-amber-500/20 text-amber-400';
            default:
                return 'bg-gray-500/20 text-gray-400';
        }
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return '';

        try {
            const date = new Date(timestamp);

            if (isNaN(date.getTime())) {
                return timestamp;
            }

            const now = new Date();

            const diffMs = now - date;
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);

            if (diffMins < 1) return 'Vừa xong';
            if (diffMins < 60) return `${diffMins} phút trước`;
            if (diffHours < 24) return `${diffHours} giờ trước`;
            if (diffDays < 7) return `${diffDays} ngày trước`;

            return date.toLocaleString('vi-VN', {
                timeZone: 'Asia/Ho_Chi_Minh',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            console.error('Error formatting time:', e);
            return timestamp;
        }
    };

    return (
        <div className="overflow-hidden">
            {activities.length === 0 ? (
                <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                        <span className="text-3xl">📋</span>
                    </div>
                    <p className="text-gray-500 text-sm">Chưa có hoạt động nào</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200/10">
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Loại
                                </th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Hoạt động
                                </th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Người thực hiện
                                </th>
                                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Thời gian
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {activities.map((activity, index) => {
                                const IconComponent = getActivityIcon(activity.type);
                                return (
                                    <tr
                                        key={activity.id || index}
                                        className="border-b border-gray-200/5 hover:bg-white/5 transition-colors"
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${getActivityColor(activity.type)}`}>
                                                    <IconComponent className="w-4 h-4" />
                                                </div>
                                            </div>
                                        </td>

                                        <td className="py-3 px-4">
                                            <p className="text-sm font-medium text-gray-900">
                                                {activity.action || activity.description}
                                            </p>
                                            {activity.resource_name && (
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    {typeof activity.resource_name === 'string'
                                                        ? activity.resource_name
                                                        : activity.resource_name?.filename || JSON.stringify(activity.resource_name)
                                                    }
                                                </p>
                                            )}
                                        </td>

                                        <td className="py-3 px-4">
                                            <p className="text-sm text-gray-600">
                                                {activity.user || activity.user_email || 'Hệ thống'}
                                            </p>
                                        </td>

                                        <td className="py-3 px-4 text-right">
                                            <span className="text-xs text-gray-400">
                                                {formatTime(activity.time || activity.timestamp || activity.created_at)}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default RecentActivity;
