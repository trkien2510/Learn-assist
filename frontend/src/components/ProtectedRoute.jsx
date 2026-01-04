import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';
import { BookIcon } from './icons/Icons';

const LoadingScreen = () => (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center animate-pulse">
                <BookIcon className="w-8 h-8 text-gray-900" />
            </div>
            <p className="text-gray-600">Đang tải...</p>
        </div>
    </div>
);

export const ProtectedRoute = () => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <LoadingScreen />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export const PublicRoute = () => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <LoadingScreen />;
    }

    if (isAuthenticated) {
        return <Navigate to="/app/dashboard" replace />;
    }

    return <Outlet />;
};

export const RoleRoute = ({ allowedRoles }) => {
    const { isAuthenticated, hasRole, isLoading } = useAuth();

    if (isLoading) {
        return <LoadingScreen />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!hasRole(allowedRoles)) {
        return <Navigate to="/app/dashboard" replace />;
    }

    return <Outlet />;
};
