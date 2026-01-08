import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/authService';
import { UserIcon, EmailIcon, LockIcon, EditIcon, PhoneIcon, CalendarIcon, TrashIcon } from '../components/icons/Icons';

const Profile = () => {
    const { user, updateUser, logout } = useAuth();
    const [editing, setEditing] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [formData, setFormData] = useState({
        full_name: user?.full_name || user?.name || '',
        email: user?.email || '',
        phone_number: user?.phone_number || '',
        dob: user?.dob ? new Date(user.dob).toISOString().split('T')[0] : ''
    });
    const [passwordData, setPasswordData] = useState({
        old_password: '',
        new_password: '',
        confirm_password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (user) {
            setFormData({
                full_name: user.full_name || user.name || '',
                email: user.email || '',
                phone_number: user.phone_number || '',
                dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : ''
            });
        }
    }, [user]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError('');

            const { email, ...updateData } = formData;

            await userService.updateProfile(updateData);
            await updateUser();
            setSuccess('Cập nhật thông tin thành công!');
            setEditing(false);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message || 'Không thể cập nhật thông tin');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async (e) => {
        e.preventDefault();
        if (!window.confirm('Bạn có chắc chắn muốn XÓA VĨNH VIỄN tài khoản? Tất cả dữ liệu của bạn sẽ bị xóa và không thể khôi phục.')) return;

        try {
            setLoading(true);
            setError('');
            await userService.deleteAccount({ password: deletePassword });

            logout();

            window.location.href = '/login';
        } catch (err) {
            setError(err.message || 'Không thể xóa tài khoản');
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (passwordData.new_password !== passwordData.confirm_password) {
            setError('Mật khẩu mới không khớp');
            return;
        }

        if (passwordData.new_password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        try {
            setLoading(true);
            setError('');
            await userService.changePassword({
                old_password: passwordData.old_password,
                new_password: passwordData.new_password
            });
            setSuccess('Đổi mật khẩu thành công!');
            setChangingPassword(false);
            setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message || 'Không thể đổi mật khẩu');
        } finally {
            setLoading(false);
        }
    };

    const getRoleBadge = () => {
        switch (user?.role) {
            case 'admin':
                return { text: 'Admin', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
            case 'teacher':
                return { text: 'Giảng viên', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
            case 'student':
                return { text: 'Sinh viên', color: 'bg-green-500/20 text-green-400 border-green-500/30' };
            default:
                return { text: 'User', color: 'bg-slate-500/20 text-gray-500 border-slate-500/30' };
        }
    };

    const roleBadge = getRoleBadge();

    return (
        <div className="max-w-full mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold gradient-text">Hồ sơ cá nhân</h1>
                <p className="text-gray-500 mt-2">Quản lý thông tin tài khoản của bạn</p>
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

            <div className="card-glass p-8">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-linear-to-br/srgb from-cyan-400 to-blue-500 flex items-center justify-center text-gray-900 text-2xl font-bold">
                            {user?.full_name?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{user?.full_name || user?.name}</h2>
                            <span className={`inline-block mt-2 px-3 py-1 text-xs font-medium rounded-full border ${roleBadge.color}`}>
                                {roleBadge.text}
                            </span>
                        </div>
                    </div>
                    {!editing && !changingPassword && (
                        <button
                            onClick={() => setEditing(true)}
                            className="btn-secondary flex items-center gap-2"
                        >
                            <EditIcon className="w-4 h-4" />
                            Chỉnh sửa
                        </button>
                    )}
                </div>

                {editing ? (
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">
                                Họ và tên
                            </label>
                            <input
                                type="text"
                                value={formData.full_name}
                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                className="input-glass"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                disabled
                                className="input-glass opacity-50 cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-500 mt-1">Email không thể thay đổi</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-2">
                                    Số điện thoại
                                </label>
                                <input
                                    type="text"
                                    value={formData.phone_number}
                                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                                    className="input-glass"
                                    placeholder="0xxxxxxxxx"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-2">
                                    Ngày sinh
                                </label>
                                <input
                                    type="date"
                                    value={formData.dob}
                                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                    className="input-glass"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => {
                                    setEditing(false);
                                    setFormData({
                                        full_name: user?.full_name || user?.name || '',
                                        email: user?.email || '',
                                        phone_number: user?.phone_number || '',
                                        dob: user?.dob ? new Date(user.dob).toISOString().split('T')[0] : ''
                                    });
                                }}
                                className="flex-1 btn-secondary"
                            >
                                Hủy
                            </button>
                            <button type="submit" disabled={loading} className="flex-1 btn-primary">
                                {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-4 text-gray-600">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-center gap-3">
                                <EmailIcon className="w-5 h-5 text-gray-500" />
                                <div>
                                    <p className="text-sm text-gray-500">Email</p>
                                    <p className="text-gray-900">{user?.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <UserIcon className="w-5 h-5 text-gray-500" />
                                <div>
                                    <p className="text-sm text-gray-500">Họ và tên</p>
                                    <p className="text-gray-900">{user?.full_name || user?.name || 'Chưa cập nhật'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <PhoneIcon className="w-5 h-5 text-gray-500" />
                                <div>
                                    <p className="text-sm text-gray-500">Số điện thoại</p>
                                    <p className="text-gray-900">{user?.phone_number || 'Chưa cập nhật'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <CalendarIcon className="w-5 h-5 text-gray-500" />
                                <div>
                                    <p className="text-sm text-gray-500">Ngày sinh</p>
                                    <p className="text-gray-900">{user?.dob ? new Date(user.dob).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="card-glass p-8">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Đổi mật khẩu</h3>
                    {!changingPassword && !editing && (
                        <button
                            onClick={() => setChangingPassword(true)}
                            className="btn-secondary flex items-center gap-2"
                        >
                            <LockIcon className="w-4 h-4" />
                            Đổi mật khẩu
                        </button>
                    )}
                </div>

                {changingPassword ? (
                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">
                                Mật khẩu hiện tại
                            </label>
                            <input
                                type="password"
                                required
                                value={passwordData.old_password}
                                onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                                className="input-glass"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">
                                Mật khẩu mới
                            </label>
                            <input
                                type="password"
                                required
                                value={passwordData.new_password}
                                onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                                className="input-glass"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">
                                Xác nhận mật khẩu mới
                            </label>
                            <input
                                type="password"
                                required
                                value={passwordData.confirm_password}
                                onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                                className="input-glass"
                            />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => {
                                    setChangingPassword(false);
                                    setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
                                }}
                                className="flex-1 btn-secondary"
                            >
                                Hủy
                            </button>
                            <button type="submit" disabled={loading} className="flex-1 btn-primary">
                                {loading ? 'Đang đổi...' : 'Đổi mật khẩu'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <p className="text-gray-500">Click "Đổi mật khẩu" để thay đổi mật khẩu của bạn</p>
                )}
            </div>

            {user?.role !== 'admin' && (
                <div className="card-glass p-8 border-red-500/20">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-red-600">Xóa tài khoản</h3>
                            <p className="text-sm text-gray-500 mt-1">Xóa vĩnh viễn tài khoản và tất cả dữ liệu của bạn</p>
                        </div>
                        {!deleting && (
                            <button
                                onClick={() => setDeleting(true)}
                                className="px-4 py-2 bg-red-500/10 text-red-600 rounded-xl hover:bg-red-500/20 transition-colors flex items-center gap-2 font-semibold"
                            >
                                <TrashIcon className="w-4 h-4" />
                                Xóa tài khoản
                            </button>
                        )}
                    </div>

                    {deleting && (
                        <form onSubmit={handleDeleteAccount} className="space-y-4">
                            <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm mb-4">
                                <strong>Cảnh báo:</strong> Hành động này không thể hoàn tác! Tất cả dữ liệu của bạn bao gồm tài liệu, câu hỏi, bài kiểm tra và lớp học sẽ bị xóa vĩnh viễn.
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-2">
                                    Xác nhận mật khẩu
                                </label>
                                <input
                                    type="password"
                                    required
                                    value={deletePassword}
                                    onChange={(e) => setDeletePassword(e.target.value)}
                                    className="input-glass border-red-200 focus:border-red-500"
                                    placeholder="Nhập mật khẩu của bạn"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setDeleting(false);
                                        setDeletePassword('');
                                    }}
                                    className="flex-1 btn-secondary"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-bold"
                                >
                                    {loading ? 'Đang xử lý...' : 'Xác nhận xóa tài khoản'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            )}
        </div>
    );
};

export default Profile;
