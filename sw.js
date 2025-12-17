// Service Worker para Portal Atlético de Madrid
const CACHE_NAME = 'portal-atm-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/login.html',
  '/admin.html',
  '/styles/main.css',
  '/scripts/app.js',
  '/scripts/auth.js',
  '/scripts/admin.js',
  '/scripts/config.js',
  '/scripts/firebase.js',
  '/images/escudo_atletico.png',
  '/favicon.ico'
];

// Instalación del Service Worker
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Service Worker: Cache abierto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Activación del Service Worker
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Eliminando cache antiguo', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});