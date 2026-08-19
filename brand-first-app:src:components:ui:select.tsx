interface SelectProps {
 label?: string;
 placeholder?: string;
 value: string;
 onChange: (value: string) => void;
 options: { label: string; value: string }[];
 required?: boolean;
 disabled?: boolean;
}

export default function Select({
 label,
 placeholder,
 value,
 onChange,
 options,
 required = false,
 disabled = false,
}: SelectProps) {
 return (
   <div className="flex flex-col gap-1">
     {label && (
       <label className="text-sm font-medium text-gray-700">{label}</label>
     )}
     <select
       value={value}
       onChange={(e) => onChange(e.target.value)}
       disabled={disabled}
       className={`
         px-4 py-2 rounded-lg border border-gray-200
         ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
         ${required ? 'border-brand-300' : ''}
         focus:border-brand-400 focus:ring-1 focus:ring-brand-400
       `}
     >
       {placeholder && (
         <option value="" disabled={false}>
           {placeholder}
         </option>
       )}
       {options.map((opt) => (
         <option key={opt.value} value={opt.value}>
           {opt.label}
         </option>
       ))}
     </select>
   </div>
 );
}