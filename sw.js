// เปลี่ยนชื่อเวอร์ชัน (จาก v4.2 เป็น v5.0) เพื่อบังคับให้บราวเซอร์ทิ้งแคชเก่าแล้วอัปเดตใหม่
const CACHE_NAME = 'esb-thai-v2.2-Beta'; 

// 💡 อัปเดตรายการไฟล์ที่ต้องเก็บแคช (Cache) เพื่อให้ออฟไลน์ได้ 100%
const urlsToCache = [
    './', 
    './index.html', 
    './manifest.json', 
    './icon.png',
    './app.js',
    './session1.js',
    './session2.js',
    './session3.js',
    './resetFeature.js',
    './audioFeature.js',
    './notificationFeature.js'
    './upcomingFeature.js'
    './study.js'
    './shared.js'
    './review.js'
    './retentionFeature.js'
    './practiceFeature.js'
    './profile.js'
    './home.js'
    './bookmarkFeature.js'

];

// --- 1. โค้ดเดิมของคุณ (จัดการ Offline & Cache) ---
self.addEventListener('install', (e) => {
    self.skipWaiting();
    e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)));
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

self.addEventListener('fetch', (e) => {
    e.respondWith(caches.match(e.request).then((res) => res || fetch(e.request)));
});

// ======================================================
// 🚀 2. โค้ดใหม่ที่เพิ่มเข้ามา (จัดการ Notification)
// ======================================================

// ดักจับคำสั่งจากหน้าเว็บเพื่อเด้งป๊อปอัปแจ้งเตือน
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
        self.registration.showNotification(event.data.title, {
            body: event.data.body,
            icon: 'icon.png', // ใช้รูป icon.png เดิมของคุณได้เลย
            badge: 'icon.png',
            vibrate: [200, 100, 200] // สั่น 3 จังหวะ
        });
    }
});

// เมื่อผู้ใช้แตะที่การแจ้งเตือน ให้เปิดแอปหรือเด้งกลับมาที่หน้าเว็บ
self.addEventListener('notificationclick', (event) => {
    event.notification.close(); // ปิดป้ายแจ้งเตือน
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(windowClients => {
            // เช็คว่าเปิดแอปทิ้งไว้อยู่ไหม ถ้าเปิดอยู่ให้เด้งหน้านั้นขึ้นมา
            for (let i = 0; i < windowClients.length; i++) {
                let client = windowClients[i];
                if (client.url.includes('/') && 'focus' in client) {
                    return client.focus();
                }
            }
            // ถ้าแอปปิดอยู่ ให้เปิดหน้าต่างใหม่
            if (clients.openWindow) {
                return clients.openWindow('./index.html');
            }
        })
    );
});


