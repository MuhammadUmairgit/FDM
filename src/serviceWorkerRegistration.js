/* eslint-disable no-restricted-globals */
const CACHE_NAME = "inventory-pro-v2";
const DATA_CACHE_NAME = "inventory-data-v2";

// iOS has a 50MB cache limit, so be selective about what you cache
const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon.ico",
  "/static/js/main.js",
  "/static/css/main.css",
  "/10469240.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Cache opened");
      // Cache only critical resources initially
      return cache.addAll(
        urlsToCache.filter(
          (url) => !url.includes("chunk.js") && !url.includes("firestore")
        )
      );
    })
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip caching for Safari browsers due to iOS limitations
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  if (isSafari && (request.method !== "GET" || request.headers.get("range"))) {
    return;
  }

  // For data requests, try network first
  if (
    url.pathname.startsWith("/api") ||
    url.pathname.includes("firestore.googleapis.com")
  ) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone the response for caching
          const responseToCache = response.clone();
          caches
            .open(DATA_CACHE_NAME)
            .then((cache) => cache.put(request, responseToCache));
          return response;
        })
        .catch(() => {
          return caches
            .match(request)
            .then((response) => response || new Response("Offline"));
        })
    );
    return;
  }

  // For all other requests, try cache first
  event.respondWith(
    caches.match(request).then((response) => response || fetch(request))
  );
});

self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME, DATA_CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
