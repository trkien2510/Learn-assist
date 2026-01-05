import React, { useState, useEffect } from 'react';
import { adminService } from '../services/otherServices';
import {
    UsersIcon,
    SearchIcon,
    TrashIcon,
    UserGroupIcon,
    ShieldCheckIcon,
    ClockIcon,
    TrendingUpIcon,
    FilterIcon
} from '../components/icons/Icons';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [filters, setFilters] = useState({
        role: '',
        is_activate: '',
        search: ''
    });

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showUserModal, setShowUserModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userActivity, setUserActivity] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, [page, filters]);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await adminService.users.getAll(page, 20, filters);
            const data = response.data || response;
            setUsers(data.items || data || []);
            setTotalPages(data.total_pages || 1);
        } catch (err) {
            setError(err.message || 'Không thể tải danh sách người dùng');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            setStatsLoading(true);
            const response = await adminService.stats.getStatistics();
            const data = response.data || response;
            setStats(data);
        } catch (err) {
            console.error('Error fetching stats:', err);
        } finally {
            setStatsLoading(false);
        }
    };

    const handleToggleStatus = async (userId, currentStatus) => {
        const action = currentStatus ? 'vô hiệu hóa' : 'kích hoạt';
        const confirmMessage = currentStatus
            ? 'Bạn có chắc muốn vô hiệu hóa tài khoản này? Người dùng sẽ không thể đăng nhập.'
            : 'Bạn có chắc muốn kích hoạt lại tài khoản này?';

        if (!window.confirm(confirmMessage)) return;

        try {
            await adminService.users.updateStatus(userId, !currentStatus);
            setSuccess(`Đã ${!currentStatus ? 'kích hoạt' : 'vô hiệu hóa'} người dùng!`);
            fetchUsers();
            fetchStats();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message || 'Không thể cập nhật trạng thái');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!confirm('Bạn có chắc muốn xóa người dùng này? Hành động này không thể hoàn tác!')) return;

        try {
            await adminService.users.delete(userId);
            setSuccess('Đã xóa người dùng!');
            fetchUsers();
            fetchStats();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message || 'Không thể xóa người dùng');
        }
    };

    const handleViewActivity = async (user) => {
        try {
            const response = await adminService.stats.getUserActivity(user._id || user.id, 30);
            setUserActivity(response.data || response);
            setSelectedUser(user);
            setShowUserModal(true);
        } catch (err) {
            setError('Không thể tải hoạt động người dùng');
        }
    };

    const getRoleBadge = (role) => {
        const colors = {
            admin: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
            teacher: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            student: 'bg-green-500/20 text-green-400 border-green-500/30'
        };
        const labels = {
            admin: 'Quản trị viên',
            teacher: 'Giảng viên',
            student: 'Sinh viên'
        };
        return (
            <span className={`text-xs px-3 py-1 rounded-full border ${colors[role] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
                {labels[role] || role}
            </span>
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        let dateStr = dateString;
        if (!/Z|[+-]\d{2}:\d{2}$/.test(dateString)) {
            dateStr = dateString + 'Z';
        }
        return new Date(dateStr).toLocaleDateString('vi-VN', {
            timeZone: 'Asia/Ho_Chi_Minh',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return '';
        let dateStr = dateString;
        if (!/Z|[+-]\d{2}:\d{2}$/.test(dateString)) {
            dateStr = dateString + 'Z';
        }
        return new Date(dateStr).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold gradient-text">Quản lý người dùng</h1>
                <p className="text-gray-500 mt-2">Quản lý tất cả người dùng trong hệ thống</p>
            </div>

            {stats && stats.users && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="card-glass p-5 hover-lift">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm font-medium">Tổng người dùng</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.users.total}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    <span className="text-green-500">+{stats.users.new_30d}</span> trong 30 ngày
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-linear-to-br/srgb from-blue-500 to-indigo-600 flex items-center justify-center">
                                <UsersIcon className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="card-glass p-5 hover-lift">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm font-medium">Sinh viên</p>
                                <p className="text-3xl font-bold text-green-600 mt-1">{stats.users.students}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {((stats.users.students / stats.users.total) * 100).toFixed(1)}% tổng số
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-linear-to-br/srgb from-green-500 to-emerald-600 flex items-center justify-center">
                                <UserGroupIcon className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="card-glass p-5 hover-lift">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm font-medium">Giảng viên</p>
                                <p className="text-3xl font-bold text-blue-600 mt-1">{stats.users.teachers}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {((stats.users.teachers / stats.users.total) * 100).toFixed(1)}% tổng số
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-linear-to-br/srgb from-blue-500 to-cyan-600 flex items-center justify-center">
                                <ShieldCheckIcon className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="card-glass p-5 hover-lift">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm font-medium">Đang hoạt động</p>
                                <p className="text-3xl font-bold text-green-600 mt-1">{stats.users.active}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    <span className="text-red-500">{stats.users.inactive}</span> vô hiệu hóa
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-linear-to-br/srgb from-green-500 to-teal-600 flex items-center justify-center">
                                <TrendingUpIcon className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="card-glass p-4">
                <div className="flex items-center gap-2 mb-4">
                    <FilterIcon className="w-5 h-5 text-gray-600" />
                    <h3 className="font-semibold text-gray-900">Bộ lọc</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm email hoặc tên..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            className="input-glass pl-10 w-full"
                        />
                    </div>
                    <select
                        value={filters.role}
                        onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                        className="input-glass"
                    >
                        <option value="">Tất cả vai trò</option>
                        <option value="admin">Quản trị viên</option>
                        <option value="teacher">Giảng viên</option>
                        <option value="student">Sinh viên</option>
                    </select>
                    <select
                        value={filters.is_activate}
                        onChange={(e) => setFilters({ ...filters, is_activate: e.target.value })}
                        className="input-glass"
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="true">Đang hoạt động</option>
                        <option value="false">Đã vô hiệu hóa</option>
                    </select>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 flex items-center gap-2">
                    <span>⚠️</span>
                    {error}
                </div>
            )}

            {success && (
                <div className="p-4 bg-green-500/10 border border-green-500/50 rounded-xl text-green-400 flex items-center gap-2">
                    <span>✓</span>
                    {success}
                </div>
            )}

            {loading ? (
                <div className="card-glass p-12 text-center">
                    <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
                </div>
            ) : users.length === 0 ? (
                <div className="card-glass p-12 text-center">
                    <UsersIcon className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy người dùng</h3>
                    <p className="text-gray-500">Thử thay đổi bộ lọc</p>
                </div>
            ) : (
                <div className="card-glass overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="table-glass">
                            <thead>
                                <tr>
                                    <th className="text-left p-4">Người dùng</th>
                                    <th className="text-left p-4">Vai trò</th>
                                    <th className="text-left p-4">Số điện thoại</th>
                                    <th className="text-left p-4">Ngày đăng ký</th>
                                    <th className="text-left p-4">Trạng thái</th>
                                    <th className="text-left p-4">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user._id || user.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-linear-to-br/srgb from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                                                    {user.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{user.full_name || user.username}</p>
                                                    <p className="text-xs text-gray-500">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            {getRoleBadge(user.role)}
                                        </td>
                                        <td className="p-4">
                                            <span className="text-sm text-gray-600">{user.phone_number || '-'}</span>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-sm text-gray-600">{formatDate(user.created_at)}</span>
                                        </td>
                                        <td className="p-4">
                                            {user.role === 'admin' ? (
                                                <span className="text-xs px-3 py-1 rounded-full bg-purple-500/20 text-purple-400">
                                                    ● Quản trị viên
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => handleToggleStatus(user._id || user.id, user.is_activate)}
                                                    className={`text-xs px-3 py-1 rounded-full ${user.is_activate
                                                        ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                                        : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                                        } transition-colors`}
                                                >
                                                    {user.is_activate ? '● Hoạt động' : '○ Vô hiệu'}
                                                </button>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleViewActivity(user)}
                                                    className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors"
                                                    title="Xem hoạt động"
                                                >
                                                    <ClockIcon className="w-4 h-4" />
                                                </button>
                                                {user.role !== 'admin' && (
                                                    <button
                                                        onClick={() => handleDeleteUser(user._id || user.id)}
                                                        className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                                                        title="Xóa người dùng"
                                                    >
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
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

            {showUserModal && selectedUser && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-100" onClick={() => setShowUserModal(false)}>
                    <div className="card-glass max-w-2xl w-full max-h-[80vh] overflow-y-auto m-4" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Hoạt động người dùng</h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {selectedUser.full_name} ({selectedUser.email})
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowUserModal(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                        <div className="p-6">
                            {userActivity && userActivity.timeline ? (
                                <div className="space-y-3">
                                    {userActivity.timeline.map((log, idx) => (
                                        <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-gray-900">{log.action}</p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {formatDateTime(log.created_at)}
                                                    </p>
                                                    {log.resource_type && (
                                                        <p className="text-xs text-gray-600 mt-1">
                                                            Tài nguyên: <span className="font-medium">{log.resource_type}</span>
                                                        </p>
                                                    )}
                                                </div>
                                                <span className={`text-xs px-2 py-1 rounded ${log.status === 'success' ? 'bg-green-500/20 text-green-600' : 'bg-red-500/20 text-red-600'}`}>
                                                    {log.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-gray-500">Không có hoạt động nào</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
