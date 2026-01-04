import { useCallback } from 'react';

const useDateFormat = () => {
    const formatDate = useCallback((dateString, options = {}) => {
        if (!dateString) return '';

        let dateStr = dateString;
        if (!/Z|[+-]\d{2}:\d{2}$/.test(dateString)) {
            dateStr = dateString + 'Z';
        }

        const date = new Date(dateStr);

        if (isNaN(date.getTime())) return dateString;

        const defaultOptions = {
            locale: 'vi-VN',
            ...options
        };

        return date.toLocaleString(defaultOptions.locale, defaultOptions);
    }, []);

    const formatDateOnly = useCallback((dateString) => {
        return formatDate(dateString, {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }, [formatDate]);

    const formatTimeOnly = useCallback((dateString) => {
        return formatDate(dateString, {
            hour: '2-digit',
            minute: '2-digit'
        });
    }, [formatDate]);

    const formatDateTime = useCallback((dateString) => {
        return formatDate(dateString);
    }, [formatDate]);

    const formatRelative = useCallback((dateString) => {
        if (!dateString) return '';

        let dateStr = dateString;
        if (!/Z|[+-]\d{2}:\d{2}$/.test(dateString)) {
            dateStr = dateString + 'Z';
        }

        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Vừa xong';
        if (diffMins < 60) return `${diffMins} phút trước`;
        if (diffHours < 24) return `${diffHours} giờ trước`;
        if (diffDays < 7) return `${diffDays} ngày trước`;

        return formatDateOnly(dateString);
    }, [formatDateOnly]);

    const formatDateTimeWithOffset = useCallback((dateTimeStr) => {
        const date = new Date(dateTimeStr);
        const offset = -date.getTimezoneOffset();
        const offsetHours = String(Math.floor(Math.abs(offset) / 60)).padStart(2, '0');
        const offsetMins = String(Math.abs(offset) % 60).padStart(2, '0');
        const offsetSign = offset >= 0 ? '+' : '-';

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = '00';

        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${offsetSign}${offsetHours}:${offsetMins}`;
    }, []);

    return {
        formatDate,
        formatDateOnly,
        formatTimeOnly,
        formatDateTime,
        formatRelative,
        formatDateTimeWithOffset
    };
};

export default useDateFormat;
