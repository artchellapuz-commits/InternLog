const CACHE_NAME = 'internlog-cache-v3'; // Changed from v2 to v3
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
    event.respondWith(Response.redirect('./?share-target'));
    event.waitUntil(async function () {
      const formData = await event.request.formData();
      const file = formData.get('file');
      if (!file) return;

      const text = await file.text();
      const client = await self.clients.get(event.resultingClientId || (await self.clients.matchAll())[0].id);
      client.postMessage({ type: 'file-shared', text });
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
