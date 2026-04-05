// go-order\app\Customer-Service\page.tsx

'use client';

import { useState } from 'react';
import { motion, AnimatePresence, Easing } from 'framer-motion';
import { 
  Sparkles, 
  Crown, 
  Star, 
  Table, 
  Key, 
  Send, 
  CheckCircle,
  ArrowLeft,
  ChevronRight,
  Zap,
  Users,
  TrendingUp,
  Loader2,
  UtensilsCrossed,
  Rocket,
  Coffee,
  Award,
  Building2,
  User,
  Smartphone,
  Eye,
  EyeOff,
  Phone
} from 'lucide-react';

// استيراد الدوال من ملف api
import { 
  sendSubscriptionRequest,
  sendUpgradeRequest,
  addTablesRequest,
  passwordTicketRequest
} from './api/telegram';

// إصلاح تعريف fadeInUp - استخدام Easing من framer-motion
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -30 },
  transition: { duration: 0.5, ease: "easeInOut" as Easing }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

export default function CustomerService() {
  const [activeService, setActiveService] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [autoRefill, setAutoRefill] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const result = await sendSubscriptionRequest({
        restaurantName: String(formData.restaurantName || ''),
        whatsapp: String(formData.whatsapp || ''),
        subscriptionType: String(formData.subscriptionType || ''),
        autoRefill: autoRefill,
      });
      
      if (result.success) {
        setSubmitStatus({ type: 'success', message: '✅ تم استلام طلبك بنجاح! سنقوم بالتواصل معك قريباً.' });
        setTimeout(() => {
          setActiveService(null);
          setFormData({});
          setAutoRefill(false);
          setSubmitStatus(null);
        }, 3000);
      } else {
        setSubmitStatus({ type: 'error', message: `❌ حدث خطأ: ${result.error || 'يرجى المحاولة مرة أخرى'}` });
      }
    } catch (error) {
      console.error('Error in handleSubscription:', error);
      setSubmitStatus({ type: 'error', message: '❌ حدث خطأ. يرجى المحاولة مرة أخرى.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpgrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const result = await sendUpgradeRequest({
        username: String(formData.username || ''),
        restaurantName: String(formData.restaurantName || ''),
        phone: String(formData.phone || ''),
        plan: String(selectedPlan || '')
      });
      
      if (result.success) {
        setSubmitStatus({ type: 'success', message: '✅ تم استلام طلب الترقية! سنتواصل معك قريباً.' });
        setTimeout(() => {
          setActiveService(null);
          setSelectedPlan(null);
          setFormData({});
          setSubmitStatus(null);
        }, 3000);
      } else {
        setSubmitStatus({ type: 'error', message: `❌ حدث خطأ: ${result.error || 'يرجى المحاولة مرة أخرى'}` });
      }
    } catch (error) {
      console.error('Error in handleUpgrade:', error);
      setSubmitStatus({ type: 'error', message: '❌ حدث خطأ. يرجى المحاولة مرة أخرى.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTables = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const result = await addTablesRequest({
        username: String(formData.username || ''),
        restaurantName: String(formData.restaurantName || ''),
        phone: String(formData.phone || ''),
        tableCount: Number(formData.tableCount) || 0
      });
      
      if (result.success) {
        setSubmitStatus({ type: 'success', message: '✅ تم استلام طلب إضافة الطاولات! سنقوم بإنشاء أكواد QR وإرسالها.' });
        setTimeout(() => {
          setActiveService(null);
          setFormData({});
          setSubmitStatus(null);
        }, 3000);
      } else {
        setSubmitStatus({ type: 'error', message: `❌ حدث خطأ: ${result.error || 'يرجى المحاولة مرة أخرى'}` });
      }
    } catch (error) {
      console.error('Error in handleAddTables:', error);
      setSubmitStatus({ type: 'error', message: '❌ حدث خطأ. يرجى المحاولة مرة أخرى.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const result = await passwordTicketRequest({
        restaurantName: String(formData.restaurantName || ''),
        username: String(formData.username || ''),
        phone: String(formData.phone || ''),
        requestType: String(formData.requestType || '') as 'ticket' | 'change',
        oldPassword: formData.oldPassword ? String(formData.oldPassword) : undefined,
        newPassword: formData.newPassword ? String(formData.newPassword) : undefined
      });
      
      if (result.success) {
        setSubmitStatus({ 
          type: 'success', 
          message: formData.requestType === 'change' 
            ? '✅ تم استلام طلب تغيير كلمة المرور!' 
            : '✅ تم استلام تذكرة كلمة المرور!' 
        });
        setTimeout(() => {
          setActiveService(null);
          setFormData({});
          setSubmitStatus(null);
        }, 3000);
      } else {
        setSubmitStatus({ type: 'error', message: `❌ حدث خطأ: ${result.error || 'يرجى المحاولة مرة أخرى'}` });
      }
    } catch (error) {
      console.error('Error in handlePasswordTicket:', error);
      setSubmitStatus({ type: 'error', message: '❌ حدث خطأ. يرجى المحاولة مرة أخرى.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderSubscriptionForm = () => (
    <motion.form
      initial={fadeInUp.initial}
      animate={fadeInUp.animate}
      exit={fadeInUp.exit}
      transition={fadeInUp.transition}
      onSubmit={handleSubscription}
      className="space-y-5"
    >
      <div className="relative group">
        <label className="block text-sm font-medium mb-2 text-[#FF8C42] flex items-center gap-2">
          <Building2 className="w-4 h-4" />
          اسم المطعم *
        </label>
        <input
          type="text"
          name="restaurantName"
          required
          onChange={handleInputChange}
          className="w-full px-5 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:border-[#FF8C42] focus:ring-2 focus:ring-[#FF8C42]/30 transition-all outline-none"
          placeholder="أدخل اسم المطعم"
        />
      </div>

      <div className="relative group">
        <label className="block text-sm font-medium mb-2 text-[#FF8C42] flex items-center gap-2">
          <Smartphone className="w-4 h-4" />
          رقم الواتساب للتواصل *
        </label>
        <input
          type="tel"
          name="whatsapp"
          required
          onChange={handleInputChange}
          className="w-full px-5 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:border-[#FF8C42] focus:ring-2 focus:ring-[#FF8C42]/30 transition-all outline-none"
          placeholder="مثال: 966512345678"
        />
      </div>

      <div className="relative group">
        <label className="block text-sm font-medium mb-2 text-[#FF8C42] flex items-center gap-2">
          <Star className="w-4 h-4" />
          نوع الخدمة *
        </label>
        <select
          name="subscriptionType"
          required
          onChange={handleInputChange}
          className="w-full px-5 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white focus:border-[#FF8C42] focus:ring-2 focus:ring-[#FF8C42]/30 transition-all outline-none [&>option]:bg-[#1A2A4F]"
        >
          <option value="" className="bg-[#1A2A4F]">اختر نوع الخدمة</option>
          <option value="trial" className="bg-[#1A2A4F]">✨ تجربة مجانية - 14 يوم</option>
          <option value="normal" className="bg-[#1A2A4F]">📋 اشتراك Normal</option>
          <option value="pro" className="bg-[#1A2A4F]">⭐ اشتراك Pro</option>
          <option value="plus" className="bg-[#1A2A4F]">👑 اشتراك Plus</option>
        </select>
      </div>

      <div className="flex items-center gap-3 py-2">
        <div className="relative">
          <input
            type="checkbox"
            id="autoRefill"
            checked={autoRefill}
            onChange={(e) => setAutoRefill(e.target.checked)}
            className="w-5 h-5 rounded border-white/30 bg-white/10 text-[#FF8C42] focus:ring-[#FF8C42]/30 focus:ring-2 transition-all"
          />
        </div>
        <label htmlFor="autoRefill" className="text-white/90 font-medium cursor-pointer">تفعيل التعبئة التلقائية للمينيو</label>
      </div>

      <motion.button
        type="submit"
        disabled={isSubmitting}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-4 bg-gradient-to-r from-[#FF8C42] to-[#FFA366] text-[#1A2A4F] rounded-xl font-bold text-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            جاري الإرسال...
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            إرسال الطلب
          </>
        )}
      </motion.button>
    </motion.form>
  );

  const renderUpgradeCards = () => {
    const plans = [
      {
        name: 'normal',
        title: 'Normal',
        price: '5$',
        priceDetail: '+ 1.5$ لكل طاولة',
        features: ['خدمة إدارة طلبات الطاولات داخل المطعم'],
        icon: <Coffee className="w-12 h-12" />,
        gradient: 'from-blue-600 to-cyan-500',
        bgGradient: 'bg-gradient-to-br from-blue-600/20 to-cyan-500/20'
      },
      {
        name: 'pro',
        title: 'Pro',
        price: '10$',
        priceDetail: '+ 1$ لكل طاولة',
        features: ['إدارة طلبات الطاولات', 'خدمات الطلبات لخارج المطعم', 'صفحات إعلانية للوجبات'],
        icon: <Rocket className="w-12 h-12" />,
        gradient: 'from-purple-600 to-pink-500',
        bgGradient: 'bg-gradient-to-br from-purple-600/20 to-pink-500/20',
        popular: true
      },
      {
        name: 'plus',
        title: 'Plus',
        price: '25$',
        priceDetail: '+ 1.5$ لكل طاولة زائدة عن 5',
        features: ['نظام متكامل', 'إدارة الموظفين', 'إحصائيات المطعم', 'رفع المبيعات'],
        icon: <Crown className="w-12 h-12" />,
        gradient: 'from-yellow-600 to-orange-500',
        bgGradient: 'bg-gradient-to-br from-yellow-600/20 to-orange-500/20'
      }
    ];

    return (
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="space-y-6"
      >
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              whileHover={{ scale: 1.03, y: -8 }}
              whileTap={{ scale: 0.98 }}
              className={`relative rounded-2xl overflow-hidden cursor-pointer ${plan.bgGradient} border border-white/20 backdrop-blur-sm`}
            >
              <div className="absolute top-0 right-0 w-40 h-40 opacity-10">
                <UtensilsCrossed className="w-full h-full" />
              </div>
              {plan.popular && (
                <div className="absolute top-4 right-4 bg-gradient-to-r from-[#FF8C42] to-[#FFA366] text-[#1A2A4F] px-3 py-1 rounded-full text-xs font-bold z-10 flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  الأكثر طلباً
                </div>
              )}
              <div className={`bg-gradient-to-r ${plan.gradient} p-6 text-white`}>
                <div className="mb-4">{plan.icon}</div>
                <h3 className="text-2xl font-bold mb-1">{plan.title}</h3>
                <div className="text-3xl font-bold">{plan.price}</div>
                <div className="text-sm opacity-80">{plan.priceDetail}</div>
              </div>
              <div className="p-6">
                <ul className="space-y-2">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-white/80 text-sm">
                      <CheckCircle className="w-4 h-4 text-[#FF8C42]" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <motion.button
                  onClick={() => {
                    setSelectedPlan(plan.name);
                    setFormData({});
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-6 w-full py-3 bg-gradient-to-r from-[#FF8C42] to-[#FFA366] text-[#1A2A4F] rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  ترقية الآن
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  };

  const renderUpgradeForm = () => (
    <motion.form
      initial={fadeInUp.initial}
      animate={fadeInUp.animate}
      exit={fadeInUp.exit}
      transition={fadeInUp.transition}
      onSubmit={handleUpgrade}
      className="space-y-5"
    >
      <div className="relative group">
        <label className="block text-sm font-medium mb-2 text-[#FF8C42] flex items-center gap-2">
          <User className="w-4 h-4" />
          Username الخاص بالمطعم *
        </label>
        <input
          type="text"
          name="username"
          required
          onChange={handleInputChange}
          className="w-full px-5 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:border-[#FF8C42] focus:ring-2 focus:ring-[#FF8C42]/30 transition-all outline-none"
          placeholder="أدخل username"
        />
      </div>

      <div className="relative group">
        <label className="block text-sm font-medium mb-2 text-[#FF8C42] flex items-center gap-2">
          <Building2 className="w-4 h-4" />
          اسم المطعم *
        </label>
        <input
          type="text"
          name="restaurantName"
          required
          onChange={handleInputChange}
          className="w-full px-5 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:border-[#FF8C42] focus:ring-2 focus:ring-[#FF8C42]/30 transition-all outline-none"
          placeholder="أدخل اسم المطعم"
        />
      </div>

      <div className="relative group">
        <label className="block text-sm font-medium mb-2 text-[#FF8C42] flex items-center gap-2">
          <Smartphone className="w-4 h-4" />
          رقم التواصل *
        </label>
        <input
          type="tel"
          name="phone"
          required
          onChange={handleInputChange}
          className="w-full px-5 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:border-[#FF8C42] focus:ring-2 focus:ring-[#FF8C42]/30 transition-all outline-none"
          placeholder="رقم الواتساب للتواصل"
        />
      </div>

      <motion.button
        type="submit"
        disabled={isSubmitting}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-4 bg-gradient-to-r from-[#FF8C42] to-[#FFA366] text-[#1A2A4F] rounded-xl font-bold text-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            جاري الإرسال...
          </>
        ) : (
          <>
            <CheckCircle className="w-5 h-5" />
            تأكيد الترقية
          </>
        )}
      </motion.button>
    </motion.form>
  );

  const renderAddTablesForm = () => (
    <motion.form
      initial={fadeInUp.initial}
      animate={fadeInUp.animate}
      exit={fadeInUp.exit}
      transition={fadeInUp.transition}
      onSubmit={handleAddTables}
      className="space-y-5"
    >
      <div className="relative group">
        <label className="block text-sm font-medium mb-2 text-[#FF8C42] flex items-center gap-2">
          <User className="w-4 h-4" />
          Username الخاص بالمطعم *
        </label>
        <input
          type="text"
          name="username"
          required
          onChange={handleInputChange}
          className="w-full px-5 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:border-[#FF8C42] focus:ring-2 focus:ring-[#FF8C42]/30 transition-all outline-none"
          placeholder="أدخل username"
        />
      </div>

      <div className="relative group">
        <label className="block text-sm font-medium mb-2 text-[#FF8C42] flex items-center gap-2">
          <Building2 className="w-4 h-4" />
          اسم المطعم *
        </label>
        <input
          type="text"
          name="restaurantName"
          required
          onChange={handleInputChange}
          className="w-full px-5 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:border-[#FF8C42] focus:ring-2 focus:ring-[#FF8C42]/30 transition-all outline-none"
          placeholder="أدخل اسم المطعم"
        />
      </div>

      <div className="relative group">
        <label className="block text-sm font-medium mb-2 text-[#FF8C42] flex items-center gap-2">
          <Smartphone className="w-4 h-4" />
          رقم التواصل (واتساب) *
        </label>
        <input
          type="tel"
          name="phone"
          required
          onChange={handleInputChange}
          className="w-full px-5 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:border-[#FF8C42] focus:ring-2 focus:ring-[#FF8C42]/30 transition-all outline-none"
          placeholder="مثال: 966512345678"
        />
      </div>

      <div className="relative group">
        <label className="block text-sm font-medium mb-2 text-[#FF8C42] flex items-center gap-2">
          <Table className="w-4 h-4" />
          عدد الطاولات الجديدة *
        </label>
        <input
          type="number"
          name="tableCount"
          required
          min="1"
          onChange={handleInputChange}
          className="w-full px-5 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:border-[#FF8C42] focus:ring-2 focus:ring-[#FF8C42]/30 transition-all outline-none"
          placeholder="عدد الطاولات المراد إضافتها"
        />
      </div>

      <motion.button
        type="submit"
        disabled={isSubmitting}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-4 bg-gradient-to-r from-[#FF8C42] to-[#FFA366] text-[#1A2A4F] rounded-xl font-bold text-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            جاري الإرسال...
          </>
        ) : (
          <>
            <Table className="w-5 h-5" />
            تأكيد إضافة الطاولات
          </>
        )}
      </motion.button>
    </motion.form>
  );

  const renderPasswordTicketForm = () => (
    <motion.form
      initial={fadeInUp.initial}
      animate={fadeInUp.animate}
      exit={fadeInUp.exit}
      transition={fadeInUp.transition}
      onSubmit={handlePasswordTicket}
      className="space-y-5"
    >
      <div className="relative group">
        <label className="block text-sm font-medium mb-2 text-[#FF8C42] flex items-center gap-2">
          <Key className="w-4 h-4" />
          نوع الطلب *
        </label>
        <select
          name="requestType"
          required
          onChange={handleInputChange}
          className="w-full px-5 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white focus:border-[#FF8C42] focus:ring-2 focus:ring-[#FF8C42]/30 transition-all outline-none [&>option]:bg-[#1A2A4F]"
        >
          <option value="" className="bg-[#1A2A4F]">اختر نوع الطلب</option>
          <option value="ticket" className="bg-[#1A2A4F]">🎫 تذكرة بكلمة المرور</option>
          <option value="change" className="bg-[#1A2A4F]">🔄 تغيير كلمة المرور</option>
        </select>
      </div>

      <div className="relative group">
        <label className="block text-sm font-medium mb-2 text-[#FF8C42] flex items-center gap-2">
          <Building2 className="w-4 h-4" />
          اسم المطعم *
        </label>
        <input
          type="text"
          name="restaurantName"
          required
          onChange={handleInputChange}
          className="w-full px-5 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:border-[#FF8C42] focus:ring-2 focus:ring-[#FF8C42]/30 transition-all outline-none"
          placeholder="أدخل اسم المطعم"
        />
      </div>

      <div className="relative group">
        <label className="block text-sm font-medium mb-2 text-[#FF8C42] flex items-center gap-2">
          <User className="w-4 h-4" />
          Username الخاص بالمطعم *
        </label>
        <input
          type="text"
          name="username"
          required
          onChange={handleInputChange}
          className="w-full px-5 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:border-[#FF8C42] focus:ring-2 focus:ring-[#FF8C42]/30 transition-all outline-none"
          placeholder="أدخل username"
        />
      </div>

      <div className="relative group">
        <label className="block text-sm font-medium mb-2 text-[#FF8C42] flex items-center gap-2">
          <Smartphone className="w-4 h-4" />
          رقم التواصل *
        </label>
        <input
          type="tel"
          name="phone"
          required
          onChange={handleInputChange}
          className="w-full px-5 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:border-[#FF8C42] focus:ring-2 focus:ring-[#FF8C42]/30 transition-all outline-none"
          placeholder="رقم الواتساب للتواصل"
        />
      </div>

      {formData.requestType === 'change' && (
        <motion.div
          initial={fadeInUp.initial}
          animate={fadeInUp.animate}
          exit={fadeInUp.exit}
          transition={fadeInUp.transition}
          className="space-y-4"
        >
          <div className="relative">
            <label className="block text-sm font-medium mb-2 text-[#FF8C42] flex items-center gap-2">
              <Key className="w-4 h-4" />
              كلمة المرور السابقة *
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="oldPassword"
                required
                onChange={handleInputChange}
                className="w-full px-5 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:border-[#FF8C42] focus:ring-2 focus:ring-[#FF8C42]/30 transition-all outline-none pr-12"
                placeholder="أدخل كلمة المرور السابقة"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-[#FF8C42] flex items-center gap-2">
              <Key className="w-4 h-4" />
              كلمة المرور الجديدة *
            </label>
            <input
              type="password"
              name="newPassword"
              required
              onChange={handleInputChange}
              className="w-full px-5 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:border-[#FF8C42] focus:ring-2 focus:ring-[#FF8C42]/30 transition-all outline-none"
              placeholder="أدخل كلمة المرور الجديدة"
            />
          </div>
        </motion.div>
      )}

      <motion.button
        type="submit"
        disabled={isSubmitting}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-4 bg-gradient-to-r from-[#FF8C42] to-[#FFA366] text-[#1A2A4F] rounded-xl font-bold text-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            جاري الإرسال...
          </>
        ) : (
          <>
            <Key className="w-5 h-5" />
            {formData.requestType === 'change' ? 'تغيير كلمة المرور' : 'إرسال التذكرة'}
          </>
        )}
      </motion.button>
    </motion.form>
  );

  const services = [
    { id: 'subscription', title: 'إنشاء اشتراك جديد', icon: <Sparkles className="w-6 h-6" />, description: 'احصل على اشتراك جديد لمطعمك مع تجربة مجانية', gradient: 'from-blue-500 to-cyan-500' },
    { id: 'upgrade', title: 'ترقية الاشتراك', icon: <Crown className="w-6 h-6" />, description: 'رقّي اشتراكك للحصول على ميزات أكثر', gradient: 'from-purple-500 to-pink-500' },
    { id: 'tables', title: 'إضافة طاولات', icon: <Table className="w-6 h-6" />, description: 'أضف طاولات جديدة لمطعمك', gradient: 'from-green-500 to-emerald-500' },
    { id: 'password', title: 'تذكرة كلمة المرور', icon: <Key className="w-6 h-6" />, description: 'استرجاع أو تغيير كلمة المرور', gradient: 'from-orange-500 to-red-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] via-[#1A2A4F] to-[#0F172A] relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#FF8C42]/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#1A2A4F]/30 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-[#FF8C42]/5 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#FF8C42]/10 to-transparent" />
        <div className="container mx-auto px-4 py-20 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
            className="flex flex-col items-center text-center"
          >
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="relative mb-6"
            >
              <div className="absolute inset-0 bg-[#FF8C42]/30 rounded-full blur-xl animate-ping" />
              <div className="relative w-24 h-24 bg-gradient-to-br from-[#FF8C42] to-[#FFA366] rounded-full flex items-center justify-center shadow-2xl">
                <UtensilsCrossed className="w-12 h-12 text-white" />
              </div>
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white via-[#FF8C42] to-white bg-clip-text text-transparent mb-4">
              GoOrder
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-2">خدمة العملاء</p>
            <p className="text-lg text-white/60 max-w-2xl">نحن هنا لخدمتك على مدار الساعة</p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 relative z-10">
        <AnimatePresence mode="wait">
          {!activeService ? (
            <motion.div
              key="services"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Services Grid */}
              <motion.div 
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
              >
                {services.map((service) => (
                  <motion.button
                    key={service.id}
                    whileHover={{ scale: 1.03, y: -8 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveService(service.id)}
                    className="group relative rounded-2xl p-6 text-right overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 hover:border-[#FF8C42]/50 transition-all duration-300"
                  >
                    {/* Large Transparent UtensilsCrossed Icon in Background */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                      <UtensilsCrossed className="w-48 h-48 text-white/30 transform rotate-12" />
                    </div>
                    
                    {/* Shine Line Effect - المسطرة اللامعة */}
                    <div className="absolute inset-0 overflow-hidden rounded-2xl">
                      <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/20 to-transparent w-full h-full" />
                    </div>
                    
                    {/* Animated Background Gradient */}
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${service.gradient} opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500`} />
                    
                    {/* Icon */}
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${service.gradient} text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg relative z-10`}>
                      {service.icon}
                    </div>
                    
                    {/* Content */}
                    <h3 className="text-xl font-bold text-white mb-2 relative z-10">{service.title}</h3>
                    <p className="text-white/60 text-sm relative z-10">{service.description}</p>
                    
                    {/* Arrow Button */}
                    <div className="mt-4 flex items-center text-[#FF8C42] gap-1 group-hover:gap-2 transition-all relative z-10">
                      <span className="text-sm">اطلب الخدمة</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </motion.button>
                ))}
              </motion.div>
              
              {/* Quick Stats */}
              <motion.div
                initial={fadeInUp.initial}
                animate={fadeInUp.animate}
                transition={fadeInUp.transition}
                className="grid md:grid-cols-3 gap-6 mb-16"
              >
                <motion.div whileHover={{ scale: 1.02, y: -5 }} className="bg-gradient-to-r from-[#1A2A4F]/80 to-[#2A3A5F]/80 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#FF8C42]/20 rounded-full flex items-center justify-center">
                      <Zap className="w-6 h-6 text-[#FF8C42]" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">24/7</div>
                      <div className="text-sm text-white/60">دعم فني على مدار الساعة</div>
                    </div>
                  </div>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02, y: -5 }} className="bg-gradient-to-r from-[#FF8C42]/20 to-[#FFA366]/20 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-[#FF8C42]" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">+10</div>
                      <div className="text-sm text-white/60">مطعم يثقون بنا</div>
                    </div>
                  </div>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02, y: -5 }} className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-[#FF8C42]" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">+80%</div>
                      <div className="text-sm text-white/60">متوسط نمو المبيعات</div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Contact Section */}
              <motion.div
                initial={fadeInUp.initial}
                animate={fadeInUp.animate}
                transition={fadeInUp.transition}
                
              >
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-white mb-4">يمكنك مراسلتنا عبر</h3>
                  <div className="flex justify-center gap-8">
                    <motion.a
                      whileHover={{ scale: 1.1, y: -5 }}
                      href="https://wa.me/79610195064"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center gap-2"
                    >
                      <div className="w-14 h-14 bg-[#FF8C42] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all">
                        <Phone className="w-7 h-7 text-white" />
                      </div>
                      <span className="font-semibold text-white text-sm">واتساب</span>
                    </motion.a>
                    
                    <motion.a
                      whileHover={{ scale: 1.1, y: -5 }}
                      href="https://t.me/onrequstGoOrder"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center gap-2"
                    >
                      <div className="w-14 h-14 bg-[#FF8C42] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all">
                        <Send className="w-7 h-7 text-white" />
                      </div>
                      <span className="font-semibold text-white text-sm">تليغرام</span>
                    </motion.a>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              {/* Back Button */}
              <motion.button
                initial={fadeInUp.initial}
                animate={fadeInUp.animate}
                transition={fadeInUp.transition}
                onClick={() => {
                  setActiveService(null);
                  setSelectedPlan(null);
                  setFormData({});
                  setAutoRefill(false);
                }}
                className="flex items-center gap-2 text-white/70 hover:text-[#FF8C42] transition-colors mb-6 group"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span>العودة إلى الخدمات</span>
              </motion.button>

              {/* Service Form */}
              <div className="max-w-2xl mx-auto rounded-2xl p-8 bg-white/5 backdrop-blur-sm border border-white/10 shadow-2xl">
                <div className="text-center mb-8">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1, rotate: 360 }}
                    transition={{ duration: 0.5, type: "spring" }}
                    className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${
                      activeService === 'subscription' ? 'from-blue-500 to-cyan-500' :
                      activeService === 'upgrade' ? 'from-purple-500 to-pink-500' :
                      activeService === 'tables' ? 'from-green-500 to-emerald-500' :
                      'from-orange-500 to-red-500'
                    } text-white flex items-center justify-center mx-auto mb-4 shadow-xl`}
                  >
                    {activeService === 'subscription' && <Sparkles className="w-10 h-10" />}
                    {activeService === 'upgrade' && <Crown className="w-10 h-10" />}
                    {activeService === 'tables' && <Table className="w-10 h-10" />}
                    {activeService === 'password' && <Key className="w-10 h-10" />}
                  </motion.div>
                  <h2 className="text-2xl font-bold text-white">
                    {activeService === 'subscription' && 'إنشاء اشتراك جديد'}
                    {activeService === 'upgrade' && (selectedPlan ? `ترقية الاشتراك - ${selectedPlan.toUpperCase()}` : 'ترقية الاشتراك')}
                    {activeService === 'tables' && 'إضافة طاولات جديدة'}
                    {activeService === 'password' && 'تذكرة كلمة المرور'}
                  </h2>
                </div>

                {submitStatus && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mb-6 p-4 rounded-xl text-center ${
                      submitStatus.type === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}
                  >
                    {submitStatus.message}
                  </motion.div>
                )}

                {activeService === 'subscription' && renderSubscriptionForm()}
                {activeService === 'upgrade' && (selectedPlan ? renderUpgradeForm() : renderUpgradeCards())}
                {activeService === 'tables' && renderAddTablesForm()}
                {activeService === 'password' && renderPasswordTicketForm()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}