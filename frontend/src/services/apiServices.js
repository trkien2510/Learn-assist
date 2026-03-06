import httpClient from './httpClient';
import { API_ENDPOINTS } from '../config/api';

export const classroomService = {
    async create(classroomData) {
        return httpClient.post(API_ENDPOINTS.CLASSROOM_CREATE, classroomData);
    },

    async getAll(page = 1, pageSize = 10) {
        return httpClient.get(API_ENDPOINTS.CLASSROOM_ALL, { page, page_size: pageSize });
    },

    async getMembers(classCode) {
        return httpClient.get(API_ENDPOINTS.CLASSROOM_MEMBERS(classCode));
    },

    async delete(classCode) {
        return httpClient.delete(API_ENDPOINTS.CLASSROOM_DELETE(classCode));
    },

    async sendJoinRequest(classCode) {
        return httpClient.post(API_ENDPOINTS.CLASSROOM_JOIN_REQUEST(classCode));
    },

    async acceptRequest(classCode, requestId) {
        return httpClient.post(API_ENDPOINTS.CLASSROOM_ACCEPT(classCode, requestId));
    },

    async rejectRequest(classCode, requestId) {
        return httpClient.post(API_ENDPOINTS.CLASSROOM_REJECT(classCode, requestId));
    },

    async acceptAllRequests(classCode) {
        return httpClient.post(API_ENDPOINTS.CLASSROOM_ACCEPT_ALL(classCode));
    },

    async rejectAllRequests(classCode) {
        return httpClient.post(API_ENDPOINTS.CLASSROOM_REJECT_ALL(classCode));
    },

    async leave(classCode) {
        return httpClient.post(API_ENDPOINTS.CLASSROOM_LEAVE(classCode));
    },

    async removeMember(classCode, memberId) {
        return httpClient.delete(API_ENDPOINTS.CLASSROOM_REMOVE_MEMBER(classCode, memberId));
    },

    async getPendingRequests() {
        return httpClient.get(API_ENDPOINTS.CLASSROOM_PENDING_REQUESTS);
    },

    async getDetail(classCode) {
        return httpClient.get(API_ENDPOINTS.CLASSROOM_DETAIL(classCode));
    },

    async sendMessage(classCode, content) {
        return httpClient.post(API_ENDPOINTS.MESSAGE_SEND(classCode), { content });
    },

    async getMessages(classCode, page = 1, pageSize = 50) {
        return httpClient.get(API_ENDPOINTS.MESSAGE_GET(classCode), { page, page_size: pageSize });
    },
};

export const documentService = {
    async getAll(page = 1, pageSize = 10) {
        return httpClient.get(API_ENDPOINTS.DOCUMENT_ALL, { page, page_size: pageSize });
    },

    async upload(file, numQuestions, mode) {
        const formData = new FormData();
        formData.append('file', file);
        return httpClient.upload(API_ENDPOINTS.DOCUMENT_UPLOAD(numQuestions, mode), formData);
    },

    async saveQuestions(documentId, questions) {
        return httpClient.post(API_ENDPOINTS.DOCUMENT_SAVE_QUESTIONS(documentId), { questions });
    },

    async delete(documentId) {
        return httpClient.delete(API_ENDPOINTS.DOCUMENT_DELETE(documentId));
    },

    async getQuestionCount(documentId) {
        return httpClient.get(API_ENDPOINTS.DOCUMENT_QUESTION_COUNT(documentId));
    }
};

export const questionService = {
    async create(questionData) {
        return httpClient.post(API_ENDPOINTS.QUESTION_CREATE, questionData);
    },

    async getAll(page = 1, pageSize = 10, filters = {}) {
        return httpClient.get(API_ENDPOINTS.QUESTION_ALL, { page, page_size: pageSize, ...filters });
    },

    async getMyQuestions(page = 1, pageSize = 100) {
        return httpClient.get(API_ENDPOINTS.QUESTION_ALL, { page, page_size: pageSize });
    },

    async getSubjects() {
        return httpClient.get(API_ENDPOINTS.QUESTION_SUBJECTS);
    },

    async getById(questionId) {
        return httpClient.get(API_ENDPOINTS.QUESTION_GET(questionId));
    },

    async update(questionId, questionData) {
        return httpClient.put(API_ENDPOINTS.QUESTION_UPDATE(questionId), questionData);
    },

    async delete(questionId) {
        return httpClient.delete(API_ENDPOINTS.QUESTION_DELETE(questionId));
    }
};

