import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, ROLES } from '../../contexts/AuthContext';
import { useSidebar } from '../../contexts/SidebarContext';
import {
    DashboardIcon,
    UsersIcon,
    BookIcon,
    DocumentIcon,
    QuestionIcon,
    ExamIcon,
    ChartIcon,
    LogoutIcon,
    MenuIcon,
    CloseIcon,
    BellIcon,
    LogIcon,
    FolderIcon,
    SunIcon,
    MoonIcon
} from '../../components/icons/Icons';
import { useNotifications } from '../../contexts/NotificationContext';
import { useTheme } from '../../contexts/ThemeContext';

const Sidebar = () => {
    const { isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen } = useSidebar();
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { unreadCount } = useNotifications();
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname;

    const getNavItems = () => {
        const commonItems = [
            { path: 'dashboard', name: 'Tổng quan', icon: DashboardIcon }
        ];

        const adminItems = [
            { path: 'dashboard', name: 'Tổng quan', icon: DashboardIcon },
            { path: 'users', name: 'Quản lý người dùng', icon: UsersIcon },
            { path: 'classrooms', name: 'Quản lý lớp học', icon: BookIcon },
            { path: 'logs', name: 'Nhật ký hoạt động', icon: LogIcon }
        ];

        const teacherItems = [
            { path: 'dashboard', name: 'Tổng quan', icon: DashboardIcon },
            { path: 'classrooms', name: 'Lớp học', icon: BookIcon },
            { path: 'documents', name: 'Tài liệu', icon: DocumentIcon },
            { path: 'questions', name: 'Ngân hàng câu hỏi', icon: QuestionIcon },
            { path: 'exams', name: 'Đề kiểm tra', icon: ExamIcon },
            { path: 'statistics', name: 'Thống kê', icon: ChartIcon },
            { path: 'notifications', name: 'Thông báo', icon: BellIcon }
        ];

        const studentItems = [
            { path: 'dashboard', name: 'Tổng quan', icon: DashboardIcon },
            { path: 'classrooms', name: 'Lớp học', icon: BookIcon },
            { path: 'documents', name: 'Tài liệu', icon: DocumentIcon },
            { path: 'questions', name: 'Ngân hàng câu hỏi', icon: QuestionIcon },
            { path: 'exams', name: 'Bài kiểm tra', icon: ExamIcon },
            { path: 'results', name: 'Kết quả', icon: ChartIcon },
            { path: 'practice', name: 'Tự luyện', icon: FolderIcon },
            { path: 'notifications', name: 'Thông báo', icon: BellIcon }
        ];

        switch (user?.role) {
            case ROLES.ADMIN:
                return adminItems;
            case ROLES.TEACHER:
                return teacherItems;
            case ROLES.STUDENT:
                return studentItems;
            default:
                return commonItems;
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getRoleBadge = () => {
        switch (user?.role) {
            case ROLES.ADMIN:
                return { text: 'Admin', class: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
            case ROLES.TEACHER:
                return { text: 'Giảng viên', class: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
            case ROLES.STUDENT:
                return { text: 'Sinh viên', class: 'bg-green-500/20 text-green-400 border-green-500/30' };
            default:
                return { text: 'User', class: 'bg-slate-500/20 text-gray-500 border-slate-500/30' };
        }
    };

    const navItems = getNavItems();
    const roleBadge = getRoleBadge();

    return (
        <>
            <button
                onClick={() => setIsMobileOpen(true)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl glass text-gray-900 dark:text-gray-900"
            >
                <MenuIcon className="w-6 h-6" />
            </button>

            {isMobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            <aside
                className={`
          fixed inset-y-0 left-0 z-50
          flex flex-col
          bg-(--sidebar-bg) backdrop-blur-xl border-r border-white/5
          transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-20' : 'w-72'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
            >
                <div className="flex items-center justify-between h-16 px-4 border-b border-white/5">
                    {!isCollapsed && (
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                <BookIcon className="w-5 h-5 text-gray-900" />
                            </div>
                            <span className="text-lg font-bold gradient-text">Learn Assist</span>
                        </div>
                    )}

                    <button
                        onClick={() => {
                            if (window.innerWidth < 1024) {
                                setIsMobileOpen(false);
                            } else {
                                setIsCollapsed(!isCollapsed);
                            }
                        }}
                        className="p-2 rounded-lg hover:bg-white/5 text-gray-600 hover:text-gray-900 dark:hover:text-gray-900 transition-colors"
                    >
                        {window.innerWidth < 1024 ? (
                            <CloseIcon className="w-5 h-5" />
                        ) : isCollapsed ? (
                            <MenuIcon className="w-5 h-5" />
                        ) : (
                            <CloseIcon className="w-5 h-5" />
                        )}
                    </button>
                </div>


                <div className={`px-2 py-1 border-b border-white/5 ${isCollapsed ? 'items-center' : ''}`}>
                    <button
                        onClick={() => {
                            navigate('profile');
                            setIsMobileOpen(false);
                        }}
                        className={`w-full flex ${isCollapsed ? 'justify-center' : 'items-center gap-3'} p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer group`}
                    >
                        <div className="w-10 h-10 rounded-full bg-linear-to-br/srgb from-cyan-400 to-blue-500 flex items-center justify-center text-gray-900 font-semibold group-hover:scale-105 transition-transform">
                            {user?.full_name?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        {!isCollapsed && (
                            <div className="flex-1 min-w-0 text-left">
                                <p className="text-sm font-semibold text-gray-950 dark:text-white truncate group-hover:text-blue-600 transition-colors uppercase">{user?.full_name || user?.username || 'User'}</p>
                                <p className="text-xs text-blue-500 font-semibold truncate capitalize opacity-80">{roleBadge.text}</p>
                            </div>
                        )}
                    </button>

                    <button
                        onClick={toggleTheme}
                        className={`mt-2 w-full flex ${isCollapsed ? 'justify-center' : 'items-center gap-3'} p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer group text-gray-400 hover:text-blue-500`}
                        title={theme === 'light' ? 'Chế độ tối' : 'Chế độ sáng'}
                    >
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 group-hover:bg-blue-500/10 group-hover:rotate-12 transition-all duration-300">
                            {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
                        </div>
                        {!isCollapsed && (
                            <div className="flex-1 text-left">
                                <p className="text-sm font-medium">{theme === 'light' ? 'Chế độ tối' : 'Chế độ sáng'}</p>
                                <p className="text-[10px] opacity-50 uppercase tracking-wider">{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</p>
                            </div>
                        )}
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto px-2 py-1 space-y-1">
                    {navItems.map((item) => {
                        const IconComponent = item.icon;

                        const isItemActive = (navIsActive) => {
                            if (item.path === 'classrooms' && currentPath.startsWith('/app/classroom/')) {
                                return true;
                            }
                            return navIsActive;
                        };

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsMobileOpen(false)}
                                className={({ isActive }) => `
                  relative flex items-center gap-3 px-4 py-3 rounded-xl
                  transition-all duration-200
                  ${isItemActive(isActive)
                                        ? 'bg-linear-to-r from-blue-500/20 to-indigo-600/20 text-blue-500 border border-blue-500/30'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-white/10'
                                    }
                  ${isCollapsed ? 'justify-center px-3' : ''}
                `}
                            >
                                {({ isActive }) => (
                                    <>
                                        {isItemActive(isActive) && (
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-linear-to-b from-blue-400 to-orange-500" />
                                        )}
                                        <IconComponent className="w-5 h-5 shrink-0" />
                                        {!isCollapsed && (
                                            <div className="flex-1 flex items-center justify-between">
                                                <span className="font-medium">{item.name}</span>
                                                {item.path === 'notifications' && unreadCount > 0 && (
                                                    <span className="ml-2 px-2 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded-full min-w-5 text-center">
                                                        {unreadCount > 99 ? '99+' : unreadCount}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                        {isCollapsed && item.path === 'notifications' && unreadCount > 0 && (
                                            <div className="absolute top-2 right-2 w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                                                {unreadCount > 99 ? '99+' : unreadCount}
                                            </div>
                                        )}
                                    </>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>

                <div className="px-2 py-1 border-t border-white/5">
                    <button
                        onClick={handleLogout}
                        className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-xl
              text-red-400 hover:text-red-600 hover:bg-red-500/10
              transition-all duration-200
              ${isCollapsed ? 'justify-center px-3' : ''}
            `}
                    >
                        <LogoutIcon className="w-5 h-5 shrink-0" />
                        {!isCollapsed && <span className="font-medium">Đăng xuất</span>}
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
