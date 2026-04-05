// app/api/v1/restaurant/order/route.ts

import { supabase_server } from "@/server/supabase-server";
import { Order,} from "@/types";
import { NextRequest, NextResponse } from "next/server";
import webpush from 'web-push';

// تهيئة web-push
webpush.setVapidDetails(
  'mailto:your-email@example.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);
// app/api/v1/restaurant/order/route.ts

export async function POST(request: NextRequest) {
    const order: Order = await request.json();
    const { data, error } = await supabase_server.rpc('create_order_with_items', {
        p_restaurant_id: order.restaurantId,
        p_table_number: order.tableNumber,
        p_status: order.status,
        p_order_type: order.orderType,
        p_items: order.items.map(item => ({
            menu_item_id: item.menuItemId,
            quantity: item.quantity,
            notes: item.notes || null
        })),
        p_customer_name: order.customerName || null,
        p_customer_phone: order.customerPhone || null,
        p_delivery_address: order.deliveryAddress || null,
        p_note: order.note || null
    });
    
    if (!data || error) {
        console.error('Error creating order:', error);
        return NextResponse.json({ success: false, error: error?.message || 'Failed to create order' }, { status: 500 });
    }
    
    console.log('Order created with ID:', data);
    
    // 🔥 إطلاق النار ونسيان - بدون await
    notifyOrderUpdate(order.restaurantId, order.status, data.id).catch(err => {
        console.error('Failed to send push notifications (non-blocking):', err);
    });
    
    return NextResponse.json({ success: true, data: { id: data.id } }, { status: 201 });
}

const notifyOrderUpdate = async (restaurantId: string, status: string, orderId: string) => {
    console.log("1")
    try {
        const { data: subscriptions } = await supabase_server
            .from('push_subscriptions')
            .select('subscription')
            .eq('restaurant_id', restaurantId)
            .eq('active', true);
        
        if (!subscriptions?.length) {
            console.log('No active subscriptions found');
            return;
        }
        
        // إرسال الإشعارات بدون انتظار الانتهاء
        const notificationPromises = subscriptions.map(async ({ subscription }) => {
            try {
                await webpush.sendNotification(
                    subscription,
                    JSON.stringify({
                        type: 'NEW_ORDER',
                        orderId: orderId,
                        timestamp: Date.now(),
                        silent: false
                    })
                );
            } catch (err) {
                console.error('Failed to send individual notification:', err);
                // إذا كان الاشتراك منتهياً (410)، نحدث قاعدة البيانات
                if ((err as any).statusCode === 410) {
                    await supabase_server
                        .from('push_subscriptions')
                        .update({ active: false })
                        .eq('subscription', subscription);
                }
            }
        });
        
        // 🔥 نطلق جميع الإشعارات ولا ننتظر - لكن نتعامل مع الأخطاء
        Promise.allSettled(notificationPromises).then(results => {
            const succeeded = results.filter(r => r.status === 'fulfilled').length;
            const failed = results.filter(r => r.status === 'rejected').length;
            console.log(`Notifications: ${succeeded} succeeded, ${failed} failed`);
        });
        
    } catch (error) {
        console.error('Error in notifyOrderUpdate:', error);
        // لا نرمي الخطأ لأعلى لأننا لا نريد إيقاف الـ Response
    }
}