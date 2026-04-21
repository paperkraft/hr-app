self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener("fetch", (event) => {
  // Basic pass-through for now
  // We can add offline caching later if needed
  event.respondWith(fetch(event.request));
});
