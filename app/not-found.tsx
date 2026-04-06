// app/not-found.tsx
import Link from 'next/link';
import { Utensils, UtensilsCrossed, Beef, Soup } from 'lucide-react';
export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
      <div className="text-center">
        
        {/* طبق فارغ مع أدوات */}
        <div className="relative mb-8">
          <div className="w-64 h-64 mx-auto relative">
            {/* ظل الطبق */}
            <div className="absolute inset-0 bg-gray-200 rounded-full blur-xl opacity-50 transform translate-y-2"></div>
            
            {/* الطبق */}
            <div className="absolute inset-0 bg-white rounded-full shadow-lg border border-gray-200"></div>
            <div className="absolute inset-4 bg-gray-50 rounded-full border border-gray-100"></div>
            <div className="absolute inset-8 bg-white rounded-full"></div>
            
            {/* نص 404 على الطبق */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-5xl font-bold text-gray-400">404</span>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-gray-700 mb-2">
          الطبق فارغ!
        </h2>
        
        <p className="text-gray-500 mb-60">
          الصفحة التي تبحث عنها غير موجودة في قائمتنا 
        </p>
        <p className="text-gray-500 mb-6">
          GoOrder
        </p>
        <p className="text-gray-500 mb-3">
          by onRequest
        </p>
      </div>
    </div>
  );
}