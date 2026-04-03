// app/[restaurantName]/dashboard/components/tabs/TableOrders.tsx
'use client';

import { useState } from 'react';

interface TableOrdersProps {
  restaurantId: string;
}

// بيانات تجريبية للطلبات
const mockOrders = [
  { id: '1', tableNumber: 5, items: 3, total: 45.5, time: 'منذ 5 دقائق', status: 'pending' },
  { id: '2', tableNumber: 8, items: 2, total: 32.0, time: 'منذ 12 دقيقة', status: 'preparing' },
  { id: '3', tableNumber: 3, items: 4, total: 67.5, time: 'منذ 20 دقيقة', status: 'ready' },
];

export function TableOrders({ restaurantId }: TableOrdersProps) {
  const [orders, setOrders] = useState(mockOrders);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'preparing': return 'bg-blue-100 text-blue-700';
      case 'ready': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'pending': return 'في انتظار التحضير';
      case 'preparing': return 'قيد التحضير';
      case 'ready': return 'جاهز للتقديم';
      default: return status;
    }
  };

  return (
    <div className="p-6 md:p-8">
      {/* الهيدر */}
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">طلبات الطاولات</h2>
        <p className="text-gray-500 mt-1">إدارة ومتابعة طلبات الزبائن داخل المطعم</p>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4">
          <p className="text-2xl font-bold text-orange-600">12</p>
          <p className="text-sm text-orange-600">طلبات نشطة</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4">
          <p className="text-2xl font-bold text-yellow-600">3</p>
          <p className="text-sm text-yellow-600">قيد الانتظار</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
          <p className="text-2xl font-bold text-blue-600">5</p>
          <p className="text-sm text-blue-600">قيد التحضير</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
          <p className="text-2xl font-bold text-green-600">4</p>
          <p className="text-sm text-green-600">جاهزة للتقديم</p>
        </div>
      </div>

      {/* قائمة الطلبات */}
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">#{order.tableNumber}</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-800">طاولة رقم {order.tableNumber}</h3>
                  <p className="text-sm text-gray-500">{order.items} أطباق • {order.total}₺</p>
                  <p className="text-xs text-gray-400 mt-1">{order.time}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
                <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary-dark transition-colors">
                  تحديث الحالة
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}