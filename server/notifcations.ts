import webpush from 'web-push';
import { supabase_server } from './supabase-server';

// تهيئة web-push
webpush.setVapidDetails(
  'mailto:your-email@example.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export const notifyOrderUpdate = async (restaurantId: string, status: string, orderId: string) => {
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