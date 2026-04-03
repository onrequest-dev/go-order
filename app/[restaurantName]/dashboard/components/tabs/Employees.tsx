// app/[restaurantName]/dashboard/components/tabs/Employees.tsx
'use client';

interface EmployeesProps {
  restaurantId: string;
}

export function Employees({ restaurantId }: EmployeesProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-2xl font-bold mb-4">إدارة الموظفين</h2>
      <p className="text-gray-600">هذه الصفحة قيد التطوير...</p>
      <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
        + إضافة موظف جديد
      </button>
    </div>
  );
}