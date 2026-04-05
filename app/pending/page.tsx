// app/orders/pending/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { getPendingOrders, updateOrderStatus } from '@/client/helpers/dashboard';
import { Order} from '@/types';
import { useWebPush } from '@/hooks/useWebPush';

export default function PendingOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    if(!orders|| orders.length === 0) {
    setLoading(true);
    }
    const result = await getPendingOrders();
    console.log('Pending orders result:', result);
    
    if (result.success && result.data) {
      // تحويل البيانات من الـ API إلى نوع Order
      const formattedOrders: Order[] = result.data.map((item: any) => ({
        id: item.id,
        tableNumber: item.tableNumber || 0,
        totalPrice: item.totalPrice || 0,
        status: item.status,
        orderType: item.orderType,
        createdAt: new Date(item.createdAt),
        customerName: item.customerName,
        customerPhone: item.customerPhone,
        deliveryAddress: item.deliveryAddress,
        restaurantId: item.restaurantId,
        note: item.note,
        modified_at: item.modified_at ? new Date(item.modified_at) : undefined,
        items: item.items || []
      }));
      setOrders(formattedOrders);
    }
    setLoading(false);
  };
   const { isSupported, isSubscribed, error, retry } = useWebPush({
    onNewOrder: fetchOrders,
    retryCount: 3,      // 3 محاولات
    retryDelay: 5000    // 5 ثواني بين المحاولات
  });

  

  const handleCompleteOrder = async (orderId: string) => {
    setUpdatingId(orderId);
    const result = await updateOrderStatus(orderId, 'ready');
    
    if (result.success) {
      // تحديث حالة الطلب محلياً
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: 'ready' as const }
            : order
        )
      );
    } else {
      alert(result.error || 'Failed to update order status');
    }
    setUpdatingId(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Pending Orders</h1>
      
      {orders.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No pending orders
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {orders.map((order) => (
            <div key={order.id} className="border rounded-lg p-4 shadow-sm bg-white">
              {/* رأس الطلب */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="font-semibold text-lg">
                    #{order.id.slice(-6)}
                  </span>
                  {order.orderType === 'dine_in' ? (
                    <div className="text-sm text-gray-600">
                      Table {order.tableNumber}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-600">
                      Delivery: {order.customerName}
                    </div>
                  )}
                </div>
                <span className={`px-2 py-1 text-xs rounded ${
                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {order.status}
                </span>
              </div>

              {/* عناصر الطلب */}
              <div className="border-t pt-3 mb-3">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm mb-1">
                    <span>
                      {item.quantity}× {item.name}
                    </span>
                    <span className="text-gray-600">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                    <span className="text-gray-600">
                      {(item.notes)}
                    </span>
                  </div>
                ))}
              </div>

              {/* ملاحظات */}
              {order.note && (
                <div className="text-sm text-gray-500 mb-3">
                  📝 {order.note}
                </div>
              )}

              {/* المجموع والزر */}
              <div className="border-t pt-3 flex justify-between items-center">
                <span className="font-bold">
                  Total: ${order.totalPrice.toFixed(2)}
                </span>
                {order.status === 'pending' && (
                  <button
                    onClick={() => handleCompleteOrder(order.id)}
                    disabled={updatingId === order.id}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400 transition"
                  >
                    {updatingId === order.id ? 'Updating...' : 'Complete Order'}
                  </button>
                )}
                {order.status === 'ready' && (
                  <span className="text-green-600 text-sm">✓ Ready</span>
                )}
              </div>

              {/* معلومات التوصيل إن وجدت */}
              {order.orderType === 'delivery' && order.deliveryAddress && (
                <div className="text-xs text-gray-400 mt-2">
                  📍 {order.deliveryAddress} | 📞 {order.customerPhone}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}