import React from 'react';

const Login = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-blue-600 p-3 rounded-xl shadow-lg"></div>
        </div>

        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
          Learn Assist System
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Hệ thống ôn tập và kiểm tra tự động
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-slate-200">
          <div className="mb-6">
            <h3 className="text-lg font-medium text-slate-900 text-center mb-4">
              Chọn vai trò để trải nghiệm (Demo)
            </h3>

            <div className="space-y-3">
              <button className="w-full flex items-center justify-between px-4 py-4 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-blue-50 hover:border-blue-500 hover:text-blue-700 transition-all">
                <span>Giảng viên</span>
                <span className="text-xs text-slate-400">Tạo đề, Thống kê</span>
              </button>

              <button className="w-full flex items-center justify-between px-4 py-4 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-green-50 hover:border-green-500 hover:text-green-700 transition-all">
                <span>Sinh viên</span>
                <span className="text-xs text-slate-400">Làm bài, Xem điểm</span>
              </button>

              <button className="w-full flex items-center justify-between px-4 py-4 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-purple-50 hover:border-purple-500 hover:text-purple-700 transition-all">
                <span>Quản trị viên</span>
                <span className="text-xs text-slate-400">Quản lý hệ thống</span>
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-500">Thông tin bản quyền</span>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-400">
            &copy; 2024 Learn Assist Project - trkien2510
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;