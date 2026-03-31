const CACHE_NAME = 'internlog-cache-v4'; // Updated for share target support
const urlsToCache = [
  '/',
  'index.html',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  // Handle Share Target POST requests
  if (event.request.method === 'POST') {
    event.respondWith(Response.redirect('./?share-target', 303));
    event.waitUntil(async function () {
      const formData = await event.request.formData();
      const file = formData.get('file');
      if (!file) return;

      const text = await file.text();
      const fileName = file.name;
      
      // Wait for the client to be ready (the redirected page)
      const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const client of clients) {
        if (client.url.includes('share-target')) {
          client.postMessage({ type: 'file-shared', text, fileName });
        }
      }
    }());
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).catch(() => caches.match('index.html'));
      })
  );
});
