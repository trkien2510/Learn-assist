import React, { useState, useEffect } from 'react';
import { adminService } from '../services/otherServices';
import { LogIcon, SearchIcon, Filter Icon, RefreshIcon } from '../components/icons/Icons';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const AdminLogs = () => {
    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [filters, setFilters] = useState({
        resource_type: '',
        status: '',
        user_role: '',
        search: ''
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

    const getStatusColor = (status) => {
        return status === 'success'
            ? 'bg-green-500/20 text-green-400'
            : 'bg-red-500/20 text-red-400';
    };

    const getResourceIcon = (type) => {
        const icons = {
            user: '👤',
            classroom: '📚',
            exam: '📝',
            question: '❓',
            document: '📄',
            result: '📊'
        };
        return icons[type] || '📋';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold gradient-text">Nhật ký hoạt động</h1>
                    <p className="text-gray-500 mt-2">Theo dõi toàn bộ hoạt động hệ thống</p>
                </div>
                <button
                    onClick={fetchLogs}
                    className="btn-secondary flex items-center gap-2"
                >
                    <RefreshIcon className="w-5 h-5" />
                    Làm mới
                </button>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="card-glass p-4">
                        <p className="text-gray-500 text-sm">Tổng hoạt động</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.total_logs || 0}</p>
                    </div>
                    <div className="card-glass p-4">
                        <p className="text-gray-500 text-sm">Thành công</p>
                        <p className="text-2xl font-bold text-green-400">{stats.successful_logs || 0}</p>
                    </div>
                    <div className="card-glass p-4">
                        <p className="text-gray-500 text-sm">Lỗi</p>
                        <p className="text-2xl font-bold text-red-400">{stats.failed_logs || 0}</p>
                    </div>
                    <div className="card-glass p-4">
                        <p className="text-gray-500 text-sm">Hôm nay</p>
                        <p className="text-2xl font-bold text-blue-400">{stats.logs_today || 0}</p>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="card-glass p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            className="input-glass pl-10"
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
                    <select
                        value={filters.user_role}
                        onChange={(e) => setFilters({ ...filters, user_role: e.target.value })}
                        className="input-glass"
                    >
                        <option value="">Tất cả vai trò</option>
                        <option value="admin">Admin</option>
                        <option value="teacher">Giảng viên</option>
                        <option value="student">Sinh viên</option>
                    </select>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400">
                    {error}
                </div>
            )}

            {/* Logs Table */}
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
                                    <th className="text-left p-4">Người dùng</th>
                                    <th className="text-left p-4">Hành động</th>
                                    <th className="text-left p-4">Tài nguyên</th>
                                    <th className="text-left p-4">Trạng thái</th>
                                    <th className="text-left p-4">IP</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log) => (
                                    <tr key={log._id || log.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4">
                                            <span className="text-sm text-gray-500">
                                                {formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: vi })}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{log.user_email}</p>
                                                <p className="text-xs text-gray-500 capitalize">{log.user_role}</p>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-sm text-gray-700">{log.action}</span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <span>{getResourceIcon(log.resource_type)}</span>
                                                <span className="text-sm capitalize">{log.resource_type}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`text-xs px-2 py-1 rounded ${getStatusColor(log.status)}`}>
                                                {log.status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-xs text-gray-500 font-mono">{log.ip_address}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 p-4 border-t border-gray-200">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="btn-secondary disabled:opacity-50"
                            >
                                Trước
                            </button>
                            <span className="text-gray-600">
                                Trang {page} / {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="btn-secondary disabled:opacity-50"
                            >
                                Sau
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminLogs;
