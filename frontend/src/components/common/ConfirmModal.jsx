import React from 'react';
import { CloseIcon } from '../icons/Icons';

const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Xác nhận',
    message = 'Bạn có chắc chắn muốn thực hiện hành động này?',
    confirmText = 'Xác nhận',
    cancelText = 'Hủy',
    confirmVariant = 'danger',
    loading = false
}) => {
    if (!isOpen) return null;

    const confirmStyles = {
        danger: 'bg-red-500 hover:bg-red-600 text-white',
        primary: 'bg-blue-500 hover:bg-blue-600 text-white',
        success: 'bg-green-500 hover:bg-green-600 text-white'
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-100 p-4">
            <div className="card-glass p-6 max-w-md w-full animate-fadeIn">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <CloseIcon className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <p className="text-gray-600 mb-6">{message}</p>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 btn-secondary"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${confirmStyles[confirmVariant]} disabled:opacity-50`}
                    >
                        {loading ? 'Đang xử lý...' : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
