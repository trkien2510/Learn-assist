import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, ROLES } from '../../contexts/AuthContext';
import {
    DashboardIcon,
    UsersIcon,
    BookIcon,
    DocumentIcon,
    QuestionIcon,
    ExamIcon,
    ChartIcon,
    SettingsIcon,
    LogoutIcon,
    MenuIcon,
    CloseIcon,
    BellIcon,
    LogIcon,
    FolderIcon
} from '../../components/icons/Icons';

const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const getNavItems = () => {
        const commonItems = [
            { path: '/dashboard', name: 'Tổng quan', icon: DashboardIcon }
        ];

        const adminItems = [
            { path: '/dashboard', name: 'Tổng quan', icon: DashboardIcon },
            { path: '/users', name: 'Quản lý người dùng', icon: UsersIcon },
            { path: '/classrooms', name: 'Quản lý lớp học', icon: BookIcon },
            { path: '/documents', name: 'Quản lý tài liệu', icon: DocumentIcon },
            { path: '/questions', name: 'Ngân hàng câu hỏi', icon: QuestionIcon },
            { path: '/exams', name: 'Quản lý đề thi', icon: ExamIcon },
            { path: '/statistics', name: 'Thống kê hệ thống', icon: ChartIcon },
            { path: '/logs', name: 'Nhật ký hoạt động', icon: LogIcon },
            { path: '/settings', name: 'Cài đặt', icon: SettingsIcon }
        ];

        const teacherItems = [
            { path: '/dashboard', name: 'Tổng quan', icon: DashboardIcon },
            { path: '/my-classrooms', name: 'Lớp học của tôi', icon: BookIcon },
            { path: '/documents', name: 'Tài liệu', icon: DocumentIcon },
            { path: '/questions', name: 'Ngân hàng câu hỏi', icon: QuestionIcon },
            { path: '/exams', name: 'Quản lý đề thi', icon: ExamIcon },
            { path: '/statistics', name: 'Thống kê', icon: ChartIcon },
            { path: '/settings', name: 'Cài đặt', icon: SettingsIcon }
        ];

        const studentItems = [
            { path: '/dashboard', name: 'Tổng quan', icon: DashboardIcon },
            { path: '/my-classrooms', name: 'Lớp học của tôi', icon: BookIcon },
            { path: '/my-exams', name: 'Bài thi của tôi', icon: ExamIcon },
            { path: '/my-results', name: 'Kết quả học tập', icon: ChartIcon },
            { path: '/library', name: 'Thư viện tài liệu', icon: FolderIcon },
            { path: '/settings', name: 'Cài đặt', icon: SettingsIcon }
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
                return { text: 'Admin', class: 'bg-purple-500/20 text-purple-400 border-purple-500/30' };
            case ROLES.TEACHER:
                return { text: 'Giảng viên', class: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
            case ROLES.STUDENT:
                return { text: 'Sinh viên', class: 'bg-green-500/20 text-green-400 border-green-500/30' };
            default:
                return { text: 'User', class: 'bg-slate-500/20 text-slate-400 border-slate-500/30' };
        }
    };

    const navItems = getNavItems();
    const roleBadge = getRoleBadge();

    return (
        <>
            <button
                onClick={() => setIsMobileOpen(true)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl glass text-white"
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
          fixed lg:static inset-y-0 left-0 z-50
          flex flex-col
          bg-slate-900/95 backdrop-blur-xl border-r border-white/5
          transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-20' : 'w-72'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
            >
                <div className="flex items-center justify-between h-16 px-4 border-b border-white/5">
                    {!isCollapsed && (
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                <BookIcon className="w-5 h-5 text-white" />
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
                        className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
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

                <div className={`p-4 border-b border-white/5 ${isCollapsed ? 'items-center' : ''}`}>
                    <div className={`flex ${isCollapsed ? 'justify-center' : 'items-center gap-3'}`}>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-semibold">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        {!isCollapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
                                <p className="text-xs text-slate-400 truncate">{user?.email || 'user@example.com'}</p>
                            </div>
                        )}
                    </div>
                    {!isCollapsed && (
                        <span className={`inline-block mt-3 px-3 py-1 text-xs font-medium rounded-full border ${roleBadge.class}`}>
                            {roleBadge.text}
                        </span>
                    )}
                </div>

                <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                    {navItems.map((item) => {
                        const IconComponent = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsMobileOpen(false)}
                                className={`
                  relative flex items-center gap-3 px-4 py-3 rounded-xl
                  transition-all duration-200
                  ${isActive
                                        ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-purple-500/30'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }
                  ${isCollapsed ? 'justify-center px-3' : ''}
                `}
                            >
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-gradient-to-b from-purple-400 to-pink-500" />
                                )}
                                <IconComponent className="w-5 h-5 flex-shrink-0" />
                                {!isCollapsed && <span className="font-medium">{item.name}</span>}
                            </NavLink>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-white/5">
                    <button
                        onClick={handleLogout}
                        className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-xl
              text-red-400 hover:text-red-300 hover:bg-red-500/10
              transition-all duration-200
              ${isCollapsed ? 'justify-center px-3' : ''}
            `}
                    >
                        <LogoutIcon className="w-5 h-5 flex-shrink-0" />
                        {!isCollapsed && <span className="font-medium">Đăng xuất</span>}
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
