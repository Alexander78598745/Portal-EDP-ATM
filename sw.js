// Service Worker para Portal Atlético de Madrid
const CACHE_NAME = 'portal-atm-v2';
const urlsToCache = [
  './',
  './index.html',
  './login.html',
  './admin.html',
  './styles/main.css',
  './scripts/app.js',
  './scripts/auth.js',
  './scripts/admin.js',
  './scripts/config.js',
  './scripts/firebase.js',
  './images/escudo_atletico.png',
  './favicon.ico',
  './manifest.json'
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

// Fetch event con mejor manejo de errores
self.addEventListener('fetch', function(event) {
  // Solo manejar requests del mismo origen
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }
        
        // Para requests de archivos locales, usar fetch con fallback
        return fetch(event.request).catch(function(error) {
          console.log('Service Worker: Fallback para', event.request.url);
          // Si es una página HTML y falla, servir index.html
          if (event.request.destination === 'document') {
            return caches.match('./index.html');
          }
          // Para otros tipos, devolver una respuesta básica
          return new Response('Contenido no disponible offline', {
            status: 503,
            statusText: 'Service Unavailable'
          });
        });
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
      ).then(function() {
        // Tomar control inmediato de todas las pestañas
        return self.clients.claim();
      })
    })
  );
});