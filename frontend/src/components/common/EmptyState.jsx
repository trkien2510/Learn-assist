import React from 'react';

const EmptyState = ({
    icon: Icon,
    title,
    description,
    action,
    actionLabel,
    className = ''
}) => {
    return (
        <div className={`card-glass p-12 text-center ${className}`}>
            {Icon && (
                <Icon className="w-16 h-16 mx-auto mb-4 text-slate-600" />
            )}
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {title}
            </h3>
            {description && (
                <p className="text-gray-500 mb-6">{description}</p>
            )}
            {action && actionLabel && (
                <button onClick={action} className="btn-primary">
                    {actionLabel}
                </button>
            )}
        </div>
    );
};

export default EmptyState;
