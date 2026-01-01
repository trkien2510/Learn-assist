import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, ROLES } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { EmailIcon, LockIcon, EyeIcon, EyeOffIcon, UserIcon, AdminIcon, TeacherIcon, StudentIcon } from '../components/icons/Icons';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const { register, isAuthenticated, isLoading: authLoading } = useAuth();
    const { theme } = useTheme();
    const navigate = useNavigate();

    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            navigate('/app/dashboard', { replace: true });
        }
    }, [isAuthenticated, authLoading, navigate]);

    const roles = [
        {
            id: ROLES.TEACHER,
            name: 'Giảng viên',
            description: 'Tạo đề, Thống kê',
            icon: TeacherIcon,
            color: 'from-orange-500 to-amber-500',
            hoverBg: 'hover:bg-orange-50 dark:hover:bg-orange-500/10',
            hoverBorder: 'hover:border-orange-300 dark:hover:border-orange-500/50',
            borderColor: 'border-gray-200 dark:border-slate-700'
        },
        {
            id: ROLES.STUDENT,
            name: 'Sinh viên',
            description: 'Làm bài, Xem điểm',
            icon: StudentIcon,
            color: 'from-green-500 to-emerald-500',
            hoverBg: 'hover:bg-green-50 dark:hover:bg-green-500/10',
            hoverBorder: 'hover:border-green-300 dark:hover:border-green-500/50',
            borderColor: 'border-gray-200 dark:border-slate-700'
        }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!username || !email || !fullName || !dateOfBirth || !password || !confirmPassword) {
            setError('Vui lòng nhập đầy đủ các trường bắt buộc');
            return;
        }

        if (username.length < 3) {
            setError('Tên đăng nhập phải có ít nhất 3 ký tự');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Email không hợp lệ');
            return;
        }

        if (phoneNumber && phoneNumber.trim() !== '') {
            const cleanedPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');
            const phoneRegex = /^0\d{9,10}$/;
            if (!phoneRegex.test(cleanedPhone)) {
                setError('Số điện thoại phải có 10-11 chữ số và bắt đầu bằng số 0');
                return;
            }
        }

        if (password !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }

        if (password.length < 8) {
            setError('Mật khẩu phải có ít nhất 8 ký tự');
            return;
        }

        if (!selectedRole) {
            setError('Vui lòng chọn vai trò');
            return;
        }

        setIsLoading(true);
        try {
            const userData = {
                username: username,
                email: email,
                password: password,
                full_name: fullName,
                dob: dateOfBirth,
                phone_number: phoneNumber && phoneNumber.trim() !== '' ? phoneNumber : null,
                role: selectedRole
            };

            await register(userData);

            navigate('/otp-verification', {
                state: {
                    email: email,
                    purpose: 'registration'
                }
            });
        } catch (err) {
            setError(err.message || 'Đăng ký thất bại. Email hoặc tên đăng nhập có thể đã được sử dụng.');
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
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-blue-500 to-cyan-500 mb-4 glow-primary">
                        <svg className="w-8 h-8 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-shadow-black mb-2">Đăng ký</h1>
                    <p className="text-gray-500">Tạo tài khoản mới để bắt đầu</p>
                </div>

                <div className="glass rounded-3xl p-8 shadow-2xl">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Tạo tài khoản</h2>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm animate-fadeIn">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">Tên đăng nhập <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <UserIcon className="w-5 h-5 text-slate-500" />
                                </div>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="username123"
                                    className="input-glass pl-12"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">Email <span className="text-red-500">*</span></label>
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
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">Tên đầy đủ <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Nguyễn Văn A"
                                    className="input-glass pl-12"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">Ngày sinh <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <input
                                    type="date"
                                    value={dateOfBirth}
                                    onChange={(e) => setDateOfBirth(e.target.value)}
                                    className="input-glass pl-12"
                                    max={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">Số điện thoại <span className="text-gray-400 text-xs">(Không bắt buộc)</span></label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                </div>
                                <input
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    placeholder="0123456789"
                                    className="input-glass pl-12"
                                    maxLength={11}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">Mật khẩu <span className="text-red-500">*</span> <span className="text-gray-400 text-xs">(Tối thiểu 8 ký tự)</span></label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <LockIcon className="w-5 h-5 text-slate-500" />
                                </div>
                                <input
                                    type={'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="input-glass pl-12"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">Xác nhận mật khẩu <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <LockIcon className="w-5 h-5 text-slate-500" />
                                </div>
                                <input
                                    type={'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="input-glass pl-12"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-3">Chọn vai trò <span className="text-red-500">*</span></label>
                            <div className="grid grid-cols-2 gap-3">
                                {roles.map((role) => {
                                    const IconComponent = role.icon;
                                    const isSelected = selectedRole === role.id;
                                    return (
                                        <button
                                            key={role.id}
                                            type="button"
                                            onClick={() => setSelectedRole(role.id)}
                                            style={!isSelected ? { backgroundColor: theme === 'dark' ? 'rgb(30 41 59)' : 'rgb(249 250 251)' } : {}}
                                            className={`
                        relative p-4 rounded-xl border-2 transition-all duration-300 text-center
                        ${isSelected
                                                    ? `bg-linear-to-br/srgb ${role.color} border-transparent shadow-lg`
                                                    : `${role.borderColor} ${role.hoverBg} ${role.hoverBorder} hover:shadow-md`
                                                }
                      `}
                                        >
                                            <IconComponent className={`w-6 h-6 mx-auto mb-2 ${isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-400'}`} />
                                            <span className={`text-sm font-medium block ${isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-800 dark:text-gray-300'}`}>
                                                {role.name}
                                            </span>
                                            <span className={`text-xs ${isSelected ? 'text-gray-800 dark:text-white/90' : 'text-gray-600 dark:text-gray-400'}`}>
                                                {role.description}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Đang đăng ký...
                                </span>
                            ) : 'Đăng ký'}
                        </button>
                    </form>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                    </div>

                    <p className="pt-4 text-center text-gray-500">
                        Đã có tài khoản?{' '}
                        <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                            Đăng nhập
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
