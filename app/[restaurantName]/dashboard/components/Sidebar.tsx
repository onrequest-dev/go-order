// app/[restaurantName]/dashboard/components/Sidebar.tsx
'use client';

import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { 
  Home, 
  ClipboardList, 
  Megaphone, 
  Truck, 
  BarChart3, 
  TrendingUp, 
  Users, 
  Lock,
  LogOut,
  Settings,
  X,
  Crown
} from 'lucide-react';
import { Restaurant, getAvailableTabs, SubscriptionTier } from '@/types';

interface SidebarProps {
  subscriptionType: string;
  isActive: boolean;
  restaurant: Restaurant;
  onClose: () => void;
}

// تعيين الأيقونات لكل تبويب
const iconMap = {
  'Home': Home,
  'Orders': ClipboardList,
  'Promo': Megaphone,
  'Delivery': Truck,
  'Stats': BarChart3,
  'Profits': TrendingUp,
  'Employees': Users,
};

// ألوان الباقات
const tierColors = {
  Normal: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' },
  pro: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  plus: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
};

export function Sidebar({ subscriptionType, isActive, restaurant, onClose }: SidebarProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentTab = searchParams.get('tab') || 'main';
  const [isMobile, setIsMobile] = useState(false);
  
  // التحقق من حجم الشاشة
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const tabs = getAvailableTabs(subscriptionType as SubscriptionTier, isActive);
  const primaryColor = restaurant.primaryColor || '#f97316';
  
  const getTabClass = (tabPath: string) => {
    const isActiveTab = currentTab === tabPath;
    return `
      relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
      ${isActiveTab 
        ? 'text-white shadow-lg' 
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
      }
    `;
  };
  
  const handleNavigation = (tabPath: string, e: React.MouseEvent) => {
    e.preventDefault();
    router.push(`?tab=${tabPath}`);
    if (isMobile) {
      onClose();
    }
  };
  
  return (
    <>
      <style jsx global>{`
        /* تحسينات للهاتف المحمول */
        @media (max-width: 1024px) {
          .sidebar-mobile {
            touch-action: pan-y pinch-zoom;
          }
          
          button, a, [role="button"] {
            cursor: pointer;
            -webkit-tap-highlight-color: transparent;
            touch-action: manipulation;
          }
          
          /* تحسين سرعة الحركات على الهواتف */
          .transform-gpu {
            transform: translateZ(0);
            backface-visibility: hidden;
            perspective: 1000px;
          }
        }
        
        /* إخفاء شريط التمرير مع الحفاظ على الوظيفة */
        .hide-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      
      <motion.div 
        initial={{ x: isMobile ? '100%' : 0 }}
        animate={{ x: 0 }}
        exit={{ x: isMobile ? '100%' : 0 }}
        transition={{ 
          type: 'spring', 
          damping: 25, 
          stiffness: 320,
          mass: 0.8
        }}
        className={`
          relative h-full w-80 md:w-80 lg:w-80 bg-white shadow-2xl flex flex-col 
          overflow-y-auto overflow-x-hidden lg:rounded-3xl hide-scrollbar
          ${isMobile ? 'transform-gpu' : ''}
        `}
        style={{ 
          borderRadius: isMobile ? '1.5rem' : '2rem',
          margin: isMobile ? '0' : '10px',
          height: isMobile ? '100%' : 'calc(100% - 20px)',
        }}
      >
        {/* زر إغلاق للشاشات الصغيرة */}
        <motion.div 
          className="lg:hidden absolute top-4 left-4 z-20"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <button 
            onClick={onClose}
            className="p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:bg-white transition-all duration-200"
            aria-label="إغلاق القائمة"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>
        </motion.div>
        
        {/* رأس الـ Sidebar */}
        <div 
          className="relative pt-8 pb-6 px-6 border-b"
          style={{ 
            background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)`,
            borderTopLeftRadius: isMobile ? '1.5rem' : '2rem',
            borderTopRightRadius: isMobile ? '1.5rem' : '2rem',
          }}
        >
          {/* خلفية زخرفية خفيفة */}
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
          </div>
          
          {/* شعار المطعم */}
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', delay: 0.1, damping: 15 }}
            className="flex justify-center mb-4 relative"
          >
            <div className="relative">
              <div 
                className="absolute inset-0 rounded-2xl blur-xl opacity-30"
                style={{ background: primaryColor }}
              />
              {restaurant.logo ? (
                <img 
                  src={restaurant.logo} 
                  alt={restaurant.name} 
                  className="relative w-20 h-20 rounded-2xl object-cover shadow-xl border-4 border-white/90"
                  loading="lazy"
                />
              ) : (
                <div 
                  className="relative w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl border border-white/30"
                >
                  <span className="text-3xl font-bold text-white">
                    {restaurant.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
          
          {/* اسم المطعم */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="text-center relative"
          >
            <h2 className="text-xl font-bold text-white truncate px-2">
              {restaurant.name}
            </h2>
            <div className="flex items-center justify-center gap-2 mt-1">
              <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-400' : 'bg-red-400'}`}>
                {isActive && (
                  <span className="absolute w-2 h-2 rounded-full bg-green-400 animate-ping opacity-75" />
                )}
              </div>
              <span className="text-xs text-white/80">
                {isActive ? 'نشط' : 'غير نشط'}
              </span>
            </div>
          </motion.div>
          
          {/* بطاقة الاشتراك */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-4 p-3 bg-white/15 backdrop-blur-md rounded-xl border border-white/20"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-white/70">الباقة الحالية</span>
              <span className={`
                text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1
                ${tierColors[subscriptionType as keyof typeof tierColors]?.bg || 'bg-gray-100'} 
                ${tierColors[subscriptionType as keyof typeof tierColors]?.text || 'text-gray-700'}
              `}>
                <Crown className="w-3 h-3" />
                {subscriptionType === 'plus' ? 'باقة بلس' : 
                 subscriptionType === 'pro' ? 'باقة برو' : 'باقة عادية'}
              </span>
            </div>
            
            {restaurant.subscriptionExpiryDate && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-white/60">ينتهي في</span>
                <span className="text-white font-medium">
                  {new Date(restaurant.subscriptionExpiryDate).toLocaleDateString('ar')}
                </span>
              </div>
            )}
          </motion.div>
        </div>
        
        {/* قائمة التبويبات */}
        <nav className="flex-1 p-4 space-y-1.5">
          <AnimatePresence>
            {tabs.map((tab, index) => {
              const IconComponent = iconMap[tab.iconName as keyof typeof iconMap];
              const isLocked = !tab.isEnabled;
              const isActiveTab = currentTab === tab.path;
              
              return (
                <motion.div
                  key={tab.id}
                  initial={{ x: 30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  whileHover={!isMobile ? { scale: 1.02, x: -5 } : {}}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    href={`?tab=${tab.path}`}
                    onClick={(e) => handleNavigation(tab.path, e)}
                    className={getTabClass(tab.path)}
                    style={{
                      background: isActiveTab 
                        ? `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}cc 100%)`
                        : 'transparent'
                    }}
                  >
                    {IconComponent && (
                      <IconComponent 
                        className={`w-5 h-5 transition-all duration-300 ${
                          isActiveTab ? 'text-white' : 'text-gray-500'
                        }`}
                      />
                    )}
                    <span className={`flex-1 font-medium text-right ${isActiveTab ? 'text-white' : ''}`}>
                      {tab.name}
                    </span>
                    
                    {isLocked && (
                      <motion.div 
                        className="relative"
                        whileHover={{ scale: 1.1 }}
                      >
                        <Lock className="w-4 h-4 text-gray-400" />
                      </motion.div>
                    )}
                    
                    {/* مؤشر التبويب النشط */}
                    {isActiveTab && (
                      <motion.div 
                        layoutId="activeTab"
                        className="absolute right-0 w-1 h-8 bg-white rounded-l-full"
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </nav>
        
        {/* footer مع إجراءات سريعة */}
        <div className="p-4 border-t border-gray-100 space-y-2">
          <motion.button 
            whileHover={!isMobile ? { scale: 1.02, x: -5 } : {}}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 transition-all duration-200 group"
          >
            <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            <span className="font-medium">الإعدادات</span>
          </motion.button>
          
          <motion.button 
            whileHover={!isMobile ? { scale: 1.02, x: -5 } : {}}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200 group"
          >
            <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            <span className="font-medium">تسجيل الخروج</span>
          </motion.button>
        </div>
        
        {/* شريط السحب للإغلاق على الهواتف */}
        {isMobile && (
          <div 
            className="absolute top-0 left-0 right-0 h-8 bg-transparent cursor-grab active:cursor-grabbing"
            onTouchStart={(e) => {
              const startX = e.touches[0].clientX;
              const handleTouchMove = (moveEvent: TouchEvent) => {
                const deltaX = moveEvent.touches[0].clientX - startX;
                if (deltaX > 50) onClose();
              };
              document.addEventListener('touchmove', handleTouchMove);
              document.addEventListener('touchend', () => {
                document.removeEventListener('touchmove', handleTouchMove);
              }, { once: true });
            }}
          />
        )}
      </motion.div>
    </>
  );
}