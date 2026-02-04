import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { EmailIcon, SpinnerIcon } from '../components/icons/Icons';
import { translateError } from '../utils/errorMessages';

const OTPVerification = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { verifyOTP, requestOTP } = useAuth();

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [resendCooldown, setResendCooldown] = useState(0);

    const email = location.state?.email || '';
    const purpose = location.state?.purpose || 'registration';

    useEffect(() => {
        if (!email) {
            navigate('/register');
        }
    }, [email, navigate]);

    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const handleOtpChange = (index, value) => {
        if (value.length > 1) {
            value = value.slice(0, 1);
        }

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            if (prevInput) prevInput.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        const newOtp = pastedData.split('').concat(Array(6 - pastedData.length).fill(''));
        setOtp(newOtp);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        const otpCode = otp.join('');

        if (otpCode.length !== 6) {
            setError('Vui lòng nhập đầy đủ 6 số');
            setLoading(false);
            return;
        }

        try {
            await verifyOTP(email, otpCode, purpose);
            setSuccess('Xác thực thành công!');

            setTimeout(() => {
                if (purpose === 'registration') {
                    navigate('/app/dashboard');
                } else {
                    navigate('/login');
                }
            }, 1500);
        } catch (err) {
            setError(translateError(err));
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendCooldown > 0) return;

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await requestOTP(email, purpose);
            setSuccess('Mã OTP mới đã được gửi đến email của bạn');
            setResendCooldown(60);
            setOtp(['', '', '', '', '', '']);
        } catch (err) {
            setError(translateError(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                        <EmailIcon className="w-8 h-8 text-gray-900" />
                    </div>
                    <h1 className="text-3xl font-bold gradient-text mb-2">Xác thực Email</h1>
                    <p className="text-gray-600">
                        Chúng tôi đã gửi mã OTP gồm 6 số đến
                    </p>
                    <p className="text-blue-400 font-semibold">{email}</p>
                </div>

                <form onSubmit={handleSubmit} className="card-glass p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-xl text-green-400 text-sm">
                            {success}
                        </div>
                    )}

                    <div className="mb-8">
                        <label className="block text-sm font-medium text-gray-600 mb-4 text-center">
                            Nhập mã OTP
                        </label>
                        <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    id={`otp-${index}`}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    className="w-12 h-14 text-center text-2xl font-bold bg-slate-800/50 border border-slate-700 rounded-xl text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                                    disabled={loading}
                                />
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || otp.some(d => !d)}
                        className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <SpinnerIcon />
                                Đang xác thực...
                            </span>
                        ) : (
                            'Xác thực'
                        )}
                    </button>

                    <div className="mt-6 text-center">
                        <p className="text-gray-500 text-sm mb-2">
                            Không nhận được mã?
                        </p>
                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={loading || resendCooldown > 0}
                            className="text-blue-400 hover:text-blue-300 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {resendCooldown > 0 ? `Gửi lại sau ${resendCooldown}s` : 'Gửi lại mã OTP'}
                        </button>
                    </div>
                </form>

                <p className="text-center text-gray-500 text-sm mt-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                        Quay lại
                    </button>
                </p>
            </div>
        </div>
    );
};

export default OTPVerification;
