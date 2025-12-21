import React from 'react';

const StatsCard = ({ stat, index }) => {
    const IconComponent = stat.icon;

    return (
        <div
            className="card-glass group cursor-pointer transform hover:scale-105 transition-all duration-300"
            style={{ animationDelay: `${index * 100}ms` }}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-gray-500 text-sm font-medium">{stat.name}</p>
                    <p className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
                        {stat.value}
                    </p>
                    {stat.change && (
                        <p className={`text-xs mt-3 flex items-center gap-1 ${stat.change.startsWith('+') || stat.change.startsWith('↑')
                                ? 'text-green-400'
                                : stat.change.startsWith('-') || stat.change.startsWith('↓')
                                    ? 'text-red-400'
                                    : 'text-gray-400'
                            }`}>
                            <span className="font-semibold">{stat.change}</span>
                            {stat.changeText || 'so với tháng trước'}
                        </p>
                    )}
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                    {IconComponent && <IconComponent className="w-6 h-6 text-gray-900" />}
                </div>
            </div>

            {stat.subtitle && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500">{stat.subtitle}</p>
                </div>
            )}
        </div>
    );
};

export default StatsCard;
