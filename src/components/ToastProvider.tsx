"use client";

import React, { ReactNode, createContext, useContext } from 'react';
import { Toaster } from 'react-hot-toast';
import { useState, useCallback } from 'react';

// Define the structure for the toast context
interface ToastContextType {
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showLoadingStart: (message: string, duration?: number) => Promise<string>;
  dismissToast: (toastId: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toastId, setToastId] = useState<string | null>(null);

  const showSuccess = useCallback((message: string, duration: number = 3000) => {
    toast.success(message, { duration });
  }, []);

  const showError = useCallback((message: string, duration: number = 5000) => {
    toast.error(message, { duration });
  }, []);

  const showLoadingStart = useCallback((message: string, duration: number = 2500) => {
    const id = toast.loading(message, { duration });
    setToastId(id);
    return Promise.resolve(id);
  }, []);

  const dismissToast = useCallback((id: string) => {
    toast.dismiss(id);
    setToastId(null);
  }, []);


  const contextValue = {
    showSuccess,
    showError,
    showLoadingStart,
    dismissToast,
  }

  return (
    <ToastContext.Provider value={contextValue}>
        <Toaster />
        {children}
    </ToastContext.Provider>
  );
};

export default ToastProvider;