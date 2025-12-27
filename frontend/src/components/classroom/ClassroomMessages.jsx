import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { classroomService } from '../../services/apiServices';
import { SendIcon, TrashIcon } from '../icons/Icons';

const ClassroomMessages = ({ classCode, classroom }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const prevMessageCountRef = useRef(0);
    const isInitialLoadRef = useRef(true);
    const userSentMessageRef = useRef(false);

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }, [classCode]);

    useEffect(() => {
        const hasNewMessages = messages.length > prevMessageCountRef.current;

        if (isInitialLoadRef.current && messages.length > 0) {
            scrollToBottom();
            isInitialLoadRef.current = false;
        } else if (userSentMessageRef.current) {
            scrollToBottom();
            userSentMessageRef.current = false;
        } else if (hasNewMessages && prevMessageCountRef.current > 0) {
            const container = messagesContainerRef.current;
            if (container) {
                const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
                if (isAtBottom) {
                    scrollToBottom();
                }
            }
        }

        prevMessageCountRef.current = messages.length;
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchMessages = async () => {
        try {
            const response = await classroomService.getMessages(classCode, 1, 50);
            const data = response.data || response;

            const messagesList = (data.items || []).reverse();
            setMessages(messagesList);
        } catch (err) {
            if (!messages.length) {
                setError(err.message || 'Không thể tải tin nhắn');
            }
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            setSending(true);
            setError('');
            await classroomService.sendMessage(classCode, newMessage.trim());
            setNewMessage('');
            userSentMessageRef.current = true;
            await fetchMessages();
        } catch (err) {
            setError(err.message || 'Không thể gửi tin nhắn');
        } finally {
            setSending(false);
        }
    };

    const handleDeleteMessage = async (messageId) => {
        if (!confirm('Bạn có chắc muốn xóa tin nhắn này?')) return;

        try {
            await classroomService.deleteMessage(messageId);
            await fetchMessages();
        } catch (err) {
            setError(err.message || 'Không thể xóa tin nhắn');
        }
    };

    const canDeleteMessage = (message) => {
        return message.sender_id === user?.id || classroom?.is_creator;
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Vừa xong';
        if (diffMins < 60) return `${diffMins} phút trước`;
        if (diffHours < 24) return `${diffHours} giờ trước`;
        if (diffDays < 7) return `${diffDays} ngày trước`;
        return date.toLocaleDateString('vi-VN');
    };

    return (
        <div className="flex flex-col h-[600px]">
            <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white rounded-t-xl border border-gray-200"
            >
                {loading && messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <div className="text-center">
                            <p className="text-lg mb-2">Chưa có tin nhắn nào</p>
                            <p className="text-sm">Hãy bắt đầu cuộc trò chuyện!</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {messages.map((message) => {
                            const userId = user?.id || user?._id;
                            const isMine = String(message.sender_id) === String(userId);

                            return (
                                <div
                                    key={message.id}
                                    className={`flex gap-3 ${isMine ? 'flex-row-reverse' : ''}`}
                                >
                                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${isMine
                                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                                        : 'bg-gradient-to-br from-gray-400 to-gray-500 text-white'
                                        }`}>
                                        {message.sender_name?.charAt(0).toUpperCase() || 'U'}
                                    </div>

                                    <div className={`flex flex-col max-w-[70%] ${isMine ? 'items-end' : 'items-start'}`}>
                                        <div className={`flex items-center gap-2 mb-1 ${isMine ? 'flex-row-reverse' : ''}`}>
                                            <span className="text-xs font-medium text-gray-300">
                                                {message.sender_name}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {formatTime(message.created_at)}
                                            </span>
                                        </div>

                                        <div className="relative group">
                                            <div className={`p-3 rounded-2xl shadow-md ${isMine
                                                ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-none'
                                                : 'bg-gray-100 text-gray-900 rounded-bl-none border border-gray-200'
                                                }`}>
                                                <p className="whitespace-pre-wrap break-words">{message.content}</p>
                                            </div>

                                            {canDeleteMessage(message) && (
                                                <button
                                                    onClick={() => handleDeleteMessage(message.id)}
                                                    className="absolute -top-2 -right-2 p-1.5 bg-red-500 hover:bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                                                    title="Xóa tin nhắn"
                                                >
                                                    <TrashIcon className="w-3 h-3 text-white" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {error && (
                <div className="px-4 py-2 bg-red-500/10 border-t border-red-500/20 text-red-400 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSendMessage} className="border-t border-gray-200/10 p-4 bg-gray-900/10 rounded-b-xl">
                <div className="flex gap-2">
                    <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage(e);
                            }
                        }}
                        placeholder="Nhập tin nhắn... (Enter để gửi, Shift+Enter để xuống dòng)"
                        className="flex-1 input-glass resize-none min-h-[60px] max-h-[120px]"
                        disabled={sending}
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="btn-primary px-6 self-end disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {sending ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <SendIcon className="w-5 h-5" />
                        )}
                    </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                    Tin nhắn tự động làm mới mỗi 3 giây
                </p>
            </form>
        </div>
    );
};

export default ClassroomMessages;
