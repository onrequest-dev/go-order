// types/index.ts
//معلمنا الغالي منورني ياوردة هاي انواع البيانات الشاملة

import { JwtPayload } from "jsonwebtoken";

// ========== أنواع الاشتراكات ==========
export type SubscriptionTier = 'normal' | 'pro' | 'plus';//نوع الاشتراك (عادي، برو، بلس)
export type SubscriptionStatus = 'active' | 'expired' | 'suspended';//حالة الاشتراك (نشط، منتهي، موقوف)

// ========== بيانات الوجبة ==========
export interface MenuItem {
  id: string;//معرف الوجبة
  name: string;//اسم الوجبة
  description: string;//وصف الوجبة
  price: number;//سعر الوجبة
  image: string;//صورة الوجبة
  isActive: boolean;
  category?: string;//فئة الوجبة
  preparationTime?: number;//وقت الاعداد
}

// ========== بيانات الطلب ==========
export interface Order {
  restaurantId: string
  id: string;//معرف الطلب
  tableNumber: number;//الطاولة التي تم طلب الوجبة عليها
  items: OrderItem[];//عناصر الطلب
  totalPrice: number;//المبلغ الإجمالي للطلب
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'completed' | 'rejected';//حالة الطلب
  orderType: 'dine_in' | 'delivery';//(الطلب داخل المطعم أو طلب توصيل) نحن لازم نعالجه بشكل مختلف في الواجهة
  createdAt: Date;//تاريخ إنشاء الطلب  (مشان جماعة الإحصائيات)
  customerName?: string;//اسم العميل(للطلبات الخارجية)
  customerPhone?: string;//رقم هاتف العميل(للطلبات الخارجية)
  deliveryAddress?: string;//عنوان التوصيل(للطلبات الخارجية)
  note?: string;
  modified_at?: Date;//تاريخ آخر تعديل على الطلب (مشان جماعة الإحصائيات)  
}

export interface OrderItem {
  menuItemId: string;//معرف الوجبة من قائمة الطعام
  name: string;//اسم الوجبة (للعرض في الطلب)
  quantity: number;//كمية الوجبة المطلوبة
  price: number;//سعر الوجبة في وقت الطلب (مهم للإحصائيات حتى لو تغير السعر لاحقاً)
  notes?: string;//ملاحظات حول الطلب
}

// ========== بيانات المطعم ==========
export interface Restaurant {
  id: string;//معرف المطعم
  name: string;//اسم المطعم
  slug: string;//اسم المستخدم الخاص بالمطعم (يستخدم في الروابط)
  logo: string;//شعار المطعم
  primaryColor?: string;//لون المطعم الأساسي
  phone?: string;//رقم هاتف المطعم
  address?: string;//عنوان المطعم
  isActive: boolean;//ما إذا كان المطعم نشطًا
  isSubscriptionActive: boolean;//ما إذا كانت الاشتراك نشطًا
  subscriptionType: SubscriptionTier;//نوع الاشتراك
  subscriptionExpiryDate?: Date;//تاريخ انتهاء الاشتراك
  lastTimePaidDate?: Date;// تاريخ اخر مرة دفع 
  numberOfTables: number;//عدد الطاولات في المطعم
  categories: string[];//فئات الوجبات في المطعم
  menu: MenuItem[];//قائمة الطعام
  averagePreparationTime: number;//متوسط وقت إعداد الوجبة بالدقائق
  serviceFee: number;//رسوم الخدمة 
  currency: Currency;//نوع العملة المستخدمة في المطعم
  status?: RestaurantStats;//إحصائيات المطعم (يمكن أن تكون غير موجودة في البداية)
}

// ========== إحصائيات المطعم ==========(مبدأيا مارح نقرب)
export interface RestaurantStats {
  totalOrders: number;//إجمالي عدد الطلبات
  totalRevenue: number;//إجمالي الإيرادات
  averageOrderValue: number;//متوسط قيمة الطلب
  popularItems: PopularItem[];//الوجبات الأكثر طلبًا
  monthlyStats: MonthlyStats[];//الإحصائيات الشهرية (عدد الطلبات والإيرادات لكل شهر)
}

