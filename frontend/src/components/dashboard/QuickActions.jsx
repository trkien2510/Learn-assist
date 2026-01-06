import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRightIcon } from '../icons/Icons';

const QuickActions = ({ actions }) => {
    const navigate = useNavigate();

    return (
        <div className="card-glass">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Điều hướng nhanh</h2>

            <div className="space-y-3">
                {actions.map((action, index) => (
                    <button
                        key={action.name}
                        onClick={() => action.href && navigate(action.href)}
                        className="w-full p-4 rounded-xl border border-gray-200 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all text-left group"
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <p className="font-medium text-gray-900 group-hover:text-blue-400 transition-colors">
                                    {action.name}
                                </p>
                                <p className="text-sm text-gray-500 mt-0.5">
                                    {action.description}
                                </p>
                            </div>
                            <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-400 group-hover:translate-x-1 transition-all shrink-0 ml-4" />
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default QuickActions;
