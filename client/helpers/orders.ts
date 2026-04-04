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

export async function createOrder(order: Order): Promise<CreateOrderResponse> {
  try {
    const response = await fetch('/api/v1/restaurant/order', {
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
export async function createOrderHelper(orderData: Order) {
  const result = await createOrder(orderData);
  
  if (result.success) {
    console.log('تم إنشاء الطلب بنجاح:', result.data);
    // يمكنك هنا عرض رسالة نجاح للمستخدم
    // أو تحديث حالة الواجهة
    return result.data;
  } else {
    console.error('فشل إنشاء الطلب:', result.error);
    // يمكنك هنا عرض رسالة خطأ للمستخدم
    throw new Error(result.error);
  }
}