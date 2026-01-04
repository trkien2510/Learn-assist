import React from 'react';

const StatusBadge = ({ status, size = 'sm', className = '' }) => {
    const statusStyles = {
        upcoming: 'bg-blue-500/20 text-blue-400',
        ongoing: 'bg-green-500/20 text-green-400',
        ended: 'bg-gray-500/20 text-gray-400',
        active: 'bg-green-500/20 text-green-400',
        inactive: 'bg-red-500/20 text-red-400',
        pending: 'bg-yellow-500/20 text-yellow-400',
        approved: 'bg-green-500/20 text-green-400',
        rejected: 'bg-red-500/20 text-red-400',
        easy: 'bg-green-500/20 text-green-400 border-green-500/30',
        medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        hard: 'bg-red-500/20 text-red-400 border-red-500/30'
    };

    const statusLabels = {
        upcoming: 'Sắp diễn ra',
        ongoing: 'Đang diễn ra',
        ended: 'Đã kết thúc',
        active: 'Hoạt động',
        inactive: 'Vô hiệu',
        pending: 'Chờ duyệt',
        approved: 'Đã duyệt',
        rejected: 'Từ chối',
        easy: 'Dễ',
        medium: 'Trung bình',
        hard: 'Khó'
    };

    const sizeClasses = {
        xs: 'text-xs px-1.5 py-0.5',
        sm: 'text-xs px-2 py-1',
        md: 'text-sm px-3 py-1.5'
    };

    const normalizedStatus = status?.toLowerCase().replace(/\s+/g, '');
    const style = statusStyles[normalizedStatus] || 'bg-gray-500/20 text-gray-400';
    const label = statusLabels[normalizedStatus] || status;

    return (
        <span className={`inline-flex items-center rounded-lg font-medium border ${style} ${sizeClasses[size]} ${className}`}>
            {label}
        </span>
    );
};

export default StatusBadge;
