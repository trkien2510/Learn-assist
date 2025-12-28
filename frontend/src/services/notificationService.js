import httpClient from './httpClient';
import { API_ENDPOINTS } from '../config/api';

export const notificationService = {
    async getNotifications(page = 1, pageSize = 20, unreadOnly = false) {
        const params = { page, page_size: pageSize };
        if (unreadOnly) {
            params.unread_only = true;
        }
        return httpClient.get(API_ENDPOINTS.NOTIFICATIONS_GET, params);
    },

    async getUnreadCount() {
        return httpClient.get(API_ENDPOINTS.NOTIFICATIONS_UNREAD_COUNT);
    },

    async markAsRead(notificationIds = null) {
        // Ensure notification_ids is an array if provided
        let ids = notificationIds;
        if (notificationIds && !Array.isArray(notificationIds)) {
            ids = [notificationIds];
        }
        const body = ids ? { notification_ids: ids } : {};
        return httpClient.post(API_ENDPOINTS.NOTIFICATIONS_MARK_READ, body);
    },

    async markAllAsRead() {
        return httpClient.post(API_ENDPOINTS.NOTIFICATIONS_MARK_READ, {});
    },

    async deleteNotification(notificationId) {
        return httpClient.delete(API_ENDPOINTS.NOTIFICATIONS_DELETE(notificationId));
    },

    async deleteAllNotifications() {
        return httpClient.delete(API_ENDPOINTS.NOTIFICATIONS_DELETE_ALL);
    }
};

export default notificationService;
