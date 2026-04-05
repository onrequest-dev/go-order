// app/orders/pending/page.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { getPendingOrders, updateOrderStatus } from '@/client/helpers/dashboard';
import { Order} from '@/types';
import { useWebPush } from '@/hooks/useWebPush';

export default function PendingOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  // المصفوفات المطلوبة
  const [currentOrderIds, setCurrentOrderIds] = useState<string[]>([]);
  const [newOrderIds, setNewOrderIds] = useState<string[]>([]);
  
  // متغير لتتبع ما إذا كان المستخدم قد تفاعل مع الصفحة
  const [userInteracted, setUserInteracted] = useState(false);
  const [pendingOrdersToSpeak, setPendingOrdersToSpeak] = useState<Order[]>([]);
  
  // متغيرات لمنع التكرار
  const isSpeakingRef = useRef(false);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    fetchOrders();
    
    // تنظيف عند إلغاء تحميل المكون
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  // محاولة قراءة الطلبات المعلقة بعد تفاعل المستخدم
  useEffect(() => {
    if (userInteracted && pendingOrdersToSpeak.length > 0 && !isSpeakingRef.current) {
      speakNewOrders(pendingOrdersToSpeak);
      setPendingOrdersToSpeak([]);
    }
  }, [userInteracted, pendingOrdersToSpeak]);

  // دالة لقراءة الطلبات الجديدة بصوت عالي
  const speakNewOrders = (newOrders: Order[]) => {
    if (!('speechSynthesis' in window)) {
      console.log('❌ متصفحك لا يدعم خاصية تحويل النص إلى كلام');
      return;
    }

    if (newOrders.length === 0) return;
    
    // منع التكرار إذا كان هناك نطق جاري
    if (isSpeakingRef.current) {
      console.log('⚠️ يوجد نطق قيد التشغيل، سيتم تجاهل الطلب الجديد');
      return;
    }

    // إلغاء أي نطق سابق
    window.speechSynthesis.cancel();
    
    // تنظيف أي timeout سابق
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // بناء النص الذي سيتم قراءته
    let textToSpeak = `تنبيه. لديك ${newOrders.length} طلب جديد. `;
    
    newOrders.forEach((order, index) => {
      if (order.orderType === 'dine_in') {
        textToSpeak += `الطلب ${index + 1}: طاولة رقم ${order.tableNumber}. `;
      } else {
        textToSpeak += `الطلب ${index + 1}: توصيل إلى ${order.customerName}. `;
      }
      
      // قراءة أصناف الطلب
      textToSpeak += `الأصناف: `;
      order.items.forEach((item, itemIndex) => {
        textToSpeak += `${item.quantity} ${item.name}`;
        if (itemIndex < order.items.length - 1) textToSpeak += `، `;
      });
      textToSpeak += `. `;
      
      // قراءة الملاحظات إن وجدت
      if (order.note && order.note.trim()) {
        textToSpeak += `ملاحظات: ${order.note}. `;
      }
      
      textToSpeak += `الإجمالي: ${order.totalPrice} دولار. `;
    });

    console.log('📢 سيتم نطق النص:', textToSpeak);

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'ar-EG';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      console.log('🎤 بدء النطق...');
      isSpeakingRef.current = true;
      currentUtteranceRef.current = utterance;
    };
    
    utterance.onend = () => {
      console.log('✅ انتهى النطق');
      isSpeakingRef.current = false;
      currentUtteranceRef.current = null;
      
      // إعادة تعيين speechSynthesis لمنع التكرار في بعض المتصفحات
      setTimeout(() => {
        window.speechSynthesis.cancel();
      }, 100);
    };
    
    utterance.onerror = (event) => {
      console.error('❌ خطأ في النطق:', event);
      isSpeakingRef.current = false;
      currentUtteranceRef.current = null;
      
      // إذا كان الخطأ ليس بسبب الإلغاء، نحاول تنظيف الحالة
      if (event.error !== 'interrupted' && event.error !== 'canceled') {
        setTimeout(() => {
          window.speechSynthesis.cancel();
        }, 100);
      }
    };

    // تشغيل النطق
    window.speechSynthesis.speak(utterance);
    
    // حل إضافي لمنع التكرار في Chrome
    timeoutRef.current = setTimeout(() => {
      if (isSpeakingRef.current) {
        console.log('⚠️ انتهى الوقت المحدد للنطق، يتم الإلغاء');
        window.speechSynthesis.cancel();
        isSpeakingRef.current = false;
        currentUtteranceRef.current = null;
      }
    }, 30000); // 30 ثانية كحد أقصى للنطق
  };

  // دالة لتفعيل الصوت عند أول تفاعل من المستخدم
  const enableAudio = () => {
    if (!userInteracted) {
      setUserInteracted(true);
      // إلغاء أي نطق سابق
      window.speechSynthesis.cancel();
      // تشغيل صوت صامت لتفعيل الـ API
      const silentUtterance = new SpeechSynthesisUtterance('');
      silentUtterance.lang = 'ar-EG';
      window.speechSynthesis.speak(silentUtterance);
      
      // إلغاء الصوت الصامت بعد 100ms
      setTimeout(() => {
        window.speechSynthesis.cancel();
      }, 100);
    }
  };

  const fetchOrders = async () => {
    if(!orders || orders.length === 0) {
      setLoading(true);
    }
    const result = await getPendingOrders();
    console.log('نتيجة جلب الطلبات:', result);
    
    if (result.success && result.data) {
      const formattedOrders: Order[] = result.data.map((item: any) => ({
        id: item.id,
        tableNumber: item.tableNumber || 0,
        totalPrice: item.totalPrice || 0,
        status: item.status,
        orderType: item.orderType,
        createdAt: new Date(item.createdAt),
        customerName: item.customerName,
        customerPhone: item.customerPhone,
        deliveryAddress: item.deliveryAddress,
        restaurantId: item.restaurantId,
        note: item.note,
        modified_at: item.modified_at ? new Date(item.modified_at) : undefined,
        items: item.items || []
      }));
      
      const newIds = formattedOrders.map(order => order.id);
      const addedIds = newIds.filter(id => !currentOrderIds.includes(id));
      const newOrdersData = formattedOrders.filter(order => addedIds.includes(order.id));
      
      console.log('الطلبات الجديدة:', newOrdersData.length);
      
      setNewOrderIds(addedIds);
      setCurrentOrderIds(newIds);
      setOrders(formattedOrders);
      
      // إذا كان المستخدم قد تفاعل مع الصفحة، اقرأ الطلبات فوراً
      if (newOrdersData.length > 0) {
        if (userInteracted && !isSpeakingRef.current) {
          setTimeout(() => {
            speakNewOrders(newOrdersData);
          }, 500);
        } else if (userInteracted && isSpeakingRef.current) {
          // إذا كان هناك نطق جاري، أضف إلى قائمة الانتظار
          setPendingOrdersToSpeak(prev => [...prev, ...newOrdersData]);
        } else {
          // خزن الطلبات لقراءتها لاحقاً بعد التفاعل
          setPendingOrdersToSpeak(prev => [...prev, ...newOrdersData]);
        }
      }
    }
    setLoading(false);
  };
  
  const { isSupported, isSubscribed, error, retry } = useWebPush({
    onNewOrder: fetchOrders,
    retryCount: 3,
    retryDelay: 5000
  });

  const handleCompleteOrder = async (orderId: string) => {
    setUpdatingId(orderId);
    const result = await updateOrderStatus(orderId, 'ready');
    
    if (result.success) {
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: 'ready' as const }
            : order
        )
      );
    } else {
      alert(result.error || 'فشل في تحديث حالة الطلب');
    }
    setUpdatingId(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">جاري تحميل الطلبات...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4" dir="rtl" onClick={enableAudio}>
      <h1 className="text-2xl font-bold mb-6">الطلبات المعلقة</h1>
      
      {/* رسالة تحذيرية إذا لم يتم تفعيل الصوت بعد */}
      {!userInteracted && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded mb-4 text-center">
          🔔 اضغط في أي مكان في الصفحة لتفعيل خاصية النطق التلقائي للطلبات الجديدة
        </div>
      )}
      
      {/* عرض عدد الطلبات الجديدة */}
      {newOrderIds.length > 0 && (
        <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg mb-4 text-center">
          🆕 تم إضافة {newOrderIds.length} طلب جديد
          {!userInteracted && pendingOrdersToSpeak.length > 0 && 
            ` (سيتم نطقها بعد تفعيل الصوت)`
          }
        </div>
      )}
      
      {orders.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          لا توجد طلبات معلقة
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {orders.map((order) => (
            <div key={order.id} className="border rounded-lg p-4 shadow-sm bg-white">
              {/* رأس الطلب */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="font-semibold text-lg">
                    #{order.id.slice(-6)}
                  </span>
                  {order.orderType === 'dine_in' ? (
                    <div className="text-sm text-gray-600">
                      طاولة رقم {order.tableNumber}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-600">
                      توصيل: {order.customerName}
                    </div>
                  )}
                </div>
                <span className={`px-2 py-1 text-xs rounded ${
                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {order.status === 'pending' ? 'قيد الانتظار' :
                   order.status === 'preparing' ? 'قيد التحضير' :
                   'جاهز'}
                </span>
              </div>

              {/* عناصر الطلب */}
              <div className="border-t pt-3 mb-3">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm mb-1">
                    <span>
                      {item.quantity}× {item.name}
                    </span>
                    <span className="text-gray-600">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                    <span className="text-gray-600">
                      {item.notes}
                    </span>
                  </div>
                ))}
              </div>

              {/* ملاحظات */}
              {order.note && (
                <div className="text-sm text-gray-500 mb-3">
                  📝 ملاحظات: {order.note}
                </div>
              )}

              {/* المجموع والزر */}
              <div className="border-t pt-3 flex justify-between items-center">
                <span className="font-bold">
                  الإجمالي: ${order.totalPrice.toFixed(2)}
                </span>
                {order.status === 'pending' && (
                  <button
                    onClick={() => handleCompleteOrder(order.id)}
                    disabled={updatingId === order.id}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400 transition"
                  >
                    {updatingId === order.id ? 'جاري التحديث...' : 'إكمال الطلب'}
                  </button>
                )}
                {order.status === 'ready' && (
                  <span className="text-green-600 text-sm">✓ جاهز</span>
                )}
              </div>

              {/* معلومات التوصيل إن وجدت */}
              {order.orderType === 'delivery' && order.deliveryAddress && (
                <div className="text-xs text-gray-400 mt-2">
                  📍 {order.deliveryAddress} | 📞 {order.customerPhone}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}













// ========= الكود بدون الصوت ========




// // app/orders/pending/page.tsx
// 'use client';

// import { useEffect, useState } from 'react';
// import { getPendingOrders, updateOrderStatus } from '@/client/helpers/dashboard';
// import { Order} from '@/types';
// import { useWebPush } from '@/hooks/useWebPush';

// export default function PendingOrdersPage() {
//   const [orders, setOrders] = useState<Order[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [updatingId, setUpdatingId] = useState<string | null>(null);
  
//   // المصفوفات المطلوبة
//   const [currentOrderIds, setCurrentOrderIds] = useState<string[]>([]);
//   const [newOrderIds, setNewOrderIds] = useState<string[]>([]);
  
//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   const fetchOrders = async () => {
//     if(!orders || orders.length === 0) {
//       setLoading(true);
//     }
//     const result = await getPendingOrders();
//     console.log('Pending orders result:', result);
    
//     if (result.success && result.data) {
//       // تحويل البيانات من الـ API إلى نوع Order
//       const formattedOrders: Order[] = result.data.map((item: any) => ({
//         id: item.id,
//         tableNumber: item.tableNumber || 0,
//         totalPrice: item.totalPrice || 0,
//         status: item.status,
//         orderType: item.orderType,
//         createdAt: new Date(item.createdAt),
//         customerName: item.customerName,
//         customerPhone: item.customerPhone,
//         deliveryAddress: item.deliveryAddress,
//         restaurantId: item.restaurantId,
//         note: item.note,
//         modified_at: item.modified_at ? new Date(item.modified_at) : undefined,
//         items: item.items || []
//       }));
      
//       // استخراج IDs الطلبات الجديدة
//       const newIds = formattedOrders.map(order => order.id);
      
//       // المقارنة: إيجاد IDs غير الموجودة في currentOrderIds
//       const addedIds = newIds.filter(id => !currentOrderIds.includes(id));
      
//       // تحديث مصفوفة الطلبات الجديدة
//       setNewOrderIds(addedIds);
      
//       // تحديث مصفوفة الطلبات الحالية لتشمل الكل
//       setCurrentOrderIds(newIds);
      
//       // تحديث حالة الطلبات
//       setOrders(formattedOrders);
//     }
//     setLoading(false);
//   };
  
//   const { isSupported, isSubscribed, error, retry } = useWebPush({
//     onNewOrder: fetchOrders,
//     retryCount: 3,
//     retryDelay: 5000
//   });

//   const handleCompleteOrder = async (orderId: string) => {
//     setUpdatingId(orderId);
//     const result = await updateOrderStatus(orderId, 'ready');
    
//     if (result.success) {
//       // تحديث حالة الطلب محلياً
//       setOrders(prevOrders => 
//         prevOrders.map(order => 
//           order.id === orderId 
//             ? { ...order, status: 'ready' as const }
//             : order
//         )
//       );
//     } else {
//       alert(result.error || 'فشل في تحديث حالة الطلب');
//     }
//     setUpdatingId(null);
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="text-gray-500">جاري تحميل الطلبات...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto p-4" dir="rtl">
//       <h1 className="text-2xl font-bold mb-6">الطلبات المعلقة</h1>
      
//       {orders.length === 0 ? (
//         <div className="text-center text-gray-500 py-8">
//           لا توجد طلبات معلقة
//         </div>
//       ) : (
//         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
//           {orders.map((order) => (
//             <div key={order.id} className="border rounded-lg p-4 shadow-sm bg-white">
//               {/* رأس الطلب */}
//               <div className="flex justify-between items-start mb-3">
//                 <div>
//                   <span className="font-semibold text-lg">
//                     #{order.id.slice(-6)}
//                   </span>
//                   {order.orderType === 'dine_in' ? (
//                     <div className="text-sm text-gray-600">
//                       طاولة رقم {order.tableNumber}
//                     </div>
//                   ) : (
//                     <div className="text-sm text-gray-600">
//                       توصيل: {order.customerName}
//                     </div>
//                   )}
//                 </div>
//                 <span className={`px-2 py-1 text-xs rounded ${
//                   order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
//                   order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
//                   'bg-green-100 text-green-800'
//                 }`}>
//                   {order.status === 'pending' ? 'قيد الانتظار' :
//                    order.status === 'preparing' ? 'قيد التحضير' :
//                    'جاهز'}
//                 </span>
//               </div>

//               {/* عناصر الطلب */}
//               <div className="border-t pt-3 mb-3">
//                 {order.items.map((item, idx) => (
//                   <div key={idx} className="flex justify-between text-sm mb-1">
//                     <span>
//                       {item.quantity}× {item.name}
//                     </span>
//                     <span className="text-gray-600">
//                       ${(item.price * item.quantity).toFixed(2)}
//                     </span>
//                     <span className="text-gray-600">
//                       {item.notes}
//                     </span>
//                   </div>
//                 ))}
//               </div>

//               {/* ملاحظات */}
//               {order.note && (
//                 <div className="text-sm text-gray-500 mb-3">
//                   📝 ملاحظات: {order.note}
//                 </div>
//               )}

//               {/* المجموع والزر */}
//               <div className="border-t pt-3 flex justify-between items-center">
//                 <span className="font-bold">
//                   الإجمالي: ${order.totalPrice.toFixed(2)}
//                 </span>
//                 {order.status === 'pending' && (
//                   <button
//                     onClick={() => handleCompleteOrder(order.id)}
//                     disabled={updatingId === order.id}
//                     className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400 transition"
//                   >
//                     {updatingId === order.id ? 'جاري التحديث...' : 'إكمال الطلب'}
//                   </button>
//                 )}
//                 {order.status === 'ready' && (
//                   <span className="text-green-600 text-sm">✓ جاهز</span>
//                 )}
//               </div>

//               {/* معلومات التوصيل إن وجدت */}
//               {order.orderType === 'delivery' && order.deliveryAddress && (
//                 <div className="text-xs text-gray-400 mt-2">
//                   📍 {order.deliveryAddress} | 📞 {order.customerPhone}
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

