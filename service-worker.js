const CACHE_NAME = "malayalam-imposter-v10";

const filesToCache = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./words.js",
  "./manifest.json",
  "./service-worker.js"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(filesToCache)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(cacheNames.map(cache => cache !== CACHE_NAME ? caches.delete(cache) : null))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  event.respondWith(caches.match(event.request).then(response => response || fetch(event.request)));
});
