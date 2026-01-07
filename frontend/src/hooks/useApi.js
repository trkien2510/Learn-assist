import { useState, useCallback } from 'react';

/**
 * Hook for handling API calls with loading, error states
 * Specifically designed to handle BaseResponse { success, message, data, code }
 */
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

            // Extract data from BaseResponse structure
            // If response has .data property, use it, else use whole response
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

