"use client";

import React, { ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';

/**
 * Component that must wrap the entire application component tree 
 * to ensure global access to the toast notification system.
 * @param children The children elements that consume the toast context.
 */
const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    return (
        <React.Fragment>
            {children}
            <Toaster position="bottom-right" />
        </React.Fragment>
    );
};

export default ToastProvider;