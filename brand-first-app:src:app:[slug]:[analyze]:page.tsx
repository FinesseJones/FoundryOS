import 'globals.css';
import { BrandUpload } from '../../components/BrandUpload';
import { Card } from '../../components/ui/card';

export default function AnalyzePage() {
 return (
   <div className="min-h-screen p-4 md:p-6 bg-warm-100">
     <div className="max-w-3xl mx-auto">
       <Card className="p-6">
         <h1 className="text-3xl font-bold text-gray-900 mb-2">
           Brand Analysis
         </h1>
         <p className="text-gray-500 text-sm mb-6">
           Upload your website URL and any content to get a full brand personality breakdown.
         </p>
         <BrandUpload />
       </Card>
     </div>
   </div>
 );
}