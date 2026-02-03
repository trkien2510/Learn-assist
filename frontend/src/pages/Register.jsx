import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, ROLES } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { EmailIcon, LockIcon, UserIcon, TeacherIcon, StudentIcon, UserAddIcon, CalendarIcon, PhoneIcon, SpinnerIcon } from '../components/icons/Icons';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
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
            name: 'Giáo viên',
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

            <div className="relative z-10 w-full max-w-2xl animate-fadeIn">
                <div className="text-center mb-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-linear-to-br from-blue-500 to-cyan-500 mb-2 glow-primary">
                        <UserAddIcon className="w-6 h-6 text-gray-900" />
                    </div>
                    <h1 className="text-2xl font-bold text-shadow-black">Đăng ký tài khoản</h1>
                </div>

                <div className="glass rounded-2xl p-6 shadow-2xl">
                    {error && (
                        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm animate-fadeIn">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Tên đăng nhập <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <UserIcon className="w-4 h-4 text-slate-500" />
                                    </div>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="username123"
                                        className="input-glass pl-10 py-2 text-sm"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Email <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <EmailIcon className="w-4 h-4 text-slate-500" />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="your@email.com"
                                        className="input-glass pl-10 py-2 text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Họ và tên <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <UserIcon className="w-4 h-4 text-slate-500" />
                                    </div>
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="Nguyễn Văn A"
                                        className="input-glass pl-10 py-2 text-sm"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Ngày sinh <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <CalendarIcon className="w-4 h-4 text-slate-500" />
                                    </div>
                                    <input
                                        type="date"
                                        value={dateOfBirth}
                                        onChange={(e) => setDateOfBirth(e.target.value)}
                                        className="input-glass pl-10 py-2 text-sm"
                                        max={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Số điện thoại <span className="text-gray-400 text-xs">(Tùy chọn)</span></label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <PhoneIcon className="w-4 h-4 text-slate-500" />
                                    </div>
                                    <input
                                        type="tel"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        placeholder="0123456789"
                                        className="input-glass pl-10 py-2 text-sm"
                                        maxLength={11}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Mật khẩu <span className="text-red-500">*</span> <span className="text-gray-400">(≥8 ký tự)</span></label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <LockIcon className="w-4 h-4 text-slate-500" />
                                    </div>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="input-glass pl-10 py-2 text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Xác nhận mật khẩu <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <LockIcon className="w-4 h-4 text-slate-500" />
                                    </div>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="input-glass pl-10 py-2 text-sm"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Vai trò <span className="text-red-500">*</span></label>
                                <div className="grid grid-cols-2 gap-2">
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
                                                    relative p-2 rounded-lg border-2 transition-all duration-300 text-center
                                                    ${isSelected
                                                        ? `bg-linear-to-br/srgb ${role.color} border-transparent shadow-md`
                                                        : `${role.borderColor} ${role.hoverBg} ${role.hoverBorder}`
                                                    }
                                                `}
                                            >
                                                <IconComponent className={`w-4 h-4 mx-auto ${isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-400'}`} />
                                                <span className={`text-xs font-medium block ${isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-800 dark:text-gray-300'}`}>
                                                    {role.name}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full btn-primary py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <SpinnerIcon />
                                    Đang đăng ký...
                                </span>
                            ) : 'Đăng ký'}
                        </button>
                    </form>

                    <p className="pt-4 text-center text-gray-500 text-sm">
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
