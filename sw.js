const CACHE_NAME = 'esb-thai-v1.1.2'; 

const urlsToCache = [
    './', 
    './index.html', 
    './manifest.json', 
    './icon.png',
    './app.js',
    './session1.js',
    './session2.js',
    './session2.1.js'
    './session2.2.js'
    './session2.3.js'
    './session3.js',
    './resetFeature.js',
    './audioFeature.js',
    './notificationFeature.js',
    './upcomingFeature.js',
    './study.js',
    './shared.js',
    './review.js',
    './retentionFeature.js',
    './practiceFeature.js',
    './profile.js',
    './home.js',
    './bookmarkFeature.js'
];

self.addEventListener('install', (e) => {
    self.skipWaiting();
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            // ⭐️ เปลี่ยนจาก addAll เป็นวนลูป add ทีละตัว เพื่อไม่ให้พังถาวรถ้ามีบางไฟล์หาย
            return Promise.allSettled(
                urlsToCache.map(url => cache.add(url).catch(err => console.warn('Cache failed for:', url)))
            );
        })
    );
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

// --- ระบบ Notification (ของมึงเดิมเป๊ะ) ---
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
        self.registration.showNotification(event.data.title, {
            body: event.data.body,
            icon: 'icon.png',
            badge: 'icon.png',
            vibrate: [200, 100, 200]
        });
    }
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(windowClients => {
            for (let i = 0; i < windowClients.length; i++) {
                let client = windowClients[i];
                if (client.url.includes('/') && 'focus' in client) return client.focus();
            }
            if (clients.openWindow) return clients.openWindow('./index.html');
        })
    );
});
