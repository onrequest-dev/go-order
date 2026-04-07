"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { 
  QrCode, 
  Truck, 
  TrendingUp, 
  LayoutDashboard, 
  Shield, 
  Star, 
  ArrowRight, 
  CheckCircle2,
  Sparkles,
  Clock,
  Smartphone,
  CreditCard,
  BarChart3,
  Users,
  Award,
  Zap,
  Globe,
  Bell,
  Coffee,
  UtensilsCrossed,
  Receipt,
  Printer,
  Settings,
  Home,
  Package,
  ShoppingCart,
  User,
  LogOut,
  Menu,
  X,
  DollarSign,
  Percent,
  Phone,
  MapPin,
  Calendar,
  ChevronDown,
  Eye,
  MoreHorizontal,
  Plus,
  Minus,
  Trash2,
  Send,
  Check,
  AlertCircle,
  Flame,
  Crown,
  Gift,
  Wifi,
  Battery,
  Signal,
} from "lucide-react";

// ========== الأنواع ==========
interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
  isAvailable: boolean;
  popular?: boolean;
  spicy?: boolean;
}

interface OrderItem {
  id: number;
  menuItemId: number;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

interface Order {
  id: string;
  tableNumber: number;
  items: OrderItem[];
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'paid';
  timestamp: Date;
  total: number;
  customerName?: string;
  specialRequests?: string;
}

// ========== Bottom Navigation Bar للهاتف ==========
const MobileBottomNav = ({ activePage, setActivePage }: { activePage: string; setActivePage: (page: string) => void }) => {
  const menuItems = [
    { id: 'dashboard', icon: Home, label: 'الرئيسية' },
    { id: 'orders', icon: ShoppingCart, label: 'الطلبات', badge: 3 },
    { id: 'menu', icon: Coffee, label: 'القائمة' },
    { id: 'analytics', icon: BarChart3, label: 'الإحصائيات' },
    { id: 'profile', icon: User, label: 'الحساب' },
  ];

};

// ========== Hero Section للهاتف ==========
const MobileHero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden px-5 pt-8 pb-16">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[300px] h-[300px] rounded-full bg-[#FF8C42] opacity-[0.08] blur-[80px]" />
        <div className="absolute bottom-0 right-0 w-[200px] h-[200px] rounded-full bg-[#FF8C42] opacity-[0.05] blur-[60px]" />
      </div>

      <div className="relative z-10 text-center">
        {/* Badge */}
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="inline-flex items-center gap-2 bg-[#FF8C42]/10 backdrop-blur-sm px-4 py-2 rounded-full border border-[#FF8C42]/20 mb-6"
        >
          <Sparkles size={16} className="text-[#FF8C42]" />
          <span className="text-[#FF8C42] text-sm font-medium">ثورة في إدارة المطاعم</span>
        </motion.div>

        {/* Headline */}
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
          مطعمك الذكي
          <span className="block text-[#FF8C42] mt-2">يبدأ من هنا</span>
        </h1>

        {/* Subheadline */}
        <p className="text-white/60 text-base mb-8 max-w-sm mx-auto leading-relaxed">
          زود أرباحك 40%، قلل أخطاء الطلبات، وامنح عملائك تجربة لا تُنسى مع أول نظام إدارة مطاعم متكامل بالعالم العربي.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
          <motion.button
            whileTap={{ scale: 0.97 }}
            className="bg-gradient-to-r from-[#FF8C42] to-[#FF6B2C] text-white px-8 py-3.5 rounded-xl font-bold shadow-xl shadow-[#FF8C42]/30 flex items-center justify-center gap-2 text-base"
          >
            ابدأ الآن مجاناً
            <ArrowRight size={18} />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            className="border border-white/20 text-white px-6 py-3.5 rounded-xl font-medium hover:bg-white/5 transition-all"
          >
            شاهد الفيديو
          </motion.button>
        </div>

        {/* Social Proof */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex -space-x-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF8C42] to-[#FF6B2C] border-2 border-[#1A2A4F] flex items-center justify-center">
                <span className="text-white text-xs font-bold">M</span>
              </div>
            ))}
          </div>
          <p className="text-white/40 text-sm">
            <span className="text-[#FF8C42] font-bold">+500 مطعم</span> يثقون بنا في السعودية والإمارات
          </p>
        </div>

