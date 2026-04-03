// app/[restaurantName]/dashboard/components/tabs/Profits.tsx
'use client';

interface ProfitsProps {
  restaurantId: string;
}

export function Profits({ restaurantId }: ProfitsProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-2xl font-bold mb-4">الأرباح</h2>
      <p className="text-gray-600">هذه الصفحة قيد التطوير...</p>
      <div className="mt-4 border-t pt-4">
        <div className="flex justify-between items-center">
          <span className="font-medium">صافي الأرباح هذا الشهر:</span>
          <span className="text-xl font-bold text-green-600">0</span>
        </div>
      </div>
    </div>
  );
}