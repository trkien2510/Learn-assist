import React, { useState, useEffect } from 'react';
import { notificationService } from '../services/otherServices';
import { BellIcon, TrashIcon, CheckIcon } from '../components/icons/Icons';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await notificationService.getAll();
            const data = response.data || response;
            setNotifications(data.items || data || []);
        } catch (err) {
            setError(err.message || 'Không thể tải thông báo');
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await notificationService.markAsRead(notificationId);
            fetchNotifications();
        } catch (err) {
            console.error('Error marking as read:', err);
        }
    };

    const markAllAsRead = async () => {
        try {
            await notificationService.markAsRead(null);
            fetchNotifications();
        } catch (err) {
            console.error('Error marking all as read:', err);
        }
    };

    const deleteNotification = async (notificationId) => {
        try {
            await notificationService.delete(notificationId);
            fetchNotifications();
        } catch (err) {
            console.error('Error deleting notification:', err);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('vi-VN');
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold gradient-text">Thông báo</h1>
                    <p className="text-gray-500 mt-2">
                        {unreadCount} thông báo chưa đọc
                    </p>
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={markAllAsRead}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                    >
                        <CheckIcon className="w-4 h-4" />
                        Đánh dấu tất cả đã đọc
                    </button>
                )}
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="card-glass p-6 animate-pulse">
                            <div className="h-4 bg-slate-700 rounded mb-2 w-2/3"></div>
                            <div className="h-3 bg-slate-700 rounded w-1/3"></div>
                        </div>
                    ))}
                </div>
            ) : notifications.length === 0 ? (
                <div className="card-glass p-12 text-center">
                    <BellIcon className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Không có thông báo</h3>
                    <p className="text-gray-500">
                        Chưa có thông báo nào
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {notifications.map((notification) => (
                        <div
                            key={notification._id || notification.id}
                            className={`card-glass p-6 hover-scale cursor-pointer ${!notification.is_read ? 'border-l-4 border-blue-500' : ''
                                }`}
                            onClick={() => !notification.is_read && markAsRead(notification._id || notification.id)}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                                        {!notification.is_read && (
                                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                        )}
                                    </div>
                                    <p className="text-gray-600 mb-3">{notification.content}</p>
                                    <p className="text-sm text-gray-500">
                                        {formatDate(notification.created_at)}
                                    </p>
                                </div>
                                <div className="flex gap-2 ml-4">
                                    {!notification.is_read && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                markAsRead(notification._id || notification.id);
                                            }}
                                            className="p-2 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500/20 transition-colors"
                                            title="Đánh dấu đã đọc"
                                        >
                                            <CheckIcon className="w-4 h-4" />
                                        </button>
                                    )}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteNotification(notification._id || notification.id);
                                        }}
                                        className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                                        title="Xóa"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Notifications;
