// app/[restaurantName]/Dashboard/components/UpgradeDialog.tsx
'use client';

import { useState } from 'react';

interface UpgradeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantId: string;
}

export function UpgradeDialog({ isOpen, onClose, restaurantId }: UpgradeDialogProps) {
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'plus'>('pro');
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6" dir="rtl">
        <h2 className="text-2xl font-bold mb-4">ترقية الاشتراك</h2>
        
        <div className="space-y-3 mb-6">
          <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input 
              type="radio"
              checked={selectedPlan === 'pro'}
              onChange={() => setSelectedPlan('pro')}
              className="ml-3"
            />
            <div className="flex-1">
              <div className="font-bold">باقة Pro</div>
              <div className="text-sm text-gray-600">الصفحات الإعلانية + طلبات التوصيل</div>
              <div className="text-blue-600 font-bold mt-1">$29/شهر</div>
            </div>
          </label>
          
          <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input 
              type="radio"
              checked={selectedPlan === 'plus'}
              onChange={() => setSelectedPlan('plus')}
              className="ml-3"
            />
            <div className="flex-1">
              <div className="font-bold">باقة Plus</div>
              <div className="text-sm text-gray-600">كل الميزات + الإحصائيات والأرباح والموظفين</div>
              <div className="text-blue-600 font-bold mt-1">$59/شهر</div>
            </div>
          </label>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            إلغاء
          </button>
          <button 
            onClick={() => {
              // منطق الترقية
              alert(`تم ترقية الاشتراك إلى ${selectedPlan}`);
              onClose();
            }}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            ترقية الآن
          </button>
        </div>
      </div>
    </div>
  );
}