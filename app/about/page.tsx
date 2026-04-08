"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
  QrCode, 
  TrendingUp, 
  LayoutDashboard, 
  Shield, 
  Star, 
  ArrowRight, 
  CheckCircle2,
  Sparkles,
  Clock,
  CreditCard,
  BarChart3,
  Users,
  Award,
  Zap,
  Globe,
  Bell,
  Coffee,
  Receipt,
  Printer,
  Settings,
  Home,
  ShoppingCart,
  User,
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
  Send,
  Check,
  AlertCircle,
  Flame,
  Crown,
  Gift,
  Wifi,
  Battery,
  Signal,
  MessageCircle,
  Headphones,
  Rocket,
  PieChart,
  Smartphone,
  Layers,
  PenTool,
  Link2,
} from "lucide-react";

// ========== المكونات الأساسية ==========

// زر متحرك
const AnimatedButton = ({ href, children, primary = true }: { href: string; children: React.ReactNode; primary?: boolean }) => {
  return (
    <Link href={href}>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`group relative px-8 py-3.5 rounded-xl font-bold shadow-xl flex items-center justify-center gap-2 overflow-hidden transition-all ${
          primary 
            ? "bg-gradient-to-r from-[#FF8C42] to-[#FF6B2C] text-white shadow-[#FF8C42]/30" 
            : "border border-white/20 text-white hover:bg-white/5"
        }`}
      >
        <span className="relative z-10">{children}</span>
        {primary && <ArrowRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />}
      </motion.button>
    </Link>
  );
};

// بطاقة الميزة
const FeatureCard = ({ icon: Icon, title, description, color = "#FF8C42" }: { icon: any; title: string; description: string; color?: string }) => {
  return (
    <motion.div
      whileHover={{ y: -5, borderColor: `${color}40` }}
      className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10 transition-all duration-300 h-full"
    >
      <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `${color}15` }}>
        <Icon size={24} style={{ color }} />
      </div>
      <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
      <p className="text-white/50 text-sm leading-relaxed">{description}</p>
    </motion.div>
  );
};

