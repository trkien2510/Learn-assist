import React, { useState, useEffect } from 'react';
import { classroomService } from '../../services/apiServices';
import { CheckIcon, XIcon, UsersIcon } from '../icons/Icons';

const ClassroomRequests = ({ classCode, onUpdate }) => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchRequests();
    }, [classCode]);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await classroomService.getMembers(classCode);
            const data = response.data || response;
            setRequests(data.pending_requests || []);
        } catch (err) {
            setError(err.message || 'Không thể tải danh sách yêu cầu');
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (requestId) => {
        try {
            setProcessing(true);
            await classroomService.acceptRequest(classCode, requestId);
            await fetchRequests();
            if (onUpdate) onUpdate();
        } catch (err) {
            setError(err.message || 'Không thể chấp nhận yêu cầu');
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async (requestId) => {
        try {
            setProcessing(true);
            await classroomService.rejectRequest(classCode, requestId);
            await fetchRequests();
            if (onUpdate) onUpdate();
        } catch (err) {
            setError(err.message || 'Không thể từ chối yêu cầu');
        } finally {
            setProcessing(false);
        }
    };

    const handleAcceptAll = async () => {
        if (!confirm(`Chấp nhận tất cả ${requests.length} yêu cầu?`)) return;

        try {
            setProcessing(true);
            await classroomService.acceptAllRequests(classCode);
            await fetchRequests();
            if (onUpdate) onUpdate();
        } catch (err) {
            setError(err.message || 'Không thể chấp nhận tất cả yêu cầu');
        } finally {
            setProcessing(false);
        }
    };

    const handleRejectAll = async () => {
        if (!confirm(`Từ chối tất cả ${requests.length} yêu cầu?`)) return;

        try {
            setProcessing(true);
            await classroomService.rejectAllRequests(classCode);
            await fetchRequests();
            if (onUpdate) onUpdate();
        } catch (err) {
            setError(err.message || 'Không thể từ chối tất cả yêu cầu');
        } finally {
            setProcessing(false);
        }
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
                <h3 className="text-xl font-bold text-gray-900">
                    Yêu cầu tham gia ({requests.length})
                </h3>
                {requests.length > 0 && (
                    <div className="flex gap-2">
                        <button
                            onClick={handleAcceptAll}
                            disabled={processing}
                            className="btn-primary text-sm"
                        >
                            Chấp nhận tất cả
                        </button>
                        <button
                            onClick={handleRejectAll}
                            disabled={processing}
                            className="btn-secondary text-sm"
                        >
                            Từ chối tất cả
                        </button>
                    </div>
                )}
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400">
                    {error}
                </div>
            )}

            {requests.length === 0 ? (
                <div className="card-glass p-12 text-center">
                    <UsersIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                    <p className="text-gray-500">Không có yêu cầu nào đang chờ</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {requests.map((request) => (
                        <div key={request.request_id || request._id} className="card-glass p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-linear-to-br/srgb from-yellow-400 to-orange-500 flex items-center justify-center text-gray-900 font-semibold">
                                        {request.full_name?.charAt(0).toUpperCase() || request.email?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {request.full_name || 'Chưa cập nhật tên'}
                                        </p>
                                        <p className="text-sm text-gray-500">{request.email}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleAccept(request.request_id || request._id)}
                                        disabled={processing}
                                        className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors disabled:opacity-50"
                                        title="Chấp nhận"
                                    >
                                        <CheckIcon className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleReject(request.request_id || request._id)}
                                        disabled={processing}
                                        className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50"
                                        title="Từ chối"
                                    >
                                        <XIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ClassroomRequests;
