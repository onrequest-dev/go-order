// app/[restaurantName]/dashboard/components/tabs/TableOrders.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChefHat, 
  Receipt, 
  Clock, 
  CheckCircle, 
  CookingPot, 
  CircleDollarSign,
  Printer,
  ChevronRight,
  Package,
  Utensils,
  Zap,
  Timer,
  Loader2
} from 'lucide-react';

// استيراد المكونات
import PendingOrdersPage from './order/PendingOrder';
import ReadyOrdersPage from './order/ReadyOrder';
import { Restaurant } from '@/types'; // استيراد نوع Restaurant

interface TableOrdersProps {
  restaurant: Restaurant;  // تغيير من restaurantId إلى restaurant كامل
}

type TabType = 'kitchen' | 'cashier';

// بيانات تجريبية للطلبات (للقيد التنفيذ فقط)
const mockOrders = [
  { id: '1', tableNumber: 5, items: 3, total: 45.5, time: 'منذ 5 دقائق', status: 'pending', itemsList: ['شاورما', 'بطاطا', 'كولا'] },
  { id: '2', tableNumber: 8, items: 2, total: 32.0, time: 'منذ 12 دقيقة', status: 'preparing', itemsList: ['بيتزا', 'عصير'] },
  { id: '3', tableNumber: 3, items: 4, total: 67.5, time: 'منذ 20 دقيقة', status: 'ready', itemsList: ['برجر', 'بطاطا', 'سلطة', 'ماء'] },
  { id: '4', tableNumber: 2, items: 2, total: 28.0, time: 'منذ 2 دقيقة', status: 'pending', itemsList: ['فطيرة', 'شاي'] },
];

export function TableOrders({ restaurant }: TableOrdersProps) {
  const [activeTab, setActiveTab] = useState<TabType>('kitchen');
  const [orders, setOrders] = useState(mockOrders);
  const [loading, setLoading] = useState(false);

  // استخراج القيم من بيانات المطعم
  const primaryColor = restaurant.primaryColor || '#f97316';
  const restaurantId = restaurant.id;

  // تصفية الطلبات
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const preparingOrders = orders.filter(o => o.status === 'preparing');
  const readyOrders = orders.filter(o => o.status === 'ready');

  // تحديث حالة الطلب
  const updateOrderStatus = (orderId: string, newStatus: string) => {
    setLoading(true);
    setTimeout(() => {
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      setLoading(false);
    }, 300);
  };

  // متغيرات الأنيميشن
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        duration: 0.3
      }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    },
    exit: { 
      opacity: 0, 
      x: -100,
      transition: { duration: 0.2 }
    }
  };

  // عرض تبويب المطبخ
  const renderKitchenTab = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-8"
    >
      {/* الطلبات الجديدة - استخدام PendingOrdersPage */}
      <div>
        <motion.div 
          className="flex items-center justify-between mb-4"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
        </motion.div>
        <PendingOrdersPage 
          primaryColor={primaryColor} 
        />
      </div>
    </motion.div>
  );

  // عرض تبويب الكاشير - استخدام ReadyOrdersPage
  const renderCashierTab = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-6"
    >
      <ReadyOrdersPage 
        restaurant={restaurant}  // تمرير كامل بيانات المطعم
      />
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto p-6 md:p-8">
        {/* التبويبات */}
        <div className="flex justify-center mb-2">
          <div className="bg-gray-100 rounded-2xl p-1 inline-flex gap-1">
            <motion.button
              onClick={() => setActiveTab('kitchen')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'kitchen' 
                  ? 'bg-primary text-white shadow-lg' 
                  : 'text-gray-700 hover:text-gray-900'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={activeTab === 'kitchen' ? { backgroundColor: primaryColor } : {}}
            >
              <ChefHat className="w-4 h-4" />
              المطبخ
            </motion.button>
            
            <motion.button
              onClick={() => setActiveTab('cashier')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'cashier' 
                  ? 'bg-primary text-white shadow-lg' 
                  : 'text-gray-700 hover:text-gray-900'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={activeTab === 'cashier' ? { backgroundColor: primaryColor } : {}}
            >
              <Receipt className="w-4 h-4" />
              الكاشير
            </motion.button>
          </div>
        </div>

        {/* محتوى التبويب النشط */}
        <div className="mt-1">
          <AnimatePresence mode="wait">
            {activeTab === 'kitchen' ? renderKitchenTab() : renderCashierTab()}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}