// app/[restaurantName]/dashboard/components/tabs/order/ReadyOrder.tsx
'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Receipt, 
  CheckCircle, 
  Loader2,
  Utensils,
  DollarSign,
  CreditCard,
  X,
  MapPin,
  Phone,
  Clock,
  ChefHat,
  Table2,
  User,
  AlertCircle
} from 'lucide-react';
import { getReadyOrders, updateOrderStatus } from '@/client/helpers/dashboard';
import { Order, Restaurant } from '@/types';
import { useWebPush } from '@/hooks/useWebPush';

interface ReadyOrdersPageProps {
  restaurant: Restaurant;
}

// أيقونات العملات المخصصة
const CurrencyIcon = ({ currency, className }: { currency: string; className?: string }) => {
  if (currency === 'USD') return <DollarSign className={className} />;
  if (currency === 'TRY') return <span className={className}>₺</span>;
  if (currency === 'SYP') return <span className={className}>ل.س</span>;
  return <DollarSign className={className} />;
};

// دالة للحصول على رمز العملة
const getCurrencySymbol = (currency: string): string => {
  const symbols: Record<string, string> = {
    'USD': '$',
    'TRY': '₺',
    'SYP': 'ل.س'
  };
  return symbols[currency] || 'ل.س';
};

// دالة لتنسيق السعر
const formatPrice = (price: number, currency: string): string => {
  const symbol = getCurrencySymbol(currency);
  return `${price.toFixed(2)} ${symbol}`;
};

// دالة للحصول على الوقت المنقضي
const getElapsedTime = (date: Date): string => {
  const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
  if (minutes < 1) return 'الآن';
  if (minutes < 60) return `${minutes} د`;
  const hours = Math.floor(minutes / 60);
  return `${hours} س`;
};

export default function ReadyOrdersPage({ restaurant }: ReadyOrdersPageProps) {
  // استخراج بيانات المطعم
  const {
    id: restaurantId,
    name: restaurantName,
    primaryColor = '#f97316',
    currency = 'SYP',
    serviceFee: restaurantServiceFee = 0.1,
    logo,
    address
  } = restaurant;

  const currencySymbol = getCurrencySymbol(currency);
  const serviceFeePercentage = restaurantServiceFee || 0.1;

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);
  const [showMobileInvoice, setShowMobileInvoice] = useState(false);
  
  // متغيرات الصوت
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastNotifiedOrderIdsRef = useRef<Set<string>>(new Set());
  const isFirstLoadRef = useRef<boolean>(true);
  const currentOrderIdsRef = useRef<Set<string>>(new Set());

