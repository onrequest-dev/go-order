// services/restaurantService.ts

import { Restaurant } from "@/types";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}


export async function updateRestaurant(
  restaurantData: Partial<Restaurant>
): Promise<ApiResponse<Restaurant>> {
  try {
    const response = await fetch("/api/v1/restaurant/info", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(restaurantData),
    });

    const result = await response.json();
    console.log("API response for updateRestaurant:", result);
    if (!response.ok) {
      return { success: false, error: result.error || "فشل تحديث بيانات المطعم" };
    }

    return { success: true, data: result.data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "حدث خطأ في الاتصال",
    };
  }
}


export async function getRestaurant(): Promise<ApiResponse<Restaurant>> {
  try {
    const response = await fetch("/api/v1/restaurant/info");
    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: result.error || "فشل جلب بيانات المطعم" };
    }
    const menuresponse = await fetch("/api/v1/restaurant/menu/get2", {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },credentials: 'include',
    });
    const menuresult = await menuresponse.json();
    if (!menuresponse.ok) {
      return { success: false, error: menuresult.error || "فشل جلب بيانات قائمة الطعام" };
    }
    const resturantData: Restaurant = {
      ...result.data,
      primaryColor: result.data.primary_color || '#D48117',
      currency : result.data.currency || 'USD',
      isActive : result.data.is_active ?? true,
      logo : result.data.logo_link || null,
      numberOfTables : result.data.number_of_tables ,
      serviceFee : result.data.service_fee ?? 0,
      averagePreparationTime : result.data.average_preparation_time ?? 0,
      // لازم نضيف حقل في قاعدة البيانات يدل اذا الاشتراك شغال ولا لا 
      isSubscriptionActive:true,
      menu: menuresult.data.menu || [],
    }
    return { success: true, data: resturantData };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "حدث خطأ في الاتصال",
    };
  }
}