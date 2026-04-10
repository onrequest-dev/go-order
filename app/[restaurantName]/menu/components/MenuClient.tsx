// go-order\app\[restaurantName]\menu\MenuClient.tsx

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { 
  ShoppingBag, 
  Clock, 
  Utensils,
  Plus,
  Minus,
  Send,
  ChevronUp,
  Trash2,
  Edit3,
  CheckCircle2,
  Users,
  MessageSquare,
  Coffee,
  AlertTriangle,
  Ban,
  WifiOff,
  Loader2,
  Download,
  X
} from "lucide-react";
import Image from "next/image";
import { MenuItem, Restaurant, Order, OrderItem, getCurrencySymbol } from "@/types";
import { createOrder } from "@/client/helpers/orders";

// ========== أنواع البيانات ==========
interface CartItem extends MenuItem {
  quantity: number;
  notes: string;
}

interface OrderDetailsType {
  restaurantName: string;
  tableNumber: number;
  totalItems: number;
  subtotal: number;
  serviceFee: number;
  totalAmount: number;
  currencySymbol: string;
  preparationTime: number;
  orderId?: string;
  items?: OrderItem[];  //الوجبات المطلوبة
}

interface CategoryFilterProps {
  categories: string[];
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  primaryColor: string;
}

interface OrderConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  orderDetails: OrderDetailsType;
  primaryColor: string;
  onViewInvoice: () => void;
}

interface ErrorStateProps {
  type: 'not_found' | 'inactive' | 'subscription_expired' | 'offline' | 'general';
  message: string;
  primaryColor?: string;
  onRetry?: () => void;
}

// ========== مكون التنبيه البسيط ==========
const ToastMessage = ({ message, isVisible, primaryColor }: { message: string; isVisible: boolean; primaryColor: string }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className="fixed top-20 left-0 right-0 z-50 flex justify-center px-4"
        >
          <div
            className="px-4 py-2 rounded-lg shadow-lg text-sm font-medium whitespace-nowrap"
            style={{ backgroundColor: primaryColor, color: 'white' }}
          >
            {message}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ========== مكون التحميل ==========
const LoadingSpinner = ({ primaryColor }: { primaryColor: string }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
      <div className="text-center">
        <Loader2 size={48} className="animate-spin mx-auto mb-4" style={{ color: primaryColor }} />
        <p className="text-gray-500 text-sm">جاري تحميل المنيو...</p>
      </div>
    </div>
  );
};

// ========== مكونات عرض الحالات المختلفة ==========
const ErrorState = ({ type, message, primaryColor = "#FF8C42", onRetry }: ErrorStateProps) => {
  const icons = {
    not_found: <Utensils size={64} className="text-gray-400" />,
    inactive: <Ban size={64} className="text-red-400" />,
    subscription_expired: <AlertTriangle size={64} className="text-orange-400" />,
    offline: <WifiOff size={64} className="text-gray-400" />,
    general: <AlertTriangle size={64} className="text-yellow-400" />
  };

  const titles = {
    not_found: "المطعم غير موجود",
    inactive: "المطعم غير نشط",
    subscription_expired: "الاشتراك منتهي",
    offline: "لا يوجد اتصال بالإنترنت",
    general: "حدث خطأ"
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="mb-6">{icons[type]}</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{titles[type]}</h2>
        <p className="text-gray-500 mb-6">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-6 py-2 rounded-lg text-white font-semibold transition-all hover:shadow-lg"
            style={{ backgroundColor: primaryColor }}
          >
            إعادة المحاولة
          </button>
        )}
      </motion.div>
    </div>
  );
};

// ========== أيقونة الفاتورة المصغرة ==========
const InvoiceMiniButton = ({ onClick, primaryColor }: { onClick: () => void; primaryColor: string }) => {
  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="fixed bottom-24 left-4 z-40 w-12 h-12 rounded-full shadow-2xl flex items-center justify-center text-white"
      style={{ backgroundColor: primaryColor }}
    >
      <Receipt size={22} />
    </motion.button>
  );
};

