// public/sw.js
self.addEventListener("push", function (event) {
  const data = event.data?.json();

  // اشعار خفي بدون ظهور (silent push)
 event.waitUntil(registration.showNotification("New Order", {
    body: "You have a new order!",
    icon: "/icon.png",
    silent: true, // لا يصدر صوت أو يظهر إشعار
  }));

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
