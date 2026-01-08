import { useState, useCallback, useMemo } from 'react';

const usePagination = (initialPage = 1, initialPageSize = 10) => {
    const [page, _setPage] = useState(initialPage);
    const [pageSize, setPageSize] = useState(initialPageSize);
    const [total, setTotal] = useState(0);

    const totalPages = useMemo(() => {
        return Math.ceil(total / pageSize) || 1;
    }, [total, pageSize]);

    const hasNext = useMemo(() => page < totalPages, [page, totalPages]);
    const hasPrevious = useMemo(() => page > 1, [page]);

    const goToPage = useCallback((newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            _setPage(newPage);
        }
    }, [totalPages]);

    const nextPage = useCallback(() => {
        if (hasNext) _setPage(p => p + 1);
    }, [hasNext]);

    const previousPage = useCallback(() => {
        if (hasPrevious) _setPage(p => p - 1);
    }, [hasPrevious]);

    const reset = useCallback(() => {
        _setPage(initialPage);
    }, [initialPage]);

    const updateFromResponse = useCallback((response) => {
        if (response.total !== undefined) setTotal(response.total);
        if (response.page !== undefined) _setPage(response.page);
        if (response.page_size !== undefined) setPageSize(response.page_size);
    }, []);

    return {
        page,
        pageSize,
        total,
        totalPages,
        hasNext,
        hasPrevious,
        setPage: goToPage,
        setPageSize,
        setTotal,
        nextPage,
        previousPage,
        reset,
        updateFromResponse
    };
};

export default usePagination;
