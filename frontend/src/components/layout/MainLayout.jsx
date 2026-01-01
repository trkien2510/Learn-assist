import React, { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { SidebarProvider, useSidebar } from '../../contexts/SidebarContext';
import Sidebar from './Sidebar';

const MainLayoutContent = () => {
    const { isCollapsed } = useSidebar();
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

    useEffect(() => {
        const handleResize = () => {
            setIsDesktop(window.innerWidth >= 1024);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const getMarginLeft = () => {
        if (!isDesktop) return '0';
        return isCollapsed ? '5rem' : '18rem';
    };

    return (
        <div className="min-h-screen bg-(--bg-color) text-(--text-color)">
            <Sidebar />

            <div
                className="flex flex-col min-h-screen transition-all duration-300"
                style={{ marginLeft: getMarginLeft() }}
            >
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

const MainLayout = () => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-(--bg-color) flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500">Đang tải...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return (
        <SidebarProvider>
            <MainLayoutContent />
        </SidebarProvider>
    );
};

export default MainLayout;