// ========== القسم الرئيسي (Hero) ==========
const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden px-5 pt-20 pb-16">
      {/* خلفية متحركة */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#FF8C42] opacity-[0.06] blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-[#FF8C42] opacity-[0.04] blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto">
        <div className="text-center mb-12">
          {/* شارة */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-[#FF8C42]/10 backdrop-blur-sm px-4 py-2 rounded-full border border-[#FF8C42]/20 mb-6"
          >
            <span className="text-[#FF8C42] text-[50px] font-medium">GoOrder</span>
          </motion.div>

          {/* العنوان الرئيسي */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight"
          >
            ليس مجرد نظام إدارة.
            <br />
            <span className="text-[#FF8C42]">إنه شريك نجاحك الرقمي.</span>
          </motion.h1>

          {/* الوصف */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/60 text-base md:text-lg mb-8 max-w-2xl mx-auto leading-relaxed"
          >
            منصة GoOrder تمنحك تحكماً كاملاً في عمليات مطعمك الداخلية وتجربة عملائك الرقمية. 
            وفر وقتك، ضاعف أرباحك، وابنِ علامتك التجارية بأدوات احترافية.
          </motion.p>

          {/* أزرار الدعوة للإجراء */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-16 w-full"
          >
            <AnimatedButton href="/Customer-Service">ابدأ فترة الـ 14 يوم المجانية</AnimatedButton>
            <AnimatedButton href="#demo" primary={false}>شاهد عرضاً توضيحياً</AnimatedButton>
          </motion.div>
        </div>

        {/* محاكاة الجهاز (Phone + Laptop) */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, type: "spring" }}
          className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16"
        >
          {/* هاتف - تجربة العميل */}
          <div className="relative">
            <p className="text-center text-white/40 text-xl mb-4 flex items-center justify-center gap-1">
              <Smartphone size={14} /> تجربة عميل استثنائية
            </p>
            <div className="relative w-[260px] h-[520px] md:w-[280px] md:h-[560px]">
              <motion.div 
  initial={{ y: 50, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  transition={{ delay: 0.2, type: "spring" }}
  className="relative mx-auto w-[280px] h-[560px]"
>
  <div className="relative rounded-[40px] bg-[#0F1A33] p-2 shadow-2xl border border-white/10 h-[560px]">
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-5 bg-[#0F1A33] rounded-b-2xl z-10" />
    <div className="bg-gradient-to-br from-[#1A2A4F] to-[#0F1A33] rounded-[32px] overflow-hidden h-[530px]">
      
      {/* محتوى الشاشة */}
      <div dir="rtl" className="h-full overflow-y-auto">
        
        {/* الهيدر */}
        <div className="bg-orange-400 px-4 py-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full"></div>
            <div className="flex-1">
              <div className="h-5 w-28 bg-white/30 rounded"></div>
              <div className="flex gap-2 mt-2">
                <div className="h-4 w-16 bg-white/30 rounded-full"></div>
                <div className="h-4 w-16 bg-white/30 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* الفلاتر */}
        <div className="px-4 py-3">
          <div className="flex gap-2 overflow-x-auto">
            <div className="h-7 w-14 bg-orange-400 rounded-full shrink-0"></div>
            <div className="h-7 w-14 bg-white/10 rounded-full shrink-0"></div>
            <div className="h-7 w-14 bg-white/10 rounded-full shrink-0"></div>
            <div className="h-7 w-14 bg-white/10 rounded-full shrink-0"></div>
            <div className="h-7 w-14 bg-white/10 rounded-full shrink-0"></div>
          </div>
        </div>

        {/* شبكة الأطباق */}
        <div className="px-4">
          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white/5 rounded-xl overflow-hidden">
                <div className="w-full aspect-square bg-white/10"></div>
                <div className="p-2">
                  <div className="h-3 w-20 bg-white/20 rounded mb-1"></div>
                  <div className="h-2 w-full bg-white/10 rounded mb-2"></div>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-1">
                      <div className="w-5 h-5 bg-white/20 rounded"></div>
                      <div className="w-5 h-5 bg-white/20 rounded"></div>
                    </div>
                    <div className="w-12 h-6 bg-orange-400 rounded-lg"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>

  {/* عناصر عائمة */}
  <motion.div 
    animate={{ y: [0, -6, 0] }}
    transition={{ duration: 3, repeat: Infinity }}
    className="absolute -top-3 -right-3 bg-orange-400 p-1.5 rounded-xl shadow-lg"
  >
    <div className="w-3 h-3 bg-white rounded"></div>
  </motion.div>
  <motion.div 
    animate={{ y: [0, 6, 0] }}
    transition={{ duration: 4, repeat: Infinity, delay: 1 }}
    className="absolute -bottom-3 -left-3 bg-green-500 p-1.5 rounded-xl shadow-lg"
  >
    <div className="w-3 h-3 bg-white rounded"></div>
  </motion.div>


</motion.div>
              
              {/* عناصر عائمة متحركة */}
              <motion.div 
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-4 -right-4 bg-green-500 p-2 rounded-xl shadow-lg"
              >
                <CheckCircle2 size={16} className="text-white" />
              </motion.div>
            </div>
          </div>

          {/* لابتوب - لوحة التحكم */}
          <div className="relative mt-20">
            <p className="text-center text-white/40 text-sm mb-4 flex items-center justify-center gap-1">
              <LayoutDashboard size={14} /> لوحة تحكم احترافية
            </p>
            <div className="relative w-full max-w-2xl rounded-t-xl overflow-hidden shadow-2xl border border-white/20 bg-[#0F1A33]">
              {/* شريط عنوان اللابتوب */}
              <div className="bg-[#1A1F2E] px-4 py-2 flex items-center gap-2 border-b border-white/10">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="flex-1 text-center">
                  <span className="text-white/40 text-xs">GoOrder Dashboard — نظرة عامة</span>
                </div>
              </div>
              
              {/* محتوى لوحة التحكم */}
              <div dir="rtl" className="p-4 bg-gradient-to-br from-[#0F1A33] to-[#1A2A4F]">
                {/* صف الإحصائيات */}
                <div className="grid grid-cols-4 gap-3 mb-4">
                  <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-white/40 text-[10px]">المبيعات</span>
                      <DollarSign size={12} className="text-[#FF8C42]" />
                    </div>
                    <p className="text-white font-bold text-lg">$2,480</p>
                    <p className="text-green-400 text-[10px]">↑ 12% عن أمس</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-white/40 text-[10px]">الطلبات</span>
                      <ShoppingCart size={12} className="text-[#FF8C42]" />
                    </div>
                    <p className="text-white font-bold text-lg">48</p>
                    <p className="text-green-400 text-[10px]">↑ 8 طلبات جديدة</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-white/40 text-[10px]">متوسط الفاتورة</span>
                      <Receipt size={12} className="text-[#FF8C42]" />
                    </div>
                    <p className="text-white font-bold text-lg">$51.6</p>
                    <p className="text-green-400 text-[10px]">↑ $2.4</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-white/40 text-[10px]">الموظفون</span>
                      <Users size={12} className="text-[#FF8C42]" />
                    </div>
                    <p className="text-white font-bold text-lg">8</p>
                    <p className="text-white/30 text-[10px]">نشطون حالياً</p>
                  </div>
                </div>
                
                {/* رسم بياني بسيط */}
                <div className="bg-white/5 rounded-lg p-4 mb-4 border border-white/5">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-white text-sm font-medium">أداء المبيعات — آخر 7 أيام</span>
                    <span className="text-white/30 text-[10px]">تحديث مباشر</span>
                  </div>
                  <div className="h-20 flex items-end gap-1">
                    {[40, 65, 45, 70, 55, 80, 60].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full bg-[#FF8C42]/30 rounded-t" style={{ height: `${h}%` }}>
                          <div className="w-full bg-[#FF8C42] rounded-t h-full" />
                        </div>
                        <span className="text-white/30 text-[8px]">{["أحد","إثن","ثلا","أرب","خمي","جمع","سبت"][i]}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* آخر الطلبات */}
                <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white text-sm font-medium">آخر الطلبات</span>
                    <span className="text-[#FF8C42] text-[10px]">عرض الكل</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        <span className="text-white">طاولة #12</span>
                      </div>
                      <span className="text-white/50">$86.50</span>
                      <span className="text-white/30 text-[10px]">قبل 2 د</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                        <span className="text-white">طاولة #08</span>
                      </div>
                      <span className="text-white/50">$124.00</span>
                      <span className="text-white/30 text-[10px]">قبل 5 د</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#FF8C42]"></span>
                        <span className="text-white">طاولة #03</span>
                      </div>
                      <span className="text-white/50">$45.20</span>
                      <span className="text-white/30 text-[10px]">قبل 8 د</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// ========== قسم الرؤية والقيمة الاستثمارية ==========
const VisionSection = () => {
  return (
    <section className="py-20 px-5 bg-white/[0.02]">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            رؤيتنا: <span className="text-[#FF8C42]">تمكين المطاعم من الازدهار الرقمي</span>
          </h2>
          <p className="text-white/60 text-lg max-w-3xl mx-auto">
            نؤمن أن التكنولوجيا يجب أن تكون شريكاً استراتيجياً للمطعم، وليس مجرد أداة. 
            GoOrder صُممت لتمنحك ميزة تنافسية حقيقية في سوق متغير.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-[#1A2A4F]/50 to-transparent rounded-2xl p-6 border border-white/10 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-[#FF8C42]/10 flex items-center justify-center mx-auto mb-4">
              <Rocket size={28} className="text-[#FF8C42]" />
            </div>
            <h3 className="text-white font-bold text-xl mb-2">استثمار بعائد سريع</h3>
            <p className="text-white/50 text-sm leading-relaxed">
              تكلفة تشغيل GoOrder أقل من تكلفة موظف واحد، بينما تمنحك عوائد متعددة من تحسين الكفاءة وزيادة متوسط الفاتورة. استرد استثمارك في الأسابيع الأولى.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-[#1A2A4F]/50 to-transparent rounded-2xl p-6 border border-white/10 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-[#FF8C42]/10 flex items-center justify-center mx-auto mb-4">
              <Shield size={28} className="text-[#FF8C42]" />
            </div>
            <h3 className="text-white font-bold text-xl mb-2">ملكية كاملة لبياناتك</h3>
            <p className="text-white/50 text-sm leading-relaxed">
              على عكس منصات التوصيل التي تحجب بيانات العملاء، GoOrder تمنحك ملكية كاملة لقاعدة بيانات عملائك لبناء علاقة مباشرة وبرامج ولاء فعالة.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-[#1A2A4F]/50 to-transparent rounded-2xl p-6 border border-white/10 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-[#FF8C42]/10 flex items-center justify-center mx-auto mb-4">
              <Headphones size={28} className="text-[#FF8C42]" />
            </div>
            <h3 className="text-white font-bold text-xl mb-2">خدمة عملاء استثنائية</h3>
            <p className="text-white/50 text-sm leading-relaxed">
              نجاحك هو نجاحنا. فريق دعم متخصص متاح عبر الهاتف والواتساب والتليجرام لحل أي استفسار أو مشكلة بشكل فوري. لست وحدك في هذه الرحلة.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// ========== قسم المميزات المتكاملة ==========
const FeaturesSection = () => {
  const features = [
    {
      icon: QrCode,
      title: "نظام QR ذكي",
      description: "امنح عملائك تجربة طلب سلسة من الطاولة بدون تطبيقات. قوائم رقمية تفاعلية تعرض صور وأسعار وتفاصيل كل طبق بشكل جذاب.",
    },
    {
      icon: LayoutDashboard,
      title: "لوحة تحكم متكاملة",
      description: "أدر جميع عمليات مطعمك من شاشة واحدة: الطلبات، المطبخ، المخزون، الموظفين. تحكم كامل في أدق التفاصيل.",
    },
    {
      icon: PenTool,
      title: "مينيو مخصص بهويتك",
      description: "صمم قائمتك الرقمية بألوان وشعار مطعمك. أضف صوراً احترافية للأطباق ووصفاً جذاباً يزيد من رغبة العملاء في الطلب.",
    },
    {
      icon: Users,
      title: "إدارة الموظفين والورديات",
      description: "جدول مواعيد الموظفين، صلاحيات الاستخدام، وتتبع أداء كل فرد. نظام كامل لإدارة فريق العمل بكفاءة.",
    },
    {
      icon: PieChart,
      title: "تحليلات وتقارير شهرية",
      description: "تقارير تفصيلية عن المبيعات، الأطباق الأكثر ربحاً، أوقات الذروة، وأداء الموظفين. بيانات دقيقة لاتخاذ قرارات استثمارية أفضل.",
    },
    {
      icon: Globe,
      title: "صفحة خاصة لمطعمك",
      description: "احصل على صفحة ويب مخصصة لمطعمك مع إمكانية تخصيص رابط خاص. عزز ظهورك على الإنترنت واجذب عملاء جدد.",
    },
    {
      icon: Link2,
      title: "صفحات إعلانية للأطباق",
      description: "أنشئ روابط قصيرة لكل وجبة أو عرض خاص لمشاركتها على وسائل التواصل الاجتماعي وجذب الطلبات المباشرة.",
    },
    {
      icon: Layers,
      title: "باقات اشتراك متعددة",
      description: "اختر الباقة التي تناسب حجم ونشاط مطعمك. من الباقات الأساسية للمطاعم الصغيرة إلى حلول المؤسسات متعددة الفروع.",
    },
  ];

  return (
    <section className="py-20 px-5">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            منظومة متكاملة <span className="text-[#FF8C42]">لتشغيل مطعمك بذكاء</span>
          </h2>
          <p className="text-white/60 text-lg max-w-3xl mx-auto">
            كل ما تحتاجه لإدارة مطعم عصري وناجح في منصة واحدة. أدوات مصممة خصيصاً لتلبية احتياجات قطاع المطاعم.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              viewport={{ once: true }}
            >
              <FeatureCard {...feature} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ========== قسم خدمة العملاء والدعم ==========
const SupportSection = () => {
  return (
    <section className="py-20 px-5 bg-gradient-to-b from-[#FF8C42]/5 to-transparent">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-br from-[#1A2A4F] to-[#0F1A33] rounded-3xl p-8 md:p-12 border border-white/10 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-[#FF8C42]/20 flex items-center justify-center mx-auto mb-6">
            <Headphones size={36} className="text-[#FF8C42]" />
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            نجاحك هو هدفنا. <span className="text-[#FF8C42]">خدمة عملاء لا تتوقف.</span>
          </h2>
          
          <p className="text-white/60 text-base md:text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
            ندرك أن أي نظام جديد يحتاج إلى دعم وتوجيه. فريق GoOrder موجود معك خطوة بخطوة لضمان انتقال سلس واستفادة قصوى من كل ميزة. 
            استفساراتك تُحل فوراً عبر قنواتنا المباشرة.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="https://wa.me/79610195064" 
              target="_blank"
              className="bg-[#25D366] hover:bg-[#20bd5a] text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg shadow-[#25D366]/20"
            >
              <MessageCircle size={22} />
              تواصل عبر الواتساب
            </Link>
            <Link 
              href="https://t.me/onrequstGoOrder" 
              target="_blank"
              className="bg-[#0088cc] hover:bg-[#0077b3] text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg shadow-[#0088cc]/20"
            >
              <Send size={22} />
              تواصل عبر التليجرام
            </Link>
            <Link 
              href="/Customer-Service"
              className="bg-white/10 hover:bg-white/15 text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all border border-white/10"
            >
              <Headphones size={22} />
              مركز المساعدة
            </Link>
          </div>
          
          <p className="text-white/30 text-sm mt-6">
            * دعم فني وتقني متاح طوال أيام الأسبوع. نضمن الرد خلال دقائق.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

// ========== قسم التجربة المجانية والعرض ==========
const TrialSection = () => {
  return (
    <section className="py-20 px-5">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#FF8C42] to-[#FF6B2C] p-8 md:p-12 text-center"
        >
          {/* عناصر زخرفية */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
          
          <div className="relative z-10">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-block mb-6"
            >
              <span className="bg-white/20 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-sm font-medium border border-white/20">
                عرض حصري للعملاء الأوائل
              </span>
            </motion.div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              ابدأ رحلة التحول الرقمي اليوم.
              <br />
              <span className="text-white/90">أول 14 يوم مجاناً بالكامل.</span>
            </h2>
            
            <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
              بدون أي التزام مالي. نوفر لك كل المستلزمات الأساسية: تصميم المنيو الرقمي، تدريب فريقك، ودعم فني غير محدود. جرب القوة الكاملة لـ GoOrder.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/Customer-Service">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white text-[#FF6B2C] px-10 py-4 rounded-xl font-bold shadow-2xl flex items-center gap-2 text-lg"
                >
                  ابدأ فترتك المجانية الآن
                  <ArrowRight size={20} />
                </motion.button>
              </Link>
              <p className="text-white/70 text-sm">
                * لا حاجة لبطاقة ائتمان. إلغاء في أي وقت.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-6 justify-center mt-10">
              <div className="flex items-center gap-2 text-white/80">
                <CheckCircle2 size={18} className="text-white" />
                <span className="text-sm">تصميم مينيو مجاني</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <CheckCircle2 size={18} className="text-white" />
                <span className="text-sm">جلسة تدريبية لفريقك</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <CheckCircle2 size={18} className="text-white" />
                <span className="text-sm">دعم فني 24/7</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// ========== تذييل الصفحة ==========
const Footer = () => {
  return (
    <footer className="py-10 px-5 border-t border-white/10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-right">
            <h3 className="text-2xl font-bold text-white mb-2">GoOrder</h3>
            <p className="text-white/40 text-sm">شريك نجاحك الرقمي في عالم المطاعم</p>
          </div>
          
          <div className="flex gap-6">
            <Link href="/Customer-Service" className="text-white/50 hover:text-[#FF8C42] text-sm transition-colors">
              خدمة العملاء
            </Link>
            <Link href="/privacy" className="text-white/50 hover:text-[#FF8C42] text-sm transition-colors">
              سياسة الخصوصية
            </Link>
            <Link href="/terms" className="text-white/50 hover:text-[#FF8C42] text-sm transition-colors">
              شروط الاستخدام
            </Link>
          </div>
          
          <div className="text-white/30 text-sm">
            © 2025 GoOrder. جميع الحقوق محفوظة.
          </div>
        </div>
        
        <div className="text-center mt-8">
          <p className="text-white/20 text-xs">
            نتطلع إلى التعاون والاستثمار المشترك في نجاح مطعمك.
          </p>
        </div>
      </div>
    </footer>
  );
};

// ========== المكون الرئيسي ==========
export default function MobileLandingPage() {
  return (
    <div className="relative bg-gradient-to-br from-[#0F1A33] via-[#1A2A4F] to-[#0F1A33] min-h-screen overflow-x-hidden" dir="rtl">
      
      {/* نمط الخلفية الشبكي */}
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

      {/* المحتوى الرئيسي */}
      <div className="relative z-10">
        <HeroSection />
        <VisionSection />
        <FeaturesSection />
        <SupportSection />
        <TrialSection />
        <Footer />
      </div>
    </div>
  );
}