import React from 'react';
import {
    UsersIcon,
    ExamIcon,
    BookIcon,
    DocumentIcon,
    ChartIcon
} from '../icons/Icons';

const RecentActivity = ({ activities }) => {
    const getActivityIcon = (type) => {
        switch (type) {
            case 'user':
                return UsersIcon;
            case 'exam':
                return ExamIcon;
            case 'class':
                return BookIcon;
            case 'document':
                return DocumentIcon;
            case 'question':
                return DocumentIcon;
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
                return 'bg-blue-500/20 text-blue-400';
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

    return (
        <div className="space-y-4">
            {activities.length === 0 ? (
                <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                        <span className="text-3xl">📋</span>
                    </div>
                    <p className="text-gray-500 text-sm">Chưa có hoạt động nào</p>
                </div>
            ) : (
                activities.map((activity, index) => {
                    const IconComponent = getActivityIcon(activity.type);
                    return (
                        <div
                            key={activity.id}
                            className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${getActivityColor(activity.type)}`}>
                                <IconComponent className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {activity.action}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                    bởi {activity.user}
                                </p>
                            </div>
                            <span className="text-xs text-gray-400 flex-shrink-0">
                                {activity.time}
                            </span>
                        </div>
                    );
                })
            )}
        </div>
    );
};

export default RecentActivity;
