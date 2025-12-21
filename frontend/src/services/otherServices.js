import httpClient from './httpClient';
import { API_ENDPOINTS } from '../config/api';

export const statisticsService = {
    // Get exam statistics
    async getByExam(examId) {
        return httpClient.get(API_ENDPOINTS.STATS_BY_EXAM(examId));
    },

    // Get classroom statistics
    async getByClass(classId) {
        return httpClient.get(API_ENDPOINTS.STATS_BY_CLASS(classId));
    },

    // Get personal statistics
    async getPersonal() {
        return httpClient.get(API_ENDPOINTS.STATS_PERSONAL);
    },

    // Get overall statistics
    async getOverall() {
        return httpClient.get(API_ENDPOINTS.STATS_OVERALL);
    },

    // Get comprehensive statistics
    async getComprehensive() {
        return httpClient.get(API_ENDPOINTS.STATS_COMPREHENSIVE);
    },

    // Get student comprehensive statistics
    async getStudentComprehensive() {
        return httpClient.get(API_ENDPOINTS.STATS_STUDENT_COMPREHENSIVE);
    },

    // Get teacher comprehensive statistics
    async getTeacherComprehensive() {
        return httpClient.get(API_ENDPOINTS.STATS_TEACHER_COMPREHENSIVE);
    },

    // Get detailed exam statistics
    async getExamDetailed(examId) {
        return httpClient.get(API_ENDPOINTS.STATS_EXAM_DETAILED(examId));
    },

    // Get detailed classroom statistics
    async getClassDetailed(classId) {
        return httpClient.get(API_ENDPOINTS.STATS_CLASS_DETAILED(classId));
    },

    // Get platform statistics (admin only)
    async getPlatform() {
        return httpClient.get(API_ENDPOINTS.STATS_PLATFORM);
    },

    // Aliases for role-based stats (used in Statistics page)
    async getSystemStats() {
        return this.getPlatform(); // Admin stats
    },

    async getTeacherStats() {
        return this.getTeacherComprehensive(); // Teacher stats
    },

    async getStudentStats() {
        return this.getStudentComprehensive(); // Student stats
    }
};

export const notificationService = {
    // Get notifications
    async getAll(page = 1, pageSize = 10, unreadOnly = false) {
        return httpClient.get(API_ENDPOINTS.NOTIFICATIONS_GET, {
            page,
            page_size: pageSize,
            unread_only: unreadOnly
        });
    },

    // Get unread count
    async getUnreadCount() {
        return httpClient.get(API_ENDPOINTS.NOTIFICATIONS_UNREAD_COUNT);
    },

    // Mark as read
    async markAsRead(notificationIds = null) {
        return httpClient.post(API_ENDPOINTS.NOTIFICATIONS_MARK_READ, {
            notification_ids: notificationIds
        });
    },

    // Delete notification
    async delete(notificationId) {
        return httpClient.delete(API_ENDPOINTS.NOTIFICATIONS_DELETE(notificationId));
    },

    // Delete all notifications
    async deleteAll() {
        return httpClient.delete(API_ENDPOINTS.NOTIFICATIONS_DELETE_ALL);
    }
};

export const practiceService = {
    // Create practice exam
    async createExam(examData) {
        return httpClient.post(API_ENDPOINTS.PRACTICE_CREATE, examData);
    },

    // Get practice exams
    async getExams(page = 1, pageSize = 10) {
        return httpClient.get(API_ENDPOINTS.PRACTICE_GET_EXAMS, { page, page_size: pageSize });
    },

    // Start practice exam
    async start(examId) {
        return httpClient.post(API_ENDPOINTS.PRACTICE_START(examId));
    },

    // Submit practice exam
    async submit(examId, answers) {
        return httpClient.post(API_ENDPOINTS.PRACTICE_SUBMIT(examId), { answers });
    },

    // Delete practice exam
    async delete(examId) {
        return httpClient.delete(API_ENDPOINTS.PRACTICE_DELETE(examId));
    },

    // Get practice statistics
    async getStats() {
        return httpClient.get(API_ENDPOINTS.PRACTICE_STATS);
    },

    // Get detailed practice statistics
    async getStatsDetailed() {
        return httpClient.get(API_ENDPOINTS.PRACTICE_STATS_DETAILED);
    },

    // Get exam statistics
    async getExamStats(examId) {
        return httpClient.get(API_ENDPOINTS.PRACTICE_EXAM_STATS(examId));
    },

    // Get document statistics
    async getDocumentStats() {
        return httpClient.get(API_ENDPOINTS.PRACTICE_DOCUMENT_STATS);
    }
};

export const adminService = {
    // User Management
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

    // Classroom Management
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

    // Log Management
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

    // Notification Management
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
    }
};
