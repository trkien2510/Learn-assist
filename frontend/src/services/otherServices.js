import httpClient from './httpClient';
import { API_ENDPOINTS } from '../config/api';

export const statisticsService = {
    async getByExam(examId) {
        return httpClient.get(API_ENDPOINTS.STATS_BY_EXAM(examId));
    },

    async getByClass(classId) {
        return httpClient.get(API_ENDPOINTS.STATS_BY_CLASS(classId));
    },

    async getPersonal() {
        return httpClient.get(API_ENDPOINTS.STATS_PERSONAL);
    },

    async getOverall() {
        return httpClient.get(API_ENDPOINTS.STATS_OVERALL);
    },

    async getComprehensive() {
        return httpClient.get(API_ENDPOINTS.STATS_COMPREHENSIVE);
    },

    async getStudentComprehensive() {
        return httpClient.get(API_ENDPOINTS.STATS_STUDENT_COMPREHENSIVE);
    },

    async getTeacherComprehensive() {
        return httpClient.get(API_ENDPOINTS.STATS_TEACHER_COMPREHENSIVE);
    },

    async getExamDetailed(examId) {
        return httpClient.get(API_ENDPOINTS.STATS_EXAM_DETAILED(examId));
    },

    async getClassDetailed(classId) {
        return httpClient.get(API_ENDPOINTS.STATS_CLASS_DETAILED(classId));
    },

    async getPlatform() {
        return httpClient.get(API_ENDPOINTS.STATS_PLATFORM);
    },

    async getSystemStats() {
        return this.getPlatform();
    },

    async getTeacherStats() {
        return this.getTeacherComprehensive();
    },

    async getStudentStats() {
        return this.getStudentComprehensive();
    }
};

export const notificationService = {
    async getAll(page = 1, pageSize = 10, unreadOnly = false) {
        return httpClient.get(API_ENDPOINTS.NOTIFICATIONS_GET, {
            page,
            page_size: pageSize,
            unread_only: unreadOnly
        });
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
        return httpClient.post(API_ENDPOINTS.NOTIFICATIONS_MARK_READ, {
            notification_ids: ids
        });
    },

    async delete(notificationId) {
        return httpClient.delete(API_ENDPOINTS.NOTIFICATIONS_DELETE(notificationId));
    },

    async deleteAll() {
        return httpClient.delete(API_ENDPOINTS.NOTIFICATIONS_DELETE_ALL);
    }
};

export const practiceService = {
    async createExam(examData) {
        return httpClient.post(API_ENDPOINTS.PRACTICE_CREATE, examData);
    },

    async getExams(page = 1, pageSize = 10) {
        return httpClient.get(API_ENDPOINTS.PRACTICE_GET_EXAMS, { page, page_size: pageSize });
    },

    async start(examId) {
        return httpClient.post(API_ENDPOINTS.PRACTICE_START(examId));
    },

    async submit(examId, answers) {
        return httpClient.post(API_ENDPOINTS.PRACTICE_SUBMIT(examId), { answers });
    },

    async delete(examId) {
        return httpClient.delete(API_ENDPOINTS.PRACTICE_DELETE(examId));
    },

    async getStats() {
        return httpClient.get(API_ENDPOINTS.PRACTICE_STATS);
    },

    async getStatsDetailed() {
        return httpClient.get(API_ENDPOINTS.PRACTICE_STATS_DETAILED);
    },

    async getExamStats(examId) {
        return httpClient.get(API_ENDPOINTS.PRACTICE_EXAM_STATS(examId));
    },

    async getDocumentStats() {
        return httpClient.get(API_ENDPOINTS.PRACTICE_DOCUMENT_STATS);
    }
};

export const adminService = {
    users: {
        async getAll(page = 1, pageSize = 10, filters = {}) {
            return httpClient.get(API_ENDPOINTS.ADMIN_USERS, {
                page,
                page_size: pageSize,
                ...filters
            });
        },

        async getById(userId) {
            return httpClient.get(API_ENDPOINTS.ADMIN_USER_GET(userId));
        },

        async update(userId, userData) {
            return httpClient.put(API_ENDPOINTS.ADMIN_USER_UPDATE(userId), userData);
        },

        async delete(userId) {
            return httpClient.delete(API_ENDPOINTS.ADMIN_USER_DELETE(userId));
        },

        async updateStatus(userId, isActive) {
            return httpClient.patch(API_ENDPOINTS.ADMIN_USER_STATUS(userId), { is_activate: isActive });
        }
    },

    classrooms: {
        async getById(classroomId) {
            return httpClient.get(API_ENDPOINTS.ADMIN_CLASSROOM_GET(classroomId));
        },

        async update(classroomId, classroomData) {
            return httpClient.put(API_ENDPOINTS.ADMIN_CLASSROOM_UPDATE(classroomId), classroomData);
        },

        async delete(classroomId) {
            return httpClient.delete(API_ENDPOINTS.ADMIN_CLASSROOM_DELETE(classroomId));
        }
    },

    logs: {
        async getAll(page = 1, pageSize = 10, filters = {}) {
            return httpClient.get(API_ENDPOINTS.ADMIN_LOGS, {
                page,
                page_size: pageSize,
                ...filters
            });
        },

        async getStats() {
            return httpClient.get(API_ENDPOINTS.ADMIN_LOG_STATS);
        },

        async getById(logId) {
            return httpClient.get(API_ENDPOINTS.ADMIN_LOG_GET(logId));
        },

        async cleanup(days = 30) {
            return httpClient.delete(API_ENDPOINTS.ADMIN_LOG_CLEANUP, { days });
        }
    },

    notifications: {
        async getSystemNotifications(page = 1, pageSize = 10) {
            return httpClient.get(API_ENDPOINTS.ADMIN_NOTIFICATIONS, { page, page_size: pageSize });
        },

        async getSystemHealth() {
            return httpClient.get(API_ENDPOINTS.ADMIN_SYSTEM_HEALTH);
        },

        async cleanup(days = 30) {
            return httpClient.post(API_ENDPOINTS.ADMIN_CLEANUP_NOTIFICATIONS, { days });
        },

        async sendTest() {
            return httpClient.post(API_ENDPOINTS.ADMIN_TEST_NOTIFICATION);
        }
    },

    stats: {
        async getStatistics() {
            return httpClient.get(API_ENDPOINTS.ADMIN_STATISTICS);
        },

        async getUserActivity(userId, days = 30) {
            return httpClient.get(API_ENDPOINTS.ADMIN_USER_ACTIVITY(userId), { days });
        },

        async getSystemHealth() {
            return httpClient.get(API_ENDPOINTS.ADMIN_SYSTEM_HEALTH);
        },

        async getUserGrowth(days = 30) {
            return httpClient.get(API_ENDPOINTS.ADMIN_USER_GROWTH, { days });
        },

        async getActivityHeatmap(days = 30) {
            return httpClient.get(API_ENDPOINTS.ADMIN_ACTIVITY_HEATMAP, { days });
        }
    }
};

export const dashboardService = {
    async getDashboard() {
        return httpClient.get(API_ENDPOINTS.DASHBOARD);
    }
};
