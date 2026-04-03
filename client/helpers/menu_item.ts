//client/helpers/menu-items.ts

import { MenuItem } from "@/types";

// ========== أنواع الردود القياسية ==========
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    status: number;
}

// ========== دالة POST: إضافة وجبة جديدة ==========
export async function createMenuItem(
    menuItem: Omit<MenuItem, 'id'> // نأخذ كل الحقول ما عدا id لأنه سيتولد تلقائياً
): Promise<ApiResponse<MenuItem>> {
    try {
        const response = await fetch('/api/v1/restaurant/menu/menu-item', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // مهم لإرسال الـ JWT cookie
            body: JSON.stringify(menuItem),
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.error || 'فشل في إضافة الوجبة',
                status: response.status,
            };
        }

        return {
            success: true,
            data: data.data,
            message: data.message || 'تم إضافة الوجبة بنجاح',
            status: response.status,
        };
    } catch (error) {
        console.error('Error creating menu item:', error);
        return {
            success: false,
            error: 'حدث خطأ في الاتصال بالخادم',
            status: 500,
        };
    }
}

// ========== دالة GET: جلب قائمة الطعام ==========

// ========== دالة PUT: تحديث وجبة موجودة ==========
export async function updateMenuItem(
    id: string,
    updates: Partial<Omit<MenuItem, 'id'>>
): Promise<ApiResponse<MenuItem>> {
    try {
        const response = await fetch('/api/v1/restaurant/menu/menu-item', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ id, ...updates }),
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.error || 'فشل في تحديث الوجبة',
                status: response.status,
            };
        }

        return {
            success: true,
            data: data.data,
            message: data.message || 'تم تحديث الوجبة بنجاح',
            status: response.status,
        };
    } catch (error) {
        console.error('Error updating menu item:', error);
        return {
            success: false,
            error: 'حدث خطأ في الاتصال بالخادم',
            status: 500,
        };
    }
}

// ========== دالة DELETE: حذف وجبة ==========
export async function deleteMenuItem(id: string): Promise<ApiResponse> {
    try {
        const response = await fetch(`/api/v1/restaurant/menu/menu-item?id=${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.error || 'فشل في حذف الوجبة',
                status: response.status,
            };
        }

        return {
            success: true,
            message: data.message || 'تم حذف الوجبة بنجاح',
            status: response.status,
        };
    } catch (error) {
        console.error('Error deleting menu item:', error);
        return {
            success: false,
            error: 'حدث خطأ في الاتصال بالخادم',
            status: 500,
        };
    }
}

// ========== دوال مساعدة إضافية ==========

// جلب وجبة واحدة بواسطة ID


// تفعيل/تعطيل وجبة
export async function toggleMenuItemStatus(
    id: string,
    isActive: boolean
): Promise<ApiResponse<MenuItem>> {
    return updateMenuItem(id, { isActive });
}

