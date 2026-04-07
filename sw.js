const CACHE_NAME = 'internlog-cache-v6'; // bump when app shell changes; v6: fresh HTML updates
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

  const req = event.request;
  const isNavigate = req.mode === 'navigate';
  const wantsHtml = (req.headers.get('accept') || '').includes('text/html');

  if (isNavigate || wantsHtml) {
    event.respondWith(
      fetch(req)
        .then(function (netRes) {
          if (netRes && netRes.ok) {
            const copy = netRes.clone();
            caches.open(CACHE_NAME).then(function (cache) {
              cache.put(req, copy);
            });
          }
          return netRes;
        })
        .catch(function () {
          return caches.match(req).then(function (r) {
            return r || caches.match('index.html');
          });
        })
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(function (response) {
      if (response) return response;
      return fetch(req).catch(function () {
        return caches.match('index.html');
      });
    })
  );
});
