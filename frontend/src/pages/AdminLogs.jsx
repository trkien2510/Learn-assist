import React, { useState, useEffect } from 'react';
import { adminService } from '../services/otherServices';
import {
    LogIcon,
    SearchIcon,
    FilterIcon,
    RefreshIcon,
    ChartBarIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    DownloadIcon
} from '../components/icons/Icons';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const parseUTCDate = (dateString) => {
    if (!dateString) return new Date();
    let dateStr = dateString;
    if (!/Z|[+-]\d{2}:\d{2}$/.test(dateString)) {
        dateStr = dateString + 'Z';
    }
    return new Date(dateStr);
};

const formatDateVN = (dateString) => {
    const date = parseUTCDate(dateString);
    return date.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
};
const AdminLogs = () => {
    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedLog, setSelectedLog] = useState(null);
    const [showLogModal, setShowLogModal] = useState(false);

    const [filters, setFilters] = useState({
        resource_type: '',
        status: '',
        action: '',
        user_id: ''
    });

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchLogs();
        fetchStats();
    }, [page, filters]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const response = await adminService.logs.getAll(page, 20, filters);
            const data = response.data || response;
            setLogs(data.items || data || []);
            setTotalPages(data.total_pages || 1);
        } catch (err) {
            setError(err.message || 'Không thể tải nhật ký');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await adminService.logs.getStats();
            const data = response.data || response;
            setStats(data);
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    };

    const handleViewDetail = async (log) => {
        setSelectedLog(log);
        setShowLogModal(true);
    };

    const handleExport = () => {
        const headers = ['Thời gian', 'Người dùng', 'Hành động', 'Tài nguyên', 'Trạng thái'];
        const rows = logs.map(log => [
            formatDateVN(log.created_at),
            log.user_id || 'N/A',
            log.action,
            log.resource_type || 'N/A',
            log.status
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `logs_${new Date().toISOString()}.csv`;
        link.click();
    };

    const getStatusBadge = (status) => {
        if (status === 'success') {
            return (
                <span className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                    <CheckCircleIcon className="w-3 h-3" />
                    Thành công
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                <XCircleIcon className="w-3 h-3" />
                Lỗi
            </span>
        );
    };

    const getResourceIcon = (type) => {
        const icons = {
            user: '👤',
            classroom: '📚',
            exam: '📝',
            question: '❓',
            document: '📄',
            result: '📊',
            auth: '🔐'
        };
        return icons[type] || '📋';
    };

    const getResourceColor = (type) => {
        const colors = {
            user: 'bg-blue-500/10 text-blue-600',
            classroom: 'bg-purple-500/10 text-purple-600',
            exam: 'bg-green-500/10 text-green-600',
            question: 'bg-yellow-500/10 text-yellow-600',
            document: 'bg-indigo-500/10 text-indigo-600',
            result: 'bg-pink-500/10 text-pink-600',
            auth: 'bg-red-500/10 text-red-600'
        };
        return colors[type] || 'bg-gray-500/10 text-gray-600';
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold gradient-text">Nhật ký hoạt động</h1>
                    <p className="text-gray-500 mt-2">Theo dõi toàn bộ hoạt động hệ thống</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleExport}
                        className="btn-secondary flex items-center gap-2"
                        disabled={logs.length === 0}
                    >
                        <DownloadIcon className="w-5 h-5" />
                        Xuất CSV
                    </button>
                    <button
                        onClick={() => { fetchLogs(); fetchStats(); }}
                        className="btn-primary flex items-center gap-2"
                    >
                        <RefreshIcon className="w-5 h-5" />
                        Làm mới
                    </button>
                </div>
            </div>

            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="card-glass p-5 hover-lift">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-linear-to-br/srgb from-blue-500 to-indigo-600 flex items-center justify-center">
                                <ChartBarIcon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-gray-500 text-xs font-medium">Tổng hoạt động</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total_logs || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="card-glass p-5 hover-lift">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-linear-to-br/srgb from-green-500 to-emerald-600 flex items-center justify-center">
                                <CheckCircleIcon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-gray-500 text-xs font-medium">Thành công</p>
                                <p className="text-2xl font-bold text-green-600">{stats.success_logs || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="card-glass p-5 hover-lift">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-linear-to-br/srgb from-red-500 to-rose-600 flex items-center justify-center">
                                <XCircleIcon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-gray-500 text-xs font-medium">Lỗi</p>
                                <p className="text-2xl font-bold text-red-600">{stats.error_logs || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="card-glass p-5 hover-lift">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-linear-to-br/srgb from-purple-500 to-violet-600 flex items-center justify-center">
                                <ClockIcon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-gray-500 text-xs font-medium">24 giờ qua</p>
                                <p className="text-2xl font-bold text-purple-600">{stats.logs_last_24h || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="card-glass p-5 hover-lift">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-linear-to-br/srgb from-orange-500 to-amber-600 flex items-center justify-center">
                                <ClockIcon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-gray-500 text-xs font-medium">7 ngày qua</p>
                                <p className="text-2xl font-bold text-orange-600">{stats.logs_last_7d || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {stats && stats.total_logs > 0 && (
                <div className="card-glass p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Tỷ lệ thành công</span>
                        <span className="text-sm font-bold text-green-600">
                            {((stats.success_logs / stats.total_logs) * 100).toFixed(1)}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                            className="bg-linear-to-r/srgb from-green-500 to-emerald-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${(stats.success_logs / stats.total_logs) * 100}%` }}
                        ></div>
                    </div>
                </div>
            )}

            <div className="card-glass p-4">
                <div className="flex items-center gap-2 mb-4">
                    <FilterIcon className="w-5 h-5 text-gray-600" />
                    <h3 className="font-semibold text-gray-900">Bộ lọc</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Tìm theo action..."
                            value={filters.action}
                            onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                            className="input-glass pl-10 w-full"
                        />
                    </div>
                    <select
                        value={filters.resource_type}
                        onChange={(e) => setFilters({ ...filters, resource_type: e.target.value })}
                        className="input-glass"
                    >
                        <option value="">Tất cả tài nguyên</option>
                        <option value="user">Người dùng</option>
                        <option value="classroom">Lớp học</option>
                        <option value="exam">Đề thi</option>
                        <option value="question">Câu hỏi</option>
                        <option value="document">Tài liệu</option>
                        <option value="auth">Xác thực</option>
                    </select>
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        className="input-glass"
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="success">Thành công</option>
                        <option value="error">Lỗi</option>
                    </select>
                    <input
                        type="text"
                        placeholder="User ID..."
                        value={filters.user_id}
                        onChange={(e) => setFilters({ ...filters, user_id: e.target.value })}
                        className="input-glass"
                    />
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 flex items-center gap-2">
                    <XCircleIcon className="w-5 h-5" />
                    {error}
                </div>
            )}

            {loading ? (
                <div className="card-glass p-12 text-center">
                    <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
                </div>
            ) : logs.length === 0 ? (
                <div className="card-glass p-12 text-center">
                    <LogIcon className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Không có nhật ký</h3>
                    <p className="text-gray-500">Chưa có hoạt động nào được ghi lại</p>
                </div>
            ) : (
                <div className="card-glass overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="table-glass">
                            <thead>
                                <tr>
                                    <th className="text-left p-4">Thời gian</th>
                                    <th className="text-left p-4">User ID</th>
                                    <th className="text-left p-4">Hành động</th>
                                    <th className="text-left p-4">Tài nguyên</th>
                                    <th className="text-left p-4">Trạng thái</th>
                                    <th className="text-left p-4">Chi tiết</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log) => (
                                    <tr key={log._id || log.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <ClockIcon className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm text-gray-600">
                                                    {formatDistanceToNow(parseUTCDate(log.created_at), { addSuffix: true, locale: vi })}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {formatDateVN(log.created_at)}
                                            </p>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                                {log.user_id ? log.user_id.substring(0, 8) + '...' : 'System'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-sm font-medium text-gray-900">{log.action}</span>
                                        </td>
                                        <td className="p-4">
                                            {log.resource_type ? (
                                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${getResourceColor(log.resource_type)}`}>
                                                    <span>{getResourceIcon(log.resource_type)}</span>
                                                    <span className="text-xs font-medium capitalize">{log.resource_type}</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            {getStatusBadge(log.status)}
                                        </td>
                                        <td className="p-4">
                                            <button
                                                onClick={() => handleViewDetail(log)}
                                                className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                                            >
                                                Xem →
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 p-4 border-t border-gray-200">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Trước
                            </button>
                            <span className="text-gray-600 px-4">
                                Trang {page} / {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Sau
                            </button>
                        </div>
                    )}
                </div>
            )}

            {showLogModal && selectedLog && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-100" onClick={() => setShowLogModal(false)}>
                    <div className="card-glass max-w-2xl w-full max-h-[80vh] overflow-y-auto m-4" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-gray-900">Chi tiết nhật ký</h3>
                                <button
                                    onClick={() => setShowLogModal(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Hành động</label>
                                <p className="mt-1 text-gray-900">{selectedLog.action}</p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700">Trạng thái</label>
                                <div className="mt-1">{getStatusBadge(selectedLog.status)}</div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700">User ID</label>
                                <p className="mt-1 text-sm font-mono bg-gray-100 px-3 py-2 rounded">
                                    {selectedLog.user_id || 'N/A'}
                                </p>
                            </div>

                            {selectedLog.resource_type && (
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Loại tài nguyên</label>
                                    <p className="mt-1 text-gray-900 capitalize">{selectedLog.resource_type}</p>
                                </div>
                            )}

                            {selectedLog.resource_id && (
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Resource ID</label>
                                    <p className="mt-1 text-sm font-mono bg-gray-100 px-3 py-2 rounded">
                                        {selectedLog.resource_id}
                                    </p>
                                </div>
                            )}

                            <div>
                                <label className="text-sm font-medium text-gray-700">Thời gian</label>
                                <p className="mt-1 text-gray-900">
                                    {formatDateVN(selectedLog.created_at)}
                                </p>
                            </div>

                            {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Chi tiết bổ sung</label>
                                    <pre className="mt-1 text-xs bg-gray-100 p-3 rounded overflow-x-auto">
                                        {JSON.stringify(selectedLog.details, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminLogs;
