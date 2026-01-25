import React, { createContext, useContext, useState, useCallback } from 'react';
import { ToastContainer } from '../components/common/Toast';
import { translateError, translateSuccess } from '../utils/errorMessages';

const ToastContext = createContext(null);

let toastIdCounter = 0;

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'success', duration = 3000) => {
        const id = ++toastIdCounter;
        setToasts((prev) => [...prev, { id, message, type, duration }]);
        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const showSuccess = useCallback((message, duration = 3000) => {
        const translatedMessage = translateSuccess(message);
        return addToast(translatedMessage, 'success', duration);
    }, [addToast]);

    const showError = useCallback((message, duration = 4000) => {
        const translatedMessage = translateError(message);
        return addToast(translatedMessage, 'error', duration);
    }, [addToast]);

    const showWarning = useCallback((message, duration = 3500) => {
        const translatedMessage = translateError(message);
        return addToast(translatedMessage, 'warning', duration);
    }, [addToast]);

    const showInfo = useCallback((message, duration = 3000) => {
        return addToast(message, 'info', duration);
    }, [addToast]);

    return (
        <ToastContext.Provider value={{ showSuccess, showError, showWarning, showInfo, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export default ToastContext;

