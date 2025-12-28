import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, ROLES } from '../contexts/AuthContext';
import { classroomService } from '../services/apiServices';
import { BookIcon, UsersIcon, PlusIcon, CloseIcon, CheckIcon, XIcon, TrashIcon, LogoutIcon } from '../components/icons/Icons';

const Classrooms = () => {
    const { user, hasRole } = useAuth();
    const navigate = useNavigate();
    const [classrooms, setClassrooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [showMembersModal, setShowMembersModal] = useState(false);
    const [selectedClassroom, setSelectedClassroom] = useState(null);
    const [copiedCode, setCopiedCode] = useState('');

    const [createForm, setCreateForm] = useState({
        name: '',
        subject: '',
        description: ''
    });
    const [joinCode, setJoinCode] = useState('');

    const [members, setMembers] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [loadingMembers, setLoadingMembers] = useState(false);

    useEffect(() => {
        fetchClassrooms();
    }, []);

    const fetchClassrooms = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await classroomService.getAll(1, 50);
            const data = response.data || response;
            setClassrooms(data.items || data || []);
        } catch (err) {
            setError(err.message || 'Không thể tải danh sách lớp học');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateClassroom = async (e) => {
        e.preventDefault();
        try {
            setError('');
            await classroomService.create(createForm);
            setSuccess('Tạo lớp học thành công!');
            setShowCreateModal(false);
            setCreateForm({ name: '', subject: '', description: '' });
            fetchClassrooms();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message || 'Không thể tạo lớp học');
        }
    };

    const handleJoinClassroom = async (e) => {
        e.preventDefault();
        try {
            setError('');
            await classroomService.sendJoinRequest(joinCode);
            setSuccess('Đã gửi yêu cầu tham gia! Đợi giáo viên phê duyệt.');
            setShowJoinModal(false);
            setJoinCode('');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message || 'Không thể tham gia lớp học');
        }
    };

    const handleViewMembers = async (classroom) => {
        try {
            setSelectedClassroom(classroom);
            setLoadingMembers(true);
            setShowMembersModal(true);

            const response = await classroomService.getMembers(classroom.class_code);
            const data = response.data || response;
            setMembers(data.members || []);
            setPendingRequests(data.pending_requests || []);
        } catch (err) {
            setError(err.message || 'Không thể tải danh sách thành viên');
        } finally {
            setLoadingMembers(false);
        }
    };

    const handleAcceptRequest = async (requestId) => {
        try {
            await classroomService.acceptRequest(selectedClassroom.class_code, requestId);
            setSuccess('Đã chấp nhận yêu cầu!');
            handleViewMembers(selectedClassroom);
            setTimeout(() => setSuccess(''), 2000);
        } catch (err) {
            setError(err.message || 'Không thể chấp nhận yêu cầu');
        }
    };

    const handleRejectRequest = async (requestId) => {
        try {
            await classroomService.rejectRequest(selectedClassroom.class_code, requestId);
            setSuccess('Đã từ chối yêu cầu!');
            handleViewMembers(selectedClassroom);
            setTimeout(() => setSuccess(''), 2000);
        } catch (err) {
            setError(err.message || 'Không thể từ chối yêu cầu');
        }
    };

    const handleRemoveMember = async (memberId) => {
        if (!confirm('Bạn có chắc muốn xóa thành viên này?')) return;

        try {
            await classroomService.removeMember(selectedClassroom.class_code, memberId);
            setSuccess('Đã xóa thành viên!');
            handleViewMembers(selectedClassroom);
            setTimeout(() => setSuccess(''), 2000);
        } catch (err) {
            setError(err.message || 'Không thể xóa thành viên');
        }
    };

    const handleLeaveClassroom = async (classCode) => {
        if (!confirm('Bạn có chắc muốn rời khỏi lớp học này?')) return;

        try {
            await classroomService.leave(classCode);
            setSuccess('Đã rời khỏi lớp học!');
            fetchClassrooms();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message || 'Không thể rời khỏi lớp học');
        }
    };

    const handleDeleteClassroom = async (classCode) => {
        if (!confirm('Bạn có chắc muốn xóa lớp học này? Hành động này không thể hoàn tác!')) return;

        try {
            await classroomService.delete(classCode);
            setSuccess('Đã xóa lớp học!');
            fetchClassrooms();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message || 'Không thể xóa lớp học');
        }
    };

    const copyClassCode = (code) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(''), 2000);
    };

    const isTeacher = hasRole([ROLES.TEACHER]);
    const isAdmin = hasRole([ROLES.ADMIN]);
    const isStudent = hasRole([ROLES.STUDENT]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold gradient-text">
                        {isTeacher ? 'Quản lý lớp học' : 'Lớp học của tôi'}
                    </h1>
                    <p className="text-gray-500 mt-2">
                        {isTeacher ? 'Tạo và quản lý lớp học của bạn' : 'Các lớp học bạn đã tham gia'}
                    </p>
                </div>

                {isTeacher && (
                    <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center gap-2">
                        <PlusIcon className="w-5 h-5" />
                        Tạo lớp học
                    </button>
                )}
                {isStudent && (
                    <button onClick={() => setShowJoinModal(true)} className="btn-primary flex items-center gap-2">
                        <PlusIcon className="w-5 h-5" />
                        Tham gia lớp
                    </button>
                )}
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 animate-fadeIn">
                    {error}
                </div>
            )}

            {success && (
                <div className="p-4 bg-green-500/10 border border-green-500/50 rounded-xl text-green-400 animate-fadeIn">
                    {success}
                </div>
            )}

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="card-glass p-6 animate-pulse">
                            <div className="h-6 bg-slate-700 rounded mb-4"></div>
                            <div className="h-4 bg-slate-700 rounded mb-2"></div>
                            <div className="h-4 bg-slate-700 rounded w-2/3"></div>
                        </div>
                    ))}
                </div>
            ) : classrooms.length === 0 ? (
                <div className="card-glass p-12 text-center">
                    <BookIcon className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {isTeacher ? 'Chưa có lớp học nào' : 'Bạn chưa tham gia lớp học nào'}
                    </h3>
                    <p className="text-gray-500 mb-6">
                        {isTeacher ? 'Tạo lớp học đầu tiên của bạn' : isStudent ? 'Nhập mã lớp học để tham gia' : 'Không có lớp học nào trong hệ thống'}
                    </p>
                    {isTeacher && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="btn-primary"
                        >
                            Tạo lớp học
                        </button>
                    )}
                    {isStudent && (
                        <button
                            onClick={() => setShowJoinModal(true)}
                            className="btn-primary"
                        >
                            Tham gia lớp
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {classrooms.map((classroom) => (
                        <div
                            key={classroom._id || classroom.id}
                            className="card-glass p-6 hover-scale cursor-pointer"
                            onClick={() => navigate(`/app/classroom/${classroom.class_code}`)}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                        <BookIcon className="w-6 h-6 text-gray-900" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg">{classroom.name}</h3>
                                        {classroom.subject && (
                                            <p className="text-xs text-gray-500">{classroom.subject}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {classroom.description && (
                                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                    {classroom.description}
                                </p>
                            )}

                            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                                <div className="flex items-center gap-2 text-gray-500">
                                    <UsersIcon className="w-4 h-4" />
                                    <span className="text-sm">{classroom.members?.length || 0} thành viên</span>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        copyClassCode(classroom.class_code);
                                    }}
                                    className={`text-xs px-3 py-1.5 border rounded-lg transition-all font-mono font-bold flex items-center gap-1.5 ${copiedCode === classroom.class_code
                                        ? 'bg-green-500/10 text-green-600 border-green-500/20'
                                        : 'bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20'
                                        }`}
                                    title={copiedCode === classroom.class_code ? "Đã sao chép!" : "Nhấn để sao chép mã"}
                                >
                                    {classroom.class_code}
                                    {copiedCode === classroom.class_code ? (
                                        <CheckIcon className="w-3 h-3" />
                                    ) : (
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                                        </svg>
                                    )}
                                </button>
                            </div>

                            <div className="flex gap-2">
                                {isTeacher && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteClassroom(classroom.class_code);
                                        }}
                                        className="flex-1 p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                                    >
                                        <TrashIcon className="w-4 h-4 mx-auto" />
                                    </button>
                                )}
                                {isStudent && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleLeaveClassroom(classroom.class_code);
                                        }}
                                        className="flex-1 p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                                    >
                                        <LogoutIcon className="w-4 h-4 mx-auto" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="card-glass p-8 max-w-md w-full animate-fadeIn">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold gradient-text">Tạo lớp học mới</h2>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                            >
                                <CloseIcon className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateClassroom} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-2">
                                    Tên lớp học *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={createForm.name}
                                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                                    className="input-glass"
                                    placeholder="VD: Lập trình Web 2024"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-2">
                                    Môn học
                                </label>
                                <input
                                    type="text"
                                    value={createForm.subject}
                                    onChange={(e) => setCreateForm({ ...createForm, subject: e.target.value })}
                                    className="input-glass"
                                    placeholder="VD: Công nghệ Web"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-2">
                                    Mô tả
                                </label>
                                <textarea
                                    value={createForm.description}
                                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                                    className="input-glass min-h-[100px]"
                                    placeholder="Mô tả về lớp học..."
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 btn-secondary">
                                    Hủy
                                </button>
                                <button type="submit" className="flex-1 btn-primary">
                                    Tạo lớp học
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showJoinModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="card-glass p-8 max-w-md w-full animate-fadeIn">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold gradient-text">Tham gia lớp học</h2>
                            <button
                                onClick={() => setShowJoinModal(false)}
                                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                            >
                                <CloseIcon className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <form onSubmit={handleJoinClassroom} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-2">
                                    Mã lớp học
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={joinCode}
                                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                    className="input-glass text-center text-2xl tracking-wider font-mono"
                                    placeholder="XXXXXXXX"
                                    maxLength={8}
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    Nhập mã 8 ký tự do giáo viên cung cấp
                                </p>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowJoinModal(false)} className="flex-1 btn-secondary">
                                    Hủy
                                </button>
                                <button type="submit" className="flex-1 btn-primary">
                                    Tham gia
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showMembersModal && selectedClassroom && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="card-glass p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto animate-fadeIn">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-bold gradient-text">{selectedClassroom.name}</h2>
                                <p className="text-gray-500 text-sm mt-1">Quản lý thành viên</p>
                            </div>
                            <button
                                onClick={() => setShowMembersModal(false)}
                                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                            >
                                <CloseIcon className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {loadingMembers ? (
                            <div className="text-center py-12">
                                <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {isTeacher && pendingRequests.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                                            Yêu cầu chờ duyệt ({pendingRequests.length})
                                        </h3>
                                        <div className="space-y-2">
                                            {pendingRequests.map((request) => (
                                                <div key={request._id || request.id} className="flex items-center justify-between p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl">
                                                    <div>
                                                        <p className="font-medium text-gray-900">{request.user?.full_name || request.user?.email}</p>
                                                        <p className="text-xs text-gray-500">{request.user?.email}</p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleAcceptRequest(request._id || request.id)}
                                                            className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                                                        >
                                                            <CheckIcon className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleRejectRequest(request._id || request.id)}
                                                            className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                                                        >
                                                            <XIcon className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                        Thành viên ({members.length})
                                    </h3>
                                    {members.length === 0 ? (
                                        <p className="text-gray-500 text-center py-8">Chưa có thành viên nào</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {members.map((member) => (
                                                <div key={member._id || member.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-linear-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-gray-900 font-semibold">
                                                            {member.full_name?.charAt(0).toUpperCase() || member.email?.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">{member.full_name || member.email}</p>
                                                            <p className="text-xs text-gray-500">{member.email}</p>
                                                        </div>
                                                    </div>
                                                    {isTeacher && member._id !== user?.id && (
                                                        <button
                                                            onClick={() => handleRemoveMember(member._id || member.id)}
                                                            className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                                                        >
                                                            <TrashIcon className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Classrooms;
