// go-order\app\[restaurantName]\menu\page.tsx

import { notFound, redirect } from "next/navigation";
import { Restaurant } from "@/types";
import MenuClient from "./components/MenuClient";

// needs attintion
export const dynamic = 'force-dynamic';
export const revalidate = 0;




async function fetchRestaurant(slug: string): Promise<Restaurant | null> {
    const { data, error } = await supabase_server.rpc('get_restaurant_by_slug', {
      p_slug:  slug.trim().toLowerCase()
  });
  // console.log("Supabase response:", { data: data, error });
  return data as Restaurant;
  // return DEFAULT_RESTAURANT;
}
  


// دالة التحقق من صلاحية المطعم
function isRestaurantValid(restaurant: Restaurant): { valid: boolean; reason?: string } {
  // التحقق من أن المطعم نشط
  if (!restaurant.isActive) {
    return { valid: false, reason: "inactive" };
  }
  
  // التحقق من أن الاشتراك نشط
  if (!restaurant.isSubscriptionActive) {
    return { valid: false, reason: "subscription_expired" };
  }
  
  // التحقق من وجود وجبات نشطة
  const hasActiveItems = restaurant.menu.some(item => item.isActive);
  if (!hasActiveItems) {
    return { valid: false, reason: "no_active_items" };
  }
  
  return { valid: true };
}

// واجهة بروبس الصفحة
interface PageProps {
  params: {
    restaurantName: string;
  };
  searchParams: {
    table?: string;
  };
}

// صفحة السيرفر الرئيسية
export default async function RestaurantMenuPage({ params, searchParams }: PageProps) {
  const { restaurantName } = params;
  const tableFromUrl = searchParams.table;
  
  console.log("Restaurant slug from URL:", restaurantName);
  
  // جلب بيانات المطعم من السيرفر
  const restaurant = await fetchRestaurant(restaurantName);
  console.log(restaurant)
  
  // حالة 1: المطعم غير موجود
  if (!restaurant) {
    console.log("Restaurant not found:", restaurantName);
    notFound();
  }
  
  console.log("Restaurant found:", restaurant.name);
  
  // التحقق من صحة المطعم (نشط، اشتراك فعال، وجبات متاحة)
  const validation = isRestaurantValid(restaurant);
  if (!validation.valid) {
    console.log("Restaurant invalid:", validation.reason);
    // عرض صفحة خطأ مناسبة حسب السبب
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        {validation.reason === "inactive" && (
          <RestaurantError 
            type="inactive" 
            message={`${restaurant.name} غير نشط حالياً. يرجى التواصل مع إدارة المطعم.`}
            primaryColor={restaurant.primaryColor}
          />
        )}
        {validation.reason === "subscription_expired" && (
          <RestaurantError 
            type="subscription_expired" 
            message={`اشتراك ${restaurant.name} منتهي. يرجى تجديد الاشتراك للاستمرار في تقديم الخدمة.`}
            primaryColor={restaurant.primaryColor}
          />
        )}
        {validation.reason === "no_active_items" && (
          <RestaurantError 
            type="general" 
            message={`لا توجد وجبات متاحة حالياً في ${restaurant.name}. يرجى المحاولة لاحقاً.`}
            primaryColor={restaurant.primaryColor}
          />
        )}
      </div>
    );
  }
  
// التحقق من رقم الطاولة
let tableNumber: number;

if (tableFromUrl) {
  const tableNum = parseInt(tableFromUrl);
  
  // ✅ التحقق من صحة رقم الطاولة
  if (isNaN(tableNum) || tableNum < 1 || tableNum > restaurant.numberOfTables) {
    console.log("Invalid table number, showing 404");
    notFound(); // ✅ عرض صفحة 404 بدلاً من التحويل
  }
  
  tableNumber = tableNum;
} else {
  // إذا لم يتم توفير رقم طاولة، نعرض الطاولة 1 (هذا مقبول)
  console.log("No table number provided, defaulting to table 1");
  tableNumber = 1;
}

console.log("Rendering menu for table:", tableNumber);
  
  // عرض الصفحة مع المكون العميل
  return (
    <RestaurantProvider
      restaurant={restaurant}
      tableNumber={tableNumber}
    />
  );
}

// مكون لتوفير البيانات للمكون العميل
function RestaurantProvider({ restaurant, tableNumber }: { restaurant: Restaurant; tableNumber: number }) {
  return <MenuClient restaurant={restaurant} tableNumber={tableNumber} />;
}

// مكونات عرض الخطأ
function RestaurantError({ type, message, primaryColor = "#FF8C42" }: { type: 'inactive' | 'subscription_expired' | 'general'; message: string; primaryColor?: string }) {
  const icons = {
    inactive: <Ban size={64} className="text-red-400" />,
    subscription_expired: <AlertTriangle size={64} className="text-orange-400" />,
    general: <AlertTriangle size={64} className="text-yellow-400" />
  };
  
  const titles = {
    inactive: "المطعم غير نشط",
    subscription_expired: "الاشتراك منتهي",
    general: "غير متاح حالياً"
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 20 }}
        className="text-center max-w-md"
      >
        <div className="mb-6">{icons[type]}</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{titles[type]}</h2>
        <p className="text-gray-500 mb-6">{message}</p>
        <div 
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white"
          style={{ backgroundColor: primaryColor }}
        >
          <Clock size={18} />
          <span>يرجى المحاولة لاحقاً</span>
        </div>
      </motion.div>
    </div>
  );
}

// استيراد الـ motion لاستخدامه في مكون الخطأ
import { motion } from "framer-motion";
import { Ban, AlertTriangle, Clock } from "lucide-react";
import { supabase_server } from "@/server/supabase-server";
