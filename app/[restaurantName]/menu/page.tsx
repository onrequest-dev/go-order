// go-order\app\[restaurantName]\menu\page.tsx

import { notFound, redirect } from "next/navigation";
import { Restaurant } from "@/types";
import MenuClient from "./components/MenuClient";

// ========== بيانات افتراضية للمطعم AL-Zwak ==========
export const dynamic = 'force-dynamic';
export const revalidate = 0;
const DEFAULT_RESTAURANT: Restaurant = {
  id: "default-al-zwak-001",
  name: "مطعم الزواك",
  slug: "AL-Zwak",
  logo: "/img/brand/Alzwak.png",
  primaryColor: "#6E5A0C",
  phone: "+963 123 456 789",
  address: "دمشق، سوريا",
  isActive: true,
  isSubscriptionActive: true,
  subscriptionType: "pro",
  numberOfTables: 10,
  categories: ["مقبلات", "أطباق رئيسية", "مشروبات", "حلويات"],
  menu: [
    {
      id: "item-001",
      name: "شاورما دجاج",
      description: "شاورما دجاج طازجة مع الصوص الخاص والثومية",
      price: 25000,
      image: "/images/shawarma.jpg",
      isActive: true,
      category: "أطباق رئيسية",
      preparationTime: 10
    },
    {
      id: "item-002",
      name: "فلافل",
      description: "فلافل مقلية طازجة مع الطحينة والسلطة",
      price: 8000,
      image: "/images/falafel.jpg",
      isActive: true,
      category: "مقبلات",
      preparationTime: 8
    },
    {
      id: "item-003",
      name: "حمص",
      description: "حمص بالطحينة والليمون مع زيت الزيتون",
      price: 6000,
      image: "/images/hummus.jpg",
      isActive: true,
      category: "مقبلات",
      preparationTime: 5
    },
    {
      id: "item-004",
      name: "متة بالجبنة",
      description: "متة محشية جبنة موزاريلا مع صلصة الطماطم",
      price: 18000,
      image: "/images/pizza.jpg",
      isActive: true,
      category: "أطباق رئيسية",
      preparationTime: 15
    },
    {
      id: "item-006",
      name: "كنافة",
      description: "كنافة نابلسية بالجبنة مع القطر",
      price: 12000,
      image: "/images/kanafeh.jpg",
      isActive: true,
      category: "حلويات",
      preparationTime: 12
    },
    {
      id: "item-007",
      name: "تبولة",
      description: "تبولة بالبقدونس والبرغل والطماطم",
      price: 7000,
      image: "/images/tabbouleh.jpg",
      isActive: true,
      category: "مقبلات",
      preparationTime: 7
    },
    {
      id: "item-008",
      name: "مشاوي مشكلة",
      description: "شيش طاووق، لحم، كباب مع الخضار المشوية",
      price: 45000,
      image: "/images/mashawi.jpg",
      isActive: true,
      category: "أطباق رئيسية",
      preparationTime: 20
    }
  ],
  averagePreparationTime: 15,
  serviceFee: 2000,
  currency: "SYP"
};

// واجهة لبيانات المطعم من الـ API
interface RestaurantResponse {
  success: boolean;
  data?: Restaurant;
  error?: string;
}

// دالة لجلب بيانات المطعم من السيرفر (مع بيانات افتراضية كـ fallback)
async function fetchRestaurant(slug: string): Promise<Restaurant | null> {
    const { data, error } = await supabase_server.rpc('get_restaurant_by_slug', {
      p_slug:  slug.trim().toLowerCase()
  });
  console.log("Supabase response:", { data: data, error });
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
  let tableNumber: number | null = null;
  
  if (tableFromUrl) {
    const tableNum = parseInt(tableFromUrl);
    if (!isNaN(tableNum) && tableNum >= 1 && tableNum <= restaurant.numberOfTables) {
      tableNumber = tableNum;
    } else {
      console.log("Invalid table number, redirecting to table 1");
      redirect(`/${restaurantName}/menu?table=1`);
    }
  } else {
    console.log("No table number, redirecting to table 1");
    redirect(`/${restaurantName}/menu?table=1`);
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