export const examService = {
    async create(examData) {
        return httpClient.post(API_ENDPOINTS.EXAM_CREATE, examData);
    },

    async getAll(page = 1, pageSize = 10) {
        return httpClient.get(API_ENDPOINTS.EXAM_ALL, { page, page_size: pageSize });
    },

    async getByClass(classId, page = 1, pageSize = 10) {
        return httpClient.get(API_ENDPOINTS.EXAM_BY_CLASS(classId), { page, page_size: pageSize });
    },

    async delete(examId) {
        return httpClient.delete(API_ENDPOINTS.EXAM_DELETE(examId));
    },

    async getById(examId) {
        return httpClient.get(API_ENDPOINTS.EXAM_GET(examId));
    },

    async start(examId) {
        return httpClient.post(API_ENDPOINTS.EXAM_START(examId));
    },

    async submit(examId, answers) {
        return httpClient.post(API_ENDPOINTS.EXAM_SUBMIT(examId), { answers });
    },

    async previewQuestions(classCode, totalQuestions, easyCount, mediumCount, hardCount, documentIds = []) {
        const payload = {
            class_code: classCode,
            total_questions: totalQuestions,
            easy_count: easyCount,
            medium_count: mediumCount,
            hard_count: hardCount
        };
        if (documentIds && documentIds.length > 0) {
            payload.document_ids = documentIds;
        }
        return httpClient.post(API_ENDPOINTS.EXAM_PREVIEW, payload);
    },

    async replaceQuestion(classCode, questionId, excludedIds, difficulty) {
        return httpClient.post(
            `${API_ENDPOINTS.EXAM_REPLACE_QUESTION}?class_code=${classCode}&difficulty=${difficulty}`,
            { question_id: questionId, excluded_ids: excludedIds }
        );
    }
};

export const resultService = {
    async getAll(page = 1, pageSize = 10, examType = null) {
        const params = { page, page_size: pageSize };
        if (examType) params.exam_type = examType;
        return httpClient.get(API_ENDPOINTS.RESULT_ALL, params);
    },

    async getByExam(examId, page = 1, pageSize = 10) {
        return httpClient.get(API_ENDPOINTS.RESULT_BY_EXAM(examId), { page, page_size: pageSize });
    },

    async getByClass(classId, page = 1, pageSize = 10) {
        return httpClient.get(API_ENDPOINTS.RESULT_BY_CLASS(classId), { page, page_size: pageSize });
    },

    async delete(resultId) {
        return httpClient.delete(API_ENDPOINTS.RESULT_DELETE(resultId));
    }
};

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
        let ids = notificationIds;
        if (notificationIds && !Array.isArray(notificationIds)) {
            ids = [notificationIds];
        }
        return httpClient.post(API_ENDPOINTS.NOTIFICATIONS_MARK_READ, { notification_ids: ids });
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

export const dashboardService = {
    async getDashboard() {
        return httpClient.get(API_ENDPOINTS.DASHBOARD);
    }
};

export const adminService = {
    users: {
        async getAll(page = 1, pageSize = 10, filters = {}) {
            return httpClient.get(API_ENDPOINTS.ADMIN_USERS, { page, page_size: pageSize, ...filters });
        },

        async create(userData) {
            return httpClient.post(API_ENDPOINTS.ADMIN_USER_CREATE, userData);
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
            return httpClient.get(API_ENDPOINTS.ADMIN_LOGS, { page, page_size: pageSize, ...filters });
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
