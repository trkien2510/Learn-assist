import { useState, useCallback } from 'react';

const useApi = (apiFunction) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const execute = useCallback(async (...args) => {
        try {
            setLoading(true);
            setError('');
            setSuccessMessage('');

            const response = await apiFunction(...args);

            const result = (response && response.data !== undefined) ? response.data : response;

            setData(result);

            if (response && response.message && response.success) {
                setSuccessMessage(response.message);
            }

            return result;
        } catch (err) {
            const errorMsg = err.message || 'Đã xảy ra lỗi';
            setError(errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [apiFunction]);

    const reset = useCallback(() => {
        setData(null);
        setError('');
        setLoading(false);
        setSuccessMessage('');
    }, []);

    return {
        data,
        loading,
        error,
        successMessage,
        execute,
        reset,
        setData,
        setError,
        setSuccessMessage
    };
};

export default useApi;

