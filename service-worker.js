const CACHE_NAME = "tt-malta-v1";
const APP_SHELL = [
  "./",
  "index.html",
  "styles.css",
  "app.js",
  "config.json",
  "tracks.json",
  "manifest.webmanifest",
  "qr.html",
  "assets/logo.svg",
  "assets/icon-192.png",
  "assets/icon-512.png",
  "assets/qr-placeholder.png",
  "audio/dummy.mp3"
];

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(APP_SHELL);
    try {
      const response = await fetch("tracks.json", { cache: "no-store" });
      const tracks = await response.json();
      const audioFiles = [...new Set(tracks.map(track => track.audio).filter(Boolean))];
      await cache.addAll(audioFiles);
    } catch (error) {
      console.warn("Audio pre-cache was not completed", error);
    }
  })());
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match("index.html")))
  );
});
