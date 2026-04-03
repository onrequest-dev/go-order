// lib/restaurant-data.ts
import { Restaurant } from '@/types';

// دالة لجلب بيانات المطعم من الـ API أو قاعدة البيانات
export async function getRestaurantData(slug: string): Promise<Restaurant> {
  // هنا يمكنك استبدال هذا بطلب حقيقي إلى API الخاص بك
  // مثال: fetch(`/api/restaurants/${slug}`)
  
  // مؤقتاً: استخدام بيانات تجريبية مع محاكاة تأخير الشبكة
  await new Promise(resolve => setTimeout(resolve, 500)); // محاكاة طلب الشبكة
  
  // هذا مجرد مثال - استبدله ببيانات حقيقية من قاعدة البيانات
  const restaurant: Restaurant = {
    id: '1',
    name: slug === 'al-baraka' ? 'مطعم البركة' : `مطعم ${slug}`,
    slug: slug,
    logo: '/img/brand/Alzwak.png',
    primaryColor: '#6461ff',
    phone: '+963 123 456 789',
    address: 'دمشق، سوريا',
    isActive: true,
    isSubscriptionActive: true,
    subscriptionType: 'plus', // يمكن أن تكون 'Normal' أو 'pro' أو 'plus'
    subscriptionExpiryDate: new Date('2025-12-31'),
    numberOfTables: 15,
    categories: ['مشاوي', 'مقبلات', 'مشروبات'],
    menu: [      {
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
      }],
    averagePreparationTime: 20,
    serviceFee: 10,
    currency: 'SYP',
    status: {
      totalOrders: 1250,
      totalRevenue: 7500000,
      averageOrderValue: 6000,
      popularItems: [],
      monthlyStats: []
    }
  };
  
  return restaurant;
}

// دالة لتحديث بيانات المطعم
export async function updateRestaurantData(
  slug: string, 
  data: Partial<Restaurant>
): Promise<Restaurant> {
  // هنا منطق تحديث البيانات في قاعدة البيانات
  const response = await fetch(`/api/restaurants/${slug}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    throw new Error('فشل في تحديث بيانات المطعم');
  }
  
  return response.json();
}