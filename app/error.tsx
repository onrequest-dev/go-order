// app/error.tsx
'use client';

import { RefreshCw } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-amber-50 flex items-center justify-center p-4">
      <div className="text-center">
        
        {/* صحن مكسور - تصميم محسن */}
        <div className="relative mb-8">
          <div className="w-72 h-72 mx-auto relative">
            
            {/* ظل الطبق */}
            <div className="absolute inset-0 bg-gray-300 rounded-full blur-xl opacity-40 transform translate-y-3"></div>
            
            {/* الجزء الأيمن من الطبق المكسور (أكبر قطعة) */}
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-40 h-40">
              <div className="w-full h-full bg-white rounded-t-full rounded-br-full shadow-lg border border-gray-200 rotate-12 origin-bottom-left">
                {/* حافة مكسورة خشنة */}
                <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-8 bg-white -skew-y-12"></div>
                <div className="absolute -left-4 top-1/3 transform -translate-y-1/3 w-3 h-6 bg-white -skew-y-6"></div>
              </div>
            </div>
            
            {/* الجزء الأيسر من الطبق المكسور (قطعة أصغر) */}
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-32 h-32">
              <div className="w-full h-full bg-white rounded-t-full rounded-bl-full shadow-lg border border-gray-200 -rotate-12 origin-bottom-right">
                <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-8 bg-white -skew-y-12"></div>
              </div>
            </div>
            
            {/* قطعة صغيرة مكسورة */}
            <div className="absolute left-16 bottom-8 w-12 h-10">
              <div className="w-full h-full bg-white rounded-lg shadow-md border border-gray-200 rotate-45">
              </div>
            </div>
            
            {/* قطعة صغيرة أخرى */}
            <div className="absolute right-12 top-8 w-8 h-7">
              <div className="w-full h-full bg-white rounded-md shadow-md border border-gray-200 -rotate-30">
              </div>
            </div>
            
            {/* فتات صغير */}
            <div className="absolute left-24 top-20 w-3 h-3 bg-white rounded-full shadow-sm"></div>
            <div className="absolute right-20 bottom-16 w-2 h-2 bg-white rounded-full shadow-sm"></div>
            
            {/* خطوط الكسر والشقوق */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <line x1="45%" y1="40%" x2="55%" y2="60%" stroke="#9ca3af" strokeWidth="2" strokeDasharray="3,3" />
              <line x1="50%" y1="35%" x2="50%" y2="65%" stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="2,4" />
              <line x1="40%" y1="50%" x2="60%" y2="45%" stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="2,3" />
            </svg>
            
            {/* نص Error */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-red-500 text-white text-3xl font-bold w-24 h-24 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                Error
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-gray-700 mb-2">
          الطبق تحطم!
        </h2>
        
        <p className="text-gray-500 mb-8">
          حدث خطأ غير متوقع أثناء تحميل الصفحة
        </p>

        <button
          onClick={reset}
          className="px-5 py-2.5   text-orange-500 rounded-lg font-medium transition-all inline-flex items-center gap-2"
        >
          <RefreshCw className="w-12 h-12" />
        </button>
        
        <p className="text-gray-400 text-xs mt-8">
          GoOrder 
        </p>
        <p className="text-gray-400 text-xs mt-8">
            by onRequst
        </p>
      </div>
    </div>
  );
}