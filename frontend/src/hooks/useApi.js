import { useState, useCallback } from 'react';

const useApi = (apiFunction) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const execute = useCallback(async (...args) => {
        try {
            setLoading(true);
            setError('');
            const response = await apiFunction(...args);
            const result = response.data || response;
            setData(result);
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
    }, []);

    return { data, loading, error, execute, reset, setError };
};

export default useApi;
