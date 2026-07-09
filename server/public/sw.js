/**
 * Service Worker: браузер як "тонкий клієнт" для статики.
 * Живі дані гри завжди йдуть у мережу (сервер = джерело правди).
 */
var GAME_CACHE_VERSION = '20260709perf1';
var STATIC_CACHE = 'l2dop-static-' + GAME_CACHE_VERSION;

var PRECACHE_URLS = [
  '/assets/maps/aden2.jpg',
  '/icons/drops/other.svg',
  '/ref/2.png',
  '/ref/18.png',
  '/ref/19.png',
  '/styles.css',
  '/common.js',
  '/ui-i18n.js',
  '/l2-nav.js',
];

function isLiveDataPath(pathname) {
  return (
    pathname.indexOf('/character/') === 0 ||
    pathname === '/character' ||
    pathname.indexOf('/auth/') === 0 ||
    pathname.indexOf('/game/') === 0 ||
    pathname.indexOf('/battle/') === 0 ||
    pathname === '/battle'
  );
}

function isStaticAssetPath(pathname) {
  if (isLiveDataPath(pathname)) return false;
  if (pathname === '/' || /\.html$/i.test(pathname)) return false;
  return (
    pathname.indexOf('/assets/') === 0 ||
    pathname.indexOf('/icons/') === 0 ||
    pathname.indexOf('/ref/') === 0 ||
    pathname.indexOf('/characters/') === 0 ||
    pathname.indexOf('/css/') === 0 ||
    /\.js$/i.test(pathname) ||
    /\.(woff2?|ttf|otf|eot)$/i.test(pathname)
  );
}

function shouldCacheResponse(resp) {
  if (!resp || resp.status !== 200) return false;
  var ct = String(resp.headers.get('content-type') || '').toLowerCase();
  return (
    ct.indexOf('text/css') !== -1 ||
    ct.indexOf('javascript') !== -1 ||
    ct.indexOf('image/') !== -1 ||
    ct.indexOf('font/') !== -1
  );
}

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(function (cache) {
      return Promise.all(
        PRECACHE_URLS.map(function (u) {
          return cache.add(u).catch(function () {
            return null;
          });
        })
      ).then(function () {
        return self.skipWaiting();
      });
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
              return k.indexOf('l2dop-static-') === 0 && k !== STATIC_CACHE;
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

  if (isLiveDataPath(url.pathname)) {
    event.respondWith(fetch(event.request, { cache: 'no-store' }));
    return;
  }

  if (!isStaticAssetPath(url.pathname)) return;

  event.respondWith(
    caches.open(STATIC_CACHE).then(function (cache) {
      return cache.match(event.request).then(function (cached) {
        if (cached) return cached;
        return fetch(event.request).then(function (response) {
          if (shouldCacheResponse(response)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      });
    })
  );
});
