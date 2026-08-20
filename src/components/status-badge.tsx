"use client";

import React from 'react';

interface StatusBadgeProps {
    status: 'Active' | 'In Progress' | 'Suspended' | 'Qualified' | 'Cold' | 'High' | 'Medium' | 'Low' | string;
    variant?: 'primary' | 'secondary' | 'destructive';
    children: React.ReactNode;
}

const getBadgeClasses = (status: string, variant?: 'primary' | 'secondary' | 'destructive'): { className: string; text: string } => {
    switch (status) {
        case 'Active':
        case 'Qualified':
            return { className: 'bg-green-100 text-green-800 border-green-300', text: 'Active' };
        case 'In Progress':
        case 'Needs Follow-up':
            return { className: 'bg-yellow-100 text-yellow-800 border-yellow-300', text: 'In Progress' };
        case 'Suspended':
        case 'Cold':
            return { className: 'bg-gray-100 text-gray-600 border-gray-300', text: 'Inactive' };
        case 'High':
            return { className: 'bg-red-100 text-red-800 border-red-300', text: 'High Priority' };
        case 'Medium':
            return { className: 'bg-yellow-100 text-yellow-800 border-yellow-300', text: 'Medium Priority' };
        case 'Low':
            return { className: 'bg-blue-100 text-blue-800 border-blue-300', text: 'Low Priority' };
        default:
            return { className: 'bg-gray-100 text-gray-600 border-gray-300', text: status };
    }
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, variant = 'primary', children }) => {
    const { className, text } = getBadgeClasses(status, variant);

    return (
        <span className={`inline-flex items-center rounded-full px-3 py-0.5 text-sm font-medium border ${className}`}>
            {typeof children === 'string' ? children : children}
        </span>
    );
};

export default StatusBadge;