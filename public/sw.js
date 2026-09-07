const CACHE_NAME = "ellie-shell-v4";
const STATIC_ASSETS = ["/images/home-iridescent-background.webp", "/icons/ellie-closet-192.png", "/offline.html"];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS)));
  self.skipWaiting();
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME && (key.startsWith("the-wall-shell-") || key.startsWith("ellie-shell-"))).map(key => caches.delete(key)))));
  self.clients.claim();
});
self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;
  // Never persist private pages, API data, or signed photo URLs in the service worker.
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match("/offline.html")));
    return;
  }
  if (!STATIC_ASSETS.includes(url.pathname) && !url.pathname.startsWith("/_next/static/")) return;
  event.respondWith(caches.match(request).then(cached => cached || fetch(request).then(response => {
    if (response.ok) { const copy = response.clone(); void caches.open(CACHE_NAME).then(cache => cache.put(request, copy)); }
    return response;
  })));
});