// ========== بطاقة الوجبة ==========
const MenuItemCard = ({ 
  item, 
  primaryColor, 
  onAddToCart,
  cartQuantity,
  currencySymbol,
  showToast
}: { 
  item: MenuItem; 
  primaryColor: string;
  onAddToCart: (item: MenuItem, quantity: number) => void;
  cartQuantity: number;
  currencySymbol: string;
  showToast: (message: string) => void;
}) => {
  const [quantity, setQuantity] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

const handleAddToCart = () => {
  // إذا كانت الكمية 0، نضيف 1 تلقائياً
  const finalQuantity = quantity === 0 ? 1 : quantity;
  onAddToCart(item, finalQuantity);
  setQuantity(0);
};

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -4 }}
      className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 h-full flex flex-col
        max-w-full md:max-w-[280px] lg:max-w-[260px] xl:max-w-[280px] mx-auto w-full"
    >
      <div className="relative w-full overflow-hidden flex-shrink-0 
        aspect-[4/3] md:aspect-[1/1] lg:aspect-[1/1] 
        md:max-h-[200px] lg:max-h-[180px] xl:max-h-[200px]"
      >
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        
        <div 
          className="absolute bottom-2 right-2 px-1.5 py-0.5 md:px-2 md:py-0.5 rounded-lg text-white font-bold text-xs sm:text-sm md:text-xs lg:text-xs"
          style={{ backgroundColor: primaryColor }}
        >
          {item.price} {currencySymbol}
        </div>
      </div>
      
      <div className="p-2 sm:p-3 md:p-2.5 lg:p-2 flex-1 flex flex-col">
        <h3 className="text-sm sm:text-base md:text-sm lg:text-sm font-bold text-gray-800 mb-1 line-clamp-2">
          {item.name}
        </h3>
        
        <p className="text-gray-500 text-xs sm:text-sm md:text-xs lg:text-xs mb-1 line-clamp-2 md:line-clamp-2">
          {item.description}
        </p>
        
        <div className="flex-1" />
        
        <div className="flex items-center justify-between gap-2 mt-auto pt-1">
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5 flex-shrink-0">
            <button
              onClick={() => setQuantity(Math.max(0, quantity - 1))}
              className="p-1 sm:p-1.5 md:p-1 rounded-lg hover:bg-gray-200 transition-colors active:scale-95"
              aria-label="إنقاص الكمية"
            >
              <Minus size={12} className="text-gray-600" />
            </button>
            <span className="w-5 sm:w-6 md:w-5 text-center font-bold text-gray-800 text-xs sm:text-sm md:text-xs">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-1 sm:p-1.5 md:p-1 rounded-lg hover:bg-gray-200 transition-colors active:scale-95"
              aria-label="زيادة الكمية"
            >
              <Plus size={12} className="text-gray-600" />
            </button>
          </div>
        </div>

        <button
          onClick={handleAddToCart}
          className={`flex items-center justify-center gap-1 px-2 mt-2 py-1.5 rounded-lg text-white font-semibold transition-all duration-300 text-xs hover:shadow-lg active:scale-95`}
          style={{ backgroundColor: primaryColor }}
          aria-label="إضافة إلى السلة"
        >
          <ShoppingBag size={12} />
          <span className="xs:inline text-xs">أضف للطلب</span>
        </button>
      
        {cartQuantity > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-center text-xs font-medium py-1 rounded-lg"
            style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
          >
            ✓ {cartQuantity} ضمن الطلب
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

// ========== عنصر السلة المنسدل ==========
const CartBottomSheet = ({ 
  cartItems, 
  onUpdateQuantity, 
  onRemoveItem, 
  onUpdateNotes,
  onSubmitOrder,
  primaryColor,
  restaurantName,
  tableNumber,
  serviceFee,
  currencySymbol,
  preparationTime,
  isSubmitting,
  onClose,
  onDragEnd
}: { 
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, change: number) => void;
  onRemoveItem: (id: string) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onSubmitOrder: (notes: string) => Promise<void>;
  primaryColor: string;
  restaurantName: string;
  tableNumber: number;
  serviceFee: number;
  currencySymbol: string;
  preparationTime: number;
  isSubmitting: boolean;
  onClose: () => void;
  onDragEnd: (event: any, info: any) => void;
}) => {
  const [globalNotes, setGlobalNotes] = useState("");
  const [showGlobalNotes, setShowGlobalNotes] = useState(false);
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalAmount = subtotal + serviceFee;
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (cartItems.length === 0) return null;

  const handleSubmit = async () => {
    await onSubmitOrder(globalNotes);
    setGlobalNotes("");
    setShowGlobalNotes(false);
  };

  return (
    <AnimatePresence>
      <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ 
          duration: 0.3,
          ease: "easeInOut"
        }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 z-50"
      />
      
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ 
          type: "tween",
          duration: 0.3,
          ease: "easeInOut"
        }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.3}
        dragMomentum={false}
        onDragEnd={onDragEnd}
        className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col"
        style={{ borderTop: `3px solid ${primaryColor}` }}
      >
          <div className="sticky top-0 bg-white rounded-t-3xl p-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">طلبك من {restaurantName}</h2>
                <p className="text-xs sm:text-sm text-gray-400">{totalItems} منتجات</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 transition active:scale-95"
              >
                <ChevronUp size={24} className="text-gray-400" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-3">
            {cartItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-gray-50/80 rounded-xl p-3 hover:bg-gray-100/80 transition-colors"
                  style={{ 
                    border: `1px solid ${primaryColor}`,
                    borderLeft: `3px solid ${primaryColor}`
                  }}
                >
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1">
                    <div className="flex flex-wrap justify-between items-start gap-2">
                      <h3 className="font-bold text-gray-800 text-sm sm:text-base">
                        {item.name}
                      </h3>
                      <p className="font-semibold text-sm" style={{ color: primaryColor }}>
                        {item.price * item.quantity} {currencySymbol}
                      </p>
                    </div>
                    
                    <p className="text-gray-400 text-xs mt-1">
                      {item.price} {currencySymbol} × {item.quantity}
                    </p>
                    
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1 bg-white rounded-lg p-0.5 border border-gray-100">
                        <button
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          className="p-1.5 rounded-lg hover:bg-gray-50 transition active:scale-95"
                          aria-label="إنقاص الكمية"
                        >
                          <Minus size={14} className="text-gray-500" />
                        </button>
                        <span className="w-7 text-center text-sm font-bold text-gray-700">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          className="p-1.5 rounded-lg hover:bg-gray-50 transition active:scale-95"
                          aria-label="زيادة الكمية"
                        >
                          <Plus size={14} className="text-gray-500" />
                        </button>
                      </div>
                      
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="p-1.5 text-red-600 hover:text-red-500 transition active:scale-95"
                        aria-label="حذف الوجبة"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-1.5">
                    <Edit3 size={12} />
                    <span>ملاحظات إضافية</span>
                  </div>
                    <input
                    type="text"
                    value={item.notes}
                    onChange={(e) => onUpdateNotes(item.id, e.target.value)}
                    placeholder="ما الإضافات التي ترغب بها؟ أو هل تود إزالة شيء ما؟"
                    className="w-full text-sm p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-opacity-50 transition placeholder:text-gray-400 text-gray-700"
                    style={{ 
                        '--tw-ring-color': primaryColor 
                    } as React.CSSProperties}
                    />
                </div>
              </motion.div>
            ))}
          </div>

          <div className="px-4">
            <div className="bg-orange-50 rounded-xl p-2 flex items-center gap-3">
              <Clock size={20} className="text-orange-500" />
              <div className="flex-1">
                <p className="text-xs text-orange-600 font-medium">وقت التحضير المقدر <span className="text-sm font-bold text-orange-700">{preparationTime} دقيقة</span></p>
              </div>
              <Coffee size={16} className="text-orange-400" />
            </div>
          </div>

          <div className="py-2 px-4 border-t bg-gray-50/80">
            <label className="flex items-center gap-2 cursor-pointer mb-3">
              <input
                type="checkbox"
                checked={showGlobalNotes}
                onChange={(e) => setShowGlobalNotes(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 focus:ring-2"
                style={{ accentColor: primaryColor }}
              />
              <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <MessageSquare size={14} />
                إضافة ملاحظات عامة للطلب
              </span>
            </label>
            
            <AnimatePresence>
              {showGlobalNotes && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                <textarea
                value={globalNotes}
                onChange={(e) => setGlobalNotes(e.target.value)}
                placeholder="أي ملاحظات إضافية للمطعم..."
                rows={2}
                className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-opacity-50 transition resize-none text-sm placeholder:text-gray-400 text-gray-700"
                style={{ 
                    '--tw-ring-color': primaryColor 
                } as React.CSSProperties}
                />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="px-4 py-2 border-t bg-white">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">المجموع سعر الأطباق</span>
                <span className="text-gray-700">{subtotal} {currencySymbol}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">رسوم الخدمة</span>
                <span className="text-orange-600">{serviceFee} {currencySymbol}</span>
              </div>
              <div className="border-t pt-2 mt-1">
                <div className="flex justify-between items-center">
                  <span className="text-gray-800 font-bold">الإجمالي</span>
                  <span className="text-2xl sm:text-3xl font-bold" style={{ color: primaryColor }}>
                    {totalAmount} {currencySymbol}
                  </span>
                </div>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl text-white font-bold flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: primaryColor }}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  <span>جاري الإرسال...</span>
                </>
              ) : (
                <>
                  <Send size={18} />
                  تأكيد الطلب وإرسال
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </>
    </AnimatePresence>
  );
};

