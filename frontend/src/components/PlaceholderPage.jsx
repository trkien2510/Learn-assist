import React from 'react';

const PlaceholderPage = ({ title, description }) => {
    return (
        <div className="flex items-center justify-center min-h-[60vh] animate-fadeIn">
            <div className="text-center card-glass p-12 max-w-md">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold gradient-text mb-3">{title}</h2>
                <p className="text-gray-500 mb-6">
                    {description || 'Trang này đang được phát triển...'}
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 text-blue-400 text-sm">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Đang phát triển</span>
                </div>
            </div>
        </div>
    );
};

export default PlaceholderPage;
