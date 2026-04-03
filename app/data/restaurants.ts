// أنواع البيانات
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  isActive: boolean; // true = معروض, false = غير معروض
  category?: string;
}

// نوع العملة المدعومة
export type Currency = 'SYP' | 'TRY' | 'USD';

export interface Restaurant {
  id: string;
  name: string;
  subscriptiontype?: "Normal" | "pro" | "plus"; // نوع الاشتراك
  slug: string; // اسم المطعم في الرابط
  logo: string; // مسار صورة اللوغو
  primaryColor?: string; // اللون الرئيسي للمطعم (اختياري)
  coverImage?: string;
  phone?: string;
  address?: string;
  numberOfTables: number; // عدد الطاولات التي يحويها المطعم
  categories: string[]; // مصفوفة التصنيفات التي يقدمها المطعم (مثل: وجبات رئيسية، مشروبات، حلويات)
  menu: MenuItem[];
  // الخصائص الجديدة
  averagePreparationTime: number; // متوسط وقت اعداد الوجبات (بالدقائق)
  serviceFee: number; // مبلغ ثابت اضافي كسعر للخدمة
  currency: Currency; // نوع العملة: SYP, TRY, USD
}

// ========== البيانات الافتراضية للمطاعم ==========

export const restaurantsData: Restaurant[] = [
  {
    id: "1",
    name: "مطعم الذواق",
    subscriptiontype: "plus",
    slug: "AL-Zwak",
    logo: "/img/brand/Alzwak.png",
    primaryColor: "#ff961d",
    coverImage: "/img/brand/Alzwak.png",
    phone: "+966 12 345 6789",
    address: "الرياض، المملكة العربية السعودية",
    numberOfTables: 15,
    categories: ["وجبات رئيسية", "مقبلات", "ساندويشات", "حلويات", "مشروبات"],
    averagePreparationTime: 25, // 25 دقيقة متوسط وقت التحضير
    serviceFee: 5, // 5 وحدات من العملة كرسوم خدمة
    currency: "USD", // دولار أمريكي
    menu: [
      {
        id: "m1",
        name: "منسف الأردن",
        description: "لحم الضأن المطبوخ على اللبن الجميد مع الأرز واللوز والصنوبر",
        price: 65,
        image: "/imgwajbat/image1.png",
        isActive: true,
        category: "وجبات رئيسية"
      },
      {
        id: "m2",
        name: "كبة مشوية",
        description: "كبة لحم مع البرغل والصنوبر مشوية على الفحم",
        price: 35,
        image: "/imgwajbat/image2.png",
        isActive: true,
        category: "وجبات رئيسية"
      },
      {
        id: "m3",
        name: "شاورما الدجاج",
        description: "شاورما دجاج مع الثومية والبطاطا المقلية",
        price: 22,
        image: "/imgwajbat/image3.png",
        isActive: true,
        category: "ساندويشات"
      },
      {
        id: "m4",
        name: "كنافة نابلسية",
        description: "كنافة بالجبنة القريش مع القطر والفستق الحلبي",
        price: 18,
        image: "/imgwajbat/image4.png",
        isActive: true,
        category: "حلويات"
      },
      {
        id: "m5",
        name: "عصير قصب السكر",
        description: "عصير قصب السكر الطبيعي مع الليمون",
        price: 10,
        image: "/imgwajbat/image5.png",
        isActive: true,
        category: "مشروبات"
      }
    ]
  },
  {
    id: "2",
    name: "بيتزا هت",
    slug: "PizzaHut",
    logo: "/img/restaurants/pizzahut-logo.png",
    primaryColor: "#E31837",
    coverImage: "/img/restaurants/pizzahut-cover.jpg",
    phone: "+966 55 555 5555",
    address: "جدة، المملكة العربية السعودية",
    numberOfTables: 20,
    categories: ["بيتزا", "مقبلات", "باستا", "حلويات", "مشروبات غازية"],
    averagePreparationTime: 20, // 20 دقيقة
    serviceFee: 3, // 3 ليرات تركية
    currency: "TRY", // ليرة تركية
    menu: [
      {
        id: "p1",
        name: "بيتزا سوبر سوبريم",
        description: "بيتزا بالجبنة، الفلفل، الببروني، الزيتون، الفطر",
        price: 45,
        image: "/img/menu/supreme.jpg",
        isActive: true,
        category: "بيتزا"
      },
      {
        id: "p2",
        name: "أجنحة حارة",
        description: "أجنحة دجاج حارة مع صوص الرانش",
        price: 28,
        image: "/img/menu/wings.jpg",
        isActive: true,
        category: "مقبلات"
      },
      {
        id: "p3",
        name: "باستا ألفريدو",
        description: "باستا بالدجاج وصلصة الألفريدو الكريمية",
        price: 38,
        image: "/img/menu/pasta.jpg",
        isActive: true,
        category: "باستا"
      }
    ]
  },
  {
    id: "3",
    name: "ستاربكس",
    slug: "Starbucks",
    logo: "/img/restaurants/starbucks-logo.png",
    primaryColor: "#006241",
    coverImage: "/img/restaurants/starbucks-cover.jpg",
    phone: "+966 50 000 0000",
    address: "الدمام، المملكة العربية السعودية",
    numberOfTables: 12,
    categories: ["مشروبات ساخنة", "مشروبات باردة", "فرابتشينو", "مخبوزات", "حلويات"],
    averagePreparationTime: 10, // 10 دقائق
    serviceFee: 2, // 2 ليرة سورية
    currency: "SYP", // ليرة سورية
    menu: [
      {
        id: "s1",
        name: "كاراميل ماكياتو",
        description: "إسبريسو مع حليب مبخر وصلصة الكراميل",
        price: 18000, // سعر بالليرة السورية
        image: "/img/menu/caramel.jpg",
        isActive: true,
        category: "مشروبات ساخنة"
      },
      {
        id: "s2",
        name: "فرابتشينو الموكا",
        description: "فرابتشينو بالشوكولاتة والقهوة مع الكريمة المخفوقة",
        price: 22000,
        image: "/img/menu/mocha.jpg",
        isActive: true,
        category: "مشروبات باردة"
      },
      {
        id: "s3",
        name: "كرواسون الجبنة",
        description: "كرواسون طازج محشو بالجبنة",
        price: 12000,
        image: "/img/menu/croissant.jpg",
        isActive: true, // نفد من المخزون
        category: "مخبوزات"
      }
    ]
  }
];

