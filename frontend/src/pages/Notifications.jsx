import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, ROLES } from '../contexts/AuthContext';
import { notificationService } from '../services/apiServices';
import { useNotifications } from '../contexts/NotificationContext';
import { useDateFormat, usePagination, useFetch } from '../hooks';
import { BellIcon, TrashIcon, CheckIcon } from '../components/icons/Icons';
import { translateError } from '../utils/errorMessages';

const Notifications = () => {
    const {
        unreadCount,
        fetchUnreadCount,
        markAsRead: contextMarkAsRead,
        markAllAsRead: contextMarkAllAsRead,
        deleteNotification: contextDeleteNotification
    } = useNotifications();
    const { user, hasRole } = useAuth();
    const { formatDateTime } = useDateFormat();
    const navigate = useNavigate();
    const {
        page,
        totalPages: localTotalPages,
        setPage,
        updateFromResponse,
        hasNext: localHasNext,
        hasPrevious,
        nextPage,
        previousPage
    } = usePagination(1, 20);

    const {
        data: notificationData,
        loading,
        error,
        refresh: fetchNotifications
    } = useFetch(
        () => notificationService.getAll(page, 20),
        [page],
        {
            onSuccess: (data) => {
                updateFromResponse(data);
                fetchUnreadCount();
            }
        }
    );

    const notifications = notificationData?.items || [];
    const totalPages = notificationData?.total_pages || localTotalPages;
    const hasNext = notificationData?.has_next !== undefined ? notificationData.has_next : localHasNext;

    const handleNotificationClick = async (notification) => {
        if (!notification.is_read) {
            await contextMarkAsRead([notification._id || notification.id]);
            fetchNotifications();
        }

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
        }
    };


    const markAsRead = async (notificationId) => {
        await contextMarkAsRead([notificationId]);
        fetchNotifications();
    };

    const markAllAsRead = async () => {
        await contextMarkAllAsRead();
        fetchNotifications();
    };

    const deleteNotification = async (notificationId) => {
        await contextDeleteNotification(notificationId);
        fetchNotifications();
    };

    return (
        <div className="max-w-full mx-auto space-y-6">
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
                            onClick={() => handleNotificationClick(notification)}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="font-semibold text-gray-900">{translateError(notification.title)}</h3>
                                        {!notification.is_read && (
                                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                        )}
                                    </div>

                                    <p className="text-gray-600 mb-2 leading-relaxed">
                                        {translateError(notification.message)}
                                    </p>

                                    <p className="text-xs text-gray-400">
                                        {formatDateTime(notification.created_at)}
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
                                        className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                                        title="Xóa"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 p-4 pt-6">
                            <button
                                onClick={previousPage}
                                disabled={!hasPrevious}
                                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Trước
                            </button>
                            <span className="text-gray-600 px-4">
                                Trang {page} / {totalPages}
                            </span>
                            <button
                                onClick={nextPage}
                                disabled={!hasNext}
                                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Sau
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Notifications;