{/* ===== Mockups Container - Phone + Laptop جنباً لجنب ===== */}
<div className="mt-12 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12">
  
  {/* ========== Mockup Phone (كما هو مع تحسينات بسيطة) ========== */}
  <motion.div 
    initial={{ y: 50, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ delay: 0.2, type: "spring" }}
    className="relative mx-auto w-[260px] sm:w-[280px] h-[500px]"
  >
    <div className="relative rounded-[40px] bg-[#0F1A33] p-2 shadow-2xl border border-white/10 h-[550px]">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-5 bg-[#0F1A33] rounded-b-2xl z-10" />
      <div className="bg-gradient-to-br from-[#1A2A4F] to-[#0F1A33] rounded-[32px] overflow-hidden h-[530px]">
        <div className="p-4">
          {/* Phone Header */}
          <div className="flex justify-between items-center mb-4">
            <div className="text-white font-bold text-sm">GoOrder</div>
            <div className="flex gap-2">
              <Signal size={12} className="text-white/40" />
              <Wifi size={12} className="text-white/40" />
              <Battery size={12} className="text-white/40" />
            </div>
          </div>
          
          {/* Phone Content */}
          <div className="bg-white/5 rounded-xl p-3 mb-3">
            <div className="flex justify-between text-white/70 text-xs mb-2">
              <span>طاولة 5</span>
              <span>طلبات اليوم: 24</span>
            </div>
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "75%" }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-full bg-[#FF8C42] rounded-full"
              />
            </div>
          </div>
          
          <div className="space-y-2 max-h-[280px] overflow-y-auto">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-2 bg-white/5 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-[#FF8C42]/20 flex items-center justify-center">
                  <Coffee size={16} className="text-[#FF8C42]" />
                </div>
                <div className="flex-1">
                  <div className="text-white text-xs font-medium">طلب جديد #{i}</div>
                  <div className="text-white/40 text-[10px]">طاولة {i * 2}</div>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    
    {/* Floating Elements للجوال */}
    <motion.div 
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 3, repeat: Infinity }}
      className="absolute -top-4 -right-4 bg-[#FF8C42] p-1.5 rounded-xl shadow-lg"
    >
      <Zap size={16} className="text-white" />
    </motion.div>
    <motion.div 
      animate={{ y: [0, 8, 0] }}
      transition={{ duration: 4, repeat: Infinity, delay: 1 }}
      className="absolute -bottom-4 -left-4 bg-green-500 p-1.5 rounded-xl shadow-lg"
    >
      <TrendingUp size={16} className="text-white" />
    </motion.div>
    
    {/* Label */}
    <p className="text-center text-white/40 text-xs mt-3">لتجربة العميل</p>
  </motion.div>

  {/* ========== Mockup Laptop (جديد واحترافي) ========== */}
  <motion.div 
    initial={{ y: 50, opacity: 0, rotateX: -15 }}
    animate={{ y: 0, opacity: 1, rotateX: 0 }}
    transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
    className="relative mx-auto w-[320px] sm:w-[380px] lg:w-[420px]"
  >
    {/* Laptop Screen */}
    <div className="relative">
      {/* Screen Bezel */}
      <div className="relative rounded-t-2xl bg-[#1A1A2E] p-2 shadow-2xl border border-white/10">
        {/* Webcam */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#FF8C42]/50 shadow-glow" />
        
        {/* Screen Content */}
        <div className="bg-gradient-to-br from-[#1A2A4F] to-[#0F1A33] rounded-lg overflow-hidden">
          {/* Dashboard Header */}
          <div className="bg-[#0F1A33]/80 px-4 py-2 flex justify-between items-center border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#FF8C42] flex items-center justify-center">
                <UtensilsCrossed size={12} className="text-white" />
              </div>
              <span className="text-white text-sm font-bold">GoOrder Dashboard</span>
            </div>
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <div className="w-2 h-2 rounded-full bg-green-500" />
            </div>
          </div>
          
          {/* Dashboard Content */}
          <div className="p-4">
            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { label: "إجمالي اليوم", value: "₿1,280", change: "+12%" },
                { label: "طلبات نشطة", value: "8", change: "+3" },
                { label: "تقييم", value: "4.9 ★", change: "+0.2" }
              ].map((stat, idx) => (
                <div key={idx} className="bg-white/5 rounded-lg p-2 text-center">
                  <p className="text-white/40 text-[10px]">{stat.label}</p>
                  <p className="text-white font-bold text-sm">{stat.value}</p>
                  <p className="text-green-400 text-[8px]">{stat.change}</p>
                </div>
              ))}
            </div>
            
            {/* Orders Table */}
            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex justify-between text-white/40 text-[10px] mb-2 px-2">
                <span>الطلب</span>
                <span>الطاولة</span>
                <span>الحالة</span>
                <span>الوقت</span>
              </div>
              <div className="space-y-2">
                {[
                  { id: "#1283", table: "5", status: "تحضير", time: "5د", color: "text-yellow-400" },
                  { id: "#1282", table: "3", status: "جاهز", time: "12د", color: "text-green-400" },
                  { id: "#1281", table: "8", status: "انتظار", time: "2د", color: "text-[#FF8C42]" },
                ].map((order, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * idx }}
                    className="flex justify-between items-center text-xs py-1 border-b border-white/5"
                  >
                    <span className="text-white/70 font-medium">{order.id}</span>
                    <span className="text-white/50">طاولة {order.table}</span>
                    <span className={order.color}>{order.status}</span>
                    <span className="text-white/30">{order.time}</span>
                  </motion.div>
                ))}
              </div>
            </div>
            
            {/* Chart Preview */}
            <div className="mt-3 bg-white/5 rounded-lg p-2">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 size={12} className="text-[#FF8C42]" />
                <span className="text-white/60 text-[10px]">المبيعات اليومية</span>
              </div>
              <div className="flex items-end gap-1 h-16">
                {[35, 50, 42, 68, 55, 72, 65].map((h, i) => (
                  <motion.div 
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: h }}
                    transition={{ duration: 0.5, delay: 0.5 + i * 0.05 }}
                    className="flex-1 bg-[#FF8C42]/30 rounded-t"
                    style={{ height: `${h / 2}px` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Laptop Keyboard Base */}
      <div className="relative mt-[-8px]">
        <div className="bg-[#1A1A2E] rounded-b-2xl p-2 pt-3 shadow-2xl">
          <div className="flex gap-1 justify-center mb-2">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="w-5 h-4 bg-white/5 rounded-sm" />
            ))}
          </div>
          <div className="flex gap-1 justify-center">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="w-6 h-3 bg-white/5 rounded-sm" />
            ))}
          </div>
          {/* Trackpad */}
          <div className="w-32 h-8 bg-white/5 rounded-lg mx-auto mt-2" />
        </div>
      </div>
    </div>
    
    {/* Floating Elements للابتوب */}
    <motion.div 
      animate={{ rotate: [0, 10, 0] }}
      transition={{ duration: 5, repeat: Infinity }}
      className="absolute -top-6 -right-6 bg-purple-500/20 backdrop-blur-sm p-2 rounded-xl border border-purple-500/30"
    >
      <LayoutDashboard size={18} className="text-purple-400" />
    </motion.div>
    <motion.div 
      animate={{ scale: [1, 1.1, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
      className="absolute -bottom-6 -left-6 bg-blue-500/20 backdrop-blur-sm p-2 rounded-xl border border-blue-500/30"
    >
      <TrendingUp size={18} className="text-blue-400" />
    </motion.div>
    
    {/* Label */}
    <p className="text-center text-white/40 text-xs mt-4">لوحة تحكم الإدارة</p>
  </motion.div>
</div>

{/* ===== نص توضيحي أسفل الموكبس ===== */}
<motion.p 
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ delay: 0.6 }}
  className="text-center text-white/30 text-xs mt-6 max-w-xs mx-auto"
>
  تطبيق جوال للعملاء + لوحة تحكم للإدارة | تجربة متكاملة 100%
</motion.p>
      </div>
    </section>
  );
};

