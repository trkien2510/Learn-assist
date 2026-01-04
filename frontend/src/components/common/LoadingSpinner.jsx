import React from 'react';

const LoadingSpinner = ({ size = 'md', className = '' }) => {
    const sizeClasses = {
        sm: 'w-6 h-6 border-2',
        md: 'w-12 h-12 border-4',
        lg: 'w-16 h-16 border-4',
        xl: 'w-20 h-20 border-4'
    };

    return (
        <div className={`${sizeClasses[size]} border-blue-500/30 border-t-blue-500 rounded-full animate-spin ${className}`}></div>
    );
};

export default LoadingSpinner;
