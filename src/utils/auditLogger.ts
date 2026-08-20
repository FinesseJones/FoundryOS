import React from 'react';
import { toast } from 'react-hot-toast';
import { Clock } from 'lucide-react';

/**
 * Simulates logging a critical event into the centralized Audit Log database.
 * @param module The module where the action occurred (e.g., 'Users', 'Projects').
 * @param actionType The type of action (CREATE, UPDATE, DELETE, etc.).
 * @param details The specific data changed or the context of the action.
 * @param initiator The user who triggered the action.
 */
export const logSystemEvent = (
    module: 'Users' | 'Projects' | 'Leads' | 'Settings',
    actionType: 'CREATE' | 'UPDATE' | 'DELETE' | 'MANUAL',
    details: string,
    initiator: string
): void => {
    // In a real setup, this would be a fetch POST request to a backend API route
    console.log(`[AUDIT LOG TRIGGER]: Logging event for ${module} - ${actionType} by ${initiator} - Details: ${details}`);
    
    // Provide user feedback that the logging occurred
    toast.custom(() => 
        React.createElement(
            'div',
            { className: "p-3 bg-slate-100 border-l-4 border-slate-500 text-sm text-slate-700 flex items-center space-x-2" },
            React.createElement('span', { className: "text-slate-500" }, React.createElement(Clock, { className: "w-4 h-4" })),
            React.createElement('span', null, `✅ Event logged automatically: ${module} ${actionType}.`)
        ),
        { duration: 2000 }
    );
};