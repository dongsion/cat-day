const CACHE = "cat-day-v6";
const ASSETS = ["./", "./index.html", "./manifest.webmanifest"];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const request = event.request;
  event.respondWith(
    fetch(request)
      .then(response => {
        if (response && response.status === 200 && response.type === "basic") {
          caches.open(CACHE).then(cache => cache.put(request, response.clone()));
        }
        return response;
      })
      .catch(() => caches.match(request).then(cached => cached || caches.match("./index.html")))
  );
});
