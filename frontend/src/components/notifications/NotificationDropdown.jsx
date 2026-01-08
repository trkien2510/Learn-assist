import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, ROLES } from '../../contexts/AuthContext';
import NotificationItem from './NotificationItem';
import { ArrowRightIcon } from '../icons/Icons';

const NotificationDropdown = ({
    notifications,
    unreadCount,
    onMarkAsRead,
    onMarkAllAsRead,
    onDelete,
    onClose
}) => {
    const navigate = useNavigate();
    const { hasRole } = useAuth();

    const handleNotificationClick = (notification) => {
        if (notification.related_id) {
            const type = notification.related_type;
            const nid = notification.notification_type;

            switch (type) {
                case 'exam':
                    if (nid === 'exam_result') {
                        if (hasRole(ROLES.STUDENT)) {
                            navigate(notification.related_id ? `/app/results/${notification.related_id}` : '/app/results');
                        } else {
                            navigate(`/app/exams/${notification.related_id}/statistics`);
                        }
                    } else if (nid === 'exam_statistics_available' || nid === 'exam_ended') {
                        navigate(`/app/exams/${notification.related_id}/statistics`);
                    } else if (nid === 'exam_creation_success' && notification.title?.toLowerCase().includes('cá nhân')) {
                        navigate('/app/practice');
                    } else if (nid === 'exam_created' || nid === 'exam_started') {
                        navigate(`/app/take-exam/${notification.related_id}`);
                    } else {
                        navigate('/app/exams');
                    }
                    break;
                case 'document':
                    navigate('/app/documents');
                    break;
                case 'class':
                    navigate(`/app/classroom/${notification.related_id}`);
                    break;
                case 'user':
                    if (notification.notification_type === 'user_anomaly') {
                        navigate(`/app/users`);
                    } else {
                        navigate('/app/profile');
                    }
                    break;
                case 'system':
                    navigate('/app/logs');
                    break;
                default:
                    break;
            }
            onClose();
        } else {
            navigate('/app/notifications');
            onClose();
        }
    };

    return (
        <div className="absolute right-0 top-full mt-2 w-96 max-h-[600px] glass rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50 animate-fadeIn">
            <div className="p-4 border-b border-gray-200 bg-linear-to-r from-blue-500/10 to-cyan-500/10">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Thông báo</h3>
                        {unreadCount > 0 && (
                            <p className="text-xs text-gray-500 mt-0.5">
                                {unreadCount} thông báo chưa đọc
                            </p>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={onMarkAllAsRead}
                            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            Đánh dấu tất cả là đã đọc
                        </button>
                    )}
                </div>
            </div>

            <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                            <span className="text-3xl">🔔</span>
                        </div>
                        <p className="text-gray-500 text-sm">Không có thông báo mới</p>
                    </div>
                ) : (
                    <div className="p-3 space-y-2">
                        {notifications.map((notification) => (
                            <NotificationItem
                                key={notification.id}
                                notification={notification}
                                onMarkAsRead={onMarkAsRead}
                                onDelete={onDelete}
                                onClick={handleNotificationClick}
                            />
                        ))}
                    </div>
                )}
            </div>

            {notifications.length > 0 && (
                <div className="p-3 border-t border-gray-200 bg-white/5">
                    <button
                        onClick={() => {
                            navigate('/app/notifications');
                            onClose();
                        }}
                        className="w-full py-2 text-sm text-blue-400 hover:text-blue-300 flex items-center justify-center gap-2 transition-colors"
                    >
                        Xem tất cả thông báo
                        <ArrowRightIcon className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
