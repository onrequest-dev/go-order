// public/sw.js

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

// ✅ تفعيل وتهيئة
self.addEventListener("activate", (event) => {
  console.log("[SW] Service Worker activated");
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    clients.claim(), // يسيطر على الصفحات المفتوحة حالياً
  );
});

self.addEventListener("push", function (event) {
  const data = event.data?.json();
  console.log("Push event received with data:", data);
  // اشعار خفي بدون ظهور (silent push)
//  event.waitUntil(registration.showNotification("New Order", {
//     body: "You have a new order!",
//     icon: "/icon.png",
//     silent: false, // لا يصدر صوت أو يظهر إشعار
//   }));

  // إرسال البيانات للصفحة المفتوحة
  event.waitUntil(
    self.clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then(function (clientList) {
        console.log("Received push data:", data);
        for (const client of clientList) {
          client.postMessage({
            type: "NEW_ORDER",
            payload: data,
            timestamp: Date.now(),
          });
        }
      }),
  );
});

// الاستماع لرسائل من الصفحة (اختياري)
self.addEventListener("message", function (event) {
  if (event.data?.type === "PING") {
    // يمكن للصفحة التحقق من الاتصال
  }
});