// حساب تفاصيل الطلب - المعدلة
const calculateOrderDetails = (order: Order) => {
  const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const serviceFee = restaurantServiceFee || 0; // مبلغ ثابت وليس نسبة
  const totalAmount = subtotal + serviceFee;
  const preparationTime = Math.max(5, Math.ceil(order.items.reduce((acc, item) => acc + (item.quantity * 3), 0)));
  
  return { subtotal, serviceFee, totalAmount, preparationTime };
};

  // تحميل الطلبات
  const fetchOrders = useCallback(async () => {
    try {
      const result = await getReadyOrders();
      
      if (result.success && result.data) {
        const formattedOrders: Order[] = result.data.map((item: any) => ({
          id: item.id,
          tableNumber: item.tableNumber || 0,
          totalPrice: item.totalPrice || 0,
          status: item.status,
          orderType: item.orderType,
          createdAt: new Date(item.createdAt),
          customerName: item.customerName,
          customerPhone: item.customerPhone,
          deliveryAddress: item.deliveryAddress,
          restaurantId: item.restaurantId,
          note: item.note,
          modified_at: item.modified_at ? new Date(item.modified_at) : undefined,
          items: item.items || []
        }));
        
        const newOrderIds = new Set(formattedOrders.map(order => order.id));
        const newOrders = formattedOrders.filter(order => !currentOrderIdsRef.current.has(order.id));
        
        currentOrderIdsRef.current = newOrderIds;
        setOrders(formattedOrders);
        
        // تشغيل الصوت للطلبات الجديدة
        if (newOrders.length > 0 && !isFirstLoadRef.current) {
          playNotificationSound();
        }
      } else {
        setOrders([]);
        currentOrderIdsRef.current.clear();
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setOrders([]);
    } finally {
      setLoading(false);
      if (isFirstLoadRef.current) {
        isFirstLoadRef.current = false;
      }
    }
  }, []);

  // تشغيل صوت الإشعار
  const playNotificationSound = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/sound/OK-ready.mp3');
      audioRef.current.load();
    }
    
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(error => {
      console.log('فشل تشغيل الصوت:', error);
    });
  };

  // WebPush للإشعارات
  const { isSupported, isSubscribed, error, retry } = useWebPush({
    onNewOrder: () => {
      fetchOrders();
    },
    retryCount: 3,
    retryDelay: 5000
  });

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => fetchOrders(), 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  // عرض تفاصيل الطلب
  const showOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    // على الشاشات الصغيرة نفتح المودال
    if (window.innerWidth < 1024) {
      setShowMobileInvoice(true);
    }
  };

  // تأكيد الدفع
  const confirmPayment = async () => {
    if (!selectedOrder) return;
    
    setUpdatingId(selectedOrder.id);
    setShowPaymentConfirm(false);
    
    const result = await updateOrderStatus(selectedOrder.id, 'completed');
    
    if (result.success) {
      setOrders(prev => prev.filter(o => o.id !== selectedOrder.id));
      currentOrderIdsRef.current.delete(selectedOrder.id);
      setShowMobileInvoice(false);
      setSelectedOrder(null);
    } else {
      alert(result.error || 'فشل في تأكيد الدفع');
    }
    
    setUpdatingId(null);
  };

  // حساب إجمالي الإيرادات
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);

  const getColorWithOpacity = (color: string, opacity: number) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  // مكون عرض الفاتورة
