// app/[restaurantName]/dashboard/components/tabs/DeliveryOrders.tsx
'use client';

interface DeliveryOrdersProps {
  restaurantId: string;
}

export function DeliveryOrders({ restaurantId }: DeliveryOrdersProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-2xl font-bold mb-4">طلبات التوصيل</h2>
      <p className="text-gray-600">هذه الصفحة قيد التطوير...</p>
      <p className="text-sm text-gray-500 mt-2">Restaurant ID: {restaurantId}</p>
    </div>
  );
}