// ========== Stats Cards للهاتف ==========
const MobileStats = () => {
  const stats = [
    { value: "40%", label: "زيادة في الأرباح", icon: TrendingUp, color: "#FF8C42" },
    { value: "99%", label: "رضا العملاء", icon: Star, color: "#FFD700" },
    { value: "0", label: "أخطاء في الطلبات", icon: Shield, color: "#4CAF50" },
  ];

  return (
    <section className="py-12 px-5">
      <div className="grid grid-cols-1 gap-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-white/5 to-transparent rounded-2xl p-5 border border-white/10"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#FF8C42]/10 flex items-center justify-center">
                <stat.icon size={24} className="text-[#FF8C42]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-white/50 text-sm">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

// ========== Features Grid للهاتف ==========
const MobileFeatures = () => {
  const features = [
    { icon: QrCode, title: "مسح QR سريع", desc: "اطلب من الطاولة بدون تطبيقات", color: "#FF8C42" },
    { icon: Bell, title: "تنبيهات فورية", desc: "إشعارات في المطبخ والخدمة", color: "#FF6B2C" },
    { icon: Receipt, title: "فاتورة ذكية", desc: "طباعة وإرسال واتساب فوراً", color: "#FF8C42" },
    { icon: BarChart3, title: "تحليلات دقيقة", desc: "أعرف ماذا يبيع ومتى", color: "#FF6B2C" },
    { icon: Users, title: "ولاء العملاء", desc: "نقاط مكافآت وعروض مخصصة", color: "#FF8C42" },
    { icon: Globe, title: "متعدد الفروع", desc: "إدارة كل فروعك من لوحة واحدة", color: "#FF6B2C" },
  ];

  return (
    <section className="py-12 px-5 bg-white/5">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-3">
          مميزات تخلي مطعمك
          <span className="text-[#FF8C42]"> لا يُقهر</span>
        </h2>
        <p className="text-white/50 text-sm">كل اللي تحتاجه في منصة واحدة</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {features.map((feat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            whileHover={{ y: -3 }}
            className="bg-white/5 rounded-xl p-4 text-center border border-white/10"
          >
            <div className="w-12 h-12 rounded-xl bg-[#FF8C42]/10 flex items-center justify-center mx-auto mb-3">
              <feat.icon size={22} className="text-[#FF8C42]" />
            </div>
            <h3 className="text-white font-bold text-sm mb-1">{feat.title}</h3>
            <p className="text-white/40 text-[11px]">{feat.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

// ========== Live Demo / Order System للهاتف ==========
const MobileOrderDemo = () => {
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const demoItems: MenuItem[] = [
    { id: 1, name: 'ستيك أنجوس', price: 28, category: 'main', image: '', isAvailable: true, popular: true },
    { id: 2, name: 'بيبروني بيتزا', price: 14, category: 'main', image: '', isAvailable: true, popular: true },
    { id: 3, name: 'باستا ألفريدو', price: 16, category: 'main', image: '', isAvailable: true },
    { id: 4, name: 'تشيز كيك', price: 7, category: 'dessert', image: '', isAvailable: true },
  ];

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.menuItemId === item.id);
      if (existing) {
        return prev.map(i => i.menuItemId === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { id: Date.now(), menuItemId: item.id, name: item.name, price: item.price, quantity: 1 }];
    });
  };

  const updateQuantity = (menuItemId: number, delta: number) => {
    setCart(prev => {
      const existing = prev.find(i => i.menuItemId === menuItemId);
      if (existing) {
        const newQty = existing.quantity + delta;
        if (newQty <= 0) return prev.filter(i => i.menuItemId !== menuItemId);
        return prev.map(i => i.menuItemId === menuItemId ? { ...i, quantity: newQty } : i);
      }
      return prev;
    });
  };

  const checkout = () => {
    if (cart.length === 0) return;
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
    setTimeout(() => setCart([]), 2000);
  };

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <section className="py-12 px-5">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-3">
          جرب النظام بنفسك
          <span className="text-[#FF8C42]"> الآن!</span>
        </h2>
        <p className="text-white/50 text-sm">اختر وجباتك وشوف سهولة الطلب</p>
      </div>

      <div className="bg-gradient-to-br from-[#1A2A4F] to-[#0F1A33] rounded-2xl overflow-hidden border border-white/10">
        {/* Menu Items */}
        <div className="p-4 space-y-3">
          {demoItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between bg-white/5 rounded-xl p-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold">{item.name}</span>
                  {item.popular && <Flame size={12} className="text-[#FF8C42]" />}
                </div>
                <p className="text-[#FF8C42] font-bold text-sm">${item.price}</p>
              </div>
              <div className="flex items-center gap-2">
                  <>
                    <button 
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-7 h-7 rounded-lg bg-white/10 text-white flex items-center justify-center"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-white text-sm w-5 text-center">
                      {cart.find(i => i.menuItemId === item.id)?.quantity || 0}
                    </span>
                  </>
                <button 
                  onClick={() => addToCart(item)}
                  className="bg-[#FF8C42] text-white px-4 py-1.5 rounded-lg text-sm font-medium"
                >
                  أضف
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Cart */}
        {cart.length > 0 && (
          <div className="border-t border-white/10 p-4 bg-white/5">
            <div className="flex justify-between items-center mb-3">
              <span className="text-white font-bold">طلباتي</span>
              <span className="text-[#FF8C42] font-bold">${total}</span>
            </div>
            <button 
              onClick={checkout}
              className="w-full bg-gradient-to-r from-[#FF8C42] to-[#FF6B2C] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
            >
              <Send size={16} />
              إرسال الطلب
            </button>
          </div>
        )}
      </div>

      {/* Success Toast */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-4 right-4 bg-green-500 text-white p-4 rounded-xl shadow-2xl text-center z-50"
          >
            <CheckCircle2 size={20} className="inline ml-2" />
            تم إرسال طلبك! جاري التحضير 🍔
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

// ========== Testimonials للهاتف ==========
const MobileTestimonials = () => {
  const testimonials = [
    { name: "أحمد السعيد", restaurant: "مطعم الأندلس", text: "منذ استخدام GoOrder، زادت أرباحنا 50%! النظام سهل وفعال.", rating: 5 },
    { name: "نورة العمري", restaurant: "كافيه روز", text: "عملاؤنا يحبون سرعة الطلب. أنصح به بشدة.", rating: 5 },
    { name: "خالد المالكي", restaurant: "بيتزا هاوس", text: "أفضل استثمار عملته لمطعمي. الدعم الفني ممتاز.", rating: 5 },
  ];

  return (
    <section className="py-12 px-5 bg-white/5">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-3">
          اللي جربونا
          <span className="text-[#FF8C42]"> مدحونا</span>
        </h2>
        <p className="text-white/50 text-sm">أكثر من 500 مطعم واثق في GoOrder</p>
      </div>

      <div className="space-y-4">
        {testimonials.map((t, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white/5 rounded-2xl p-5 border border-white/10"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF8C42] to-[#FF6B2C] flex items-center justify-center">
                <User size={18} className="text-white" />
              </div>
              <div>
                <h4 className="text-white font-bold">{t.name}</h4>
                <p className="text-white/40 text-xs">{t.restaurant}</p>
              </div>
              <div className="flex gap-0.5 mr-auto">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className="fill-[#FFD700] text-[#FFD700]" />
                ))}
              </div>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">{t.text}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

// ========== Final CTA للهاتف ==========
const MobileCTA = () => {
  return (
    <section className="py-16 px-5">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-[#FF8C42] to-[#FF6B2C] rounded-3xl p-8 text-center"
      >
        <h2 className="text-2xl font-bold text-white mb-3">
          خلّي مطعمك يسبق الباقي
        </h2>
        <p className="text-white/90 text-sm mb-6">
          ابدأ الآن واحصل على شهر مجاني + دعم فني 24/7
        </p>
        <motion.button
          whileTap={{ scale: 0.97 }}
          className="bg-white text-[#FF8C42] px-8 py-3 rounded-xl font-bold shadow-lg w-full"
        >
          اطلب العرض الآن 🚀
        </motion.button>
        <p className="text-white/70 text-xs mt-4">
          * لا حاجة لبطاقة ائتمان. إلغاء في أي وقت.
        </p>
      </motion.div>
    </section>
  );
};

// ========== Footer للهاتف ==========
const MobileFooter = () => {
  return (
    <footer className="py-8 px-5 border-t border-white/10 mt-8">
      <div className="text-center">
        <div className="flex justify-center gap-6 mb-4">
        </div>
        <p className="text-white/30 text-xs">© 2025 GoOrder - ثورة إدارة المطاعم</p>
        <p className="text-white/20 text-[10px] mt-2">جميع الحقوق محفوظة</p>
      </div>
    </footer>
  );
};

// ========== المكون الرئيسي ==========
export default function MobileLandingPage() {
  const [activePage, setActivePage] = useState('dashboard');

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activePage]);

  return (
    <div className="relative bg-gradient-to-br from-[#0F1A33] via-[#1A2A4F] to-[#0F1A33] min-h-screen overflow-x-hidden" dir="rtl">
      
      {/* Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-5">
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#FF8C42" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Main Content - يظهر حسب الصفحة النشطة */}
      <div className="relative z-10 pb-20">
        {activePage === 'dashboard' && (
          <>
            <MobileHero />
            <MobileStats />
            <MobileFeatures />
            <MobileOrderDemo />
            <MobileTestimonials />
            <MobileCTA />
            <MobileFooter />
          </>
        )}
        
        {activePage === 'orders' && (
          <div className="p-5 pt-8">
            <h2 className="text-2xl font-bold text-white mb-4">الطلبات النشطة</h2>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-[#FF8C42] font-bold">طاولة #{i * 2}</span>
                      <span className="text-white/40 text-xs mr-2">منذ {i * 5} دقائق</span>
                    </div>
                    <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-0.5 rounded">قيد التحضير</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">ستيك أنجوس</span>
                      <span className="text-white/50">2x</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activePage === 'menu' && (
          <div className="p-5 pt-8">
            <h2 className="text-2xl font-bold text-white mb-4">قائمة الطعام</h2>
            <div className="space-y-3">
              {['ستيك أنجوس', 'بيبروني بيتزا', 'باستا ألفريدو', 'تشيز كيك'].map((item, i) => (
                <div key={i} className="flex items-center justify-between bg-white/5 rounded-xl p-3">
                  <div>
                    <p className="text-white font-bold">{item}</p>
                    <p className="text-[#FF8C42] text-sm">${[28, 14, 16, 7][i]}</p>
                  </div>
                  <button className="bg-[#FF8C42] text-white px-4 py-1.5 rounded-lg text-sm">تعديل</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activePage === 'analytics' && (
          <div className="p-5 pt-8">
            <h2 className="text-2xl font-bold text-white mb-4">الإحصائيات</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-[#FF8C42]">₿24</p>
                <p className="text-white/50 text-xs">طلبات اليوم</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-[#FF8C42]">₿1,280</p>
                <p className="text-white/50 text-xs">إجمالي المبيعات</p>
              </div>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-white font-bold mb-2">الوجبات الأكثر مبيعاً</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">ستيك أنجوس</span>
                  <span className="text-white">28 طلب</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">بيبروني بيتزا</span>
                  <span className="text-white">22 طلب</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activePage === 'profile' && (
          <div className="p-5 pt-8">
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FF8C42] to-[#FF6B2C] mx-auto flex items-center justify-center mb-3">
                <User size={32} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">مطعم الأندلس</h2>
              <p className="text-white/40 text-sm">info@andalus.com</p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <span className="text-white">الإعدادات</span>
                <Settings size={18} className="text-white/40" />
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <span className="text-white">مركز المساعدة</span>
                <Phone size={18} className="text-white/40" />
              </div>
              <div className="flex items-center justify-between p-3 bg-red-500/10 rounded-xl">
                <span className="text-red-400">تسجيل الخروج</span>
                <LogOut size={18} className="text-red-400" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}