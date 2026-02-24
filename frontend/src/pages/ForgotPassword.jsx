import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { EmailIcon, KeyIcon, AlertTriangleIcon, CheckCircleIcon, SpinnerIcon } from '../components/icons/Icons';

const ForgotPassword = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const navigate = useNavigate();

    const handleRequestOTP = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!email) {
            setError('Vui lòng nhập email');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Email không hợp lệ');
            return;
        }

        setIsLoading(true);
        try {
            await authService.forgotPassword(email);
            setSuccess('Nếu email tồn tại trong hệ thống, mã OTP đã được gửi đến email của bạn');
            setStep(2);
        } catch (err) {
            setSuccess('Nếu email tồn tại trong hệ thống, mã OTP đã được gửi đến email của bạn');
            setStep(2);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!otp) {
            setError('Vui lòng nhập mã OTP');
            return;
        }

        if (!newPassword || !confirmPassword) {
            setError('Vui lòng nhập đầy đủ mật khẩu mới');
            return;
        }

        if (newPassword.length < 8) {
            setError('Mật khẩu phải có ít nhất 8 ký tự');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }

        setIsLoading(true);
        try {
            await authService.resetPassword(email, otp, newPassword, confirmPassword);
            setSuccess('Đặt lại mật khẩu thành công! Đang chuyển hướng...');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Không thể đặt lại mật khẩu';

            if (errorMessage.includes('còn lại')) {
                setError(errorMessage);
            } else if (err.response?.data?.remaining_attempts !== undefined) {
                const attempts = err.response.data.remaining_attempts;
                if (attempts === 0) {
                    setError('Mã OTP đã hết lượt thử. Vui lòng yêu cầu mã mới.');
                } else {
                    setError(`Mã OTP không đúng. Bạn còn ${attempts} lần thử.`);
                }
            } else {
                setError(errorMessage);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-linear-to-br from-blue-50 via-white to-orange-50">
                <div className="absolute top-0 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
                <div className="absolute top-0 -right-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
                <div className="absolute bottom-0 left-1/2 w-80 h-80 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '4s' }}></div>
            </div>

            <div className="relative z-10 w-full max-w-md animate-fadeIn">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 mb-4 glow-primary">
                        <KeyIcon className="w-8 h-8 text-gray-900 dark:text-gray-900" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-900 mb-2">Quên mật khẩu</h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        {step === 1 && 'Nhập email để nhận mã xác thực'}
                        {step === 2 && 'Nhập mã OTP và mật khẩu mới'}
                    </p>
                </div>

                <div className="glass rounded-3xl p-8 shadow-2xl">
                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border-2 border-red-500/50 animate-fadeIn">
                            <div className="flex items-start gap-3">
                                <AlertTriangleIcon className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                                <p className="text-red-400 font-medium text-sm">{error}</p>
                            </div>
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 p-4 rounded-xl bg-green-500/10 border-2 border-green-500/50 animate-fadeIn">
                            <div className="flex items-start gap-3">
                                <CheckCircleIcon className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                                <p className="text-green-400 font-medium text-sm">{success}</p>
                            </div>
                        </div>
                    )}

                    {step === 1 && (
                        <form onSubmit={handleRequestOTP} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Email</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <EmailIcon className="w-5 h-5 text-slate-500" />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="your@email.com"
                                        className="input-glass pl-12"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <SpinnerIcon />
                                        Đang gửi...
                                    </span>
                                ) : 'Gửi mã OTP'}
                            </button>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleResetPassword} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Mã OTP</label>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder="Nhập mã OTP từ email"
                                    className="input-glass"
                                    maxLength={6}
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Mật khẩu mới</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Tối thiểu 8 ký tự"
                                    className="input-glass"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Xác nhận mật khẩu mới</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Nhập lại mật khẩu mới"
                                    className="input-glass"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <SpinnerIcon />
                                        Đang xử lý...
                                    </span>
                                ) : 'Đặt lại mật khẩu'}
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setStep(1);
                                    setOtp('');
                                    setNewPassword('');
                                    setConfirmPassword('');
                                    setError('');
                                }}
                                className="w-full btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Gửi lại mã OTP
                            </button>
                        </form>
                    )}

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                        </div>
                    </div>

                    <p className="text-center text-gray-500 dark:text-gray-400">
                        Nhớ mật khẩu?{' '}
                        <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                            Đăng nhập
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
