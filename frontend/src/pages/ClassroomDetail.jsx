import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth, ROLES } from '../contexts/AuthContext';
import { classroomService, statisticsService } from '../services/apiServices';
import {
    ArrowLeftIcon, UsersIcon, MessageIcon, ClipboardIcon,
    ChartIcon, ClockIcon, RefreshIcon
} from '../components/icons/Icons';

import ClassroomOverview from '../components/classroom/ClassroomOverview';
import ClassroomMessages from '../components/classroom/ClassroomMessages';
import ClassroomExams from '../components/classroom/ClassroomExams';
import ClassroomMembers from '../components/classroom/ClassroomMembers';
import ClassroomStatistics from '../components/classroom/ClassroomStatistics';
import ClassroomRequests from '../components/classroom/ClassroomRequests';

const ClassroomDetail = () => {
    const { classCode } = useParams();
    const navigate = useNavigate();
    const { user, hasRole } = useAuth();

    const [classroom, setClassroom] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingStats, setLoadingStats] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('overview');
    const [copied, setCopied] = useState(false);

    const isTeacher = hasRole([ROLES.TEACHER]);
    const isCreator = classroom?.is_creator;

    useEffect(() => {
        fetchClassroomDetail();
    }, [classCode]);

    const fetchClassroomDetail = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await classroomService.getDetail(classCode);
            const classData = response.data || response;
            setClassroom(classData);

            if (classData?._id || classData?.id) {
                fetchClassroomStats(classData._id || classData.id);
            }
        } catch (err) {
            setError(err.message || 'Không thể tải thông tin lớp học');
        } finally {
            setLoading(false);
        }
    };

    const fetchClassroomStats = async (classId) => {
        try {
            setLoadingStats(true);
            const response = await statisticsService.getClassDetailed(classId);
            setStats(response.data || response);
        } catch (err) {

        } finally {
            setLoadingStats(false);
        }
    };

    const tabs = [
        { id: 'overview', label: 'Tổng quan', icon: ClipboardIcon },
        { id: 'messages', label: 'Tin nhắn', icon: MessageIcon },
        { id: 'exams', label: 'Bài kiểm tra', icon: ClockIcon },
        { id: 'members', label: 'Thành viên', icon: UsersIcon },
        { id: 'statistics', label: 'Thống kê', icon: ChartIcon },
        ...(isTeacher && isCreator ? [{ id: 'requests', label: 'Yêu cầu', icon: RefreshIcon, badge: classroom?.pending_requests_count }] : [])
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-2xl mx-auto mt-12">
                <div className="card-glass p-8 text-center">
                    <p className="text-red-400 mb-4">{error}</p>
                    <button onClick={() => navigate('/classrooms')} className="btn-primary">
                        Quay lại danh sách lớp học
                    </button>
                </div>
            </div>
        );
    }

    if (!classroom) {
        return null;
    }

    return (
        <div className="space-y-6">
            <div className="card-glass p-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4 flex-1">
                        <button
                            onClick={() => navigate('/app/classrooms')}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <ArrowLeftIcon className="w-5 h-5 text-gray-400" />
                        </button>

                        <div className="flex-1 min-w-0">
                            <h1 className="text-3xl font-bold gradient-text wrap-break-word">
                                {classroom.name}
                            </h1>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(classroom.class_code);
                                setCopied(true);
                                setTimeout(() => setCopied(false), 2000);
                            }}
                            className="px-4 py-2 bg-blue-500/20 text-blue-500 rounded-lg font-mono font-semibold tracking-wider hover:bg-blue-500/30 transition-all cursor-pointer relative"
                            title="Nhấn để sao chép mã lớp"
                        >
                            {classroom.class_code}
                            {copied && (
                                <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-green-500 text-white text-xs rounded whitespace-nowrap">
                                    Đã sao chép!
                                </span>
                            )}
                        </button>
                        <div className="text-sm text-gray-500">
                            {classroom.members_count} thành viên
                        </div>
                    </div>
                </div>
            </div>

            <div className="card-glass">
                <div className="border-b border-gray-200/10">
                    <div className="flex gap-2 p-2 overflow-x-auto">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`relative flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                                        ? 'bg-linear-to-r from-blue-500/20 to-indigo-600/20 text-blue-500 border border-blue-500/30 font-semibold'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:font-semibold'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {tab.label}
                                    {tab.badge > 0 && (
                                        <span className="ml-1 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                                            {tab.badge}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="p-6">
                    {activeTab === 'overview' && <ClassroomOverview classroom={classroom} stats={stats} loadingStats={loadingStats} />}
                    {activeTab === 'messages' && <ClassroomMessages classCode={classCode} classroom={classroom} />}
                    {activeTab === 'exams' && <ClassroomExams classCode={classCode} classroom={classroom} onRefresh={fetchClassroomDetail} />}
                    {activeTab === 'members' && <ClassroomMembers classCode={classCode} classroom={classroom} isCreator={classroom.is_creator} />}
                    {activeTab === 'statistics' && <ClassroomStatistics classCode={classCode} classroom={classroom} stats={stats} loading={loadingStats} />}
                    {activeTab === 'requests' && classroom.is_creator && <ClassroomRequests classCode={classCode} onUpdate={fetchClassroomDetail} />}
                </div>
            </div>
        </div>
    );
};

export default ClassroomDetail;
