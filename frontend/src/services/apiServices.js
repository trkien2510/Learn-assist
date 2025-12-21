import httpClient from './httpClient';
import { API_ENDPOINTS } from '../config/api';

export const classroomService = {
    // Create classroom
    async create(classroomData) {
        return httpClient.post(API_ENDPOINTS.CLASSROOM_CREATE, classroomData);
    },

    // Get all classrooms
    async getAll(page = 1, pageSize = 10) {
        return httpClient.get(API_ENDPOINTS.CLASSROOM_ALL, { page, page_size: pageSize });
    },

    // Get classroom members
    async getMembers(classCode) {
        return httpClient.get(API_ENDPOINTS.CLASSROOM_MEMBERS(classCode));
    },

    // Delete classroom
    async delete(classCode) {
        return httpClient.delete(API_ENDPOINTS.CLASSROOM_DELETE(classCode));
    },

    // Send join request
    async sendJoinRequest(classCode) {
        return httpClient.post(API_ENDPOINTS.CLASSROOM_JOIN_REQUEST(classCode));
    },

    // Accept join request
    async acceptRequest(classCode, requestId) {
        return httpClient.post(API_ENDPOINTS.CLASSROOM_ACCEPT(classCode, requestId));
    },

    // Reject join request
    async rejectRequest(classCode, requestId) {
        return httpClient.post(API_ENDPOINTS.CLASSROOM_REJECT(classCode, requestId));
    },

    // Accept all requests
    async acceptAllRequests(classCode) {
        return httpClient.post(API_ENDPOINTS.CLASSROOM_ACCEPT_ALL(classCode));
    },

    // Reject all requests
    async rejectAllRequests(classCode) {
        return httpClient.post(API_ENDPOINTS.CLASSROOM_REJECT_ALL(classCode));
    },

    // Leave classroom
    async leave(classCode) {
        return httpClient.post(API_ENDPOINTS.CLASSROOM_LEAVE(classCode));
    },

    // Remove member
    async removeMember(classCode, memberId) {
        return httpClient.delete(API_ENDPOINTS.CLASSROOM_REMOVE_MEMBER(classCode, memberId));
    },

    // Get pending requests
    async getPendingRequests() {
        return httpClient.get(API_ENDPOINTS.CLASSROOM_PENDING_REQUESTS);
    }
};

export const documentService = {
    // Get all documents
    async getAll(page = 1, pageSize = 10) {
        return httpClient.get(API_ENDPOINTS.DOCUMENT_ALL, { page, page_size: pageSize });
    },

    // Upload document
    async upload(file, numQuestions) {
        const formData = new FormData();
        formData.append('file', file);
        return httpClient.upload(API_ENDPOINTS.DOCUMENT_UPLOAD(numQuestions), formData);
    },

    // Save AI-generated questions
    async saveQuestions(documentId, questions) {
        return httpClient.post(API_ENDPOINTS.DOCUMENT_SAVE_QUESTIONS(documentId), {
            questions
        });
    },

    // Delete document
    async delete(documentId) {
        return httpClient.delete(API_ENDPOINTS.DOCUMENT_DELETE(documentId));
    }
};

export const questionService = {
    // Create question
    async create(questionData) {
        return httpClient.post(API_ENDPOINTS.QUESTION_CREATE, questionData);
    },

    // Get all questions
    async getAll(page = 1, pageSize = 10, filters = {}) {
        return httpClient.get(API_ENDPOINTS.QUESTION_ALL, {
            page,
            page_size: pageSize,
            ...filters
        });
    },

    // Get subjects list
    async getSubjects() {
        return httpClient.get(API_ENDPOINTS.QUESTION_SUBJECTS);
    },

    // Get question by ID
    async getById(questionId) {
        return httpClient.get(API_ENDPOINTS.QUESTION_GET(questionId));
    },

    // Update question
    async update(questionId, questionData) {
        return httpClient.put(API_ENDPOINTS.QUESTION_UPDATE(questionId), questionData);
    },

    // Delete question
    async delete(questionId) {
        return httpClient.delete(API_ENDPOINTS.QUESTION_DELETE(questionId));
    }
};

export const examService = {
    // Create exam
    async create(examData) {
        return httpClient.post(API_ENDPOINTS.EXAM_CREATE, examData);
    },

    // Get all exams
    async getAll(page = 1, pageSize = 10) {
        return httpClient.get(API_ENDPOINTS.EXAM_ALL, { page, page_size: pageSize });
    },

    // Get exams by classroom
    async getByClass(classId, page = 1, pageSize = 10) {
        return httpClient.get(API_ENDPOINTS.EXAM_BY_CLASS(classId), { page, page_size: pageSize });
    },

    // Delete exam
    async delete(examId) {
        return httpClient.delete(API_ENDPOINTS.EXAM_DELETE(examId));
    },

    // Start exam
    async start(examId) {
        return httpClient.post(API_ENDPOINTS.EXAM_START(examId));
    },

    // Submit exam
    async submit(examId, answers) {
        return httpClient.post(API_ENDPOINTS.EXAM_SUBMIT(examId), { answers });
    }
};

export const resultService = {
    // Get all results
    async getAll(page = 1, pageSize = 10) {
        return httpClient.get(API_ENDPOINTS.RESULT_ALL, { page, page_size: pageSize });
    },

    // Get results by exam
    async getByExam(examId, page = 1, pageSize = 10) {
        return httpClient.get(API_ENDPOINTS.RESULT_BY_EXAM(examId), { page, page_size: pageSize });
    },

    // Get results by classroom
    async getByClass(classId, page = 1, pageSize = 10) {
        return httpClient.get(API_ENDPOINTS.RESULT_BY_CLASS(classId), { page, page_size: pageSize });
    },

    // Delete result
    async delete(resultId) {
        return httpClient.delete(API_ENDPOINTS.RESULT_DELETE(resultId));
    }
};
