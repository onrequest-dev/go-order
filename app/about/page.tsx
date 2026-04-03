"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
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
  Globe
} from "lucide-react";

// ========== نمط الشكل العائم ==========
const FloatingShape = ({ delay = 0, size = 100, top = "10%", left = "10%" }: { delay?: number; size?: number; top?: string; left?: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: 0.1, scale: 1 }}
    transition={{ duration: 2, delay }}
    style={{ position: "absolute", top, left, width: size, height: size }}
  >
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="50" fill="#FF8C42" />
      <path d="M50 20 L65 45 L55 45 L55 80 L45 80 L45 45 L35 45 Z" fill="#1A2A4F" />
    </svg>
  </motion.div>
);

const GradientBlob = ({ delay = 0, size = 300, top = "50%", right = "0%" }: { delay?: number; size?: number; top?: string; right?: string }) => (
  <motion.div
    animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
    transition={{ duration: 20, repeat: Infinity, delay }}
    style={{ position: "absolute", top, right, width: size, height: size }}
  >
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none">
      <path d="M100 20 C140 20 180 60 180 100 C180 140 140 180 100 180 C60 180 20 140 20 100 C20 60 60 20 100 20Z" fill="#FF8C42" opacity="0.2" filter="blur(60px)"/>
    </svg>
  </motion.div>
);

// ========== بطاقة الميزة ==========
const FeatureCard = ({ 
  icon: Icon, 
  title, 
  description, 
  delay = 0 
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string; 
  delay?: number 
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -8 }}
      className="group relative bg-white/5 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-white/10 hover:border-[#FF8C42]/40 transition-all duration-500 cursor-pointer"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#FF8C42]/0 to-[#FF8C42]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
      <div className="relative z-10">
        <div className="mb-5 text-[#FF8C42] transform group-hover:scale-110 transition-transform duration-300">
          <Icon size={40} strokeWidth={1.5} />
        </div>
        <h3 className="text-xl md:text-2xl font-bold text-white mb-3">{title}</h3>
        <p className="text-white/60 text-sm md:text-base leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
};

// ========== بطاقة السعر (كلها بنفس التصميم) ==========
const PricingCard = ({ 
  title, 
  price, 
  features, 
  delay = 0 
}: { 
  title: string; 
  price: string; 
  features: string[]; 
  delay?: number 
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -8 }}
      className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-white/10 hover:border-[#FF8C42]/40 transition-all duration-500"
    >
      <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">{title}</h3>
      <div className="mb-6">
        <span className="text-4xl md:text-5xl font-bold text-[#FF8C42]">${price}</span>
        <span className="text-white/50">/شهر</span>
      </div>
      <ul className="space-y-3 mb-8">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-2 text-white/70 text-sm md:text-base">
            <CheckCircle2 size={18} className="text-[#FF8C42] flex-shrink-0 mt-0.5" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-3 rounded-xl font-bold bg-[#FF8C42] text-white hover:bg-[#e67e3a] transition-all duration-300"
      >
        اختر الباقة
      </motion.button>
    </motion.div>
  );
};