// ========== نافذة تأكيد الطلب ==========
const OrderConfirmation = ({ isOpen, onClose, orderDetails, primaryColor, onViewInvoice }: OrderConfirmationProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60"
      />
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="relative bg-white rounded-2xl p-6 max-w-sm w-full text-center z-10"
      >
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${primaryColor}20` }}>
          <CheckCircle2 size={32} style={{ color: primaryColor }} />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">تم استلام طلبك!</h3>
        <p className="text-gray-500 text-sm mb-4">
          شكراً لطلبك من {orderDetails.restaurantName}
        </p>
        <div className="bg-gray-50 rounded-xl p-3 mb-4 text-right">
          <p className="text-sm text-gray-600 mb-1"> رقم الطاولة: {orderDetails.tableNumber}</p>
          <p className="text-sm text-gray-600 mb-1"> عدد الأطباق: {orderDetails.totalItems}</p>
          <p className="text-sm text-gray-600 mb-1">سعر الأطباق : {orderDetails.subtotal} {orderDetails.currencySymbol}</p>
          <p className="text-sm text-gray-600 mb-1">رسوم الخدمة: {orderDetails.serviceFee} {orderDetails.currencySymbol}</p>
          <p className="text-sm text-gray-600 mb-2">متوسط وقت التحضير: {orderDetails.preparationTime} دقيقة</p>
          <div className="border-t pt-2 mt-2">
            <p className="text-lg font-bold" style={{ color: primaryColor }}>الإجمالي: {orderDetails.totalAmount} {orderDetails.currencySymbol}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-full py-2 rounded-xl text-white font-bold"
          style={{ backgroundColor: primaryColor }}
        >
          رائع، شكراً
        </button>
      </motion.div>
    </div>
  );
};

// ========== مكون التصنيفات ==========
const CategoryFilter = ({ categories, activeCategory, setActiveCategory, primaryColor }: CategoryFilterProps) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
      <button
        onClick={() => setActiveCategory("all")}
        className={`px-4 py-1.5 rounded-full font-semibold transition-all duration-300 whitespace-nowrap text-sm ${
          activeCategory === "all"
            ? "text-white shadow-md"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
        style={activeCategory === "all" ? { backgroundColor: primaryColor } : {}}
      >
        الكل
      </button>
      {categories.map((cat: string) => (
        <button
          key={cat}
          onClick={() => setActiveCategory(cat)}
          className={`px-4 py-1.5 rounded-full font-semibold transition-all duration-300 whitespace-nowrap text-sm ${
            activeCategory === cat
              ? "text-white shadow-md"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
          style={activeCategory === cat ? { backgroundColor: primaryColor } : {}}
        >
          {cat}
        </button>
      ))}
    </div>
  );
};

// ========== مكون الفاتورة المصغرة ==========
interface InvoiceMiniCardProps {
  orderDetails: OrderDetailsType | null;
  onClose: () => void;
  primaryColor: string;
  cartItems?: CartItem[];
  orderItems?: OrderItem[];
}

const InvoiceMiniCard = ({ 
  orderDetails, 
  onClose, 
  primaryColor, 
  cartItems = [], 
  orderItems = [] 
}: InvoiceMiniCardProps) => {
  const [showFullInvoice, setShowFullInvoice] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [hasDownloaded, setHasDownloaded] = useState(false); // ✅ منع التحميل المتكرر
  const invoiceRef = useRef<HTMLDivElement>(null);

  // الحصول على الأصناف من مصدر آمن
  const getSafeItems = (): CartItem[] => {
    if (orderItems && Array.isArray(orderItems) && orderItems.length > 0) {
      return orderItems.map(item => ({
        id: item.menuItemId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        notes: item.notes || '',
        image: '',
        description: '',
        category: '',
        isActive: true
      })) as CartItem[];
    }
    
    if (cartItems && Array.isArray(cartItems) && cartItems.length > 0) {
      return cartItems;
    }
    
    return [];
  };

  const safeItems = getSafeItems();
  const hasItems = safeItems.length > 0;

  // منع تمرير الخلفية عند فتح الفاتورة
  useEffect(() => {
    if (showFullInvoice) {
      // حفظ قيمة overflow الأصلية
      const originalOverflow = document.body.style.overflow;
      // منع التمرير
      document.body.style.overflow = 'hidden';
      // إخفاء شريط التمرير مع الحفاظ على العرض
      document.body.style.paddingRight = `${window.innerWidth - document.documentElement.clientWidth}px`;
      
      return () => {
        // استعادة التمرير عند الإغلاق
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = '';
      };
    }
  }, [showFullInvoice]);

  // دالة تحويل الفاتورة إلى صورة وتحميلها (مرة واحدة فقط)
  const downloadInvoiceAsImage = async () => {
    // ✅ منع التحميل إذا تم التحميل مسبقاً
    if (hasDownloaded) {
      showTemporaryMessage('تم تحميل الفاتورة مسبقاً', 'info');
      return;
    }
    
    if (!invoiceRef.current) {
      showTemporaryMessage('حدث خطأ في تجهيز الفاتورة', 'error');
      return;
    }
    
    setIsDownloading(true);
    
    try {
      const html2canvasModule = await import('html2canvas');
      const html2canvas = html2canvasModule.default;
      
      showTemporaryMessage('جاري تجهيز الفاتورة...', 'info');
      
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        allowTaint: false
      });
      
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      link.download = `invoice_${orderDetails?.restaurantName || 'restaurant'}_${timestamp}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      setHasDownloaded(true); // ✅ علامة أنه تم التحميل
      showTemporaryMessage('✓ تم حفظ الفاتورة في المعرض', 'success');
      
    } catch (error) {
      console.error('خطأ في تحميل الفاتورة:', error);
      showTemporaryMessage('❌ فشل في تحميل الفاتورة', 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  // دالة مساعدة لعرض الرسائل المؤقتة
  const showTemporaryMessage = (message: string, type: 'success' | 'error' | 'info') => {
    const toastDiv = document.createElement('div');
    toastDiv.textContent = message;
    
    const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
    toastDiv.className = `fixed top-20 left-1/2 -translate-x-1/2 ${bgColor} text-white px-4 py-2 rounded-lg shadow-lg text-sm z-50 animate-fade-in-out`;
    
    document.body.appendChild(toastDiv);
    
    setTimeout(() => {
      toastDiv.style.opacity = '0';
      setTimeout(() => {
        if (document.body.contains(toastDiv)) {
          document.body.removeChild(toastDiv);
        }
      }, 300);
    }, 2000);
  };

  // معالج الإغلاق النهائي
  const handleFinalClose = () => {
    setShowFullInvoice(false);
    if (onClose) onClose();
  };

  if (!orderDetails) {
    return null;
  }

  return (
    <>
      {/* الأيقونة المدورة في يسار الشاشة */}
      <AnimatePresence>
        <motion.button
          key="invoice-icon"
          initial={{ scale: 0, opacity: 0, x: -50 }}
          animate={{ scale: 1, opacity: 1, x: 0 }}
          exit={{ scale: 0, opacity: 0, x: -50 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowFullInvoice(true)}
          className="fixed bottom-24 left-4 z-50 w-12 h-12 rounded-full shadow-2xl flex items-center justify-center"
          style={{ backgroundColor: primaryColor }}
        >
          <Receipt size={22} className="text-white" />
        </motion.button>
      </AnimatePresence>

      {/* نافذة الفاتورة الكاملة */}
      <AnimatePresence>
        {showFullInvoice && (
          <div 
            key="invoice-modal"
            className="fixed inset-0 z-50 flex items-center justify-center p-4" 
            style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
            onClick={(e) => {
              // إغلاق عند النقر على الخلفية
              if (e.target === e.currentTarget) {
                setShowFullInvoice(false);
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 0 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              style={{ 
                zIndex: 1,
                scrollbarWidth: 'thin', // ✅ شريط تمرير رفيع
                msOverflowStyle: 'none' // إخفاء شريط التمرير في Edge
              }}
            >
              {/* رأس الفاتورة */}
              <div className="sticky top-0 bg-white border-b pb-3 pt-4 px-6 z-10">
                <button
                  onClick={() => setShowFullInvoice(false)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition z-20"
                  aria-label="إغلاق"
                >
                  <X size={18} className="text-gray-500" />
                </button>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: `${primaryColor}15` }}>
                    <CheckCircle2 size={32} style={{ color: primaryColor }} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">فاتورة الطلب</h3>
                  <p className="text-gray-500 text-sm mt-1">تم استلام طلبك بنجاح</p>
                </div>
              </div>

              {/* محتوى الفاتورة القابل للتصوير */}
              <div ref={invoiceRef} className="p-6" style={{ backgroundColor: 'white' }}>
                {/* معلومات المطعم */}
                <div className="text-center mb-6 pb-4 border-b">
                  <h2 className="text-2xl font-bold" style={{ color: primaryColor }}>
                    {orderDetails.restaurantName || 'المطعم'}
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">شكراً لثقتكم بنا</p>
                  <div className="flex justify-center gap-4 mt-3 text-xs text-gray-400">
                    <span>طاولة رقم: {orderDetails.tableNumber || 1}</span>
                    <span>وقت التحضير: {orderDetails.preparationTime || 15} دقيقة</span>
                  </div>
                </div>

                {/* جدول الأطباق */}
                <div className="mb-6">
                  <h4 className="font-bold text-gray-700 mb-3 text-right border-b pb-2">تفاصيل الطلب</h4>
                  
                  {!hasItems ? (
                    <div className="text-center text-gray-500 py-8">
                      <Utensils size={32} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm">لا توجد أصناف لعرضها</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {/* رأس الجدول */}
                      <div className="flex justify-between text-xs font-bold text-gray-400 pb-2 border-b">
                        <span className="w-1/2 text-right">الصنف</span>
                        <span className="w-1/6 text-center">الكمية</span>
                        <span className="w-1/4 text-left">السعر</span>
                      </div>
                      
                      {/* صفوف الأطباق */}
                      {safeItems.map((item, index) => (
                        <div 
                          key={item.id || index} 
                          className="flex justify-between text-sm py-2 border-b border-gray-50"
                        >
                          <span className="w-1/2 text-right font-medium text-gray-700">
                            {item.name || 'بدون اسم'}
                          </span>
                          <span className="w-1/6 text-center text-gray-600">
                            {item.quantity || 0}
                          </span>
                          <span className="w-1/4 text-left font-semibold" style={{ color: primaryColor }}>
                            {((item.price || 0) * (item.quantity || 0)).toFixed(2)} {orderDetails.currencySymbol || 'ج.م'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ملاحظات الطلب */}
                {hasItems && safeItems.some(item => item.notes && item.notes.trim()) && (
                  <div className="mb-6 p-3 bg-gray-50 rounded-xl text-right">
                    <p className="text-xs font-bold text-gray-500 mb-1">ملاحظات الطلب:</p>
                    {safeItems.map((item, index) => item.notes && item.notes.trim() && (
                      <p key={item.id || index} className="text-xs text-gray-600 mt-1">
                        <span className="font-semibold">{item.name || 'صنف'}:</span> {item.notes}
                      </p>
                    ))}
                  </div>
                )}

                {/* إجمالي الفاتورة */}
                <div className="pt-4 border-t-2 border-dashed" style={{ borderColor: `${primaryColor}30` }}>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">المجموع الفرعي</span>
                      <span className="text-gray-700">
                        {orderDetails.subtotal?.toFixed(2) || '0.00'} {orderDetails.currencySymbol || 'ج.م'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">رسوم الخدمة</span>
                      <span className="text-orange-600">
                        {orderDetails.serviceFee?.toFixed(2) || '0.00'} {orderDetails.currencySymbol || 'ج.م'}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 mt-2 border-t">
                      <span className="text-lg font-bold text-gray-800">الإجمالي</span>
                      <span className="text-2xl font-bold" style={{ color: primaryColor }}>
                        {orderDetails.totalAmount?.toFixed(2) || '0.00'} {orderDetails.currencySymbol || 'ج.م'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* تذييل الفاتورة */}
                <div className="text-center mt-6 pt-4 border-t text-xs text-gray-400">
                  <p>نتمنى لكم وجبة شهية</p>
                  <p className="mt-1">GoOrder - نظام الطلبات الذكي</p>
                </div>
              </div>

              {/* أزرار التحكم مع نص توضيحي */}
              <div className="sticky bottom-0 bg-white border-t p-4">
                {/* ✅ نص توضيحي جديد */}
                <div className="text-center mb-3">
                  <p className="text-xs text-red-400">
                    {hasDownloaded ? 'عندالاغلاق لن تتمكن من عرض الفاتورة مجددا ✓ تم تحميل الفاتورة بنجاح ' : 'يمكنك تحميل الفاتورة مرة واحدة فقط عند الاغلاق لن تتمكن من عرض الفاتورة مجددا'}
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={downloadInvoiceAsImage}
                    disabled={isDownloading || hasDownloaded || !hasItems}
                    className={`flex-1 py-2.5 rounded-xl text-white text-xs  font-bold flex items-center justify-center gap-2 transition-all hover:shadow-lg ${
                      (isDownloading || hasDownloaded || !hasItems) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    style={{ backgroundColor: primaryColor }}
                  >
                    {isDownloading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Download size={18} />
                    )}
                    {isDownloading ? 'جاري التحميل...' : hasDownloaded ? 'تم التحميل ✓' : 'تحميل كصورة'}
                  </button>
                  <button
                    onClick={handleFinalClose}
                    className="flex-1 py-2.5 rounded-xl text-gray-600 text-xs font-bold border border-gray-200 hover:bg-gray-50 transition-all"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

// ========== المكون الرئيسي للعميل ==========
interface MenuClientProps {
  restaurant: Restaurant;
  tableNumber: number;
}

export default function MenuClient({ restaurant, tableNumber }: MenuClientProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [orderDetails, setOrderDetails] = useState<OrderDetailsType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCartSheetOpen, setIsCartSheetOpen] = useState(false);
  const [showInvoiceMini, setShowInvoiceMini] = useState(false);
  const [cartAnimation, setCartAnimation] = useState(false);
  const [lastOrderDetails, setLastOrderDetails] = useState<OrderDetailsType | null>(null);

  // مفتاح لمنع الخروج السريع
  const [exitCount, setExitCount] = useState(0);
  const exitTimerRef = useRef<NodeJS.Timeout | null>(null);

  // مفتاح لمنع التفاعل مع الخلفية عند فتح السلة
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // حفظ السلة في localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem(`cart_${restaurant.id}_${tableNumber}`);
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
      } catch (e) {
        console.error("خطأ في استعادة السلة:", e);
      }
    }
  }, [restaurant.id, tableNumber]);

  // حفظ السلة عند التغيير
  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem(`cart_${restaurant.id}_${tableNumber}`, JSON.stringify(cartItems));
    } else {
      localStorage.removeItem(`cart_${restaurant.id}_${tableNumber}`);
    }
  }, [cartItems, restaurant.id, tableNumber]);

  // تهيئة قائمة الأطباق النشطة مع تأثير تحميل
  useEffect(() => {
    const timer = setTimeout(() => {
      const activeItems = restaurant.menu.filter(item => item.isActive);
      setMenuItems(activeItems);
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [restaurant.menu]);

  // منع الخروج السريع
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      event.preventDefault();
      
      if (exitCount === 0) {
        setExitCount(1);
        showToastMessage("اضغط مرة أخرى للخروج");
        
        if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
        exitTimerRef.current = setTimeout(() => {
          setExitCount(0);
        }, 2000);
      } else {
        // الخروج الفعلي
        window.history.back();
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    };
  }, [exitCount]);

  // منع تمرير الخلفية عند فتح السلة
  useEffect(() => {
    if (isCartSheetOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartSheetOpen]);

    // ✅ إضافة: حل مشكلة توقف الأزرار بعد حذف آخر عنصر
  useEffect(() => {
    if (isCartSheetOpen && cartItems.length === 0) {
      setIsCartSheetOpen(false);
    }
  }, [cartItems.length, isCartSheetOpen]);
  // عرض التنبيه
  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2000);
  };

  // إضافة إلى السلة مع تأثير حركي
const addToCart = (item: MenuItem, quantity: number) => {
  setCartItems(prev => {
    const existing = prev.find(i => i.id === item.id);
    let newItems;
    if (existing) {
      newItems = prev.map(i =>
        i.id === item.id
          ? { ...i, quantity: i.quantity + quantity }
          : i
      );
    } else {
      newItems = [...prev, { ...item, quantity, notes: "" }];
    }
    
    // تفعيل تأثير التكبير والتصغير لزر السلة
    setCartAnimation(true);
    setTimeout(() => setCartAnimation(false), 300);
    
    return newItems;
  });
  setSubmitError(null);
};

  // تحديث الكمية
  const updateQuantity = (id: string, change: number) => {
    setCartItems(prev => {
      const newItems = prev.map(item => {
        if (item.id === id) {
          const newQuantity = item.quantity + change;
          if (newQuantity <= 0) return null;
          return { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(Boolean) as CartItem[];
      return newItems;
    });
  };

  // إزالة عنصر
  const removeItem = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  // تحديث الملاحظات
  const updateNotes = (id: string, notes: string) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, notes } : item
      )
    );
  };

  // حساب وقت التحضير المقدر
  const calculatePreparationTime = (itemsCount: number) => {
    return restaurant.averagePreparationTime + Math.max(0, (itemsCount - 1) * 2);
  };

const submitOrder = async (globalNotes: string) => {
  if (!restaurant || !tableNumber) return;
  
  setIsSubmitting(true);
  setSubmitError(null);
  
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalAmount = subtotal + restaurant.serviceFee;
  const preparationTime = calculatePreparationTime(totalItems);
  const currencySymbol = getCurrencySymbol(restaurant.currency);
  
  const orderItems: OrderItem[] = cartItems.map(item => ({
    menuItemId: item.id,
    name: item.name,
    quantity: item.quantity,
    price: item.price,
    notes: item.notes || undefined
  }));
  
  // ✅ ضع الطباعة هنا - قبل إرسال الطلب
  console.log("========== بدء إرسال الطلب ==========");
  console.log("📦 الأصناف المرسلة (orderItems):", orderItems);
  console.log("🏪 المطعم:", restaurant.name);
  console.log("🔢 رقم الطاولة:", tableNumber);
  console.log("💰 المجموع:", totalAmount, currencySymbol);
  
  const orderData: Omit<Order, 'id' | 'createdAt'> = {
    tableNumber,
    items: orderItems,
    totalPrice: totalAmount,
    status: 'pending',
    orderType: 'dine_in',
    customerName: undefined,
    customerPhone: undefined,
    deliveryAddress: undefined,
    restaurantId: restaurant.id,
  };
  
  try {
    const result = await createOrder({
      ...orderData,
      id: "ignore",
      createdAt: new Date(),
      note: globalNotes
    });
    
    // ✅ ضع الطباعة هنا - بعد استلام الرد
    console.log("✅ نتيجة الإرسال من السيرفر:", result);
    console.log("🆔 معرف الطلب:", result.data?.id);
    
    if (result.error) {
      throw new Error('فشل في إرسال الطلب');
    }
    
    const newOrderDetails = {
      restaurantName: restaurant.name,
      tableNumber: tableNumber,
      totalItems,
      subtotal,
      serviceFee: restaurant.serviceFee,
      totalAmount,
      currencySymbol,
      preparationTime,
      orderId: result.data?.id,
      items: orderItems  // ✅ تأكد من وجود items هنا
    };
    
    // ✅ ضع الطباعة هنا - للتأكد من newOrderDetails
    console.log("📄 newOrderDetails المحفوظ:", newOrderDetails);
    console.log("📋 newOrderDetails.items:", newOrderDetails.items);
    
    setOrderDetails(newOrderDetails);
    setLastOrderDetails(newOrderDetails);
    setShowConfirmation(true);
    
    setCartItems([]);
    localStorage.removeItem(`cart_${restaurant.id}_${tableNumber}`);
    
  } catch (error) {
    console.error("❌ خطأ في إرسال الطلب:", error);
    setSubmitError(error instanceof Error ? error.message : 'حدث خطأ في إرسال الطلب');
  } finally {
    setIsSubmitting(false);
    setIsCartSheetOpen(false);
  }
};

  // معالج سحب السلة للأسفل
  const handleCartDragEnd = (event: any, info: any) => {
    // استخدام velocity (السرعة) بالإضافة إلى المسافة لتحديد الإغلاق
    const dragThreshold = 80; // مسافة السحب المطلوبة للإغلاق (بالبكسل)
    const velocityThreshold = 300; // سرعة السحب المطلوبة
    
    const shouldClose = 
      info.offset.y > dragThreshold || // سحب لمسافة كافية
      info.velocity.y > velocityThreshold; // أو سحب بسرعة كافية
    
    if (shouldClose) {
      setIsCartSheetOpen(false);
    }
  };

  // معالج إغلاق نافذة التأكيد
  const handleConfirmationClose = () => {
    setShowConfirmation(false);
    setShowInvoiceMini(true);
  };

  // معالج إغلاق الفاتورة المصغرة
  const handleInvoiceMiniClose = () => {
    setShowInvoiceMini(false);
    setLastOrderDetails(null);
  };

  // عرض مكون التحميل
  if (isLoading) {
    return <LoadingSpinner primaryColor={restaurant.primaryColor || "#FF8C42"} />;
  }

  const categories = restaurant.categories || [];
  const filteredItems = activeCategory === "all" 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory);
  
  const getCartQuantity = (id: string) => {
    return cartItems.find(i => i.id === id)?.quantity || 0;
  };

  const primaryColor = restaurant.primaryColor || "#FF8C42";
  const currencySymbol = getCurrencySymbol(restaurant.currency);

  return (
    <div className={`min-h-screen bg-gray-50 pb-24 ${isCartSheetOpen ? 'overflow-hidden' : ''}`} dir="rtl">
      {/* تنبيهات */}
      <ToastMessage message={toastMessage} isVisible={showToast} primaryColor={primaryColor} />
      
      {/* عرض خطأ الإرسال */}
      {submitError && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm">
          {submitError}
        </div>
      )}
      
      {/* رأس الصفحة */}
      <div 
        className="relative overflow-hidden"
        style={{ 
          background: `linear-gradient(145deg, ${primaryColor}CC, ${primaryColor}99, ${primaryColor}66)`,
        }}
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-1/2 -right-1/2 w-full h-full rounded-full bg-white/5 blur-3xl"
        />
        
        <div className="relative z-10 container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            
            {restaurant.logo && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="relative"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-2 rounded-full border-2 border-white/30"
                  style={{ borderTopColor: 'white', borderRightColor: 'white' }}
                />
                <div 
                  className="relative w-20 h-20 md:w-24 md:h-24 bg-white rounded-full shadow-2xl overflow-hidden flex items-center justify-center p-2"
                  style={{ boxShadow: `0 0 20px ${primaryColor}` }}
                >
                  <Image
                    src={restaurant.logo}
                    alt={restaurant.name}
                    width={60}
                    height={60}
                    className="object-contain"
                  />
                </div>
              </motion.div>
            )}
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 text-center md:text-right"
            >
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                {restaurant.name}
              </h1>
              <div className="m-2 flex justify-center md:justify-start">
                <span className="flex items-center gap-1 text-white/80 text-lg bg-black/20 px-2 py-0.5 rounded-full">
                  خدمة الحجز ضمن المطعم 
                </span>
              </div>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <span className="flex items-center gap-1 text-white/90 text-sm bg-black/20 px-2 py-1 rounded-full">
                  <Users size={12} /> طاولة رقم {tableNumber}
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* المحتوى الرئيسي - يمنع التفاعل عند فتح السلة */}
      <div className={`container mx-auto px-4 py-5 ${isCartSheetOpen ? 'pointer-events-none' : ''}`}>
        
        <CategoryFilter
          categories={categories}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          primaryColor={primaryColor}
        />
        
        <div className="my-4">
          <p className="text-gray-400 text-xs">
            <span className="font-bold text-gray-600">{filteredItems.length}</span> وجبة متاحة
          </p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
          {filteredItems.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              primaryColor={primaryColor}
              onAddToCart={addToCart}
              cartQuantity={getCartQuantity(item.id)}
              currencySymbol={currencySymbol}
              showToast={showToastMessage}
            />
          ))}
        </div>
        
        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <Utensils size={48} className="mx-auto text-gray-300 mb-3" />
            <h3 className="text-lg font-bold text-gray-500 mb-1">لا توجد وجبات</h3>
            <p className="text-gray-400 text-sm">لا توجد وجبات في هذا التصنيف حالياً</p>
          </div>
        )}
      </div>

      {/* زر فتح السلة مع تأثير التكبير والتصغير */}
      {cartItems.length > 0 && (
<motion.button
  animate={cartAnimation ? {
    scale: [1, 1.3, 1],
    x: "-50%",  // إضافة التحريك الأفقي هنا بدلاً من CSS
    transition: { duration: 0.3 }
  } : {
    scale: 1,
    x: "-50%"
  }}
  onClick={() => setIsCartSheetOpen(true)}
  className="fixed bottom-6 left-1/2 z-40 px-5 py-3 rounded-full shadow-2xl flex items-center justify-center gap-3 text-white font-bold"
  style={{ 
    backgroundColor: primaryColor,
    width: 'auto',
    minWidth: '140px'
  }}
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  <ShoppingBag size={22} />
  <span className="text-sm">عرض الطلب</span>
  <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-bold">
    {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
  </span>
</motion.button>
      )}

      {/* الفاتورة المصغرة */}
      {showInvoiceMini && lastOrderDetails && (
      <InvoiceMiniCard
        orderDetails={lastOrderDetails}
        onClose={handleInvoiceMiniClose}
        primaryColor={primaryColor}
        cartItems={cartItems}  // اختياري
        orderItems={lastOrderDetails?.items}  // بديل آمن
      />
      )}

      {/* السلة المنسدلة */}
      {isCartSheetOpen && (
        <CartBottomSheet
          cartItems={cartItems}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeItem}
          onUpdateNotes={updateNotes}
          onSubmitOrder={submitOrder}
          primaryColor={primaryColor}
          restaurantName={restaurant.name}
          tableNumber={tableNumber}
          serviceFee={restaurant.serviceFee}
          currencySymbol={currencySymbol}
          preparationTime={calculatePreparationTime(cartItems.reduce((sum, item) => sum + item.quantity, 0))}
          isSubmitting={isSubmitting}
          onClose={() => setIsCartSheetOpen(false)}
          onDragEnd={handleCartDragEnd}
        />
      )}

      {/* نافذة تأكيد الطلب */}
      {orderDetails && (
        <OrderConfirmation
          isOpen={showConfirmation}
          onClose={handleConfirmationClose}
          orderDetails={orderDetails}
          primaryColor={primaryColor}
          onViewInvoice={() => {}}
        />
      )}
    </div>
  );
}

// إضافة مكون Receipt إذا لم يكن موجوداً
const Receipt = ({ size, className }: { size?: number; className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size || 24}
      height={size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
      <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
      <path d="M12 17.5v-11" />
    </svg>
  );
};