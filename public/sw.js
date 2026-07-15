const CACHE_NAME = 'lingoflow-v1'
const APP_SHELL = ['/', '/index.html', '/manifest.webmanifest', '/lingoflow-icon.svg']

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME)
    await cache.addAll(APP_SHELL)
    try {
      const response = await fetch('/content/assets.json')
      const assets = await response.json()
      await Promise.all(assets.map(asset => cache.add(asset).catch(() => undefined)))
    } catch { /* Runtime caching keeps the app usable when a first install is offline. */ }
    await self.skipWaiting()
  })())
})

self.addEventListener('activate', event => event.waitUntil((async () => {
  const names = await caches.keys()
  await Promise.all(names.filter(name => name !== CACHE_NAME).map(name => caches.delete(name)))
  await self.clients.claim()
})()))

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    if (new URL(event.request.url).pathname.startsWith('/content/')) caches.open(CACHE_NAME).then(cache => cache.put(event.request, response.clone()))
    return response
  })))
})
