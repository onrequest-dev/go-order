// go-order\app\[restaurantName]\menu\MenuClient.tsx

"use client";

import { useState, useEffect, useRef } from "react";
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
  Loader2
} from "lucide-react";
import Image from "next/image";
import { MenuItem, Restaurant, Order, OrderItem, getCurrencySymbol } from "@/types";

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
}

interface ErrorStateProps {
  type: 'not_found' | 'inactive' | 'subscription_expired' | 'offline' | 'general';
  message: string;
  primaryColor?: string;
  onRetry?: () => void;
}

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

// ========== بطاقة الوجبة ==========
const MenuItemCard = ({ 
  item, 
  primaryColor, 
  onAddToCart,
  cartQuantity,
  currencySymbol
}: { 
  item: MenuItem; 
  primaryColor: string;
  onAddToCart: (item: MenuItem, quantity: number) => void;
  cartQuantity: number;
  currencySymbol: string;
}) => {
  const [quantity, setQuantity] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const handleAddToCart = () => {
    if (quantity > 0) {
      onAddToCart(item, quantity);
      setQuantity(0);
    }
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
          disabled={quantity === 0}
          className={`flex items-center justify-center gap-1 px-2 mt-2 py-1.5 rounded-lg text-white font-semibold transition-all duration-300 text-xs ${
            quantity > 0 
              ? "hover:shadow-lg active:scale-95" 
              : "opacity-40 cursor-not-allowed"
          }`}
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
  isSubmitting
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
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [globalNotes, setGlobalNotes] = useState("");
  const [showGlobalNotes, setShowGlobalNotes] = useState(false);
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalAmount = subtotal + serviceFee;
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (cartItems.length === 0) return null;

  const handleSubmit = async () => {
    await onSubmitOrder(globalNotes);
    setIsOpen(false);
    setShowGlobalNotes(false);
    setGlobalNotes("");
  };

  return (
    <>
      {/* زر فتح السلة - تم تعديل position إلى left-1/2 مع translate */}
<motion.button
  initial={{ scale: 0, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{ type: "spring", stiffness: 500, delay: 0.5 }}
  onClick={() => setIsOpen(true)}
  className="fixed bottom-6 inset-x-0 mx-auto z-40 px-5 py-3 rounded-full shadow-2xl flex items-center justify-center gap-3 text-white font-bold w-fit"
  style={{ backgroundColor: primaryColor }}
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  <ShoppingBag size={22} />
  <span className="text-sm">عرض الطلب</span>
  <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-bold">{totalItems}</span>
</motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
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
                    onClick={() => setIsOpen(false)}
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
        )}
      </AnimatePresence>
    </>
  );
};

// ========== نافذة تأكيد الطلب ==========
const OrderConfirmation = ({ isOpen, onClose, orderDetails, primaryColor }: OrderConfirmationProps) => {
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
  const [orderDetails, setOrderDetails] = useState<OrderDetailsType>({ 
    restaurantName: "", 
    tableNumber: 1, 
    totalItems: 0, 
    subtotal: 0,
    serviceFee: 0,
    totalAmount: 0,
    currencySymbol: "",
    preparationTime: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // تهيئة قائمة الأطباق النشطة مع تأثير تحميل
  useEffect(() => {
    // محاكاة تحميل البيانات
    const timer = setTimeout(() => {
      const activeItems = restaurant.menu.filter(item => item.isActive);
      setMenuItems(activeItems);
      setIsLoading(false);
    }, 500); // تأخير بسيط لإظهار مكون التحميل
    
    return () => clearTimeout(timer);
  }, [restaurant.menu]);

  // إضافة إلى السلة
  const addToCart = (item: MenuItem, quantity: number) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i =>
          i.id === item.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, { ...item, quantity, notes: "" }];
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

  // إرسال الطلب إلى السيرفر
  const submitOrder = async (globalNotes: string) => {
    if (!restaurant || !tableNumber) return;
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalAmount = subtotal + restaurant.serviceFee;
    const preparationTime = calculatePreparationTime(totalItems);
    const currencySymbol = getCurrencySymbol(restaurant.currency);
    
    // تحضير بيانات الطلب للإرسال
    const orderItems: OrderItem[] = cartItems.map(item => ({
      menuItemId: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      notes: item.notes || undefined
    }));
    
    const orderData: Omit<Order, 'id' | 'createdAt'> = {
      tableNumber,
      items: orderItems,
      totalAmount,
      status: 'pending',
      orderType: 'dine_in',
      customerName: undefined,
      customerPhone: undefined,
      deliveryAddress: undefined
    };
    
    try {
      // إرسال الطلب إلى API
      const response = await fetch(`/api/orders/${restaurant.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...orderData,
          globalNotes
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'فشل في إرسال الطلب');
      }
      
      const result = await response.json();
      
      // عرض تفاصيل الطلب في نافذة التأكيد
      setOrderDetails({
        restaurantName: restaurant.name,
        tableNumber: tableNumber,
        totalItems,
        subtotal,
        serviceFee: restaurant.serviceFee,
        totalAmount,
        currencySymbol,
        preparationTime
      });
      
      setShowConfirmation(true);
      
      // تفريغ السلة بعد الإرسال
      setCartItems([]);
      
      // طباعة الطلب في الكونسول للتصحيح
      console.log("========== طلب جديد ==========");
      console.log(`معرف الطلب: ${result.orderId}`);
      console.log(`مطعم: ${restaurant.name}`);
      console.log(`رقم الطاولة: ${tableNumber}`);
      console.log(`الإجمالي: ${totalAmount} ${currencySymbol}`);
      console.log("================================");
      
    } catch (error) {
      console.error("خطأ في إرسال الطلب:", error);
      setSubmitError(error instanceof Error ? error.message : 'حدث خطأ في إرسال الطلب');
    } finally {
      setIsSubmitting(false);
    }
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
    <div className="min-h-screen bg-gray-50 pb-24" dir="rtl">
      {/* عرض خطأ الإرسال إذا وجد */}
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
                  <Clock size={12} /> متوسط وقت التحضير {restaurant.averagePreparationTime} دقيقة
                </span>
                <span className="flex items-center gap-1 text-white/90 text-sm bg-black/20 px-2 py-1 rounded-full">
                  <Users size={12} /> طاولة رقم {tableNumber}
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="container mx-auto px-4 py-5">
        
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

      {/* السلة المنسدلة */}
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
      />

      {/* نافذة تأكيد الطلب */}
      <OrderConfirmation
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        orderDetails={orderDetails}
        primaryColor={primaryColor}
      />
    </div>
  );
}