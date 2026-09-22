const CACHE_NAME = "ellie-shell-v6";
const IMAGE_CACHE_NAME = "ellie-wardrobe-images-v1";
const MAX_CACHED_IMAGES = 500;
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
  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  if (url.pathname === "/api/image" && url.searchParams.get("scope") === "viewer") {
    event.respondWith(caches.open(IMAGE_CACHE_NAME).then(async cache => {
      const cached = await cache.match(request);
      if (cached) return cached;
      const response = await fetch(request);
      if (response.ok || response.type === "opaque") {
        try {
          await cache.put(request, response.clone());
          const keys = await cache.keys();
          await Promise.all(keys.slice(0, Math.max(0, keys.length - MAX_CACHED_IMAGES)).map(key => cache.delete(key)));
        } catch {
          // A full or unavailable device cache must never prevent the image from loading.
        }
      }
      return response;
    }));
    return;
  }
  // Never persist private pages or other API data in the service worker.
  if (url.pathname.startsWith("/api/")) return;
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
