const CACHE = 'smart-calculators-v2';


const ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './calculators.json',
  './calculators/dc-cable.html',
  './calculators/energy-units.html',
  './calculators/current-calculator.html'

];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response =>
      response || fetch(event.request).catch(() => caches.match('./index.html'))
    )
  );
});
