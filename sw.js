// Private-beta cache reset. The offline app shell is intentionally disabled
// while the whole site is invitation-only: a cached public shell must not
// bypass the access gate. Secure, account-bound offline packs can return later.
var CACHE_PREFIX = 'chordph-';

self.addEventListener('install', function(event) {
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', function(event) {
    event.waitUntil(caches.keys().then(function(names) {
        return Promise.all(names.filter(function(name) {
            return name.indexOf(CACHE_PREFIX) === 0;
        }).map(function(name) { return caches.delete(name); }));
    }).then(function() { return self.clients.claim(); })
      .then(function() { return self.registration.unregister(); }));
});
