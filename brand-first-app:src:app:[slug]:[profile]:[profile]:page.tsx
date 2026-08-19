import 'globals.css';
import { BrandProfileView } from '../../components/BrandProfileView';

export default function ProfilePage() {
 return (
   <div className="min-h-screen p-4 md:p-6 bg-warm-100">
     <div className="max-w-4xl mx-auto">
       <Card className="p-6">
         <h1 className="text-3xl font-bold text-gray-900 mb-2">
           Brand Profile
         </h1>
         <p className="text-gray-500 text-sm mb-6">
           View your brand analysis and generated content strategy.
         </p>
         <BrandProfileView />
       </Card>
     </div>
   </div>
 );
}