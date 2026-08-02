var CACHE_PREFIX = 'chordph-';
var CACHE_NAME = CACHE_PREFIX + 'v76';
var APP_SHELL = [
    '/',
    '/index.html',
    '/app/',
    '/app/index.html',
    '/app/lib/supabase.js',
    '/app/lib/music-engine.js',
    '/manifest.json',
    '/icons/icon-192.png',
    '/icons/icon-512.png'
];

self.addEventListener('install', function(event) {
    event.waitUntil(caches.open(CACHE_NAME).then(function(cache) {
        return cache.addAll(APP_SHELL);
    }).then(function() { return self.skipWaiting(); }));
});

self.addEventListener('activate', function(event) {
    event.waitUntil(caches.keys().then(function(names) {
        return Promise.all(names.filter(function(name) {
            return name.indexOf(CACHE_PREFIX) === 0 && name !== CACHE_NAME;
        }).map(function(name) { return caches.delete(name); }));
    }).then(function() { return self.clients.claim(); }));
});

function cacheSuccessfulSameOrigin(request, response) {
    if (!response || !response.ok || response.type !== 'basic') return response;
    caches.open(CACHE_NAME).then(function(cache) { cache.put(request, response.clone()); });
    return response;
}

function navigationFallback(request, pathname) {
    return fetch(request).then(function(response) {
        return cacheSuccessfulSameOrigin(request, response);
    }).catch(function() {
        return caches.match(request).then(function(match) {
            if (match) return match;
            return caches.match(pathname.indexOf('/app') === 0 ? '/app/index.html' : '/index.html');
        });
    });
}

self.addEventListener('fetch', function(event) {
    if (event.request.method !== 'GET') return;
    var url = new URL(event.request.url);

    // Never cache Supabase, authentication, AI, Spotify, YouTube, or any other
    // third-party response. The analyzer's large non-commercial models also
    // remain browser-managed rather than entering the app-shell cache.
    if (url.origin !== self.location.origin || url.pathname.indexOf('/analyzer') === 0) return;

    if (event.request.mode === 'navigate') {
        event.respondWith(navigationFallback(event.request, url.pathname));
        return;
    }

    if (APP_SHELL.indexOf(url.pathname) !== -1) {
        event.respondWith(caches.match(event.request).then(function(cached) {
            if (cached) return cached;
            return fetch(event.request).then(function(response) {
                return cacheSuccessfulSameOrigin(event.request, response);
            });
        }));
    }
});
