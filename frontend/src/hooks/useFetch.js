import { useEffect, useCallback, useRef } from 'react';
import useApi from './useApi';

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
