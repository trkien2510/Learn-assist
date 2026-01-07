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

    async upload(file, numQuestions) {
        const formData = new FormData();
        formData.append('file', file);
        return httpClient.upload(API_ENDPOINTS.DOCUMENT_UPLOAD(numQuestions), formData);
    },

    async saveQuestions(documentId, questions) {
        return httpClient.post(API_ENDPOINTS.DOCUMENT_SAVE_QUESTIONS(documentId), {
            questions
        });
    },

    async delete(documentId) {
        return httpClient.delete(API_ENDPOINTS.DOCUMENT_DELETE(documentId));
    }
};

export const questionService = {
    async create(questionData) {
        return httpClient.post(API_ENDPOINTS.QUESTION_CREATE, questionData);
    },

    async getAll(page = 1, pageSize = 10, filters = {}) {
        return httpClient.get(API_ENDPOINTS.QUESTION_ALL, {
            page,
            page_size: pageSize,
            ...filters
        });
    },

    async getMyQuestions(page = 1, pageSize = 100) {
        return httpClient.get(API_ENDPOINTS.QUESTION_ALL, {
            page,
            page_size: pageSize
        });
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

    async previewQuestions(classCode, totalQuestions, easyCount, mediumCount, hardCount) {
        return httpClient.post(API_ENDPOINTS.EXAM_PREVIEW, {
            class_code: classCode,
            total_questions: totalQuestions,
            easy_count: easyCount,
            medium_count: mediumCount,
            hard_count: hardCount
        });
    },

    async replaceQuestion(classCode, questionId, excludedIds, difficulty) {
        return httpClient.post(
            `${API_ENDPOINTS.EXAM_REPLACE_QUESTION}?class_code=${classCode}&difficulty=${difficulty}`,
            {
                question_id: questionId,
                excluded_ids: excludedIds
            }
        );
    }
};

export const resultService = {
    async getAll(page = 1, pageSize = 10) {
        return httpClient.get(API_ENDPOINTS.RESULT_ALL, { page, page_size: pageSize });
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
