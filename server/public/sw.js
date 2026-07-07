/**
 * Service Worker: кеш лише статики (assets/icons/css/js).
 * API (/character, /game/, /auth/) — завжди мережа (сервер = джерело правди).
 */
var SW_VERSION = '20260707perf3';
var CACHE_NAME = 'l2dop-static-' + SW_VERSION;

var PRECACHE_URLS = [
  '/styles.css',
  '/common.js',
  '/ui-i18n.js',
  '/l2-nav.js',
  '/css/l2-game-chrome.css',
  '/css/l2-hud-panel.css',
  '/css/l2-app-chrome-skin.css',
  '/assets/maps/aden2.jpg',
  '/icons/drops/other.svg',
];

function isApiPath(pathname) {
  return (
    pathname.indexOf('/character') === 0 ||
    pathname.indexOf('/game/') === 0 ||
    pathname.indexOf('/auth/') === 0
  );
}

function isStaticAssetPath(pathname) {
  if (isApiPath(pathname)) return false;
  if (/\.html$/i.test(pathname)) return false;
  return (
    pathname.indexOf('/assets/') === 0 ||
    pathname.indexOf('/icons/') === 0 ||
    pathname.indexOf('/ref/') === 0 ||
    pathname.indexOf('/characters/') === 0 ||
    pathname.indexOf('/mobs/') === 0 ||
    pathname.indexOf('/css/') === 0 ||
    pathname.indexOf('/skills/') === 0 ||
    /\.(css|js|jpg|jpeg|png|gif|webp|svg|woff2?|ico)$/i.test(pathname)
  );
}

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(function (cache) {
        return cache.addAll(PRECACHE_URLS);
      })
      .then(function () {
        return self.skipWaiting();
      })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches
      .keys()
      .then(function (keys) {
        return Promise.all(
          keys
            .filter(function (k) {
              return k.indexOf('l2dop-static-') === 0 && k !== CACHE_NAME;
            })
            .map(function (k) {
              return caches.delete(k);
            })
        );
      })
      .then(function () {
        return self.clients.claim();
      })
  );
});

self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;
  var url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (isApiPath(url.pathname)) return;

  if (/\.html$/i.test(url.pathname)) {
    event.respondWith(fetch(event.request));
    return;
  }

  if (!isStaticAssetPath(url.pathname)) return;

  event.respondWith(
    caches.match(event.request).then(function (cached) {
      if (cached) return cached;
      return fetch(event.request).then(function (response) {
        if (!response || response.status !== 200) return response;
        var clone = response.clone();
        caches.open(CACHE_NAME).then(function (cache) {
          cache.put(event.request, clone);
        });
        return response;
      });
    })
  );
});
