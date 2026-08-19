import { Children } from 'react';

interface ButtonProps {
 children: React.ReactNode;
 variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
 size?: 'sm' | 'md' | 'lg';
 disabled?: boolean;
 onClick?: (e: React.MouseEvent) => void;
 loading?: boolean;
 fullWidth?: boolean;
}

export default function Button({
 children,
 variant = 'primary',
 size = 'md',
 disabled = false,
 onClick,
 loading = false,
 fullWidth = false,
}: ButtonProps) {
 const variants = {
   primary: {
     bg: 'bg-brand-600',
     text: 'text-white',
     hover: 'hover:bg-brand-700',
     disabledBg: 'bg-brand-400',
     disabledText: 'text-brand-950',
   },
   secondary: {
     bg: 'bg-gray-100',
     text: 'text-gray-900',
     hover: 'hover:bg-gray-200',
     disabledBg: 'bg-gray-200',
     disabledText: 'text-gray-500',
   },
   outline: {
     bg: 'bg-transparent',
     text: 'text-brand-600',
     hover: 'hover:bg-brand-50',
     disabledBg: 'bg-white',
     disabledText: 'text-gray-400',
   },
   ghost: {
     bg: 'bg-transparent',
     text: 'text-gray-500',
     hover: 'hover:text-brand-600',
     disabledBg: 'bg-white',
     disabledText: 'text-gray-400',
   },
 };

 const v = variants[variant];
 const baseClasses = [
   'font-sans font-medium rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-600/20',
   variant === 'outline' ? 'border border-brand-300' : '',
   disabled ? 'cursor-not-allowed' : '',
   fullWidth ? 'w-full' : '',
   size === 'sm' ? 'py-1 px-3 text-sm' : size === 'lg' ? 'py-2 px-6 text-base' : 'py-2 px-5 text-sm',
 ];
 const focusClasses = [
   disabled ? 'focus:bg-gray-100 focus:border-gray-200' : 'focus:bg-brand-600 focus:text-white focus:border-brand-600',
 ];
 const disabledClasses = [
   disabled ? 'opacity-50' : '',
 ];
 const baseClasses = variants[variant].bg;
 const disabledClasses = variants[variant].disabledBg;
 const baseClasses = variants[variant].disabledText;
 const baseClasses = variants[variant].disabledBg;
 const focusClasses = disabled ? 'focus:bg-gray-100 focus:border-gray-200' : 'focus:bg-brand-600 focus:text-white focus:border-brand-600';
 const disabledClasses = disabled ? 'opacity-50' : '';

 return (
   <button
     className={[
       'inline-flex items-center justify-center transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
       baseClasses,
       disabled ? 'opacity-50 cursor-not-allowed' : '',
       size === 'sm' ? 'py-1 px-3 text-sm' : size === 'lg' ? 'py-2 px-6 text-base' : 'py-2 px-5 text-sm',
       focusClasses.join(' '),
       disabledClasses.join(' '),
       fullWidth ? 'w-full' : '',
     ].join(' ')}
     disabled={disabled || loading}
     onClick={onClick}
   >
     {loading ? (
       <span className="inline-flex items-center gap-2">
         {children}
         <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="32" strokeDashoffset="8" />
           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
         </svg>
       </span>
     ) : (
       <span>{children}</span>
     )}
   </button>
 );
}