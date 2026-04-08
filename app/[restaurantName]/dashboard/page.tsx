// app/[restaurantName]/dashboard/page.tsx
'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './components/Sidebar';
import { DashboardContent } from './components/DashboardContent';
import { Restaurant } from '@/types';
import { getRestaurantData } from '@/lib/restaurant-data';
import { Menu , UtensilsCrossed } from 'lucide-react';
import { getRestaurant } from '@/client/helpers/restaurant';

export default function DashboardPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  
  const restaurantName = params.restaurantName as string;
  const activeTab = searchParams.get('tab') || 'main';
  
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        setLoading(true);
        const result = await getRestaurant();
        const data = result?.data
        if(!data) return;
        setRestaurant(data);
        console.log("Fetched restaurant data:", data);
        if (data.primaryColor) {
          document.documentElement.style.setProperty('--restaurant-primary', data.primaryColor);
        }
      } catch (err) {
        console.error('خطأ:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (restaurantName) {
      fetchRestaurant();
    }
  }, [restaurantName]);
  
  // منع التمرير عند فتح القائمة على الموبايل
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [sidebarOpen]);
  
  if (loading) return <LoadingScreen />;
  if (!restaurant) return <ErrorScreen />;
  
  const primaryColor = restaurant.primaryColor || '#f97316';
  
  return (
    <div 
      className="min-h-screen"
      style={{ 
        background: `linear-gradient(135deg, ${primaryColor} 0%, #ffffff 100%)`,
      }}
      dir="rtl"
    >

      {/* تخطيط للشاشات الكبيرة: صف بجانب بعض */}
      <div className="hidden lg:flex min-h-screen relative">
        {/* Sidebar يطفو مع مسافة 10px */}
        <div className="fixed right-0 top-0 h-full z-50" style={{ marginRight: '10px' }}>
          <Sidebar 
            subscriptionType={restaurant.subscriptionType}
            isActive={restaurant.isSubscriptionActive}//هون من المفترض يكون محطوطة دالة ايقاف التشغيل
            restaurant={restaurant}
            onClose={() => setSidebarOpen(false)}
          />
        </div>
        
        {/* المحتوى الرئيسي يأخذ باقي المساحة */}
        <div className="flex-1 min-h-screen" style={{ marginRight: '330px' }}>
          <DashboardContent 
            restaurant={restaurant}
            activeTab={activeTab}
          />
        </div>
      </div>
      
      {/* تخطيط للشاشات الصغيرة والمتوسطة: قائمة منزلقة */}
      <div className="lg:hidden min-h-screen">
        {/* هيدر الموبايل */}
        <MobileHeader 
          restaurant={restaurant}
          onMenuClick={() => setSidebarOpen(true)}
          primaryColor={primaryColor}
        />
        
        {/* المحتوى الرئيسي */}
        <DashboardContent 
          restaurant={restaurant}
          activeTab={activeTab}
        />
        
        {/* القائمة الجانبية المنزلقة */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                onClick={() => setSidebarOpen(false)}
              />
              <div className="fixed inset-y-0 right-0 z-50">
                <Sidebar 
                  subscriptionType={restaurant.subscriptionType}
                  isActive={restaurant.isSubscriptionActive}///هون من المفترض يكون محطوطة دالة ايقاف التشغيل
                  restaurant={restaurant}
                  onClose={() => setSidebarOpen(false)}
                />
              </div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}


export function LoadingScreen() {
  return (
    <div 
      className="min-h-screen flex items-center justify-center relative"
      style={{ backgroundColor: '#1A2A4F' }}
    >
      {/* خلفية بسيطة */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1A2A4F] to-[#0F1A33]" />
      
      {/* المحتوى */}
      <motion.div 
        className="relative z-10 text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* أيقونة دوارة */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="mb-6"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FF8C42] to-[#FF6B2C] flex items-center justify-center shadow-xl">
            <UtensilsCrossed className="w-10 h-10 text-white" />
          </div>
        </motion.div>

        {/* النص المتلاشي */}
        <motion.h1 
          className="text-2xl font-bold text-white"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          GoOrder
        </motion.h1>
        
        <motion.p 
          className="text-gray-400 text-xs mt-3"
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ repeat: Infinity, duration: 1.5, delay: 0.5 }}
        >
          نظام إدارة المطاعم
        </motion.p>
      </motion.div>
    </div>
  );
}

// شاشة خطأ محسنة
function ErrorScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center border border-gray-100">
        {/* أيقونة الخطأ */}
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        {/* العنوان */}
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          عذراً، حدث خطأ
        </h3>
        
        {/* الرسالة */}
        <p className="text-gray-500 mb-6 text-sm">
          لم نتمكن من تحميل بيانات المطعم. يرجى المحاولة مرة أخرى.
        </p>
        
        {/* زر إعادة المحاولة */}
        <button 
          onClick={() => window.location.reload()}
          className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium transition-colors"
        >
          إعادة المحاولة
        </button>
      </div>
    </div>
  );
}

// هيدر الموبايل المحسن
function MobileHeader({ restaurant, onMenuClick, primaryColor }: { 
  restaurant: Restaurant; 
  onMenuClick: () => void;
  primaryColor: string;
}) {
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`
        sticky top-0 z-40 transition-all duration-300
        ${scrolled 
          ? 'bg-white/90 backdrop-blur-md shadow-lg' 
          : 'bg-white/70 backdrop-blur-sm shadow-sm'
        }
      `}
      style={{ borderBottom: `2px solid ${primaryColor}20` }}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={onMenuClick}
          className="relative w-10 h-10 rounded-xl bg-white shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center"
        >
          <Menu className="w-5 h-5 text-gray-700" />
        </motion.button>
        
        <div className="flex items-center gap-3">
          <div className="text-left">
            <h1 className="font-bold text-gray-800 text-sm">
              {restaurant.name}
            </h1>
            <div className="flex items-center gap-1">
              <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${restaurant.isSubscriptionActive ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-xs text-gray-500">
                {restaurant.isSubscriptionActive ? 'نشط' : 'غير نشط'}
              </span>
            </div>
          </div>
          
          {restaurant.logo ? (
            <img 
              src={restaurant.logo} 
              alt={restaurant.name} 
              className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-md"
            />
          ) : (
            <div 
              className="w-9 h-9 rounded-full flex items-center justify-center shadow-md"
              style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)` }}
            >
              <span className="text-white text-sm font-bold">
                {restaurant.name.charAt(0)}
              </span>
            </div>
          )}
        </div>
        
        <div className="w-10" /> {/* مسافة للتوازن */}
      </div>
    </motion.header>
  );
}