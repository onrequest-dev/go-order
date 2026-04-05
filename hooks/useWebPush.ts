// hooks/useWebPush.ts
import { useEffect, useState, useRef, useCallback } from 'react';

interface UseWebPushOptions {
  onNewOrder: () => void;
  retryCount?: number;
  retryDelay?: number;
}

export function useWebPush({ 
  onNewOrder, 
  retryCount = 3, 
  retryDelay = 5000 
}: UseWebPushOptions) {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout>();
  const retryAttemptRef = useRef(0);
  const onNewOrderRef = useRef(onNewOrder);
  
  // تحديث ref عند تغير callback
  useEffect(() => {
    onNewOrderRef.current = onNewOrder;
  }, [onNewOrder]);

  const subscribe = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // التحقق من وجود اشتراك سابق
      let pushSubscription = await registration.pushManager.getSubscription();
      
      if (!pushSubscription) {
        pushSubscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
          )as unknown as BufferSource
        });
      }
      
      // ارسال الاشتراك للباك اند
      const response = await fetch('/api/v1/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: pushSubscription })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save subscription on server');
      }
      
      setIsSubscribed(true);
      setError(null);
      retryAttemptRef.current = 0; // اعادة تعيين محاولات الاعداء عند النجاح
      console.log('Push subscription successful');
      
    } catch (error) {
      console.error('Push subscription failed:', error);
      setError(error instanceof Error ? error.message : 'Subscription failed');
      setIsSubscribed(false);
      
      // اعادة المحاولة فقط اذا لم نصل للحد الأقصى
      if (retryAttemptRef.current < retryCount) {
        retryAttemptRef.current++;
        console.log(`Retrying subscription (${retryAttemptRef.current}/${retryCount})...`);
        
        retryTimeoutRef.current = setTimeout(() => {
          subscribe();
        }, retryDelay * retryAttemptRef.current); // تأخير متزايد
      } else {
        console.error('Max retry attempts reached. Push notifications disabled.');
      }
    }
  }, [retryCount, retryDelay]);

  useEffect(() => {
    // التحقق من الدعم
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('Web Push not supported');
      setIsSupported(false);
      setError('Web Push not supported by this browser');
      return;
    }
    
    setIsSupported(true);
    
    // تسجيل Service Worker
    const init = async () => {
      try {
        // تسجيل الـ SW اذا لم يكن مسجلاً
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered');
        
        // انتظار تفعيل الـ SW
        if (registration.active) {
          // الاستماع للرسائل
          navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data?.type === 'NEW_ORDER') {
              console.log('Received new order notification, refreshing...');
              onNewOrderRef.current();
            }
          });
          
          // طلب الاذن والاشتراك
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            await subscribe();
          } else {
            setError('Notification permission denied');
          }
        } else {
          // انتظار تفعيل الـ SW
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (navigator.serviceWorker.controller) {
              init();
            }
          });
        }
      } catch (error) {
        console.error('Service Worker registration failed:', error);
        setError('Service Worker registration failed');
        
        // اعادة محاولة تسجيل الـ SW
        if (retryAttemptRef.current < retryCount) {
          retryAttemptRef.current++;
          retryTimeoutRef.current = setTimeout(init, retryDelay * retryAttemptRef.current);
        }
      }
    };
    
    init();
    
    // تنظيف الـ timeouts عند unmount
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [subscribe, retryCount, retryDelay]);

  // دالة لإعادة المحاولة يدوياً
  const retry = useCallback(() => {
    retryAttemptRef.current = 0;
    setError(null);
    subscribe();
  }, [subscribe]);

  return { 
    isSupported, 
    isSubscribed, 
    error,
    retry 
  };
}

// مساعدة لتحويل VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}