// دالة مساعدة للحصول على رمز العملة
export function getCurrencySymbol(currency: Currency): string {
  switch (currency) {
    case 'SYP':
      return 'ل.س';
    case 'TRY':
      return '₺';
    case 'USD':
      return '$';
    default:
      return '';
  }
}

// دالة مساعدة للحصول على اسم العملة بالكامل
export function getCurrencyName(currency: Currency): string {
  switch (currency) {
    case 'SYP':
      return 'ليرة سورية';
    case 'TRY':
      return 'ليرة تركية';
    case 'USD':
      return 'دولار أمريكي';
    default:
      return '';
  }
}

// دالة لحساب السعر الإجمالي مع رسوم الخدمة
export function getTotalPriceWithService(restaurant: Restaurant, itemPrice: number): number {
  return itemPrice + restaurant.serviceFee;
}

// دالة مساعدة لجلب بيانات مطعم حسب الاسم
export function getRestaurantBySlug(slug: string): Restaurant | undefined {
  return restaurantsData.find(
    (restaurant) => restaurant.slug.toLowerCase() === slug.toLowerCase()
  );
}

// دالة لجلب الوجبات النشطة فقط
export function getActiveMenuItems(restaurant: Restaurant): MenuItem[] {
  return restaurant.menu.filter((item) => item.isActive === true);
}

// جلب الوجبات حسب تصنيف معين
export function getMenuItemsByCategory(restaurant: Restaurant, categoryName: string): MenuItem[] {
  return restaurant.menu.filter(item => item.category === categoryName && item.isActive);
}

// جلب جميع التصنيفات التي تحتوي على وجبات نشطة
export function getActiveCategories(restaurant: Restaurant): string[] {
  const activeCategories = restaurant.menu
    .filter(item => item.isActive)
    .map(item => item.category);
  
  return restaurant.categories.filter(cat => activeCategories.includes(cat));
}

// التحقق من صحة البيانات (للتأكد من أن كل وجبة تستخدم تصنيفاً صحيحاً)
export function validateRestaurantData(restaurant: Restaurant): boolean {
  return restaurant.menu.every(item => 
    item.category && restaurant.categories.includes(item.category)
  );
}