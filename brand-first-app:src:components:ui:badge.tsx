interface BadgeProps {
 children: React.ReactNode;
 variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
}

export default function Badge({ children, variant = 'primary' }: BadgeProps) {
 const variants = {
   primary: 'bg-brand-600 text-white',
   secondary: 'bg-gray-100 text-gray-700',
   success: 'bg-green-100 text-green-700',
   warning: 'bg-amber-100 text-amber-700',
   error: 'bg-red-100 text-red-700',
 };

 return (
   <span
     className={`
       inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
       ${variants[variant] || variants.primary}
     `}
   >
     {children}
   </span>
 );
}