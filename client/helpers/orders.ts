// types/order.ts
export interface CreateOrderResponse {
  success: boolean;
  data?: {
    id: string;
    restaurantId: string;
    tableNumber: number;
    totalPrice: number;
    status: string;
    orderType: string;
    createdAt: string;
    customerName?: string;
    customerPhone?: string;
    deliveryAddress?: string;
    note?: string;
    items?: Array<{
      id: string;
      menuItemId: string;
      quantity: number;
      price: number;
      notes?: string;
      status: string;
      name: string;
    }>;
  };
  error?: string;
}

// services/orderService.ts
import { Order } from '@/types';

// دالة بسيطة لإعادة المحاولة
async function fetchWithRetry(url: string, options: RequestInit, maxRetries: number = 7): Promise<Response> {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok || i === maxRetries - 1) {
        return response; // نجاح أو آخر محاولة
      }
      // انتظر ثانية واحدة قبل إعادة المحاولة
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      lastError = error as Error;
      if (i === maxRetries - 1) throw lastError;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  throw lastError!;
}

export async function createOrder(order: Order): Promise<CreateOrderResponse> {
  try {
    // استخدم fetchWithRetry بدلاً من fetch مباشرة
    const response = await fetchWithRetry('/api/v1/restaurant/order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(order),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'فشل في إنشاء الطلب',
      };
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    console.error('Error creating order:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'حدث خطأ في الاتصال',
    };
  }
}

// مثال على استخدام الدالة المساعدة