// ========== المكون الرئيسي ==========
export default function AboutPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0.95]);
  
  // أرقام عشوائية ثابتة لتجنب خطأ Math.random
  const blobPositions = [
    { top: "15%", right: "-10%", size: 350, delay: 0 },
    { top: "60%", right: "60%", size: 300, delay: 5 },
    { top: "80%", left: "-5%", size: 250, delay: 3 }
  ];

  return (
    <div ref={containerRef} className="relative bg-[#1A2A4F] overflow-x-hidden" dir="rtl">
      
      {/* ========== طبقة الخلفية ========== */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* إضاءة مركزية */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[#FF8C42] opacity-5 blur-[100px]" />
        
        {/* بقع إضاءة */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#FF8C42] opacity-8 blur-[80px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full bg-[#FF8C42] opacity-5 blur-[100px]" />
        
        {/* أشكال عائمة */}
        <FloatingShape delay={0} size={120} top="10%" left="5%" />
        <FloatingShape delay={2} size={180} top="70%" left="85%" />
        <FloatingShape delay={4} size={100} top="85%" left="10%" />
        
        {/* Gradient Blobs ثابتة */}
        {blobPositions.map((pos, i) => (
          <GradientBlob key={i} delay={pos.delay} size={pos.size} top={pos.top} right={pos.right} />
        ))}
        
        {/* شبكة نقطية */}
        <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dotGrid" width="30" height="30" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="#FF8C42" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dotGrid)" />
        </svg>
      </div>

      {/* ========== المحتوى الرئيسي ========== */}
      <div className="relative z-10" style={{  }}>
        
        {/* ===== القسم 1: Hero (مصمم للهواتف أولاً) ===== */}
        <section className="min-h-screen flex items-center justify-center py-12 md:py-20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col-reverse lg:flex-row items-center gap-8 md:gap-16">
              
              {/* النص - يظهر أولاً على الهاتف */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="lg:w-1/2 text-center lg:text-right"
              >
                
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 md:mb-6 leading-tight">
                  GoOrder
                  <span className="block text-[#FF8C42] text-2xl md:text-4xl lg:text-5xl mt-3 md:mt-4">
                    الحل الذكي لإدارة المطاعم
                  </span>
                </h1>
                
                <p className="text-base md:text-lg text-white/70 mb-8 md:mb-12 leading-relaxed max-w-lg mx-auto lg:mx-0">
                  نُعيد تعريف تجربة الطعام بمنصة متكاملة تحول مطعمك إلى نظام رقمي متقدم
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-[#FF8C42] text-white px-6 md:px-10 py-3 md:py-4 rounded-xl font-bold shadow-2xl shadow-[#FF8C42]/30 hover:shadow-[#FF8C42]/50 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    ابدأ الآن مجاناً
                    <ArrowRight size={18} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="border-2 border-white/30 text-white px-6 md:px-10 py-3 md:py-4 rounded-xl font-bold hover:bg-white/10 transition-all duration-300"
                  >
                    تواصل معنا
                  </motion.button>
                </div>
              </motion.div>
              
              {/* الصورة */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="lg:w-1/2 w-full max-w-md mx-auto lg:mx-0"
              >
                <Image
                  src="/img/GoOrder2.png"
                  alt="GoOrder Platform"
                  width={500}
                  height={500}
                  className="w-full h-auto"
                  priority
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* ===== القسم 2: الميزات الرئيسية ===== */}
        <section className="py-16 md:py-28">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12 md:mb-16"
            >
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">ماذا نقدم؟</h2>
              <div className="w-20 h-1 bg-[#FF8C42] mx-auto rounded-full" />
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <FeatureCard icon={QrCode} title="نظام QR متقدم" description="طلب فوري من الطاولة عبر مسح QR بدون انتظار" delay={0} />
              <FeatureCard icon={Truck} title="توصيل ذكي" description="نظام توصيل متكامل مع تتبع الطلبات" delay={0.1} />
              <FeatureCard icon={BarChart3} title="تحليلات فورية" description="مخططات بيانية لحظية للمبيعات وأوقات الذروة" delay={0.2} />
              <FeatureCard icon={LayoutDashboard} title="لوحة تحكم متكاملة" description="إدارة كاملة للمنيو والطلبات وفريق العمل" delay={0.3} />
            </div>
          </div>
        </section>

        {/* ===== القسم 3: ميزات إضافية ===== */}
        <section className="py-16 md:py-28 bg-white/5">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {[
                { icon: Clock, title: "توفير الوقت", desc: "أتمتة كاملة لعمليات الطلب والتوصيل" },
                { icon: Smartphone, title: "تطبيق متكامل", desc: "تجربة سلسة للعملاء على الهواتف الذكية" },
                { icon: CreditCard, title: "دفع آمن", desc: "بوابة دفع إلكترونية متكاملة وآمنة" },
                { icon: Users, title: "إدارة العملاء", desc: "نظام متكامل لإدارة قاعدة العملاء" },
                { icon: Award, title: "جودة عالية", desc: "خدمة متميزة تضمن رضا العملاء" },
                { icon: Zap, title: "أداء سريع", desc: "استجابة فورية وسرعة في التنفيذ" }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="flex items-center gap-4 p-4 md:p-5 rounded-xl hover:bg-white/5 transition-all duration-300"
                >
                  <item.icon size={36} className="text-[#FF8C42]" strokeWidth={1.5} />
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-white">{item.title}</h3>
                    <p className="text-white/50 text-sm">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== القسم 4: الباقات (كلها بنفس التصميم) ===== */}
        <section className="py-16 md:py-28">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12 md:mb-16"
            >
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">باقات الاشتراك الشهري</h2>
              <div className="w-20 h-1 bg-[#FF8C42] mx-auto rounded-full" />
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
              <PricingCard 
                title="أساسية"
                price="10"
                features={["طلب داخلي عبر QR", "منيو رقمي قابل للتحديث", "إدارة طاولات متكاملة", "دعم فني 24/7"]}
                delay={0}
              />
              <PricingCard 
                title="متقدمة"
                price="20"
                features={["كل ما في الأساسية", "خدمة التوصيل الخارجي", "صفحات إعلانية ديناميكية", "تتبع الطلبات في الوقت الفعلي"]}
                delay={0.1}
              />
              <PricingCard 
                title="احترافية"
                price="30"
                features={["كل ما في المتقدمة", "إحصائيات المبيعات المتقدمة", "تقارير أوقات الذروة", "الوجبات الأكثر مبيعاً", "أدوات تحسين الأداء"]}
                delay={0.2}
              />
            </div>
          </div>
        </section>

        {/* ===== القسم 5: لماذا GoOrder ===== */}
        <section className="py-16 md:py-28 bg-white/5">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 md:mb-8">لماذا GoOrder؟</h2>
                <div className="space-y-4 md:space-y-6">
                  {[
                    { icon: TrendingUp, title: "توفير التكاليف", desc: "لا حاجة لطباعة منيو ورقية أو أنظمة نقاط بيع مكلفة" },
                    { icon: Star, title: "زيادة المبيعات", desc: "الصفحات الإعلانية لكل وجبة تشجع العملاء على تجربة أطباق جديدة" },
                    { icon: Zap, title: "تحسين الكفاءة", desc: "الطلبات تصل مباشرة للمطبخ وتقارير الذروة تساعدك على التجهيز المسبق" },
                    { icon: Globe, title: "قرارات مبنية على بيانات", desc: "اعرف متى تزيد العمالة وأي الأطباق تروج وكيف ترفع أرباحك" }
                  ].map((item, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: -30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/5 transition-all duration-300"
                    >
                      <item.icon size={28} className="text-[#FF8C42] flex-shrink-0" strokeWidth={1.5} />
                      <div>
                        <h3 className="text-lg md:text-xl font-bold text-white mb-1">{item.title}</h3>
                        <p className="text-white/50 text-sm md:text-base">{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <div className="bg-gradient-to-br from-[#FF8C42]/10 to-transparent rounded-3xl p-6 md:p-8 backdrop-blur-sm border border-white/10">
                  <Shield size={48} className="text-[#FF8C42] mb-4" strokeWidth={1.5} />
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-2">رؤية واضحة لأدائك</h3>
                  <p className="text-white/60 text-sm md:text-base">لوحة تحليلات متقدمة تظهر لك كل ما تحتاج لمعرفته عن مطعمك في لحظتها</p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ===== القسم 6: CTA ===== */}
        <section className="py-16 md:py-24">
          <div className="absolute inset-0 bg-gradient-to-r from-[#FF8C42]/10 to-transparent" />
          <div className="container mx-auto px-4 md:px-6 text-center relative">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 md:mb-6">جاهز للانطلاق؟</h2>
              <p className="text-base md:text-xl text-white/70 mb-8 md:mb-12 max-w-2xl mx-auto px-4">
                انضم إلى GoOrder اليوم، وحوّل مطعمك إلى منصة رقمية متكاملة
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-[#FF8C42] text-white px-8 md:px-14 py-3 md:py-5 rounded-xl font-bold text-lg md:text-xl shadow-2xl shadow-[#FF8C42]/30 hover:shadow-[#FF8C42]/50 transition-all duration-300"
              >
                ابدأ رحلتك الآن 🚀
              </motion.button>
              <p className="mt-6 md:mt-8 text-white/30 text-sm md:text-base">
                GoOrder – اذهب واطلب. ببساطة.
              </p>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}