// app/[restaurantName]/dashboard/components/DashboardContent.tsx
'use client';

import { useState } from 'react';
import { Restaurant } from '@/types';
import { MainInfo } from './tabs/MainInfo';
import { TableOrders } from './tabs/TableOrders';
import { PromoPages } from './tabs/PromoPages';
import { DeliveryOrders } from './tabs/DeliveryOrders';
import { MonthlyStats } from './tabs/MonthlyStats';
import { Profits } from './tabs/Profits';
import { Employees } from './tabs/Employees';
import { UpgradeDialog } from './UpgradeDialog';
import { updateRestaurant } from '@/client/helpers/restaurant';

interface DashboardContentProps {
  restaurant: Restaurant;
  activeTab: string;
}

export function DashboardContent({ restaurant, activeTab }: DashboardContentProps) {
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  
  const isTabAllowed = (tabId: string) => {
    const subscription = restaurant.subscriptionType;
    const isActive = restaurant.isSubscriptionActive;
    
    if (!isActive) return tabId === 'main' || tabId === 'orders';
    if (subscription === 'plus') return true;
    if (subscription === 'pro') return !['stats', 'profits', 'employees'].includes(tabId);
    return tabId === 'main' || tabId === 'orders';
  };
  
  if (!isTabAllowed(activeTab)) {
    return (
      <div className="p-4 md:p-8">
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl shadow-sm p-8 md:p-12 text-center max-w-2xl mx-auto">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">ميزة غير متاحة</h3>
          <p className="text-gray-600 mb-6">
            هذه الميزة تتطلب ترقية اشتراكك إلى باقة 
            <span className="font-bold text-primary mx-1">
              {activeTab === 'stats' || activeTab === 'profits' || activeTab === 'employees' ? 'PLUS' : 'PRO'}
            </span>
          </p>
          <button 
            onClick={() => setShowUpgradeDialog(true)}
            className="px-8 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
          >
            ترقية الاشتراك الآن
          </button>
        </div>
        
        <UpgradeDialog 
          isOpen={showUpgradeDialog} 
          onClose={() => setShowUpgradeDialog(false)}
          restaurantId={restaurant.id}
          currentTier={restaurant.subscriptionType}
        />
      </div>
    );
  }
  
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* عنوان الصفحة - يظهر فقط على الشاشات الكبيرة */}
        <div className="hidden lg:block mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            {getTabTitle(activeTab)}
          </h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">
            {getTabDescription(activeTab, restaurant.name)}
          </p>
        </div>
        
        {/* المحتوى */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {activeTab === 'main' && <MainInfo restaurant={restaurant} onUpdateRestaurant={handleUpdateRestaurant} />}
          {activeTab === 'orders' && <TableOrders restaurantId={restaurant.id} />}
          {activeTab === 'promo' && <PromoPages restaurantId={restaurant.id} />}
          {activeTab === 'delivery' && <DeliveryOrders restaurantId={restaurant.id} />}
          {activeTab === 'stats' && <MonthlyStats restaurantId={restaurant.id} />}
          {activeTab === 'profits' && <Profits restaurantId={restaurant.id} />}
          {activeTab === 'employees' && <Employees restaurantId={restaurant.id} />}
        </div>
      </div>
    </div>
  );
}

function getTabTitle(tab: string): string {
  const titles: Record<string, string> = {
    main: 'لوحة المعلومات الرئيسية',
    orders: 'طلبات الطاولات',
    promo: 'الصفحات الإعلانية',
    delivery: 'طلبات التوصيل',
    stats: 'الإحصائيات والتقارير',
    profits: 'تحليل الأرباح',
    employees: 'إدارة فريق العمل'
  };
  return titles[tab] || 'لوحة التحكم';
}

function getTabDescription(tab: string, restaurantName: string): string {
  const descriptions: Record<string, string> = {
    main: `مرحباً بك في لوحة تحكم ${restaurantName} - يمكنك من هنا إدارة جميع بيانات مطعمك`,
    orders: `تتبع وإدارة طلبات الزبائن داخل المطعم في الوقت الفعلي`,
    promo: `أنشئ صفحات دعائية مميزة لكل وجبة وشاركها على وسائل التواصل`,
    delivery: `إدارة طلبات التوصيل الخارجية ومتابعة السائقين`,
    stats: `تحليل أداء مطعمك من خلال إحصائيات دقيقة وشاملة`,
    profits: `تعرف على أرباحك وتكاليفك لتحقيق نمو أفضل`,
    employees: `إدارة موظفينك ومهامهم ورواتبهم بكل سهولة`
  };
  return descriptions[tab] || 'إدارة متكاملة لمطعمك';
}



 const handleUpdateRestaurant = async (data: Partial<Restaurant>) => {
  const result = await updateRestaurant(data);
  if (result.success && result.data) {
    // تحديث بيانات المطعم في الواجهة بعد التعديل
    // يمكنك استخدام state أو context لتحديث البيانات المعروضة
    console.log("Restaurant updated:", result.data);
  } else {
    throw new Error(result.error || "Failed to update restaurant");
    // عرض رسالة خطأ للمستخدم إذا لزم الأمر
  }
 }