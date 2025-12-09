import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { BellIcon, SearchIcon, MenuIcon, UserIcon, SettingsIcon, LogoutIcon } from '../../components/icons/Icons';
import { useNavigate } from 'react-router-dom';

const Header = ({ onMenuClick }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const notifications = [
        { id: 1, title: 'Bài thi mới', message: 'Bạn có bài thi mới cần hoàn thành', time: '5 phút trước', unread: true },
        { id: 2, title: 'Kết quả bài thi', message: 'Kết quả bài thi Toán đã có', time: '1 giờ trước', unread: true },
        { id: 3, title: 'Thông báo hệ thống', message: 'Hệ thống sẽ bảo trì vào 22:00', time: '2 giờ trước', unread: false },
    ];

    const unreadCount = notifications.filter(n => n.unread).length;

    return (
        <header className="h-16 bg-slate-900/50 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 sticky top-0 z-30">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 rounded-lg hover:bg-white/5 text-slate-400"
                >
                    <MenuIcon className="w-5 h-5" />
                </button>

                <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 w-72">
                    <SearchIcon className="w-5 h-5 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm..."
                        className="bg-transparent border-none outline-none text-sm text-white placeholder-slate-500 w-full"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative">
                    <button
                        onClick={() => {
                            setShowNotifications(!showNotifications);
                            setShowProfileMenu(false);
                        }}
                        className="relative p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                    >
                        <BellIcon className="w-5 h-5" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-medium">
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="absolute right-0 mt-2 w-80 glass rounded-2xl shadow-2xl py-2 animate-fadeIn">
                            <div className="px-4 py-2 border-b border-white/10">
                                <h3 className="font-semibold text-white">Thông báo</h3>
                            </div>
                            <div className="max-h-80 overflow-y-auto">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`px-4 py-3 hover:bg-white/5 cursor-pointer transition-colors border-l-2 ${notification.unread ? 'border-purple-500 bg-purple-500/5' : 'border-transparent'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`w-2 h-2 rounded-full mt-2 ${notification.unread ? 'bg-purple-500' : 'bg-slate-600'}`} />
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-white">{notification.title}</p>
                                                <p className="text-xs text-slate-400 mt-0.5">{notification.message}</p>
                                                <p className="text-xs text-slate-500 mt-1">{notification.time}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="px-4 py-2 border-t border-white/10">
                                <button className="text-sm text-purple-400 hover:text-purple-300 font-medium">
                                    Xem tất cả thông báo
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="relative">
                    <button
                        onClick={() => {
                            setShowProfileMenu(!showProfileMenu);
                            setShowNotifications(false);
                        }}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors"
                    >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-sm font-semibold">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="hidden md:block text-left">
                            <p className="text-sm font-medium text-white">{user?.name || 'User'}</p>
                            <p className="text-xs text-slate-400 capitalize">{user?.role || 'guest'}</p>
                        </div>
                    </button>

                    {showProfileMenu && (
                        <div className="absolute right-0 mt-2 w-56 glass rounded-2xl shadow-2xl py-2 animate-fadeIn">
                            <div className="px-4 py-3 border-b border-white/10">
                                <p className="text-sm font-medium text-white">{user?.name}</p>
                                <p className="text-xs text-slate-400">{user?.email}</p>
                            </div>

                            <div className="py-2">
                                <button
                                    onClick={() => {
                                        navigate('/profile');
                                        setShowProfileMenu(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                                >
                                    <UserIcon className="w-4 h-4" />
                                    Hồ sơ cá nhân
                                </button>
                                <button
                                    onClick={() => {
                                        navigate('/settings');
                                        setShowProfileMenu(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                                >
                                    <SettingsIcon className="w-4 h-4" />
                                    Cài đặt
                                </button>
                            </div>

                            <div className="border-t border-white/10 pt-2">
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
