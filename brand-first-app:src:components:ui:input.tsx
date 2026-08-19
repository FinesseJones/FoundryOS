interface InputProps {
 label?: string;
 placeholder?: string;
 value?: string;
 onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
 error?: string;
 required?: boolean;
 disabled?: boolean;
 type?: 'text' | 'email' | 'password' | 'textarea';
}

export default function Input({
 label,
 placeholder,
 value = '',
 onChange,
 error,
 required = false,
 disabled = false,
 type = 'text',
}: InputProps) {
 const inputType = type === 'textarea' ? 'textarea' : 'input';
 return (
   <div className="flex flex-col gap-1">
     {label && (
       <label className="text-sm font-medium text-gray-700">{label}</label>
     )}
     <div className="relative">
       <input
         type={inputType}
         className={`
           px-4 py-2 rounded-lg border border-gray-200
           ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
           ${error ? 'border-red-300 focus:border-red-400' : 'focus:border-brand-400 focus:ring-1 focus:ring-brand-400'}
           ${inputType === 'textarea' ? 'min-h-32' : ''}
         `}
         placeholder={placeholder}
         value={value}
         onChange={onChange}
         disabled={disabled}
         required={required}
       />
       {error && (
         <p className="text-xs text-red-500 mt-1">{error}</p>
       )}
     </div>
   </div>
 );
}