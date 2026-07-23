var CACHE_NAME = 'chordph-v19';
var URLS_TO_CACHE = [
    '/',
    '/index.html'
];

self.addEventListener('install', function(event) {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache.addAll(URLS_TO_CACHE);
        })
    );
});

self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.filter(function(name) { return name !== CACHE_NAME; })
                          .map(function(name) { return caches.delete(name); })
            );
        }).then(function() { return self.clients.claim(); })
    );
});

self.addEventListener('fetch', function(event) {
    // The analyzer manages its own resources (incl. ~46 MB of ML models) —
    // keep it out of the PWA cache and let the browser handle it directly
    if (new URL(event.request.url).pathname.indexOf('/analyzer') === 0) return;
    if (event.request.method !== 'GET') return;
    event.respondWith(
        fetch(event.request).then(function(response) {
            var responseClone = response.clone();
            caches.open(CACHE_NAME).then(function(cache) {
                cache.put(event.request, responseClone);
            });
            return response;
        }).catch(function() {
            return caches.match(event.request);
        })
    );
});