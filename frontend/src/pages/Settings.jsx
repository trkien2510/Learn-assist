import React from 'react';
import { SettingsIcon } from '../components/icons/Icons';

const Settings = () => {
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold gradient-text">Cài đặt</h1>
                <p className="text-gray-500 mt-2">Tùy chỉnh hệ thống theo ý bạn</p>
            </div>

            <div className="card-glass p-8">
                <div className="text-center py-12">
                    <SettingsIcon className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Đang phát triển</h3>
                    <p className="text-gray-500">Trang cài đặt sẽ sớm được bổ sung</p>
                </div>
            </div>
        </div>
    );
};

export default Settings;
