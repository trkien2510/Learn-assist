import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { notificationService } from '../services/otherServices';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchUnreadCount = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            const response = await notificationService.getUnreadCount();
            const data = response.data || response;
            setUnreadCount(data.unread_count || 0);
        } catch (err) {
            
        }
    }, [isAuthenticated]);

    const fetchNotifications = useCallback(async (page = 1, pageSize = 20) => {
        if (!isAuthenticated) return;
        try {
            setLoading(true);
            const response = await notificationService.getAll(page, pageSize);
            const data = response.data || response;
            setNotifications(data.items || []);
            setUnreadCount(data.unread_count || 0);
            return data;
        } catch (err) {
            
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    const markAsRead = useCallback(async (notificationIds = null) => {
        try {
            await notificationService.markAsRead(notificationIds);
            await fetchUnreadCount();
        } catch (err) {
            
        }
    }, [fetchUnreadCount]);

    const markAllAsRead = useCallback(async () => {
        try {
            await notificationService.markAsRead(null);
            await fetchUnreadCount();
        } catch (err) {
            
        }
    }, [fetchUnreadCount]);

    const deleteNotification = useCallback(async (notificationId) => {
        try {
            await notificationService.delete(notificationId);
            await fetchUnreadCount();
        } catch (err) {
            
        }
    }, [fetchUnreadCount]);

    const deleteAllNotifications = useCallback(async () => {
        try {
            await notificationService.delete_all();
            setNotifications([]);
            setUnreadCount(0);
        } catch (err) {
            
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            fetchUnreadCount();
            const interval = setInterval(fetchUnreadCount, 10000); // 10 seconds
            return () => clearInterval(interval);
        } else {
            setUnreadCount(0);
            setNotifications([]);
        }
    }, [isAuthenticated, fetchUnreadCount]);

    return (
        <NotificationContext.Provider value={{
            unreadCount,
            notifications,
            loading,
            fetchUnreadCount,
            fetchNotifications,
            setUnreadCount,
            markAsRead,
            markAllAsRead,
            deleteNotification,
            deleteAllNotifications
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};
