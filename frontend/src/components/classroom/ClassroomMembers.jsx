import React, { useState, useEffect } from 'react';
import { classroomService } from '../../services/apiServices';
import { useAuth } from '../../contexts/AuthContext';
import { TrashIcon, LogoutIcon } from '../icons/Icons';

const ClassroomMembers = ({ classCode, classroom, isCreator }) => {
    const { user } = useAuth();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [leaving, setLeaving] = useState(false);

    useEffect(() => {
        fetchMembers();
    }, [classCode]);

    const fetchMembers = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await classroomService.getMembers(classCode);
            const data = response.data || response;
            setMembers(data.members || []);
        } catch (err) {
            setError(err.message || 'Không thể tải danh sách thành viên');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveMember = async (memberId) => {
        if (!confirm('Bạn có chắc muốn xóa thành viên này?')) return;

        try {
            await classroomService.removeMember(classCode, memberId);
            await fetchMembers();
        } catch (err) {
            setError(err.message || 'Không thể xóa thành viên');
        }
    };

    const handleLeaveClassroom = async () => {
        if (!confirm('Bạn có chắc muốn rời khỏi lớp học này?')) return;

        try {
            setLeaving(true);
            await classroomService.leave(classCode);
            window.location.href = '/app/classrooms';
        } catch (err) {
            setError(err.message || 'Không thể rời lớp học');
            setLeaving(false);
        }
    };

    const isCurrentUser = (member) => {
        const memberId = member.id || member._id;
        const userId = user?.id || user?._id;
        return String(memberId) === String(userId);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-950 dark:text-white">
                    Thành viên ({members.length})
                </h3>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400">
                    {error}
                </div>
            )}

            {members.length === 0 ? (
                <div className="card-glass p-12 text-center">
                    <p className="text-gray-500">Chưa có thành viên nào</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {members.map((member) => {
                        const roleDisplay = member.role === 'teacher' ? 'Giảng viên' :
                            member.role === 'student' ? 'Sinh viên' :
                                member.role || 'Thành viên';

                        const isSelf = isCurrentUser(member);

                        return (
                            <div key={member.id || member._id} className={`card-glass p-4 hover-scale ${isSelf ? 'ring-2 ring-blue-500/30' : ''}`}>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-linear-to-br/srgb from-cyan-400 to-blue-500 flex items-center justify-center text-gray-900 font-semibold text-lg">
                                        {member.full_name?.charAt(0).toUpperCase() || member.email?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="font-bold text-gray-950 dark:text-white truncate">
                                                {member.full_name || member.email?.split('@')[0]}
                                                {isSelf && <span className="text-blue-500 ml-1">(Bạn)</span>}
                                            </p>
                                            {member.is_creator && (
                                                <span className="px-2 py-0.5 bg-linear-to-r from-amber-500/20 to-orange-500/20 text-amber-500 text-xs font-medium rounded-full border border-amber-500/30">
                                                    Chủ sở hữu
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {roleDisplay}
                                        </p>
                                    </div>
                                    {isSelf && !member.is_creator && (
                                        <button
                                            onClick={handleLeaveClassroom}
                                            disabled={leaving}
                                            className="flex items-center gap-1 px-3 py-1.5 bg-orange-500/10 text-orange-500 rounded-lg hover:bg-orange-500 hover:text-white transition-all duration-200 text-sm font-medium disabled:opacity-50"
                                            title="Rời lớp học"
                                        >
                                            <LogoutIcon className="w-4 h-4" />
                                            {leaving ? 'Đang rời...' : 'Rời lớp'}
                                        </button>
                                    )}
                                    {isCreator && !member.is_creator && !isSelf && (
                                        <button
                                            onClick={() => handleRemoveMember(member.id || member._id)}
                                            className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all duration-200"
                                            title="Xóa thành viên"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ClassroomMembers;
