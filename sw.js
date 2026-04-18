const CACHE_NAME = 'plant-haven-v1';

// Assets that should always be available offline
const STATIC_ASSETS = [
  '/home.html',
  '/cart.html',
  '/login.html',
  '/signup.html',
  '/styles/home.css',
  '/javascript/home.js',
  '/javascript/cart.js',
  '/javascript/auth.js',
  '/javascript/supabase-config.js',
  '/assets/chinesevergreen.webp',
  '/assets/FiddleLeafFig.jpg',
  '/assets/MoneyTree.jpg',
  '/assets/Dieffenbachia.jpg',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
];

// ─── Install: pre-cache static assets ────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Add cross-origin assets with no-cors to avoid opaque response issues
      const localAssets = STATIC_ASSETS.filter(url => !url.startsWith('http'));
      const externalAssets = STATIC_ASSETS.filter(url => url.startsWith('http'));
      return Promise.all([
        cache.addAll(localAssets),
        ...externalAssets.map(url =>
          fetch(new Request(url, { mode: 'no-cors' }))
            .then(res => cache.put(url, res))
            .catch(() => {}) // non-critical if an external asset fails
        ),
      ]);
    })
  );
  self.skipWaiting();
});

// ─── Activate: remove old caches ─────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ─── Fetch: network-first for navigation/API, cache-first for assets ─────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and Netlify function requests (always go to network)
  if (request.method !== 'GET') return;
  if (url.pathname.startsWith('/.netlify/')) return;
  if (url.hostname !== self.location.hostname && !url.href.includes('fonts.googleapis.com') && !url.href.includes('cdn.jsdelivr.net')) return;

  // Network-first for HTML pages (always fresh content)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return res;
        })
        .catch(() => caches.match(request).then(cached => cached || caches.match('/home.html')))
    );
    return;
  }

  // Cache-first for static assets (CSS, JS, images, fonts)
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((res) => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return res;
      }).catch(() => cached);
    })
  );
});
