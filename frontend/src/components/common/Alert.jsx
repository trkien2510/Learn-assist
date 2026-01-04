import React from 'react';

const Alert = ({ type = 'info', message, onClose, className = '' }) => {
    const styles = {
        success: 'bg-green-500/10 border-green-500/50 text-green-400',
        error: 'bg-red-500/10 border-red-500/50 text-red-400',
        warning: 'bg-yellow-500/10 border-yellow-500/50 text-yellow-400',
        info: 'bg-blue-500/10 border-blue-500/50 text-blue-400'
    };

    if (!message) return null;

    return (
        <div className={`p-4 border rounded-xl animate-fadeIn flex items-center justify-between ${styles[type]} ${className}`}>
            <span>{message}</span>
            {onClose && (
                <button onClick={onClose} className="ml-4 hover:opacity-70">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}
        </div>
    );
};

export default Alert;
