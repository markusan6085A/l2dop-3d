/**
 * Сторінка «Онлайн»: GET /game/online, snapshot HUD з GET /character.
 */
(function () {
  var ONLINE_ICON = '/assets/assets/photo_2026-07-05_12-52-39.jpg';
  var SKELETON_ROWS = 4;
  var onlineInFlight = false;
  var currentSort = 'level';
  var lastPayload = null;
  var layoutDebug = false;

  function $(id) {
    return document.getElementById(id);
  }

  function isLayoutDebugEnabled() {
    try {
      return (
        /(?:^|[?&])layoutDebug=1(?:&|$)/.test(String(location.search || '')) ||
        localStorage.getItem('l2-layout-debug') === '1'
      );
    } catch (_e) {
      return false;
    }
  }

  function logLayoutPhase(phase) {
    if (!layoutDebug) return;
    var contentEl = $('online-content');
    var hudMount = $('l2-hud-panel-mount');
    var navMount = $('l2-nav-bottom');
    console.log('[page-layout-phase]', {
      page: 'online',
      phase: phase,
      scrollY: window.scrollY,
      contentHeight: contentEl ? contentEl.getBoundingClientRect().height : null,
      hudHeight: hudMount ? hudMount.getBoundingClientRect().height : null,
      navHeight: navMount ? navMount.getBoundingClientRect().height : null,
    });
  }

  function installLayoutShiftObserver() {
    if (!layoutDebug || typeof PerformanceObserver === 'undefined') return;
    try {
      new PerformanceObserver(function (list) {
        for (var i = 0; i < list.getEntries().length; i++) {
          var entry = list.getEntries()[i];
          if (!entry.hadRecentInput && entry.value > 0) {
            console.log('[layout-shift]', {
              page: 'online',
              value: entry.value,
              sources: entry.sources
                ? entry.sources.map(function (s) {
                    return {
                      node: s.node,
                      previousRect: s.previousRect,
                      currentRect: s.currentRect,
                    };
                  })
                : [],
            });
          }
        }
      }).observe({ type: 'layout-shift', buffered: true });
    } catch (_e) {
      /* ignore */
    }
  }

  function wireIcons(root) {
    if (!root) return;
    root.querySelectorAll('.l2-online-player__ico').forEach(function (icon) {
      if (icon.dataset.fallbackWired === '1') return;
      icon.dataset.fallbackWired = '1';
      icon.addEventListener('error', function onIconError() {
        icon.removeEventListener('error', onIconError);
        icon.src = '/icons/drops/other.svg';
      });
    });
  }

  function normalizeSort(sort) {
    if (sort === 'name' || sort === 'power') return sort;
    return 'level';
  }

  function setSortActive(sort) {
    currentSort = normalizeSort(sort);
    var levelBtn = $('online-sort-level');
    var nameBtn = $('online-sort-name');
    var powerBtn = $('online-sort-power');
    if (levelBtn) {
      levelBtn.classList.toggle('l2-online-sort__btn--active', currentSort === 'level');
    }
    if (nameBtn) {
      nameBtn.classList.toggle('l2-online-sort__btn--active', currentSort === 'name');
    }
    if (powerBtn) {
      powerBtn.classList.toggle('l2-online-sort__btn--active', currentSort === 'power');
    }
  }

  function sortPlayersClient(players, sort) {
    var mode = normalizeSort(sort);
    var out = (players || []).slice();
    if (mode === 'name') {
      out.sort(function (a, b) {
        return String(a.name || '').localeCompare(String(b.name || ''), 'uk');
      });
      return out;
    }
    if (mode === 'power') {
      out.sort(function (a, b) {
        var dp = Number(b.heroPower || 0) - Number(a.heroPower || 0);
        if (dp !== 0) return dp;
        return String(a.name || '').localeCompare(String(b.name || ''), 'uk');
      });
      return out;
    }
    out.sort(function (a, b) {
      var dl = Number(b.level || 0) - Number(a.level || 0);
      if (dl !== 0) return dl;
      return String(a.name || '').localeCompare(String(b.name || ''), 'uk');
    });
    return out;
  }

  function formatHeroPower(p) {
    var n = p && p.heroPower != null ? Number(p.heroPower) : NaN;
    if (!Number.isFinite(n) || n < 0) return '0';
    return String(Math.floor(n));
  }

  function createSkeletonRow() {
    var item = document.createElement('article');
    item.className = 'l2-online-player l2-online-player--skeleton';
    item.setAttribute('aria-hidden', 'true');

    var main = document.createElement('div');
    main.className = 'l2-online-player__main';

    var left = document.createElement('div');
    left.className = 'l2-online-player__left';

    var row = document.createElement('div');
    row.className = 'l2-online-player__row';

    var img = document.createElement('img');
    img.className = 'l2-online-player__ico';
    img.src = ONLINE_ICON;
    img.alt = '';
    img.width = 14;
    img.height = 14;
    img.decoding = 'async';

    var nick = document.createElement('span');
    nick.className = 'l2-online-player__nick';
    nick.textContent = '…';

    row.appendChild(img);
    row.appendChild(nick);
    left.appendChild(row);

    var city = document.createElement('p');
    city.className = 'l2-online-player__city';
    city.textContent = '…';
    left.appendChild(city);

    var power = document.createElement('span');
    power.className = 'l2-online-player__power';
    power.textContent = '…';

    main.appendChild(left);
    main.appendChild(power);
    item.appendChild(main);
    return item;
  }

  function replaceListContent(listEl, frag) {
    listEl.innerHTML = '';
    listEl.appendChild(frag);
  }

  function renderListError(message) {
    var listEl = $('online-players-list');
    if (!listEl) return;
    var err = document.createElement('p');
    err.className = 'l2-online-list__error';
    err.textContent = message || 'Не вдалося завантажити онлайн.';
    var frag = document.createDocumentFragment();
    frag.appendChild(err);
    replaceListContent(listEl, frag);
  }

  function renderListSkeleton() {
    var listEl = $('online-players-list');
    if (!listEl) return;
    var frag = document.createDocumentFragment();
    for (var i = 0; i < SKELETON_ROWS; i++) {
      frag.appendChild(createSkeletonRow());
    }
    replaceListContent(listEl, frag);
  }

  function renderPlayers(players) {
    var listEl = $('online-players-list');
    var countEl = $('online-count');
    if (!listEl) return;

    var rows = sortPlayersClient(players, currentSort);
    if (countEl) countEl.textContent = String(rows.length);

    var frag = document.createDocumentFragment();
    if (!rows.length) {
      var empty = document.createElement('p');
      empty.className = 'l2-online-empty';
      empty.textContent = 'Нікого в онлайні.';
      frag.appendChild(empty);
      replaceListContent(listEl, frag);
      return;
    }

    for (var i = 0; i < rows.length; i++) {
      var p = rows[i];
      var item = document.createElement('article');
      item.className = 'l2-online-player';

      var main = document.createElement('div');
      main.className = 'l2-online-player__main';

      var left = document.createElement('div');
      left.className = 'l2-online-player__left';

      var row = document.createElement('div');
      row.className = 'l2-online-player__row';

      var img = document.createElement('img');
      img.className = 'l2-online-player__ico';
      img.src = ONLINE_ICON;
      img.alt = '';
      img.width = 14;
      img.height = 14;
      img.decoding = 'async';

      var nick =
        window.L2 && typeof L2.createPlayerProfileNickEl === 'function'
          ? L2.createPlayerProfileNickEl({
              characterId: p.characterId,
              name: p.name,
              clanEmblemId: p.clanEmblemId,
              className: 'l2-online-player__nick',
            })
          : (function () {
              var span = document.createElement('span');
              span.className = 'l2-online-player__nick';
              span.textContent = String(p.name || '—');
              return span;
            })();

      row.appendChild(img);
      row.appendChild(nick);
      left.appendChild(row);

      var city = document.createElement('p');
      city.className = 'l2-online-player__city';
      var cityLabel = p.cityLabelEn || p.cityLabelUk || p.cityId || '—';
      city.textContent = 'у ' + cityLabel;
      left.appendChild(city);

      var power = document.createElement('span');
      power.className = 'l2-online-player__power';
      power.textContent = formatHeroPower(p);

      main.appendChild(left);
      main.appendChild(power);
      item.appendChild(main);
      frag.appendChild(item);
    }

    replaceListContent(listEl, frag);
    wireIcons(listEl);
  }

  async function loadOnline(sort, opts) {
    opts = opts || {};
    if (onlineInFlight) return false;
    var token = localStorage.getItem('token');
    var errEl = $('online-load-err');
    if (!token) {
      window.location.href = '/';
      return false;
    }

    onlineInFlight = true;
    if (errEl) {
      errEl.hidden = true;
      errEl.textContent = '';
    }

    if (!lastPayload && opts.showSkeleton !== false) {
      renderListSkeleton();
    }

    logLayoutPhase('fetch-start');

    try {
      var r = await fetch('/game/online?sort=' + encodeURIComponent(sort || currentSort), {
        headers: { Authorization: 'Bearer ' + token },
      });
      if (r.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/';
        return false;
      }
      if (!r.ok) {
        var failMsg = 'Не вдалося завантажити онлайн.';
        if (errEl) {
          errEl.hidden = false;
          errEl.textContent = failMsg;
        }
        if (!lastPayload) {
          renderListError(failMsg);
        }
        return false;
      }
      lastPayload = await r.json();
      renderPlayers(lastPayload && lastPayload.players ? lastPayload.players : []);
      logLayoutPhase('fetch-finished');
      return true;
    } catch (_e) {
      var catchMsg = 'Не вдалося завантажити онлайн.';
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent = catchMsg;
      }
      if (!lastPayload) {
        renderListError(catchMsg);
      }
      return false;
    } finally {
      onlineInFlight = false;
    }
  }

  function bindSortButton(btn, sort) {
    if (!btn) return;
    btn.addEventListener('click', function () {
      setSortActive(sort);
      if (lastPayload && lastPayload.players) {
        renderPlayers(lastPayload.players);
      } else {
        loadOnline(sort);
      }
    });
  }

  async function init() {
    layoutDebug = isLayoutDebugEnabled();
    installLayoutShiftObserver();
    logLayoutPhase('html-ready');

    if (window.L2 && typeof L2.mountL2Nav === 'function') {
      L2.mountL2Nav({});
    }
    logLayoutPhase('chrome-mounted');

    var token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/';
      return;
    }

    setSortActive('level');
    bindSortButton($('online-sort-level'), 'level');
    bindSortButton($('online-sort-name'), 'name');
    bindSortButton($('online-sort-power'), 'power');

    if (window.L2 && typeof L2.renderCharacterFromCache === 'function') {
      L2.renderCharacterFromCache();
    }
    logLayoutPhase('cache-rendered');

    renderListSkeleton();
    logLayoutPhase('skeleton-rendered');

    var resyncPromise =
      window.L2 && typeof L2.resyncCharacterWhenRequired === 'function'
        ? L2.resyncCharacterWhenRequired()
        : Promise.resolve(null);

    await loadOnline('level', { showSkeleton: false });

    var c = await resyncPromise;
    var cached =
      window.L2 && typeof L2.getCachedCharacter === 'function'
        ? L2.getCachedCharacter()
        : null;
    if (!c && !cached) {
      window.location.href = '/';
      return;
    }
    if (c && window.L2 && typeof L2.applyMutationSnapshot === 'function') {
      L2.applyMutationSnapshot(c);
    }
    logLayoutPhase('content-ready');
  }

  init();
})();