export interface PopularItem {
  itemId: string;//معرف الوجبة
  name: string;//اسم الوجبة
  orderCount: number;//عدد الطلبات
  revenue: number;// الإيرادات
}

export interface MonthlyStats {
  month: string;//اسم الشهر
  orders: number;//عدد الطلبات
  revenue: number;// الإيرادات
}

// ========== نوع العملة ==========
export type Currency = 'SYP' | 'TRY' | 'USD';

// ========== بيانات الموظف ==========(مبدأيا مارح نقرب)
export interface Employee {
  id: string;
  name: string;//اسم الموظف
  role: 'manager' | 'chef' | 'waiter' | 'delivery';//دور الموظف في المطعم
  phone: string;//رقم هاتف الموظف
  salary: number;//راتب الموظف
  hireDate: Date;//تاريخ توظيف الموظف
  isActive: boolean;//ما إذا كان الموظف نشطًا
}

// ========== تعريف واجهة التبويب ==========
export interface DashboardTab {
  id: string;//معرف فريد للتبويب
  name: string;//اسم التبويب الذي سيظهر في الواجهة
  iconName: string; // استخدام اسم الأيقونة بدلاً من المكون نفسه
  path: string;//المسار الذي يشير إلى صفحة التبويب (مثل 'main', 'orders', 'promo', إلخ)
  requiredSubscription: SubscriptionTier | null;//نوع الاشتراك المطلوب لعرض هذا التبويب (null يعني أنه متاح للجميع)
  isEnabled: boolean;//ما إذا كان التبويب مفعلًا بناءً على نوع الاشتراك وحالة الاشتراك
}

// ========== دالة للحصول على التبويبات ==========
export function getAvailableTabs(subscriptionType: SubscriptionTier, isSubscriptionActive: boolean): DashboardTab[] {
  const allTabs: DashboardTab[] = [
    { id: 'main', name: 'الرئيسية', iconName: 'Home', path: 'main', requiredSubscription: null, isEnabled: true },
    { id: 'orders', name: 'طلبات الطاولات', iconName: 'Orders', path: 'orders', requiredSubscription: null, isEnabled: true },
    { id: 'promo', name: 'الصفحات الإعلانية', iconName: 'Promo', path: 'promo', requiredSubscription: 'pro', isEnabled: false },
    { id: 'delivery', name: 'طلبات التوصيل', iconName: 'Delivery', path: 'delivery', requiredSubscription: 'pro', isEnabled: false },
    { id: 'stats', name: 'الإحصائيات الشهرية', iconName: 'Stats', path: 'stats', requiredSubscription: 'plus', isEnabled: false },
    { id: 'profits', name: 'الأرباح', iconName: 'Profits', path: 'profits', requiredSubscription: 'plus', isEnabled: false },
    { id: 'employees', name: 'إدارة الموظفين', iconName: 'Employees', path: 'employees', requiredSubscription: 'plus', isEnabled: false },
  ];
  
  if (!isSubscriptionActive) {
    return allTabs.filter(tab => tab.requiredSubscription === null);
  }
  
  return allTabs.filter(tab => {
    if (tab.requiredSubscription === null) return true;
    if (subscriptionType === 'plus') return true;
    if (subscriptionType === 'pro') return tab.requiredSubscription !== 'plus';
    return false;
  }).map(tab => ({
    ...tab,
    isEnabled: true
  }));
}

// دالة مساعدة للحصول على رمز العملة
export function getCurrencySymbol(currency: Currency): string {
  switch (currency) {
    case 'SYP': return 'ل.س';
    case 'TRY': return '₺';
    case 'USD': return '$';
    default: return '';
  }
}


// ==== backend ====
export type RestaurantEmployeeRole = 'admin'|'manager'|'employee';
export interface RestaurantEmployeeJwt extends JwtPayload {
  id: string;
  restaurantId: string;
  role : RestaurantEmployeeRole;
  subscriptionTier : SubscriptionTier;
}