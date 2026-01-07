import { useEffect, useCallback, useRef } from 'react';
import useApi from './useApi';

/**
 * Hook for fetching data on component mount or based on dependencies.
 * Handles the common BaseResponse pattern automatically.
 * 
 * @param {Function} apiFunction - The service function to call (e.g., classroomService.getAll)
 * @param {Array} dependencies - Array of values that trigger a re-fetch when changed
 * @param {Object} options - { immediate: bool, onSuccess: func, onError: func, initialParams: [] }
 */
const useFetch = (apiFunction, dependencies = [], options = {}) => {
    const {
        immediate = true,
        onSuccess,
        onError,
        initialParams = []
    } = options;

    const api = useApi(apiFunction);
    const isFirstRun = useRef(true);

    const fetch = useCallback(async (...args) => {
        try {
            const params = args.length > 0 ? args : initialParams;
            const result = await api.execute(...params);
            if (onSuccess) onSuccess(result);
            return result;
        } catch (err) {
            if (onError) onError(err);
            throw err;
        }
    }, [api.execute, onSuccess, onError, ...initialParams]);

    useEffect(() => {
        if (isFirstRun.current) {
            if (immediate) {
                fetch();
            }
            isFirstRun.current = false;
            return;
        }

        fetch();
    }, [...dependencies]);

    return {
        ...api,
        refresh: fetch
    };
};

export default useFetch;
