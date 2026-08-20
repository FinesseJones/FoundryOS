"use client";

import React from 'react';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="w-full">
            {children}
        </div>
    );
};

export default AppLayout;