// مكون عرض الفاتورة - النسخة المعدلة
const InvoiceDisplay = ({ order, onClose, isMobile = false }: { order: Order; onClose?: () => void; isMobile?: boolean }) => {
  const { subtotal, serviceFee, totalAmount } = calculateOrderDetails(order);

  return (
    <div className={`bg-white rounded-2xl shadow-lg h-full flex flex-col ${!isMobile && ''}`}>
      {/* محتوى قابل للتمرير - إخفاء شريط التمرير مع الحفاظ على وظيفة التمرير */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-none" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {/* رأس الفاتورة */}
        <div className="flex justify-between items-center mb-4 pb-3 border-b">
          <h3 className="text-lg font-bold" style={{ color: primaryColor }}>
            تفاصيل الفاتورة
          </h3>
          {isMobile && onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          )}
        </div>

{/* معلومات المطعم والطلب */}
<div className="mb-6">
  {/* اسم المطعم */}
  <h2 className="text-xl font-bold text-center mb-4" style={{ color: primaryColor }}>
    {restaurantName}
  </h2>
  
  {/* معلومات الطلب - تصميم بسيط مثل الفاتورة */}
  <div className="text-sm space-y-2">
    {/* رقم الطلب */}
    <div className="flex justify-between text-gray-600">
      <span className="text-gray-600">رقم الطلب:</span>
      <span className="font-medium">#{order.id?.slice(-6)}</span>
    </div>
    
    {/* الوقت */}
    <div className="flex justify-between text-gray-600">
      <span className="text-gray-600">وقت الطلب:</span>
      <span className="font-medium">
        {new Date(order.createdAt).toLocaleTimeString('ar-SA', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}
      </span>
    </div>
    
    {/* رقم الطاولة - للطلبات الداخلية فقط */}
    {order.orderType === 'dine_in' && (
      <div className="flex justify-between">
        <span className="text-gray-600">رقم الطاولة:</span>
        <span className="font-bold" style={{ color: primaryColor }}>
          {order.tableNumber}
        </span>
      </div>
    )}
    
    {/* خط فاصل بسيط */}
    <div className="border-b border-gray-200 pt-2"></div>
  </div>
</div>

        {/* تفاصيل الطلب */}
        <div className="mb-6">
          <h4 className="font-bold text-gray-700 mb-3 text-right flex items-center gap-2">
            <Utensils className="w-4 h-4" style={{ color: primaryColor }} />
            تفاصيل الطلب
          </h4>
          
          {!order.items || order.items.length === 0 ? (
            <div className="text-center text-gray-500 py-8 bg-gray-50 rounded-xl">
              <Utensils size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">لا توجد أصناف لعرضها</p>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-3">
              {/* رأس الجدول */}
              <div className="grid grid-cols-12 gap-2 text-xs font-bold text-gray-500 pb-2 mb-2 border-b border-gray-200">
                <span className="col-span-6 text-right">الصنف</span>
                <span className="col-span-2 text-center">الكمية</span>
                <span className="col-span-2 text-center">السعر</span>
                <span className="col-span-2 text-left">الإجمالي</span>
              </div>
              
              {/* صفوف الأطباق */}
              <div className="space-y-2">
                {order.items.map((item, index) => {
                  const itemPrice = item.price || 0;
                  const itemQuantity = item.quantity || 0;
                  const itemTotal = itemPrice * itemQuantity;
                  
                  return (
                    <div key={index} className="bg-white rounded-lg p-3">
                      <div className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-6 text-right">
                          <span className="font-medium text-gray-800 text-sm">
                            {item.name || 'صنف بدون اسم'}
                          </span>
                        </div>
                        <span className="col-span-2 text-center text-gray-600 font-medium">
                          {itemQuantity}
                        </span>
                        <span className="col-span-2 text-center text-gray-600 text-sm">
                          {formatPrice(itemPrice, currency)}
                        </span>
                        <span className="col-span-2 text-left font-bold text-sm" style={{ color: primaryColor }}>
                          {formatPrice(itemTotal, currency)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ملاحظات الطلب العامة */}
        {order.note && (
          <div className="mb-6 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
            <p className="text-xs font-bold text-yellow-700 mb-1 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              ملاحظات الطلب:
            </p>
            <p className="text-sm text-yellow-800">{order.note}</p>
          </div>
        )}


        {/* إجمالي الفاتورة - تصميم مبسط */}
        <div className="mb-6">
          {/* المجموع الفرعي */}
          <div className="flex justify-between text-sm mb-2 text-gray-600">
            <span className="text-gray-600">المجموع الفرعي</span>
            <span className="font-medium">{formatPrice(subtotal, currency)}</span>
          </div>
          
          {/* رسوم الخدمة */}
          {serviceFee > 0 && (
            <div className="flex justify-between text-sm mb-2 text-gray-600">
              <span className="text-gray-600">رسوم الخدمة</span>
              <span className="font-medium">{formatPrice(serviceFee, currency)}</span>
            </div>
          )}
          
          {/* خط فاصل */}
          <div className="border-t border-gray-300 my-3"></div>
          
          {/* الإجمالي النهائي */}
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-gray-600">الإجمالي</span>
            <span className="text-xl font-bold" style={{ color: primaryColor }}>
              {formatPrice(totalAmount, currency)}
            </span>
          </div>
        </div>

        {/* تذييل الفاتورة */}
        <div className="text-center py-4 border-t">
          <p className="text-xs text-gray-400">نتمنى لكم وجبة شهية</p>
          <p className="text-xs text-gray-400 mt-1">GoOrder</p>
        </div>
      </div>

      {/* زر تأكيد الدفع - ثابت في الأسفل */}
      <div className="p-6 pt-4 border-t bg-white">
        <button
          onClick={() => setShowPaymentConfirm(true)}
          disabled={updatingId === order.id}
          className="w-full py-3.5 rounded-xl font-bold text-white transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-base hover:opacity-90"
          style={{ backgroundColor: primaryColor }}
        >
          {updatingId === order.id ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              جاري التأكيد...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              تأكيد دفع الفاتورة
            </>
          )}
        </button>
      </div>
    </div>
  );
};

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: primaryColor }} />
      </div>
    );
  }

  return (
    <>
      {/* صوت الإشعارات */}
      <audio ref={audioRef} preload="auto">
        <source src="/sound/OK-ready.mp3" type="audio/mpeg" />
      </audio>

      <div className="w-full px-2 md:px-4 py-4" dir="rtl">
        {/* رأس الصفحة */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: primaryColor }}>
              الطلبات الجاهزة
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {orders.length} طلب جاهز للتسليم
            </p>
          </div>
        </div>

        {/* تخطيط العمودين للشاشات الكبيرة */}
        <div className="hidden lg:grid lg:grid-cols-2 gap-6 lg:items-stretch">
                      {/* العمود الأيمن: قائمة الفواتير */}
            <div className="space-y-3 lg:max-h-[800px] lg:overflow-y-auto lg:sticky lg:top-4">
              <div className="space-y-3 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100" style={{ maxHeight: 'calc(100vh - 200px)' }}>
              {orders.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-2xl">
                  <ChefHat className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-400">لا توجد طلبات جاهزة</p>
                </div>
              ) : (
                orders.map((order, index) => {
                  const { totalAmount } = calculateOrderDetails(order);
                  
                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => setSelectedOrder(order)}
                      className={`bg-white rounded-xl shadow-sm border-2 cursor-pointer overflow-hidden hover:shadow-md transition-all ${
                        selectedOrder?.id === order.id 
                          ? `border-${primaryColor} ring-2 ring-${primaryColor} ring-opacity-20`
                          : 'border-gray-100'
                      }`}
                      style={{ 
                        borderRight: `3px solid ${primaryColor}`,
                        borderColor: selectedOrder?.id === order.id ? primaryColor : undefined
                      }}
                    >
                    <div className="p-4">
                      {/* رأس البطاقة */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Receipt className="w-4 h-4" style={{ color: primaryColor }} />
                          <span className="font-bold text-gray-800 text-sm">
                            #{order.id?.slice(-6) || '????'}
                          </span>
                        </div>
                        <span 
                          className="px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{ 
                            backgroundColor: getColorWithOpacity('#10b981', 0.1),
                            color: '#10b981'
                          }}
                        >
                          جاهز
                        </span>
                      </div>

                      {/* رقم الطاولة / اسم العميل */}
                      <div className="mb-3">
                        {order.orderType === 'dine_in' ? (
                          <div className="flex items-center gap-2">
                            <Table2 className="w-4 h-4 text-gray-400" />
                            <span className="text-xl text-gray-600">طاولة</span>
                            <span className="font-bold text-xl" style={{ color: primaryColor }}>
                              {order.tableNumber}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-lg font-medium text-gray-700 truncate">
                              {order.customerName}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* الأصناف */}
                      <div className="space-y-1 mb-3">
                        {order.items.slice(0, 2).map((item, idx) => (
                          <div key={idx} className="text-lg text-gray-500 truncate">
                            {item.quantity}× {item.name}
                          </div>
                        ))}
                        {order.items.length > 2 && (
                          <div className="text-xs text-gray-400">
                            +{order.items.length - 2} أصناف أخرى
                          </div>
                        )}
                      </div>

                      {/*السعر*/}
                      <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-1">
                          <CurrencyIcon currency={currency} className="w-3 h-3"/>
                          <span className="font-bold text-sm" style={{ color: primaryColor }}>
                            {formatPrice(totalAmount, currency)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
            </div>
          </div>

          {/* العمود الأيسر: عرض الفاتورة */}
  <div className="h-[600px]">
    {selectedOrder ? (
      <div className="h-full overflow-y-auto rounded-2xl 
                      scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        <InvoiceDisplay order={selectedOrder} />
      </div>
    ) : (
      <div className="bg-gray-50 rounded-2xl p-8 h-full flex flex-col items-center justify-center">
        <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-400">اختر فاتورة لعرض التفاصيل</p>
      </div>
    )}
  </div>
        </div>

        {/* عرض الكروت فقط للشاشات الصغيرة */}
        <div className="lg:hidden">
          {orders.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-2xl">
              <ChefHat className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400">لا توجد طلبات جاهزة</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {orders.map((order, index) => {
                const { totalAmount } = calculateOrderDetails(order);
                
                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => showOrderDetails(order)}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 cursor-pointer overflow-hidden hover:shadow-md transition-all active:scale-98"
                    style={{ borderRight: `3px solid ${primaryColor}` }}
                  >
                    <div className="p-4">
                      {/* رأس البطاقة */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg" style={{ backgroundColor: getColorWithOpacity(primaryColor, 0.1) }}>
                            <Receipt className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                          </div>
                          <span className="font-bold text-gray-800 text-sm">
                            #{order.id?.slice(-6) || '????'}
                          </span>
                        </div>
                        <span 
                          className="px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{ 
                            backgroundColor: getColorWithOpacity('#10b981', 0.1),
                            color: '#10b981'
                          }}
                        >
                          جاهز
                        </span>
                      </div>

                      {/* رقم الطاولة / اسم العميل */}
                      <div className="mb-3">
                        {order.orderType === 'dine_in' ? (
                          <div className="flex items-center gap-2">
                            <div className="p-1 rounded-lg bg-gray-50">
                              <Table2 className="w-3.5 h-3.5 text-gray-500" />
                            </div>
                            <span className="text-sm text-gray-600">طاولة</span>
                            <span className="font-bold text-lg" style={{ color: primaryColor }}>
                              {order.tableNumber}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="p-1 rounded-lg bg-gray-50">
                              <User className="w-3.5 h-3.5 text-gray-500" />
                            </div>
                            <span className="text-sm font-medium text-gray-700 truncate">
                              {order.customerName}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* الأصناف */}
                      <div className="space-y-1 mb-3 bg-gray-50 rounded-lg p-2">
                        {order.items.slice(0, 2).map((item, idx) => (
                          <div key={idx} className="text-xs text-gray-600">
                            <span className="font-medium">{item.quantity}×</span> {item.name}
                          </div>
                        ))}
                        {order.items.length > 2 && (
                          <div className="text-xs text-gray-400">
                            +{order.items.length - 2} أصناف أخرى
                          </div>
                        )}
                      </div>

                      {/* السعر والوقت */}
                      <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ backgroundColor: getColorWithOpacity(primaryColor, 0.1) }}>
                          <CurrencyIcon currency={currency} className="w-3 h-3" />
                          <span className="font-bold text-sm" style={{ color: primaryColor }}>
                            {formatPrice(totalAmount, currency)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* مودال عرض الفاتورة للشاشات الصغيرة */}
      <AnimatePresence>
        {showMobileInvoice && selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto lg:hidden"
            onClick={() => setShowMobileInvoice(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <InvoiceDisplay order={selectedOrder} onClose={() => setShowMobileInvoice(false)} isMobile />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* نافذة تأكيد الدفع */}
      <AnimatePresence>
        {showPaymentConfirm && selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4"
            onClick={() => setShowPaymentConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-4">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3"
                  style={{ backgroundColor: getColorWithOpacity(primaryColor, 0.1) }}
                >
                  <CheckCircle className="w-8 h-8" style={{ color: primaryColor }} />
                </div>
                <h3 className="text-xl font-bold text-gray-800">تأكيد الدفع</h3>
                <p className="text-gray-500 mt-2">
                  هل تريد تأكيد دفع فاتورة الطلب 
                  <span className="font-bold mx-1" style={{ color: primaryColor }}>
                    #{selectedOrder.id?.slice(-6)}
                  </span>
                  بقيمة 
                  <span className="font-bold mx-1" style={{ color: primaryColor }}>
                    {formatPrice(
                      calculateOrderDetails(selectedOrder).totalAmount,
                      currency
                    )}
                  </span>
                  ؟
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={confirmPayment}
                  className="flex-1 py-2.5 rounded-xl font-medium text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  تأكيد الدفع
                </button>
                <button
                  onClick={() => setShowPaymentConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl font-medium bg-gray-100 text-gray-700"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}