import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const NotificationItem = ({ notification, onMarkAsRead, onDelete, onClick }) => {
    const getIcon = (type) => {
        switch (type) {
            case 'exam_created':
                return '📝';
            case 'exam_started':
                return '▶️';
            case 'exam_ended':
                return '⏹️';
            case 'exam_result':
                return '📊';
            case 'document_upload_success':
                return '✅';
            case 'document_upload_failed':
                return '❌';
            case 'exam_creation_success':
                return '✨';
            case 'exam_statistics_available':
                return '📈';
            case 'system_error':
                return '⚠️';
            case 'system_warning':
                return '⚡';
            case 'user_anomaly':
                return '🚨';
            case 'high_error_rate':
                return '🔴';
            default:
                return '🔔';
        }
    };

    const getTypeColor = (type) => {
        if (type.includes('error') || type.includes('failed') || type.includes('anomaly')) {
            return 'from-red-500 to-rose-500';
        }
        if (type.includes('warning')) {
            return 'from-amber-500 to-orange-500';
        }
        if (type.includes('success') || type.includes('result')) {
            return 'from-green-500 to-emerald-500';
        }
        return 'from-blue-500 to-cyan-500';
    };

    const handleClick = () => {
        if (!notification.is_read) {
            onMarkAsRead([notification.id]);
        }
        if (onClick) {
            onClick(notification);
        }
    };

    const timeAgo = notification.created_at
        ? formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: vi })
        : '';

    return (
        <div
            onClick={handleClick}
            className={`p-4 rounded-xl border transition-all cursor-pointer group ${notification.is_read
                ? 'border-gray-200 hover:border-gray-300 bg-white/5'
                : 'border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20'
                }`}
        >
            <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl bg-linear-to-br/srgb ${getTypeColor(notification.notification_type)} flex items-center justify-center shrink-0`}>
                    <span className="text-lg">{getIcon(notification.notification_type)}</span>
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <h4 className={`text-sm font-medium ${notification.is_read ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100'}`}>
                            {notification.title}
                        </h4>
                        {!notification.is_read && (
                            <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1"></span>
                        )}
                    </div>

                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {notification.message}
                    </p>

                    <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-400">
                            {timeAgo}
                        </span>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(notification.id);
                            }}
                            className="text-xs text-gray-400 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                        >
                            Xóa
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationItem;
