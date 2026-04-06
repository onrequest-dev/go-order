// helpers/orders.ts أو lib/orders.ts

import { OrderItem } from "@/types";

export interface PendingOrder {
  id: string;
  tableNumber: number | null;
  totalPrice: number | null;
  status: string;
  orderType: string;
  createdAt: string;
  customerName: string | null;
  customerPhone: string | null;
  deliveryAddress: string | null;
  restaurantId: string | null;
  note: string | null;
  modified_at: string | null;
  items: OrderItem[];
}

export interface GetPendingOrdersResponse {
  success: boolean;
  data?: PendingOrder[];
  error?: string;
}

export async function getPendingOrders(): Promise<GetPendingOrdersResponse> {
  try {
    const response = await fetchWithRetry('/api/v1/restaurant/dashboard/orders/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Failed to fetch pending orders',
      };
    }

    return {
      success: true,
      data: result.orders || [],
    };
  } catch (error) {
    console.error('Error in getPendingOrders:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}


// types/order.ts
export interface UpdateOrderStatusRequest {
  orderId: string;
  newStatus: 'pending' | 'preparing' | 'ready' | 'served' | 'completed';
}

export interface UpdateOrderStatusResponse {
  success: boolean;
  data?: {
    id: string;
    status: string;
    modified_at: string;
    [key: string]: any;
  };
  error?: string;
  message?: string;
}

// helpers/orders.ts
export async function updateOrderStatus(
  orderId: string,
  newStatus: UpdateOrderStatusRequest['newStatus'] = "ready"
): Promise<UpdateOrderStatusResponse> {
  try {
    const response = await fetch('/api/v1/restaurant/dashboard/orders/', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        orderId, 
        newStatus 
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Failed to update order status',
      };
    }

    return {
      success: true,
      data: result.data,
      message: result.message,
    };
  } catch (error) {
    console.error('Error in updateOrderStatus:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}





async function fetchWithRetry(url: string, options: RequestInit, maxRetries: number = 5): Promise<Response> {
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