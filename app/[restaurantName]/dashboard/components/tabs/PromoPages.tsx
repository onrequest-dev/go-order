// app/[restaurantName]/dashboard/components/tabs/PromoPages.tsx
'use client';

interface PromoPagesProps {
  restaurantId: string;
}

export function PromoPages({ restaurantId }: PromoPagesProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-2xl font-bold mb-4">الصفحات الإعلانية للوجبات</h2>
      <p className="text-gray-600">هذه الصفحة قيد التطوير...</p>
    </div>
  );
}