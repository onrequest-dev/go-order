// app/[restaurantName]/dashboard/page.tsx
'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './components/Sidebar';
import { DashboardContent } from './components/DashboardContent';
import { Restaurant } from '@/types';
import { getRestaurantData } from '@/lib/restaurant-data';
import { Menu } from 'lucide-react';

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
        const data = await getRestaurantData(restaurantName);
        setRestaurant(data);
        
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
            isActive={restaurant.isSubscriptionActive}
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
                  isActive={restaurant.isSubscriptionActive}
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

// شاشة تحميل متطورة


export function LoadingScreen() {
  return (
    <div 
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: '#1A2A4F' }}
    >
      {/* خلفية متحركة - دوائر متداخلة */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full"
          style={{ backgroundColor: '#FF8C42', opacity: 0.05 }}
          animate={{ 
            scale: [1, 1.5, 1],
            x: [0, -50, 0],
            y: [0, 50, 0]
          }}
          transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full"
          style={{ backgroundColor: '#FF8C42', opacity: 0.03 }}
          animate={{ 
            scale: [1.5, 1, 1.5],
            x: [0, 50, 0],
            y: [0, -50, 0]
          }}
          transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{ 
            background: 'radial-gradient(circle, rgba(255,140,66,0.08) 0%, transparent 70%)'
          }}
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        />
      </div>

      {/* المحتوى الرئيسي */}
      <div className="relative z-10 text-center">
        {/* اللوغو المتحرك */}
        <motion.div 
          className="relative mb-8"
          animate={{ 
            scale: [1, 1.05, 1],
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 2,
            ease: "easeInOut"
          }}
        >
          {/* الخلفية المتوهجة */}
          <motion.div 
            className="absolute inset-0 rounded-2xl blur-2xl"
            style={{ backgroundColor: '#FF8C42', opacity: 0.3 }}
            animate={{ 
              scale: [0.9, 1.1, 0.9],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />

          {/* اللوغو الأساسي */}
          <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-3">
              {/* حرف G */}
              <div className="relative">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#FF8C42] to-[#FF6B2C] flex items-center justify-center shadow-lg">
                  <span className="text-3xl font-bold text-white">G</span>
                </div>
                {/* الانعطاف */}
                <motion.div 
                  className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-0.5 bg-gradient-to-r from-[#FF8C42] to-transparent"
                  animate={{ width: ['0px', '24px', '0px'] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: 0.5 }}
                />
              </div>

              {/* حرف O */}
              <div className="relative">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#FF8C42] to-[#FF6B2C] flex items-center justify-center shadow-lg">
                  <span className="text-3xl font-bold text-white">O</span>
                </div>
                {/* السهم المخترق */}
                <motion.div 
                  className="absolute -left-3 top-1/2 -translate-y-1/2"
                  animate={{ x: [-10, 0, -10] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <div className="w-3 h-3 border-t-2 border-r-2 border-[#FF8C42] rotate-45" />
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* اسم الشركة */}
        <motion.h1 
          className="text-4xl font-bold mb-2 tracking-tight"
          style={{ 
            background: 'linear-gradient(135deg, #FF8C42 0%, #FF6B2C 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          GoOrder
        </motion.h1>

        {/* النص التحتي */}
        <motion.p 
          className="text-gray-400 text-sm mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          نظام إدارة المطاعم الذكي
        </motion.p>

        {/* شريط التحميل */}
        <div className="w-48 mx-auto mb-4">
          <div className="h-0.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              className="h-full rounded-full"
              style={{ backgroundColor: '#FF8C42' }}
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </div>

        {/* نص التحميل */}
        <motion.div 
          className="flex items-center justify-center gap-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <span className="text-gray-400 text-sm">جاري التحميل</span>
          <motion.span
            className="text-[#FF8C42] text-sm"
            animate={{ opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, delay: 0 }}
          >.</motion.span>
          <motion.span
            className="text-[#FF8C42] text-sm"
            animate={{ opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, delay: 0.3 }}
          >.</motion.span>
          <motion.span
            className="text-[#FF8C42] text-sm"
            animate={{ opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, delay: 0.6 }}
          >.</motion.span>
        </motion.div>

        {/* دوائر تحميل صغيرة */}
        <div className="flex justify-center gap-2 mt-6">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: '#FF8C42' }}
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 1,
                delay: i * 0.2
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// شاشة خطأ محسنة
function ErrorScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="relative">
        <div className="absolute inset-0 bg-red-500/10 rounded-3xl blur-xl" />
        <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 max-w-md text-center border border-gray-100">
          <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">عذراً!</h3>
          <p className="text-gray-600 mb-6">حدث خطأ في تحميل بيانات المطعم</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            إعادة المحاولة
          </button>
        </div>
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