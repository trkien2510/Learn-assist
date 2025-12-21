import { useState, useEffect, useCallback } from 'react';
import notificationService from '../services/notificationService';

const useNotifications = (pollingInterval = 30000) => { // Poll every 30 seconds
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch notifications
    const fetchNotifications = useCallback(async (page = 1, pageSize = 20) => {
        try {
            setLoading(true);
            setError(null);
            const response = await notificationService.getNotifications(page, pageSize);
            const data = response.data || response;
            setNotifications(data.items || []);
            setUnreadCount(data.unread_count || 0);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch unread count only
    const fetchUnreadCount = useCallback(async () => {
        try {
            const response = await notificationService.getUnreadCount();
            const data = response.data || response;
            setUnreadCount(data.unread_count || 0);
        } catch (err) {
            console.error('Failed to fetch unread count:', err);
        }
    }, []);

    // Mark as read
    const markAsRead = useCallback(async (notificationIds = null) => {
        try {
            await notificationService.markAsRead(notificationIds);
            // Refresh notifications
            await fetchNotifications();
        } catch (err) {
            console.error('Failed to mark as read:', err);
            setError(err.message);
        }
    }, [fetchNotifications]);

    // Mark all as read
    const markAllAsRead = useCallback(async () => {
        try {
            await notificationService.markAllAsRead();
            // Refresh notifications
            await fetchNotifications();
        } catch (err) {
            console.error('Failed to mark all as read:', err);
            setError(err.message);
        }
    }, [fetchNotifications]);

    // Delete notification
    const deleteNotification = useCallback(async (notificationId) => {
        try {
            await notificationService.deleteNotification(notificationId);
            // Refresh notifications
            await fetchNotifications();
        } catch (err) {
            console.error('Failed to delete notification:', err);
            setError(err.message);
        }
    }, [fetchNotifications]);

    // Delete all notifications
    const deleteAllNotifications = useCallback(async () => {
        try {
            await notificationService.deleteAllNotifications();
            setNotifications([]);
            setUnreadCount(0);
        } catch (err) {
            console.error('Failed to delete all notifications:', err);
            setError(err.message);
        }
    }, []);

    // Set up polling
    useEffect(() => {
        // Initial fetch
        fetchNotifications();

        // Set up polling interval
        const intervalId = setInterval(() => {
            fetchUnreadCount();
        }, pollingInterval);

        return () => clearInterval(intervalId);
    }, [fetchNotifications, fetchUnreadCount, pollingInterval]);

    return {
        notifications,
        unreadCount,
        loading,
        error,
        fetchNotifications,
        fetchUnreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        deleteAllNotifications
    };
};

export default useNotifications;
