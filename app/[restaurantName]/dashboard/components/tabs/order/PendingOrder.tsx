// app/[restaurantName]/dashboard/components/tabs/order/PendingOrder.tsx
'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChefHat, 
  Clock, 
  CookingPot, 
  CheckCircle, 
  Volume2, 
  VolumeX,
  AlertCircle,
  Trash2,
  Utensils,
  Timer,
  Bell,
  BellRing,
  Loader2,
  Send,
  Ban,
  RefreshCw
} from 'lucide-react';
import { getPendingOrders, updateOrderStatus } from '@/client/helpers/dashboard';
import { Order } from '@/types';
import { useWebPush } from '@/hooks/useWebPush';

interface PendingOrdersPageProps {
  primaryColor?: string;
}

interface PreparingOrder extends Order {
  startedAt: Date;
  estimatedTime: number;
}

export default function PendingOrdersPage({ primaryColor = '#f97316' }: PendingOrdersPageProps) {
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [preparingOrders, setPreparingOrders] = useState<PreparingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  
  // متغيرات للتحكم في الصوت ومنع التكرار
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastNotifiedOrderIdsRef = useRef<Set<string>>(new Set());
  const isFirstLoadRef = useRef<boolean>(true);
  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isPlayingSoundRef = useRef<boolean>(false);
  
  // تخزين الـ IDs الحالية للطلبات
  const currentOrderIdsRef = useRef<Set<string>>(new Set());

  // تحميل الطلبات قيد التحضير من localStorage
  useEffect(() => {
    loadPreparingOrdersFromStorage();
  }, []);

  // حفظ الطلبات قيد التحضير في localStorage
  useEffect(() => {
    if (preparingOrders.length > 0) {
      localStorage.setItem('preparingOrders', JSON.stringify(preparingOrders));
    } else {
      localStorage.removeItem('preparingOrders');
    }
  }, [preparingOrders]);

  const loadPreparingOrdersFromStorage = () => {
    const saved = localStorage.getItem('preparingOrders');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPreparingOrders(parsed.map((order: any) => ({
          ...order,
          startedAt: new Date(order.startedAt),
        })));
      } catch (e) {
        console.error('Failed to load preparing orders:', e);
      }
    }
  };

  // تشغيل صوت الإشعار - مع منع التكرار
  const playNotificationSound = useCallback(() => {
    if (isMuted) return;
    if (isPlayingSoundRef.current) {
      console.log('صوت قيد التشغيل، تم تجاهل الطلب');
      return;
    }
    
    isPlayingSoundRef.current = true;
    
    if (!audioRef.current) {
      audioRef.current = new Audio('/sound/Ok-pending.mp3');
      audioRef.current.load();
    }
    
    audioRef.current.currentTime = 0;
    
    const playPromise = audioRef.current.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log('تم تشغيل الصوت بنجاح');
          // إعادة تعيين العلم بعد انتهاء الصوت
          setTimeout(() => {
            isPlayingSoundRef.current = false;
          }, 2000); // 2 ثانية كحد أقصى لمنع التكرار
        })
        .catch(error => {
          console.log('فشل تشغيل الصوت:', error);
          isPlayingSoundRef.current = false;
        });
    }
    
    // timeout أمان لإعادة تعيين العلم في حالة تعطل الصوت
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    notificationTimeoutRef.current = setTimeout(() => {
      isPlayingSoundRef.current = false;
    }, 3000);
  }, [isMuted]);

  // دالة للتحقق من الطلبات الجديدة وتشغيل الصوت
  const checkAndNotifyNewOrders = useCallback((newOrders: Order[]) => {
    if (newOrders.length === 0) return;
    
    // تصفية الطلبات التي لم يتم الإشعار بها بعد
    const trulyNewOrders = newOrders.filter(order => !lastNotifiedOrderIdsRef.current.has(order.id));
    
    if (trulyNewOrders.length > 0 && !isMuted && !isFirstLoadRef.current) {
      console.log(`تم اكتشاف ${trulyNewOrders.length} طلب جديد، سيتم تشغيل الصوت`);
      
      // إضافة IDs الطلبات الجديدة إلى مجموعة المبلغ عنها
      trulyNewOrders.forEach(order => {
        lastNotifiedOrderIdsRef.current.add(order.id);
      });
      
      // تشغيل الصوت
      playNotificationSound();
    }
    
    // تنظيف مجموعة IDs القديمة (احتفظ فقط بآخر 50 طلب)
    if (lastNotifiedOrderIdsRef.current.size > 50) {
      const idsArray = Array.from(lastNotifiedOrderIdsRef.current);
      const recentIds = idsArray.slice(-30);
      lastNotifiedOrderIdsRef.current = new Set(recentIds);
    }
  }, [isMuted, playNotificationSound]);

  const fetchOrders = useCallback(async () => {
    try {
      setError(null);
      
      const result = await getPendingOrders();
      console.log('Pending orders result:', result);
      
      if (!result) {
        throw new Error('لم يتم استلام رد من الخادم');
      }
      
      if (result.success && result.data) {
        const dataArray = Array.isArray(result.data) ? result.data : [];
        
        const formattedOrders: Order[] = dataArray.map((item: any) => ({
          id: item.id || `temp-${Date.now()}`,
          tableNumber: item.tableNumber || 0,
          totalPrice: item.totalPrice || 0,
          status: item.status || 'pending',
          orderType: item.orderType || 'dine_in',
          createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
          customerName: item.customerName || '',
          customerPhone: item.customerPhone || '',
          deliveryAddress: item.deliveryAddress || '',
          restaurantId: item.restaurantId || '',
          note: item.note || '',
          modified_at: item.modified_at ? new Date(item.modified_at) : undefined,
          items: Array.isArray(item.items) ? item.items : []
        }));
        
        // الحصول على IDs الطلبات الحالية من الـ API
        const newOrderIds = new Set(formattedOrders.map(order => order.id));
        
        // العثور على الطلبات الجديدة (الموجودة في API ولكن غير الموجودة في التخزين الحالي)
        const newOrders = formattedOrders.filter(order => !currentOrderIdsRef.current.has(order.id));
        
        // تحديث مرجع الـ IDs الحالية
        currentOrderIdsRef.current = newOrderIds;
        
        // تحديث حالة الطلبات
        setPendingOrders(formattedOrders);
        
        // إشعار بالطلبات الجديدة (فقط إذا لم تكن أول تحميل)
        checkAndNotifyNewOrders(newOrders);
      } else {
        console.warn('No data received from API:', result);
        setPendingOrders([]);
        currentOrderIdsRef.current.clear();
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err instanceof Error ? err.message : 'حدث خطأ في تحميل الطلبات');
      setPendingOrders([]);
    } finally {
      setLoading(false);
      // بعد أول تحميل، نضع العلم بأنه تم التحميل
      if (isFirstLoadRef.current) {
        isFirstLoadRef.current = false;
      }
    }
  }, [checkAndNotifyNewOrders]);

  // WebPush للإشعارات الفورية
  const { isSupported, isSubscribed, error: pushError, retry } = useWebPush({
    onNewOrder: () => {
      console.log('WebPush: تم استلام طلب جديد، جاري التحديث...');
      fetchOrders();
    },
    retryCount: 3,
    retryDelay: 5000
  });

  // استدعاء fetchOrders عند تحميل المكون
  useEffect(() => {
    fetchOrders();
    
    // تحديث الطلبات كل 30 ثانية (بدون صوت للإشعارات الدورية)
    const interval = setInterval(() => {
      fetchOrders();
    }, 30000);
    
    return () => {
      clearInterval(interval);
      // تنظيف الـ timeout عند إلغاء تحميل المكون
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, [fetchOrders]);

  // قبول الطلب
  const acceptOrder = async (order: Order) => {
    setUpdatingId(order.id);
    
    try {
      // إزالة من الطلبات الجديدة
      setPendingOrders(prev => prev.filter(o => o.id !== order.id));
      
      // إزالة ID الطلب من مجموعة الإشعارات
      lastNotifiedOrderIdsRef.current.delete(order.id);
      currentOrderIdsRef.current.delete(order.id);
      
      // إضافة إلى الطلبات قيد التحضير
      const preparingOrder: PreparingOrder = {
        ...order,
        startedAt: new Date(),
        estimatedTime: Math.max(5, Math.ceil(order.items.reduce((acc, item) => acc + (item.quantity * 5), 0) / 2))
      };
      
      setPreparingOrders(prev => [...prev, preparingOrder]);
      
      // تحديث الحالة في الخادم
      const result = await updateOrderStatus(order.id, 'preparing');
      
      if (!result.success) {
        // استرجاع الطلب إذا فشل التحديث
        setPendingOrders(prev => [...prev, order]);
        setPreparingOrders(prev => prev.filter(o => o.id !== order.id));
        currentOrderIdsRef.current.add(order.id);
        alert(result.error || 'فشل في تحديث حالة الطلب');
      }
    } catch (err) {
      console.error('Error accepting order:', err);
      alert('حدث خطأ في قبول الطلب');
      setPendingOrders(prev => [...prev, order]);
      setPreparingOrders(prev => prev.filter(o => o.id !== order.id));
      currentOrderIdsRef.current.add(order.id);
    } finally {
      setUpdatingId(null);
    }
  };

  // رفض الطلب
  const rejectOrder = async (orderId: string) => {
    setShowRejectDialog(orderId);
  };

  const confirmReject = async (orderId: string) => {
    setUpdatingId(orderId);
    
    try {
      // إزالة الطلب من القائمة
      setPendingOrders(prev => prev.filter(o => o.id !== orderId));
      
      // إزالة ID الطلب من مجموعة الإشعارات
      lastNotifiedOrderIdsRef.current.delete(orderId);
      currentOrderIdsRef.current.delete(orderId);
      
      // تحديث الحالة في الخادم
      const result = await updateOrderStatus(orderId, 'rejected');//لازم نحطا بين انواع البيانات انو طلب وصل وتكنسل
      
      if (!result.success) {
        alert(result.error || 'فشل في رفض الطلب');
      }
    } catch (err) {
      console.error('Error rejecting order:', err);
      alert('حدث خطأ في رفض الطلب');
    } finally {
      setShowRejectDialog(null);
      setRejectReason('');
      setUpdatingId(null);
    }
  };

  // تسليم الوجبة
  const completeOrder = async (orderId: string) => {
    setUpdatingId(orderId);
    
    try {
      // إزالة من الطلبات قيد التحضير
      setPreparingOrders(prev => prev.filter(o => o.id !== orderId));
      
      // تحديث الحالة في الخادم
      const result = await updateOrderStatus(orderId, 'ready');
      
      if (!result.success) {
        alert(result.error || 'فشل في تحديث حالة الطلب');
      }
    } catch (err) {
      console.error('Error completing order:', err);
      alert('حدث خطأ في تسليم الطلب');
    } finally {
      setUpdatingId(null);
    }
  };

  // حساب الوقت المتبقي
  const getRemainingTime = (startedAt: Date, estimatedTime: number) => {
    const elapsed = (Date.now() - new Date(startedAt).getTime()) / 60000;
    const remaining = Math.max(0, Math.ceil(estimatedTime - elapsed));
    return remaining;
  };

  // متغيرات الأنيميشن
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20, scale: 0.95 },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 20 }
    },
    exit: {
      opacity: 0,
      x: -100,
      transition: { duration: 0.2 }
    }
  };

  const getColorWithOpacity = (color: string, opacity: number) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  // عرض حالة التحميل
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-96">
        <Loader2 className="w-12 h-12 animate-spin mb-4" style={{ color: primaryColor }} />
        <p className="text-gray-500 text-lg">جاري تحميل الطلبات...</p>
      </div>
    );
  }

  // عرض حالة الخطأ
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-96">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <p className="text-red-600 text-lg mb-2">{error}</p>
        <p className="text-gray-500 text-sm mb-4">يرجى التحقق من اتصال الإنترنت أو المحاولة مرة أخرى</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setLoading(true);
            setError(null);
            isFirstLoadRef.current = true; // إعادة تعيين علم أول تحميل
            fetchOrders();
          }}
          className="px-6 py-2 rounded-xl text-white flex items-center gap-2"
          style={{ backgroundColor: primaryColor }}
        >
          <RefreshCw className="w-4 h-4" />
          إعادة المحاولة
        </motion.button>
      </div>
    );
  }

  return (
    <>
      {/* صوت الإشعارات */}
      <audio ref={audioRef} preload="auto">
        <source src="/sound/Ok-pending.mp3" type="audio/mpeg" />
      </audio>
      
      <div className="w-full px-2 md:px-4 py-4" dir="rtl">
        {/* عمودين متجاوبين */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* العمود الأيمن: الطلبات الجديدة */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <BellRing className="w-5 h-5" style={{ color: primaryColor }} />
              <h2 className="text-lg font-bold text-gray-800">طلبات جديدة</h2>
              <motion.span 
                className="px-2.5 py-0.5 rounded-full text-xs font-medium"
                style={{ backgroundColor: getColorWithOpacity(primaryColor, 0.15), color: primaryColor }}
                animate={{ scale: pendingOrders.length > 0 ? [1, 1.1, 1] : 1 }}
                transition={{ repeat: pendingOrders.length > 0 ? Infinity : 0, duration: 1.5 }}
              >
                {pendingOrders.length}
              </motion.span>
            </div>

              <motion.div
                variants={containerVariants}
                initial="visible"
                className="space-y-4"
              >
              <AnimatePresence mode="popLayout">
                {pendingOrders.length === 0 ? (
                  <motion.div
                    key="empty-pending"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-16 bg-gray-50 rounded-2xl"
                  >
                    <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-400">لا توجد طلبات جديدة</p>
                  </motion.div>
                ) : (
                  pendingOrders.map((order) => (
                    <motion.div
                      key={order.id}
                      variants={itemVariants}//هاد الغلط بدي اخرا عل ai شقد بيغلط فيه
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      layout
                      whileHover={{ y: -2, transition: { duration: 0.2 } }}
                      className="bg-white rounded-2xl shadow-md overflow-hidden border"
                      style={{ borderColor: getColorWithOpacity(primaryColor, 0.2) }}
                    >
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-gray-800 text-lg">
                                  #{order.id?.slice(-6) || '????'}
                                </span>
                                <span 
                                  className="px-2 py-0.1 rounded-full text-[2px] font-medium"
                                  style={{ backgroundColor: getColorWithOpacity(primaryColor, 0.15), color: primaryColor }}
                                >
                                  <pre>                                                                  </pre>
                                </span>
                              </div>
                              {order.orderType === 'delivery' && order.customerName && (
                                <p className="text-sm text-gray-600 mt-1">{order.customerName}</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1 text-xl text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                            {/* <Clock className="w-3 h-3" />
                            <span>{Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000)} دقيقة</span> */}
                            {order.orderType === 'dine_in' ? `طاولة ${order.tableNumber}` : 'توصيل'}
                          </div>
                        </div>

                        <div className="mb-4">
  <div className="space-y-2">
    {order.items && order.items.map((item, idx) => (
      <div key={idx} className="flex items-start gap-2">
        <span className="text-primary font-bold text-sm shrink-0 mt-1">•</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 flex-wrap">
            <span className="font-semibold text-gray-800 text-xl shrink-0">
              {item.quantity}× {item.name}
            </span>
            {item.notes && (
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full break-words whitespace-normal max-w-full inline-block">
                <span className="font-medium">ملاحظة:</span> {item.notes}
              </span>
            )}
          </div>
        </div>
      </div>
    ))}
  </div>
</div>

{order.note && (
  <div className="mb-4 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
    <div className="text-lg text-yellow-800 flex items-start gap-1">
      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
      <p className="break-words whitespace-normal flex-1">
        <span className="font-medium">ملاحظة:</span> {order.note}
      </p>
    </div>
  </div>
)}

                        <div className="flex gap-3">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => acceptOrder(order)}
                              disabled={updatingId === order.id}
                              className="flex-1 py-2.5 rounded-xl font-medium text-white transition-all shadow-md flex items-center justify-center gap-2"
                              style={{ backgroundColor: primaryColor }}
                              initial={{ opacity: 1 }}
                              animate={updatingId === order.id ? {
                                scale: [1, 0.98, 1],
                                opacity: [1, 0.7, 1],
                                transition: { repeat: Infinity, duration: 1.5 }
                              } : {}}
                            >
                            {updatingId === order.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <ChefHat className="w-4 h-4" />
                            )}
                            قبول وتحضير
                          </motion.button>
                          
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => rejectOrder(order.id)}
                            disabled={updatingId === order.id}
                            className="px-4 py-2.5 rounded-xl font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors flex items-center gap-2"
                          >
                            <Ban className="w-4 h-4" />
                            رفض
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* العمود الأيسر: الطلبات قيد التحضير */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Timer className="w-5 h-5" style={{ color: primaryColor }} />
              <h2 className="text-lg font-bold text-gray-800">قيد التحضير</h2>
              <span 
                className="px-2.5 py-0.5 rounded-full text-xs font-medium"
                style={{ backgroundColor: getColorWithOpacity(primaryColor, 0.15), color: primaryColor }}
              >
                {preparingOrders.length}
              </span>
            </div>

              <motion.div
                variants={containerVariants}
                initial="visible"
                className="space-y-4"
              >
              <AnimatePresence mode="popLayout">
                {preparingOrders.length === 0 ? (
                  <motion.div
                    key="empty-preparing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-16 bg-gray-50 rounded-2xl"
                  >
                    <ChefHat className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-400">لا توجد طلبات قيد التحضير</p>
                  </motion.div>
                ) : (
                  preparingOrders.map((order) => {

                    return (
                      <div
                        key={order.id}
                        className="bg-white rounded-xl shadow-sm border border-gray-100"
                      >
                        <div className="p-4">
                          {/* رقم الطلب ونوعه */}
                          <div className="mb-3 pb-2 border-b border-gray-100">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-gray-800">
                                #{order.id?.slice(-6) || '????'}
                              </span>
                              <span className="text-xl px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                {order.orderType === 'dine_in' ? `طاولة ${order.tableNumber}` : 'توصيل'}
                              </span>
                            </div>
                          </div>

{/* الأصناف */}
<div className="space-y-2 mb-4">
  {order.items.map((item, idx) => (
    <div key={idx} className="border-b border-gray-100 pb-2 last:border-0">
      <div className="flex flex-col gap-1">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="font-bold text-xl text-gray-800">{item.quantity}×</span>
          <span className="text-xl text-gray-800 font-medium break-words whitespace-normal flex-1 min-w-0">
            {item.name}
          </span>
        </div>
        {item.notes && (
          <div className="w-full">
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full break-words whitespace-normal inline-block max-w-full">
                ملاحظة: {item.notes}
            </span>
          </div>
        )}
      </div>
    </div>
  ))}
</div>

                          {/* زر جاهز */}
                          <motion.button
                            onClick={() => completeOrder(order.id)}
                            disabled={updatingId === order.id}
                            className="w-full py-2.5 rounded-lg font-medium text-white bg-green-500 hover:bg-green-600 transition-colors disabled:opacity-50 relative overflow-hidden"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            animate={updatingId === order.id ? {
                              backgroundColor: ['#22c55e', '#16a34a', '#22c55e'],
                              transition: { repeat: Infinity, duration: 1 }
                            } : {}}
                          >
                            {updatingId === order.id ? (
                              <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex items-center justify-center gap-2"
                              >
                                <Loader2 className="w-4 h-4 animate-spin" />
                                جاري التجهيز...
                              </motion.span>
                            ) : (
                              <motion.span
                                initial={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center justify-center gap-2"
                              >
                                <CheckCircle className="w-4 h-4" />
                                جاهز للتقديم
                              </motion.span>
                            )}
                          </motion.button>
                        </div>
                      </div>
                    );
                  })
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>

      {/* حوار رفض الطلب */}
      <AnimatePresence >
        {showRejectDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowRejectDialog(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">رفض الطلب</h3>
              </div>
              
              <p className="text-gray-600 mb-4">
                الرجاء اخبار العميل على الطاولة بأن الطلب لن يتم تحضيره
              </p>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => confirmReject(showRejectDialog)}
                  disabled={updatingId !== null}
                  className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-medium flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  تأكيد الرفض
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowRejectDialog(null)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium"
                >
                  إلغاء
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}