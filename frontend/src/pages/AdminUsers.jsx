import React, { useState, useEffect } from 'react';
import { adminService } from '../services/otherServices';
import { UsersIcon, SearchIcon, EditIcon, TrashIcon, CheckIcon, XIcon, CloseIcon } from '../components/icons/Icons';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [filters, setFilters] = useState({
        role: '',
        is_activate: '',
        search: ''
    });

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, [page, filters]);

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

    const handleToggleStatus = async (userId, currentStatus) => {
        try {
            await adminService.users.updateStatus(userId, !currentStatus);
            setSuccess(`Đã ${!currentStatus ? 'kích hoạt' : 'vô hiệu hóa'} người dùng!`);
            fetchUsers();
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
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message || 'Không thể xóa người dùng');
        }
    };

    const getRoleBadge = (role) => {
        const colors = {
            admin: 'bg-purple-500/20 text-purple-400',
            teacher: 'bg-blue-500/20 text-blue-400',
            student: 'bg-green-500/20 text-green-400'
        };
        const labels = {
            admin: 'Quản trị viên',
            teacher: 'Giảng viên',
            student: 'Sinh viên'
        };
        return (
            <span className={`text-xs px-2 py-1 rounded ${colors[role] || 'bg-gray-500/20 text-gray-400'}`}>
                {labels[role] || role}
            </span>
        );
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold gradient-text">Quản lý người dùng</h1>
                <p className="text-gray-500 mt-2">Quản lý tất cả người dùng trong hệ thống</p>
            </div>

            {/* Filters */}
            <div className="card-glass p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm email hoặc tên..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            className="input-glass pl-10"
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
                <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400">
                    {error}
                </div>
            )}

            {success && (
                <div className="p-4 bg-green-500/10 border border-green-500/50 rounded-xl text-green-400">
                    {success}
                </div>
            )}

            {/* Users Table */}
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
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
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
                                            <button
                                                onClick={() => handleToggleStatus(user._id || user.id, user.is_activate)}
                                                className={`text-xs px-3 py-1 rounded ${user.is_activate
                                                        ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                                        : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                                    } transition-colors`}
                                            >
                                                {user.is_activate ? 'Hoạt động' : 'Vô hiệu'}
                                            </button>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleDeleteUser(user._id || user.id)}
                                                    className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                                                    title="Xóa người dùng"
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </div>
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

export default AdminUsers;
