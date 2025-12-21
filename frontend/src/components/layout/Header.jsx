import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { SearchIcon, MenuIcon, UserIcon, SettingsIcon, LogoutIcon } from '../../components/icons/Icons';
import { useNavigate } from 'react-router-dom';
import NotificationBell from '../notifications/NotificationBell';

const Header = ({ onMenuClick }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 sticky top-0 z-30">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 rounded-lg hover:bg-white/5 text-gray-500"
                >
                    <MenuIcon className="w-5 h-5" />
                </button>

                <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-gray-200 w-72">
                    <SearchIcon className="w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm..."
                        className="bg-transparent border-none outline-none text-sm text-gray-900 placeholder-gray-400 w-full"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                {/* Real Notification Bell */}
                <NotificationBell />

                {/* User Menu */}
                <div className="relative">
                    <button
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors"
                    >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-orange-500 flex items-center justify-center text-gray-900 text-sm font-semibold">
                            {user?.full_name?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="hidden md:block text-left">
                            <p className="text-sm font-medium text-gray-900">{user?.full_name || user?.username || 'User'}</p>
                            <p className="text-xs text-gray-500 capitalize">{user?.role || 'guest'}</p>
                        </div>
                    </button>

                    {showProfileMenu && (
                        <div className="absolute right-0 mt-2 w-56 glass rounded-2xl shadow-2xl py-2 animate-fadeIn border border-gray-200">
                            <div className="px-4 py-3 border-b border-gray-200">
                                <p className="text-sm font-medium text-gray-900">{user?.full_name || user?.username}</p>
                                <p className="text-xs text-gray-500">{user?.email}</p>
                            </div>

                            <div className="py-2">
                                <button
                                    onClick={() => {
                                        navigate('/app/settings');
                                        setShowProfileMenu(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-white/5 transition-colors"
                                >
                                    <UserIcon className="w-4 h-4" />
                                    Hồ sơ cá nhân
                                </button>
                                <button
                                    onClick={() => {
                                        navigate('/app/settings');
                                        setShowProfileMenu(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-white/5 transition-colors"
                                >
                                    <SettingsIcon className="w-4 h-4" />
                                    Cài đặt
                                </button>
                            </div>

                            <div className="border-t border-gray-200 pt-2">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                                >
                                    <LogoutIcon className="w-4 h-4" />
                                    Đăng xuất
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
