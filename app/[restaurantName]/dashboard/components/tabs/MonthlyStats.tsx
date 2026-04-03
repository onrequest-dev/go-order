// app/[restaurantName]/dashboard/components/tabs/MonthlyStats.tsx
'use client';

interface MonthlyStatsProps {
  restaurantId: string;
}

export function MonthlyStats({ restaurantId }: MonthlyStatsProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-2xl font-bold mb-4">الإحصائيات الشهرية</h2>
      <p className="text-gray-600">هذه الصفحة قيد التطوير...</p>
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">إجمالي الطلبات</p>
          <p className="text-2xl font-bold">0</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">الإيرادات</p>
          <p className="text-2xl font-bold">0</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">متوسط قيمة الطلب</p>
          <p className="text-2xl font-bold">0</p>
        </div>
      </div>
    </div>
  );
}