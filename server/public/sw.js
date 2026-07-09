/**
 * Service Worker: cache-first для статики (фото, ref, css, js).
 * HTML і API — завжди мережа (сервер = джерело правди).
 */
var GAME_CACHE_VERSION = '20260709perf2';
var STATIC_CACHE = 'l2dop-static-' + GAME_CACHE_VERSION;

var PRECACHE_URLS = [
  '/styles.css',
  '/common.js',
  '/ui-i18n.js',
  '/l2-nav.js',
  '/icons/drops/other.svg',
  '/ref/2.png',
  '/ref/18.png',
  '/ref/19.png',
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
  if (pathname === '/sw.js') return false;
  return (
    pathname.indexOf('/assets/') === 0 ||
    pathname.indexOf('/icons/') === 0 ||
    pathname.indexOf('/ref/') === 0 ||
    pathname.indexOf('/characters/') === 0 ||
    pathname.indexOf('/mobs/') === 0 ||
    pathname.indexOf('/css/') === 0 ||
    pathname.indexOf('/skills/') === 0 ||
    pathname === '/styles.css' ||
    /\.(css|js|woff2?|ttf|otf|eot|svg|png|jpe?g|gif|webp|ico)$/i.test(pathname)
  );
}

function shouldIgnoreSearchForPath(pathname) {
  return (
    pathname.indexOf('/assets/') === 0 ||
    pathname.indexOf('/icons/') === 0 ||
    pathname.indexOf('/ref/') === 0 ||
    pathname.indexOf('/characters/') === 0 ||
    pathname.indexOf('/mobs/') === 0
  );
}

function pathOnlyRequest(url) {
  return new Request(url.origin + url.pathname, { mode: 'same-origin' });
}

function shouldCacheResponse(resp) {
  if (!resp || resp.status !== 200) return false;
  var ct = String(resp.headers.get('content-type') || '').toLowerCase();
  return (
    ct.indexOf('text/css') !== -1 ||
    ct.indexOf('javascript') !== -1 ||
    ct.indexOf('image/') !== -1 ||
    ct.indexOf('font/') !== -1 ||
    ct.indexOf('svg') !== -1
  );
}

function cacheLookup(cache, request) {
  var url = new URL(request.url);
  return cache.match(request).then(function (cached) {
    if (cached) return cached;
    if (shouldIgnoreSearchForPath(url.pathname)) {
      return cache.match(pathOnlyRequest(url));
    }
    return null;
  });
}

function cacheStore(cache, request, response) {
  var url = new URL(request.url);
  var jobs = [cache.put(request, response.clone())];
  if (shouldIgnoreSearchForPath(url.pathname)) {
    jobs.push(cache.put(pathOnlyRequest(url), response.clone()));
  }
  return Promise.all(jobs);
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
      return cacheLookup(cache, event.request).then(function (cached) {
        if (cached) return cached;
        return fetch(event.request).then(function (response) {
          if (shouldCacheResponse(response)) {
            return cacheStore(cache, event.request, response).then(function () {
              return response;
            });
          }
          return response;
        });
      });
    })
  );
});
