export default function LoadingLoader() {
 return (
   <div className="flex items-center justify-center min-h-screen">
     <div className="animate-pulse flex items-center gap-3">
       <div className="w-8 h-8 rounded-full bg-brand-200 animate-pulse" />
       <span className="text-gray-600">Analyzing brand...</span>
     </div>
   </div>
 );
}