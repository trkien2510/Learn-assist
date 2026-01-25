import React, { useState, useEffect } from 'react';
import { documentService } from '../services/apiServices';
import { useToast } from '../contexts/ToastContext';
import { UploadIcon, FileIcon, TrashIcon, EditIcon, CloseIcon, CalendarIcon, SaveIcon } from '../components/icons/Icons';

const Documents = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const { showSuccess, showError } = useToast();

    const [selectedFile, setSelectedFile] = useState(null);
    const [numQuestions, setNumQuestions] = useState(10);
    const [showUploadModal, setShowUploadModal] = useState(false);

    const [generatedQuestions, setGeneratedQuestions] = useState([]);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [currentDocumentId, setCurrentDocumentId] = useState(null);
    const [editingQuestion, setEditingQuestion] = useState(null);

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const response = await documentService.getAll(1, 50);
            const data = response.data || response;
            setDocuments(data.items || data || []);
        } catch (err) {
            showError(err.message || 'Không thể tải danh sách tài liệu');
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e) => {
        if (uploading) {
            return;
        }

        const file = e.target.files[0];
        if (file) {
            const validTypes = [
                'application/pdf',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/msword'
            ];

            if (!validTypes.includes(file.type)) {
                showError('Chỉ chấp nhận file PDF hoặc DOCX');
                return;
            }

            if (file.size > 10 * 1024 * 1024) {
                showError('File không được vượt quá 10MB');
                return;
            }

            setSelectedFile(file);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            showError('Vui lòng chọn file');
            return;
        }

        if (numQuestions < 1 || numQuestions > 50) {
            showError('Số lượng câu hỏi phải từ 1 đến 50');
            return;
        }

        try {
            setUploading(true);

            const uploadResponse = await documentService.upload(selectedFile, numQuestions);


            const responseData = uploadResponse.data;


            setCurrentDocumentId(responseData.document_id);

            const questionsData = responseData.questions;


            let questions = [];
            if (Array.isArray(questionsData)) {
                questions = questionsData;
            } else if (questionsData && Array.isArray(questionsData.questions)) {
                questions = questionsData.questions;
            }



            setGeneratedQuestions(questions);

            const allIndices = questions.length > 0
                ? Array.from({ length: questions.length }, (_, i) => i)
                : [];
            setSelectedQuestions(allIndices);

            showSuccess('Upload và sinh câu hỏi thành công!');
            setShowUploadModal(false);
            setShowPreviewModal(true);
            setUploading(false);
            fetchDocuments();
        } catch (err) {
            showError(err.message || 'Upload thất bại. Vui lòng thử lại.');
            setUploading(false);
        }
    };

    const toggleQuestionSelection = (index) => {
        if (selectedQuestions.includes(index)) {
            setSelectedQuestions(selectedQuestions.filter(i => i !== index));
        } else {
            setSelectedQuestions([...selectedQuestions, index]);
        }
    };

    const handleSaveQuestions = async () => {
        if (selectedQuestions.length === 0) {
            showError('Vui lòng chọn ít nhất 1 câu hỏi');
            return;
        }

        try {
            setUploading(true);

            const questionsToSave = selectedQuestions.map(idx => generatedQuestions[idx]);

            await documentService.saveQuestions(currentDocumentId, questionsToSave);

            showSuccess(`Đã lưu ${questionsToSave.length} câu hỏi vào ngân hàng!`);
            setShowPreviewModal(false);
            fetchDocuments();
            resetUploadForm();
        } catch (err) {
            showError(err.message || 'Không thể lưu câu hỏi');
        } finally {
            setUploading(false);
        }
    };

    const handleEditQuestion = (index) => {
        setEditingQuestion({ index, ...generatedQuestions[index] });
    };

    const handleSaveEdit = () => {
        const newQuestions = [...generatedQuestions];
        newQuestions[editingQuestion.index] = {
            content: editingQuestion.content,
            options: editingQuestion.options,
            answer: editingQuestion.answer,
            difficulty: editingQuestion.difficulty
        };
        setGeneratedQuestions(newQuestions);
        setEditingQuestion(null);
    };

    const handleDeleteDocument = async (documentId) => {
        if (!confirm('Bạn có chắc muốn xóa tài liệu này?')) return;

        try {
            await documentService.delete(documentId);
            showSuccess('Đã xóa tài liệu!');
            fetchDocuments();
        } catch (err) {
            showError(err.message || 'Không thể xóa tài liệu');
        }
    };

    const resetUploadForm = () => {
        setSelectedFile(null);
        setNumQuestions(10);
        setGeneratedQuestions([]);
        setSelectedQuestions([]);
        setCurrentDocumentId(null);
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        let dateStr = dateString;
        if (!/Z|[+-]\d{2}:\d{2}$/.test(dateString)) {
            dateStr = dateString + 'Z';
        }
        return new Date(dateStr).toLocaleDateString('vi-VN', {
            timeZone: 'Asia/Ho_Chi_Minh',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold gradient-text">Quản lý tài liệu</h1>
                    <p className="text-gray-500 mt-2">Upload tài liệu và sinh câu hỏi tự động bằng AI</p>
                </div>
                <button
                    onClick={() => setShowUploadModal(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <UploadIcon className="w-5 h-5" />
                    Upload tài liệu
                </button>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="card-glass p-6 animate-pulse">
                            <div className="h-6 bg-slate-700 rounded mb-4 w-2/3"></div>
                            <div className="h-4 bg-slate-700 rounded w-1/3"></div>
                        </div>
                    ))}
                </div>
            ) : documents.length === 0 ? (
                <div className="card-glass p-12 text-center">
                    <UploadIcon className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có tài liệu nào</h3>
                    <p className="text-gray-500 mb-6">Upload tài liệu đầu tiên để bắt đầu</p>
                    <button onClick={() => setShowUploadModal(true)} className="btn-primary">
                        Upload tài liệu
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {documents.map((doc) => (
                        <div key={doc._id || doc.id} className="card-glass p-6 hover-scale">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4 flex-1">
                                    <div className="w-12 h-12 rounded-xl bg-linear-to-br/srgb from-blue-500 to-indigo-600 flex items-center justify-center shrink-0">
                                        <FileIcon className="w-6 h-6 text-gray-900" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900 text-lg mb-1 truncate">{doc.name}</h3>
                                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                            <span className="flex items-center gap-1.5">
                                                <FileIcon className="w-4 h-4" />
                                                {doc.file_type?.split('/').pop()?.toUpperCase() || 'DOCUMENT'}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <CalendarIcon className="w-4 h-4" />
                                                {formatDate(doc.upload_date)}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <SaveIcon className="w-4 h-4" />
                                                {doc.file_name}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDeleteDocument(doc._id || doc.id)}
                                    className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors shrink-0"
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showUploadModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-100 p-4">
                    <div className="card-glass p-8 max-w-lg w-full animate-fadeIn">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold gradient-text">Upload tài liệu</h2>
                            <button
                                onClick={() => {
                                    if (!uploading) {
                                        setShowUploadModal(false);
                                        resetUploadForm();
                                    }
                                }}
                                disabled={uploading}
                                className={`p-2 rounded-lg transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-white/5'
                                    }`}
                            >
                                <CloseIcon className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-3">
                                    Chọn file tài liệu (PDF, DOCX)
                                </label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept=".pdf,.doc,.docx"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                        id="file-upload"
                                    />
                                    <label
                                        htmlFor="file-upload"
                                        className="flex items-center justify-center gap-3 p-8 border-2 border-dashed border-slate-600 rounded-xl hover:border-blue-500 transition-colors cursor-pointer bg-slate-800/30"
                                    >
                                        <UploadIcon className="w-8 h-8 text-gray-500" />
                                        <div className="text-center">
                                            <p className="text-gray-900 font-medium">
                                                {selectedFile ? selectedFile.name : 'Click để chọn file'}
                                            </p>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {selectedFile
                                                    ? `${formatFileSize(selectedFile.size)} - ${selectedFile.type.split('/').pop()}`
                                                    : 'PDF hoặc DOCX, tối đa 10MB'}
                                            </p>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-2">
                                    Số lượng câu hỏi cần sinh
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="50"
                                    value={numQuestions}
                                    onChange={(e) => setNumQuestions(parseInt(e.target.value) || 1)}
                                    className="input-glass"
                                    placeholder="10"
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    AI sẽ tự động sinh {numQuestions} câu hỏi từ nội dung tài liệu
                                    <br />
                                    Quá trình này có thể tốn nhiều thời gian
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!uploading) {
                                            setShowUploadModal(false);
                                            resetUploadForm();
                                        }
                                    }}
                                    disabled={uploading}
                                    className="flex-1 btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {uploading ? 'Đang tạo câu hỏi...' : 'Hủy'}
                                </button>
                                <button
                                    onClick={handleUpload}
                                    disabled={!selectedFile || uploading}
                                    className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {uploading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Đang xử lý...
                                        </span>
                                    ) : (
                                        'Upload & Sinh câu hỏi'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showPreviewModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-100 p-4">
                    <div className="card-glass p-8 max-w-5xl w-full my-8 animate-fadeIn max-h-[85vh] overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                            <div>
                                <h2 className="text-2xl font-bold gradient-text">Xem trước câu hỏi AI</h2>
                                <p className="text-gray-500 text-sm mt-1">
                                    {selectedQuestions.length}/{generatedQuestions.length} câu hỏi được chọn
                                </p>
                            </div>
                            <button
                                onClick={() => setShowPreviewModal(false)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                            >
                                <CloseIcon className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-4 mb-6 scrollbar-hide">
                            {generatedQuestions.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-500 text-lg">Không có câu hỏi nào được tạo</p>
                                    <p className="text-gray-600 text-sm mt-2">Vui lòng thử lại với tài liệu khác</p>
                                </div>
                            ) : (
                                generatedQuestions.map((question, index) => (
                                    <div
                                        key={index}
                                        className={`p-4 rounded-xl border-2 transition-all ${selectedQuestions.includes(index)
                                            ? 'border-blue-500 bg-blue-500/10'
                                            : 'border-gray-200 bg-white/5'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedQuestions.includes(index)}
                                                onChange={() => toggleQuestionSelection(index)}
                                                className="mt-1 w-5 h-5 rounded border-slate-600 text-blue-500 focus:ring-blue-500"
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between mb-3">
                                                    <h4 className="font-medium text-gray-900">Câu {index + 1}</h4>
                                                    <div className="flex gap-2">
                                                        <span className={`text-xs px-2 py-1 rounded ${question.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                                                            question.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                                                'bg-red-500/20 text-red-400'
                                                            }`}>
                                                            {question.difficulty}
                                                        </span>
                                                        <button
                                                            onClick={() => handleEditQuestion(index)}
                                                            className="p-1 hover:bg-white/10 rounded transition-colors"
                                                        >
                                                            <EditIcon className="w-4 h-4 text-gray-500" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <p className="text-gray-700 mb-3">{question.content}</p>
                                                <div className="space-y-2">
                                                    {question.options?.map((option, optIdx) => (
                                                        <div
                                                            key={optIdx}
                                                            className={`p-3 rounded-lg text-sm font-medium transition-all ${option === question.answer
                                                                ? 'bg-green-50 text-green-700 border-2 border-green-500 shadow-sm'
                                                                : 'bg-gray-50 text-gray-700 border border-gray-200'
                                                                }`}
                                                        >
                                                            {String.fromCharCode(65 + optIdx)}. {option}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-gray-200">
                            <button
                                onClick={() => setSelectedQuestions(generatedQuestions.map((_, i) => i))}
                                className="btn-secondary"
                            >
                                Chọn tất cả
                            </button>
                            <button
                                onClick={() => setSelectedQuestions([])}
                                className="btn-secondary"
                            >
                                Bỏ chọn tất cả
                            </button>
                            <div className="flex-1"></div>
                            <button
                                onClick={() => setShowPreviewModal(false)}
                                className="btn-secondary"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleSaveQuestions}
                                disabled={selectedQuestions.length === 0 || uploading}
                                className="btn-primary disabled:opacity-50"
                            >
                                {uploading ? 'Đang lưu...' : `Lưu ${selectedQuestions.length} câu hỏi`}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {editingQuestion && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-100 p-4">
                    <div className="card-glass p-6 max-w-4xl w-full animate-fadeIn max-h-[80vh] overflow-y-auto scrollbar-hide">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-900">Chỉnh sửa câu hỏi</h3>
                            <button
                                onClick={() => setEditingQuestion(null)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                            >
                                <CloseIcon className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-6 mb-4">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Nội dung câu hỏi
                                    </label>
                                    <textarea
                                        value={editingQuestion.content || ''}
                                        onChange={(e) => setEditingQuestion({ ...editingQuestion, content: e.target.value })}
                                        rows={4}
                                        className="input-glass resize-none text-sm"
                                        placeholder="Nhập nội dung câu hỏi..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Đáp án đúng
                                    </label>
                                    <select
                                        value={editingQuestion.answer || ''}
                                        onChange={(e) => setEditingQuestion({ ...editingQuestion, answer: e.target.value })}
                                        className="input-glass text-sm"
                                    >
                                        {editingQuestion.options?.map((option, idx) => (
                                            <option key={idx} value={option}>
                                                {String.fromCharCode(65 + idx)}. {option}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Độ khó
                                    </label>
                                    <select
                                        value={editingQuestion.difficulty || 'Easy'}
                                        onChange={(e) => setEditingQuestion({ ...editingQuestion, difficulty: e.target.value })}
                                        className="input-glass text-sm"
                                    >
                                        <option value="Easy">Dễ</option>
                                        <option value="Medium">Trung bình</option>
                                        <option value="Hard">Khó</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Các đáp án
                                </label>

                                <div>
                                    <label className="block text-xs text-gray-500 mb-1 font-medium">A.</label>
                                    <input
                                        type="text"
                                        value={editingQuestion.options?.[0] || ''}
                                        onChange={(e) => {
                                            const newOptions = [...(editingQuestion.options || ['', '', '', ''])];
                                            newOptions[0] = e.target.value;
                                            setEditingQuestion({ ...editingQuestion, options: newOptions });
                                        }}
                                        className="input-glass text-sm"
                                        placeholder="Nhập đáp án A"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs text-gray-500 mb-1 font-medium">B.</label>
                                    <input
                                        type="text"
                                        value={editingQuestion.options?.[1] || ''}
                                        onChange={(e) => {
                                            const newOptions = [...(editingQuestion.options || ['', '', '', ''])];
                                            newOptions[1] = e.target.value;
                                            setEditingQuestion({ ...editingQuestion, options: newOptions });
                                        }}
                                        className="input-glass text-sm"
                                        placeholder="Nhập đáp án B"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs text-gray-500 mb-1 font-medium">C.</label>
                                    <input
                                        type="text"
                                        value={editingQuestion.options?.[2] || ''}
                                        onChange={(e) => {
                                            const newOptions = [...(editingQuestion.options || ['', '', '', ''])];
                                            newOptions[2] = e.target.value;
                                            setEditingQuestion({ ...editingQuestion, options: newOptions });
                                        }}
                                        className="input-glass text-sm"
                                        placeholder="Nhập đáp án C"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs text-gray-500 mb-1 font-medium">D.</label>
                                    <input
                                        type="text"
                                        value={editingQuestion.options?.[3] || ''}
                                        onChange={(e) => {
                                            const newOptions = [...(editingQuestion.options || ['', '', '', ''])];
                                            newOptions[3] = e.target.value;
                                            setEditingQuestion({ ...editingQuestion, options: newOptions });
                                        }}
                                        className="input-glass text-sm"
                                        placeholder="Nhập đáp án D"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
                            <button
                                onClick={() => setEditingQuestion(null)}
                                className="btn-secondary px-6"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                className="btn-primary px-6"
                            >
                                Lưu thay đổi
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Documents;
