/**
 * Карта як l2dop: вікно перегляду, точки мобів на карті (як mapcr у mapcreate), список околиць (around.php).
 * Клік по карті — рух; рядок моба з посиланням — /battle.html?spawnId=…; клік по маркеру — те саме.
 */
(function () {
  /** Canonical radii з GET /game/map/sync (mapRadii DTO). */
  var serverMapRadii = {
    mobInteractionRadius: null,
    playerVisibilityRadius: null,
  };
  var MOBS_PER_PAGE = 15;
  var mobListPage = 0;
  var mobDetailPage = 0;
  var MAP_SNAPSHOT_CACHE_KEY = 'l2-map-snapshot-cache-v1';
  var initialMapSyncResolved = false;

  function $(id) {
    return document.getElementById(id);
  }

  function applyMapRadiiFromSync(sync) {
    if (!sync || !sync.mapRadii) return;
    var mobR = Number(sync.mapRadii.mobInteractionRadius);
    var heroR = Number(sync.mapRadii.playerVisibilityRadius);
    if (Number.isFinite(mobR) && mobR > 0) {
      serverMapRadii.mobInteractionRadius = mobR;
    }
    if (Number.isFinite(heroR) && heroR > 0) {
      serverMapRadii.playerVisibilityRadius = heroR;
    }
  }

  function mobInteractionRadiusUnits() {
    return serverMapRadii.mobInteractionRadius;
  }

  function playerVisibilityRadiusUnits() {
    return serverMapRadii.playerVisibilityRadius;
  }

  function readCachedMapSnapshot() {
    if (window.L2 && typeof L2.readSessionSnapshotCache === 'function') {
      var mapSnap = L2.readSessionSnapshotCache(MAP_SNAPSHOT_CACHE_KEY);
      if (mapSnap) return mapSnap;
      return L2.readSessionSnapshotCache('l2-char-snapshot-cache-v1');
    }
    return null;
  }

  function writeCachedMapSnapshot(snapshot) {
    if (window.L2 && typeof L2.writeSessionSnapshotCache === 'function') {
      L2.writeSessionSnapshotCache(MAP_SNAPSHOT_CACHE_KEY, snapshot);
    }
  }

  function mapPixelToWorld(mx, my) {
    var px = mx / 18.12;
    var py = (my - 1300) / 26.2;
    var x = Math.floor(px * 3600 - 130000);
    var y = Math.floor(py * 5250);
    return { x: x, y: y };
  }

  function worldToMapPixel(x, y) {
    var dx = (x + 130000) / 3600;
    var dy = (y + 0) / 5250;
    var mx = Math.floor(18.12 * dx);
    var my = Math.floor(26.2 * dy + 1300);
    return { mx: mx, my: my };
  }

  function clickToPixel(e, img) {
    var rect = img.getBoundingClientRect();
    var rx = (e.clientX - rect.left) / rect.width;
    var ry = (e.clientY - rect.top) / rect.height;
    var mx = rx * img.naturalWidth;
    var my = ry * img.naturalHeight;
    return { mx: mx, my: my };
  }

  function placeDot(img, dot, worldX, worldY) {
    if (!img || !dot || !img.naturalWidth) return;
    var p = worldToMapPixel(worldX, worldY);
    var lx = (p.mx / img.naturalWidth) * 100;
    var ly = (p.my / img.naturalHeight) * 100;
    dot.style.left = lx + '%';
    dot.style.top = ly + '%';
  }

  function placeViewRadius(img, el, worldX, worldY, radiusWorld) {
    if (!img || !el || !img.naturalWidth || !radiusWorld) return;
    var center = worldToMapPixel(worldX, worldY);
    var east = worldToMapPixel(worldX + radiusWorld, worldY);
    var north = worldToMapPixel(worldX, worldY + radiusWorld);
    var rx = Math.abs(east.mx - center.mx);
    var ry = Math.abs(north.my - center.my);
    var lx = (center.mx / img.naturalWidth) * 100;
    var ly = (center.my / img.naturalHeight) * 100;
    var wPct = ((rx * 2) / img.naturalWidth) * 100;
    var hPct = ((ry * 2) / img.naturalHeight) * 100;
    el.style.left = lx + '%';
    el.style.top = ly + '%';
    el.style.width = wPct + '%';
    el.style.height = hPct + '%';
  }

  async function postMove(targetX, targetY) {
    var t = localStorage.getItem('token');
    var snap = window.L2 && typeof L2.lastSnapshot === 'function' ? L2.lastSnapshot() : null;
    if (!t || !snap) return { ok: false, err: 'no_session' };
    var r = await fetch('/game/move', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + t,
      },
      body: JSON.stringify({
        targetX: targetX,
        targetY: targetY,
        expectedRevision: snap.revision,
      }),
    });
    if (r.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
      return { ok: false, err: '401' };
    }
    if (r.status === 409) {
      try {
        var j409 = await r.json();
        if (window.L2 && typeof L2.resyncCharacterAfterConflict === 'function') {
          await L2.resyncCharacterAfterConflict(null, j409);
        }
      } catch (e409) {
        /* ignore */
      }
      return { ok: false, err: '409' };
    }
    if (!r.ok) {
      var msg = 'Не вдалося рухатися.';
      try {
        var j = await r.json();
        if (j && j.messageUk) msg = j.messageUk;
      } catch (e) {
        /* ignore */
      }
      return { ok: false, err: msg };
    }
    var j = await r.json();
    if (j.character && window.L2 && typeof L2.setLastSnapshot === 'function') {
      L2.setLastSnapshot(j.character);
    }
    if (j.character && window.L2 && typeof L2.applyHudFromSnapshot === 'function') {
      L2.applyHudFromSnapshot(j.character);
    }
    return { ok: true, character: j.character };
  }

  var battleStartInFlight = false;
  var pvpStartInFlight = false;

  async function startPvpFromMap(targetCharacterId) {
    if (!targetCharacterId || pvpStartInFlight) return;
    pvpStartInFlight = true;
    try {
      var t = localStorage.getItem('token');
      var snap =
        window.L2 && typeof L2.lastSnapshot === 'function' ? L2.lastSnapshot() : null;
      if (!t || !snap) {
        window.location.href = '/';
        return;
      }
      async function postStart(revision) {
        return fetch('/game/battle/pvp/start', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + t,
          },
          body: JSON.stringify({
            targetCharacterId: targetCharacterId,
            expectedRevision: revision,
          }),
        });
      }
      var r = await postStart(snap.revision);
      if (r.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/';
        return;
      }
      if (r.status === 409) {
        var fresh = await loadSnapshot();
        if (!fresh) return;
        r = await postStart(fresh.revision);
      }
      if (!r.ok) {
        var errMsg = 'Не вдалося розпочати PvP-бій.';
        try {
          var ej = await r.json();
          if (tryRedirectPveDefeatFromError(ej)) return;
          if (ej && ej.messageUk) errMsg = ej.messageUk;
        } catch (eErr) {
          /* ignore */
        }
        if (window.L2 && typeof L2.showToast === 'function') {
          L2.showToast(errMsg);
        } else {
          alert(errMsg);
        }
        return;
      }
      var j = await r.json();
      if (j.character && window.L2 && typeof L2.setLastSnapshot === 'function') {
        L2.setLastSnapshot(j.character);
      }
      if (j.character && window.L2 && typeof L2.applyHudFromSnapshot === 'function') {
        L2.applyHudFromSnapshot(j.character);
      }
      window.location.href =
        '/battle.html?pvpTargetId=' + encodeURIComponent(targetCharacterId);
    } finally {
      pvpStartInFlight = false;
    }
  }

  async function startBattleFromMap(spawnId) {
    if (!spawnId || battleStartInFlight) return;
    if (window.L2 && typeof L2.onHelperMobClicked === 'function') {
      L2.onHelperMobClicked();
    }
    battleStartInFlight = true;
    try {
      var t = localStorage.getItem('token');
      var snap =
        window.L2 && typeof L2.lastSnapshot === 'function' ? L2.lastSnapshot() : null;
      if (!t || !snap) {
        window.location.href = '/';
        return;
      }
      async function postStart(revision) {
        return fetch('/game/battle/start', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + t,
          },
          body: JSON.stringify({
            spawnId: spawnId,
            expectedRevision: revision,
          }),
        });
      }
      var r = await postStart(snap.revision);
      if (r.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/';
        return;
      }
      if (r.status === 409) {
        var fresh = await loadSnapshot();
        if (!fresh) return;
        r = await postStart(fresh.revision);
      }
      if (!r.ok) {
        var errMsg = 'Не вдалося розпочати бій.';
        try {
          var ej = await r.json();
          if (tryRedirectPveDefeatFromError(ej)) return;
          if (ej && ej.messageUk) errMsg = ej.messageUk;
        } catch (eErr) {
          /* ignore */
        }
        if (window.L2 && typeof L2.showToast === 'function') {
          L2.showToast(errMsg);
        } else {
          alert(errMsg);
        }
        return;
      }
      var j = await r.json();
      if (j.character && window.L2 && typeof L2.setLastSnapshot === 'function') {
        L2.setLastSnapshot(j.character);
      }
      if (j.character && window.L2 && typeof L2.applyHudFromSnapshot === 'function') {
        L2.applyHudFromSnapshot(j.character);
      }
      window.location.href =
        '/battle.html?spawnId=' + encodeURIComponent(spawnId);
    } finally {
      battleStartInFlight = false;
    }
  }

  function onMobBattleLinkClick(e) {
    e.preventDefault();
    e.stopPropagation();
    var a = e.currentTarget;
    if (!a) return;
    var href = a.getAttribute('href') || '';
    var m = href.match(/[?&]spawnId=([^&]+)/);
    if (!m) return;
    var sid = decodeURIComponent(m[1]);
    if (sid) startBattleFromMap(sid);
  }

  /** Кожні 15 с — легкий GET /game/map/sync (не повний /character). */
  var MAP_POLL_MS = 15000;
  var lastMapCatalogVersion = null;
  var lastPersonalMapSig = null;
  var lastMammonRotationSig = null;
  var lastMapSyncRevision = null;
  var mapSyncInFlight = false;
  var mapPollTimer = null;
  var mapPollStopped = false;
  var mapDefeatReturnInFlight = false;
  var shownMapDeathEventIds = {};

  function compactSpawnListSig(spawns) {
    if (!spawns || !spawns.length) return '0';
    var parts = [];
    for (var i = 0; i < spawns.length; i++) {
      var s = spawns[i];
      parts.push(String(s.id || '') + ':' + String(s.distance != null ? s.distance : ''));
    }
    return String(spawns.length) + '|' + parts.join(',');
  }

  function compactHeroSig(heroes) {
    var api = heroRowRenderApi();
    if (api && api.compactHeroSig) return api.compactHeroSig(heroes);
    if (!heroes || !heroes.length) return '0';
    return String(heroes.length);
  }

  function compactMarkerSig(spawns) {
    if (!spawns || !spawns.length) return '0';
    var mp = [];
    for (var k = 0; k < spawns.length; k++) {
      var m = spawns[k];
      mp.push(String(m.id || '') + ':' + String(m.kind || ''));
    }
    return String(spawns.length) + '|' + mp.join(',');
  }

  function mapPositionSig(snap) {
    if (!snap) return '';
    return [
      snap.revision,
      snap.worldX,
      snap.worldY,
      snap.targetX,
      snap.targetY,
      snap.hp,
    ].join('|');
  }

  async function loadMapSync() {
    var t = localStorage.getItem('token');
    if (!t) return null;
    var qs = '';
    if (lastMapCatalogVersion != null) {
      qs += 'mapCatalogVersion=' + encodeURIComponent(String(lastMapCatalogVersion));
    }
    if (lastPersonalMapSig != null) {
      if (qs) qs += '&';
      qs += 'personalMapSig=' + encodeURIComponent(String(lastPersonalMapSig));
    }
    if (lastMammonRotationSig != null) {
      if (qs) qs += '&';
      qs += 'mammonRotationSig=' + encodeURIComponent(String(lastMammonRotationSig));
    }
    if (lastMapSyncRevision != null) {
      if (qs) qs += '&';
      qs += 'revision=' + encodeURIComponent(String(lastMapSyncRevision));
    }
    var path = '/game/map/sync' + (qs ? '?' + qs : '');
    var r = await fetch(path, {
      headers: { Authorization: 'Bearer ' + t },
    });
    if (r.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
      return null;
    }
    if (!r.ok) return null;
    return r.json();
  }

  async function loadSnapshot() {
    var t = localStorage.getItem('token');
    if (!t) return null;
    if (window.L2 && typeof L2.fetchSnapshot === 'function') {
      return L2.fetchSnapshot({ claimWorld: true });
    }
    var r = await fetch('/character?claimWorld=1', {
      headers: { Authorization: 'Bearer ' + t },
      cache: 'no-store',
    });
    if (r.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
      return null;
    }
    if (!r.ok) return null;
    var j = await r.json();
    var snap = j && j.character ? j.character : null;
    if (!snap) return null;
    if (window.L2 && typeof L2.setLastSnapshot === 'function') {
      L2.setLastSnapshot(snap);
    }
    if (window.L2 && typeof L2.applyHudFromSnapshot === 'function') {
      L2.applyHudFromSnapshot(snap);
    }
    writeCachedMapSnapshot(snap);
    return snap;
  }

  async function loadMapAround() {
    var t = localStorage.getItem('token');
    if (!t) return null;
    var r = await fetch('/game/map/around', {
      headers: { Authorization: 'Bearer ' + t },
    });
    if (r.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
      return null;
    }
    if (!r.ok) return null;
    return r.json();
  }

  async function loadMapSpawns() {
    var t = localStorage.getItem('token');
    if (!t) return [];
    var r = await fetch('/game/map/spawns', {
      headers: { Authorization: 'Bearer ' + t },
    });
    if (r.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
      return [];
    }
    if (!r.ok) return [];
    var j = await r.json();
    return j.spawns || [];
  }

  /** Рядок списку: назва + ур.; з боку — чемпіон / райд бос / епік бос (як у l2dop). */
  function mobDisplayLine(s) {
    var n = s.name || '—';
    var lvNum = Number(s.level);
    var lvPart = Number.isFinite(lvNum) ? ' · ур. ' + Math.floor(lvNum) : '';
    var k = s.kind || '';
    if (k === 'raid') return n + lvPart + ' · райд бос';
    if (k === 'epic') return n + lvPart + ' · епік бос';
    if (k === 'epic_guard') return n + lvPart + ' · міньйони зони епіка';
    if (k === 'champion') return n + lvPart + ' · чемпіон';
    return n + lvPart;
  }

  /** Колір назви як у L2: від різниці рівня моба й персонажа + окремо тип (РБ/епік/чемпіон). */
  function mobLinkClass(s, playerLevel) {
    var pl = Number(playerLevel);
    if (!Number.isFinite(pl)) pl = 1;
    var k = s.kind || '';
    if (k === 'raid') return 'l2-map-mob-link l2-map-mob-link--raid';
    if (k === 'epic') return 'l2-map-mob-link l2-map-mob-link--epic';
    if (k === 'epic_guard')
      return 'l2-map-mob-link l2-map-mob-link--epic_guard';
    if (k === 'champion') return 'l2-map-mob-link l2-map-mob-link--champion';
    if (k === 'dungeon') return 'l2-map-mob-link l2-map-mob-link--dungeon';
    var lv = num(s.level, 1);
    var d = lv - pl;
    var tier = 'l2-map-mob-link--lvl-same';
    if (d >= 10) tier = 'l2-map-mob-link--lvl-deadly';
    else if (d >= 5) tier = 'l2-map-mob-link--lvl-hard';
    else if (d >= 3) tier = 'l2-map-mob-link--lvl-warn';
    else if (d <= -6) tier = 'l2-map-mob-link--lvl-trivial';
    else if (d <= -3) tier = 'l2-map-mob-link--lvl-easy';
    return 'l2-map-mob-link ' + tier;
  }

  function mobPinTitle(s) {
    return mobDisplayLine(s);
  }

  /** На карті лише РБ (фіолет.) і епіки (червон.); без звичайних мобів — інакше «сніг» із крапок. */
  function renderMobMarkers(img, layer, spawns, sig) {
    if (!layer) return;
    var nextSig = sig != null ? sig : compactMarkerSig(spawns);
    if (layer.dataset.l2MarkerSig === nextSig) return;
    layer.dataset.l2MarkerSig = nextSig;
    layer.innerHTML = '';
    if (!img || !img.naturalWidth || !spawns || !spawns.length) return;
    var pins = [];
    for (var h = 0; h < spawns.length; h++) {
      var kk = spawns[h].kind || '';
      if (kk === 'raid' || kk === 'epic' || kk === 'epic_guard')
        pins.push(spawns[h]);
    }
    if (!pins.length) return;
    for (var i = 0; i < pins.length; i++) {
      var s = pins[i];
      var p = worldToMapPixel(s.worldX, s.worldY);
      var lx = (p.mx / img.naturalWidth) * 100;
      var ly = (p.my / img.naturalHeight) * 100;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'l2-map-mob-pin l2-map-mob-pin--' + (s.kind || 'passive');
      btn.style.left = lx + '%';
      btn.style.top = ly + '%';
      var title = mobPinTitle(s);
      btn.setAttribute('aria-label', title);
      btn.title = title;
      btn.dataset.spawnId = s.id || '';
      layer.appendChild(btn);
    }
  }

  function heroRowRenderApi() {
    return window.L2MapHeroRowRender || null;
  }

  function heroLevelPart(h) {
    var api = heroRowRenderApi();
    if (api) return api.heroLevelPart(h);
    var lv = Number(h.level);
    return Number.isFinite(lv) ? ' · ур. ' + Math.floor(lv) : '';
  }

  function heroNickHex(h) {
    var api = heroRowRenderApi();
    if (api) return api.heroNickHex(h);
    if (!h) return null;
    if (h.pvpNickColor === 'pk') return '#e85840';
    if (h.pvpNickColor === 'aggressor') return '#a060d8';
    return null;
  }

  function applyHeroRowNickColor(mainEl, h) {
    if (!mainEl) return;
    mainEl.style.setProperty('--l2-map-hero-nick-color', heroNickHex(h) || '#bfa88a');
  }

  function stopMapPoll() {
    mapPollStopped = true;
    if (mapPollTimer != null) {
      clearInterval(mapPollTimer);
      mapPollTimer = null;
    }
  }

  function latestMapCharacterRevision() {
    if (window.L2 && typeof L2.lastSnapshot === 'function') {
      var snap = L2.lastSnapshot();
      if (snap && typeof snap.revision === 'number') {
        return Math.floor(snap.revision);
      }
    }
    return null;
  }

  function shouldRejectIncomingMapSync(sync) {
    if (mapPollStopped) return true;
    if (!sync || typeof sync !== 'object') return false;
    if (window.L2 && typeof L2.lastSnapshot === 'function') {
      var cur = L2.lastSnapshot();
      if (
        cur &&
        typeof cur.revision === 'number' &&
        typeof sync.revision === 'number' &&
        Math.floor(sync.revision) < Math.floor(cur.revision)
      ) {
        return true;
      }
    }
    return false;
  }

  function renderMapDefeatLog(el, lines) {
    if (!el) return;
    el.innerHTML = '';
    if (!lines || !lines.length) return;
    for (var li = 0; li < lines.length; li++) {
      var row = document.createElement('div');
      row.className = 'l2-battle-log__line';
      row.textContent = String(lines[li]);
      el.appendChild(row);
    }
  }

  function hideMapDefeatBlock() {
    var defRoot = $('map-defeat-root');
    if (defRoot) defRoot.hidden = true;
  }

  function clearStaleDefeatFromSnapshot(snap) {
    if (!snap) return;
    var touched = false;
    if (snap.pveDefeat) {
      delete snap.pveDefeat;
      touched = true;
    }
    if (snap.pvpDefeat) {
      delete snap.pvpDefeat;
      touched = true;
    }
    if (touched && window.L2 && typeof L2.setLastSnapshot === 'function') {
      L2.setLastSnapshot(snap);
    }
    try {
      sessionStorage.removeItem('l2battle_pending_defeat_v1');
    } catch (eClear) {
      /* ignore */
    }
  }

  function mapDefeatDedupeKey(defeat, kind) {
    if (!defeat) return '';
    if (defeat.deathEventId) return String(defeat.deathEventId);
    if (kind === 'pve' && defeat.spawnId) {
      return 'pve:' + String(defeat.spawnId);
    }
    return '';
  }

  function showMapDefeatBlock(defeat, kind) {
    var defRoot = $('map-defeat-root');
    if (!defRoot) return false;
    var dedupeKey = mapDefeatDedupeKey(defeat, kind);
    if (dedupeKey && shownMapDeathEventIds[dedupeKey]) return true;
    if (dedupeKey) shownMapDeathEventIds[dedupeKey] = true;

    defRoot.hidden = false;
    var mobHead = $('map-defeat-mobhead');
    var shout = $('map-defeat-shout');
    var hint = $('map-defeat-town-hint');
    var dlog = $('map-defeat-log');

    if (kind === 'pvp') {
      if (mobHead) mobHead.textContent = '';
      if (shout) {
        shout.textContent =
          defeat && defeat.messageUk
            ? defeat.messageUk
            : 'Вас вбив гравець [' + (defeat.killerName || '—') + ']!';
      }
    } else {
      if (mobHead && defeat) {
        mobHead.textContent =
          (defeat.mobName || '—') +
          (defeat.mobLevel != null ? ' · ур. ' + defeat.mobLevel : '');
      }
      if (shout) shout.textContent = 'Тебе переміг монстр!';
    }
    if (hint) {
      hint.textContent =
        'Натисни «Повернутися в місто» — опинишся у найближчому селищі.';
    }
    if (dlog) {
      var tail =
        defeat && defeat.fullLog && defeat.fullLog.length
          ? defeat.fullLog.slice(-40)
          : [];
      renderMapDefeatLog(dlog, tail);
    }
    if (defeat && defeat.deathEventId && kind === 'pvp') {
      void fetch('/game/battle/pvp-defeat/ack', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + (localStorage.getItem('token') || ''),
        },
        body: JSON.stringify({
          deathEventId: String(defeat.deathEventId),
          ...((window.L2 && L2.lastSnapshot && L2.lastSnapshot() && L2.lastSnapshot().id)
            ? { characterId: L2.lastSnapshot().id }
            : {}),
        }),
      }).catch(function () {
        /* ignore */
      });
    }
    return true;
  }

  function handleMapDefeatFromSync(sync, snapshot) {
    if (!sync) return false;
    if (!initialMapSyncResolved) return false;

    var snap =
      snapshot ||
      (window.L2 && typeof L2.lastSnapshot === 'function'
        ? L2.lastSnapshot()
        : null);

    if (sync.pvpDefeat && sync.pvpDefeat.scope === 'clan_siege') {
      hideMapDefeatBlock();
      return false;
    }

    if (sync.pvpDefeat) {
      if (snap) {
        snap.pvpDefeat = sync.pvpDefeat;
        delete snap.pveDefeat;
        if (window.L2 && typeof L2.setLastSnapshot === 'function') {
          L2.setLastSnapshot(snap);
        }
      }
      return showMapDefeatBlock(sync.pvpDefeat, 'pvp');
    }

    if (sync.pveDefeat) {
      if (snap) {
        snap.pveDefeat = sync.pveDefeat;
        delete snap.pvpDefeat;
        if (window.L2 && typeof L2.setLastSnapshot === 'function') {
          L2.setLastSnapshot(snap);
        }
      }
      return showMapDefeatBlock(sync.pveDefeat, 'pve');
    }

    hideMapDefeatBlock();
    clearStaleDefeatFromSnapshot(snap);
    return false;
  }

  async function mapReturnToTownAndGoCity() {
    if (mapDefeatReturnInFlight) return;
    mapDefeatReturnInFlight = true;
    stopMapPoll();
    try {
      var rev = latestMapCharacterRevision();
      if (rev == null) return;
      var t = localStorage.getItem('token');
      if (!t) return;
      var r = await fetch('/game/battle/return-to-town', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + t,
        },
        body: JSON.stringify({ expectedRevision: rev }),
      });
      if (r.status === 409 && window.L2 && typeof L2.resyncCharacterAfterConflict === 'function') {
        var conflict = null;
        try {
          conflict = await r.json();
        } catch (e409) {
          /* ignore */
        }
        await L2.resyncCharacterAfterConflict(function (snap) {
          if (window.L2 && L2.setLastSnapshot) L2.setLastSnapshot(snap);
        }, conflict);
        rev = latestMapCharacterRevision();
        if (rev == null) return;
        r = await fetch('/game/battle/return-to-town', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + t,
          },
          body: JSON.stringify({ expectedRevision: rev }),
        });
      }
      if (!r.ok) return;
      var payload = await r.json();
      if (!payload || !payload.character) return;
      if (window.L2 && typeof L2.applyCharacterSnapshot === 'function') {
        L2.applyCharacterSnapshot(payload.character);
      } else if (window.L2 && L2.setLastSnapshot) {
        L2.setLastSnapshot(payload.character);
      }
      hideMapDefeatBlock();
      clearStaleDefeatFromSnapshot(
        window.L2 && typeof L2.lastSnapshot === 'function'
          ? L2.lastSnapshot()
          : payload.character
      );
      try {
        sessionStorage.removeItem('l2-battle-page-context-v1');
      } catch (eCtx) {
        /* ignore */
      }
      window.location.replace('/city.html');
    } finally {
      mapDefeatReturnInFlight = false;
    }
  }

  function handlePvpDefeatRedirect(sync, snapshot) {
    return handleMapDefeatFromSync(sync, snapshot);
  }

  function handlePveDefeatRedirect(sync, snapshot) {
    return handleMapDefeatFromSync(sync, snapshot);
  }

  function isPveDefeatPendingErrorBody(ej) {
    return !!(ej && ej.error === 'pve_defeat_pending');
  }

  function tryRedirectPveDefeatFromError(ej) {
    if (!isPveDefeatPendingErrorBody(ej)) return false;
    if (window.L2 && typeof L2.redirectToPveDefeatScreen === 'function') {
      return L2.redirectToPveDefeatScreen();
    }
    return false;
  }

  function applyPvpIncomingFromSync(sync) {
    if (!window.L2 || typeof L2.applyPvpIncoming !== 'function') return;
    L2.applyPvpIncoming(sync && sync.pvpIncoming ? sync.pvpIncoming : null, function (cid) {
      if (cid) startPvpFromMap(cid);
    });
  }

  function heroShowsPkButton(h) {
    var api = heroRowRenderApi();
    if (api) return api.heroShowsPkButton(h);
    return !!(h && h.showPkButton === true);
  }

  function normalizeSyncNearbyHeroes(rawList) {
    var api = heroRowRenderApi();
    if (api && api.normalizeNearbyHeroes) return api.normalizeNearbyHeroes(rawList);
    return rawList && rawList.length ? rawList.slice() : [];
  }

  function appendHeroRow(listEl, h) {
    var api = heroRowRenderApi();
    if (!api) return;
    api.appendHeroRow(listEl, h, {
      L2: window.L2 || null,
      onPkClick: startPvpFromMap,
    });
  }

  function renderHeroList(around, listEl, sectionEl) {
    var api = heroRowRenderApi();
    if (!api || !api.renderHeroList) return;
    api.renderHeroList(around, listEl, sectionEl, {
      L2: window.L2 || null,
      onPkClick: startPvpFromMap,
    });
  }

  function renderHeroMarkers(img, layer, heroes) {
    if (!layer) return;
    var sig = compactHeroSig(heroes);
    if (layer.dataset.l2HeroMarkerSig === sig) return;
    layer.dataset.l2HeroMarkerSig = sig;
    layer.innerHTML = '';
    if (!img || !img.naturalWidth || !heroes || !heroes.length) return;
    for (var hj = 0; hj < heroes.length; hj++) {
      var h = heroes[hj];
      var p = worldToMapPixel(h.worldX, h.worldY);
      var lx = (p.mx / img.naturalWidth) * 100;
      var ly = (p.my / img.naturalHeight) * 100;
      var pin = document.createElement('div');
      pin.className = 'l2-map-hero-pin';
      if (h.pvpNickColor === 'pk') pin.className += ' l2-map-hero-pin--pk';
      else if (h.pvpNickColor === 'aggressor') pin.className += ' l2-map-hero-pin--aggressor';
      if (h.isPartyMember) pin.className += ' l2-map-hero-pin--party';
      if (h.isPartyLeader) pin.className += ' l2-map-hero-pin--party-leader';
      pin.style.left = lx + '%';
      pin.style.top = ly + '%';
      var title = (h.name || '—') + (h.level ? ' · ур. ' + h.level : '');
      if (h.isPartyMember) title += ' · Паті';
      if (h.isPartyLeader) title += ' · Лідер';
      pin.setAttribute('aria-label', title);
      pin.title = title;
      pin.dataset.characterId = h.characterId || '';
      pin.dataset.heroName = h.name || '';
      layer.appendChild(pin);
    }
  }

  function num(v, d) {
    var n = Number(v);
    return Number.isFinite(n) ? n : d;
  }

  function centerMapOnPlayer(viewport, img, worldX, worldY) {
    if (!viewport || !img || !img.naturalWidth) return;
    var p = worldToMapPixel(worldX, worldY);
    var px = (p.mx / img.naturalWidth) * img.offsetWidth;
    var py = (p.my / img.naturalHeight) * img.offsetHeight;
    var sl = px - viewport.clientWidth / 2;
    var st = py - viewport.clientHeight / 2;
    viewport.scrollLeft = Math.max(0, Math.min(sl, viewport.scrollWidth - viewport.clientWidth));
    viewport.scrollTop = Math.max(0, Math.min(st, viewport.scrollHeight - viewport.clientHeight));
  }

  function appendMobRow(listEl, s, playerLevel) {
    var li = document.createElement('li');
    li.className =
      'l2-map-mob-item l2-map-mob-item--battle l2-map-mob-item--with-icon';
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'l2-map-mob-icon-btn';
    btn.setAttribute('aria-label', 'Інформація про моба');
    btn.dataset.spawnId = s.id || '';
    var img = document.createElement('img');
    img.className = 'l2-map-mob-icon-img';
    img.alt = '';
    img.width = 20;
    img.height = 20;
    img.loading = 'lazy';
    img.src = s.icon || '/mobs/1.png';
    img.onerror = function () {
      img.src = '/mobs/1.png';
    };
    btn.appendChild(img);
    var a = document.createElement('a');
    a.className = mobLinkClass(s, playerLevel);
    a.href = '/battle.html?spawnId=' + encodeURIComponent(s.id);
    a.addEventListener('click', onMobBattleLinkClick);
    a.textContent = mobDisplayLine(s);
    li.appendChild(btn);
    li.appendChild(a);
    listEl.appendChild(li);
  }

  function mammonNpcIconUrl(href) {
    var h = String(href || '');
    if (h.indexOf('blacksmith') >= 0) return '/nps/76.png';
    return '/nps/38.png';
  }

  function appendNpcRow(listEl, npc, href) {
    if (!listEl || !npc) return;
    var li = document.createElement('li');
    li.className =
      'l2-map-mob-item l2-map-mob-item--npc l2-map-mob-item--with-icon';
    var img = document.createElement('img');
    img.className = 'l2-map-npc-icon-img';
    img.alt = '';
    img.width = 22;
    img.height = 22;
    img.loading = 'lazy';
    img.src = mammonNpcIconUrl(href);
    img.onerror = function () {
      img.src = '/icons/drops/other.svg';
    };
    var a = document.createElement('a');
    a.className = 'l2-map-mob-link l2-map-mob-link--npc';
    a.href = href || '/mammon-merchant.html';
    a.textContent = npc.nameEn || npc.nameUk || 'NPC';
    li.appendChild(img);
    li.appendChild(a);
    listEl.appendChild(li);
  }

  function filterMammonNearby(mammon, playerX, playerY) {
    if (!mammon || !mammon.current) return null;
    var cur = mammon.current;
    var px = Number(cur.worldX);
    var py = Number(cur.worldY);
    if (!Number.isFinite(px) || !Number.isFinite(py)) return null;
    var plx = Number(playerX);
    var ply = Number(playerY);
    if (!Number.isFinite(plx) || !Number.isFinite(ply)) return null;
    var dx = plx - px;
    var dy = ply - py;
    var heroR = playerVisibilityRadiusUnits();
    if (!Number.isFinite(heroR) || heroR <= 0) return null;
    var r2 = heroR * heroR;
    if (dx * dx + dy * dy > r2) return null;
    return mammon;
  }

  function renderNpcList(
    listEl,
    pagerEl,
    prevBtn,
    nextBtn,
    indEl,
    merchant,
    blacksmith,
    playerX,
    playerY
  ) {
    if (!listEl) return;
    var posSig =
      String(Math.floor(Number(playerX) || 0)) + ',' + String(Math.floor(Number(playerY) || 0));
    var sig =
      posSig +
      '::' +
      (merchant ? String(merchant.slotIndex) + '|' + String(merchant.rotatesAtMs || '') : '0') +
      '::' +
      (blacksmith ? String(blacksmith.slotIndex) + '|' + String(blacksmith.rotatesAtMs || '') : '0');
    if (listEl.dataset.l2NpcListSig === sig) {
      if (pagerEl) pagerEl.hidden = true;
      return;
    }
    listEl.dataset.l2NpcListSig = sig;
    listEl.classList.add('l2-map-mob-list--npc');
    delete listEl.dataset.l2AroundSig;
    listEl.innerHTML = '';
    if (merchant) {
      appendNpcRow(listEl, merchant, '/mammon-merchant.html');
    }
    if (blacksmith) {
      appendNpcRow(listEl, blacksmith, '/mammon-blacksmith.html');
    }
    if (!merchant && !blacksmith) {
      var li = document.createElement('li');
      li.className = 'l2-map-mob-item l2-map-mob-item--hint';
      li.textContent = 'Поруч немає NPC — підійди до некрополю або катакомби.';
      listEl.appendChild(li);
    }
    if (pagerEl) pagerEl.hidden = true;
  }

  function npcListForPlayer(merchant, blacksmith, playerX, playerY) {
    return {
      merchant: filterMammonNearby(merchant, playerX, playerY),
      blacksmith: filterMammonNearby(blacksmith, playerX, playerY),
    };
  }

  function renderNpcMarker(_img, layer, _npc) {
    if (!layer) return;
    if (layer.dataset.l2NpcMarkerSig === 'off') return;
    layer.dataset.l2NpcMarkerSig = 'off';
    layer.innerHTML = '';
  }

  function renderAroundSkeleton(listEl) {
    if (!listEl) return;
    listEl.innerHTML = '';
    listEl.classList.add('l2-map-mob-list--skeleton');
    for (var i = 0; i < MOBS_PER_PAGE; i++) {
      var li = document.createElement('li');
      li.className = 'l2-map-mob-item l2-map-mob-item--skeleton';
      var line = document.createElement('span');
      line.className = 'l2-ui-skeleton-line l2-ui-skeleton-line--map-row';
      li.appendChild(line);
      listEl.appendChild(li);
    }
  }

  function kindModalUk(k) {
    var m = {
      passive: 'пасивний',
      aggressive: 'агресивний',
      neutral: 'нейтральний',
      champion: 'чемпіон',
      raid: 'рейд-бос',
      epic: 'епік',
      epic_guard: 'міньйони зони епіка',
      dungeon: 'данжен / вхід',
    };
    return m[k] || String(k || '—');
  }

  /** Відсоток дропу: мінімум 3 знаки після коми; для дуже малих шансів — до 6, щоб не було «0.00%». */
  function formatDropChance(d) {
    var p;
    if (d.chancePerMillion != null) p = d.chancePerMillion / 10000;
    else if (d.chance != null) p = d.chance * 100;
    else return '—';
    if (!isFinite(p) || p < 0) return '—';
    if (p === 0) return '0%';
    var dec = 3;
    while (dec < 6 && p > 0 && Number(p.toFixed(dec)) === 0) dec++;
    return p.toFixed(dec) + '%';
  }

  /** Кількість за рядком дропу (min–max з XML або droplist). */
  function formatDropQty(r) {
    var min = r.min;
    var max = r.max;
    if (min == null && max == null) return '';
    if (min == null) min = max;
    if (max == null) max = min;
    if (!isFinite(min) || !isFinite(max)) return '';
    var isAdena = r.kind === 'adena' || r.l2ItemId === 57;
    if (isAdena) {
      if (min === max) return String(min) + ' ад.';
      return String(min) + '–' + String(max) + ' ад.';
    }
    if (min === max) return '×' + String(min);
    return String(min) + '–' + String(max) + ' шт.';
  }

  function renderDropList(container, rows) {
    if (!container) return;
    container.innerHTML = '';
    if (!rows || !rows.length) {
      container.textContent = '—';
      return;
    }
    var ul = document.createElement('ul');
    ul.className = 'l2-map-mob-modal__drop-list';
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      var li = document.createElement('li');
      li.className = 'l2-map-mob-modal__drop-li';
      var iconSrc = r.iconUrl || '/icons/slot_weapon.png';
      var img = document.createElement('img');
      img.className = 'l2-map-mob-modal__drop-ico';
      img.width = 28;
      img.height = 28;
      img.alt = '';
      img.src = iconSrc;
      img.onerror = function () {
        img.src = '/icons/drops/other.svg';
      };
      var label = r.displayName || r.id || '—';
      var qty = formatDropQty(r);
      var ch = formatDropChance(r);
      var span = document.createElement('span');
      span.className = 'l2-map-mob-modal__drop-txt';
      span.textContent = qty ? label + ' — ' + qty + ' · ' + ch : label + ' — ' + ch;
      li.appendChild(img);
      li.appendChild(span);
      ul.appendChild(li);
    }
    container.appendChild(ul);
  }

  function updateMobPager(pagerEl, prevBtn, nextBtn, indEl, page, pages, total) {
    if (!pagerEl || !indEl) return;
    if (pages <= 1) {
      pagerEl.hidden = true;
      return;
    }
    pagerEl.hidden = false;
    indEl.textContent = page + 1 + ' / ' + pages + ' (' + total + ')';
    if (prevBtn) prevBtn.disabled = page <= 0;
    if (nextBtn) nextBtn.disabled = page >= pages - 1;
  }

  function renderAround(around, listEl, pagerEl, prevBtn, nextBtn, indEl, page, setPage, playerLevel) {
    if (!around || !listEl) return;
    listEl.classList.remove('l2-map-mob-list--npc');
    listEl.classList.remove('l2-map-mob-list--skeleton');
    delete listEl.dataset.l2NpcListSig;
    var spawns = around.nearbySpawns || [];
    var total = spawns.length;
    var pages = Math.max(1, Math.ceil(total / MOBS_PER_PAGE));
    var p = page;
    if (p >= pages) p = pages - 1;
    if (p < 0) p = 0;
    setPage(p);
    var start = p * MOBS_PER_PAGE;
    var slice = spawns.slice(start, start + MOBS_PER_PAGE);
    var aroundSig =
      compactSpawnListSig(spawns) + '|p' + p + '|lv' + playerLevel;
    if (listEl.dataset.l2AroundSig === aroundSig) {
      updateMobPager(pagerEl, prevBtn, nextBtn, indEl, p, pages, total);
      return;
    }
    listEl.dataset.l2AroundSig = aroundSig;
    listEl.innerHTML = '';
    if (slice.length) {
      for (var i = 0; i < slice.length; i++) {
        appendMobRow(listEl, slice[i], playerLevel);
      }
    } else {
      var li = document.createElement('li');
      li.className = 'l2-map-mob-item l2-map-mob-item--hint';
      li.textContent =
        'Поруч немає мобів — підійди ближче до міста чи зони полювання або клікни далі по карті.';
      listEl.appendChild(li);
    }
    updateMobPager(pagerEl, prevBtn, nextBtn, indEl, p, pages, total);
  }

  function renderDetail(around, listEl, pagerEl, prevBtn, nextBtn, indEl, page, setPage, playerLevel) {
    if (!around || !listEl) return;
    var spawns = around.nearbySpawns || [];
    var total = spawns.length;
    var pages = Math.max(1, Math.ceil(total / MOBS_PER_PAGE));
    var p = page;
    if (p >= pages) p = pages - 1;
    if (p < 0) p = 0;
    setPage(p);
    var start = p * MOBS_PER_PAGE;
    var slice = spawns.slice(start, start + MOBS_PER_PAGE);
    listEl.innerHTML = '';
    if (slice.length) {
      for (var k = 0; k < slice.length; k++) {
        appendMobRow(listEl, slice[k], playerLevel);
      }
    } else {
      var li2 = document.createElement('li');
      li2.className = 'l2-map-mob-item l2-map-mob-item--hint';
      li2.textContent =
        'Поруч немає мобів — підійди ближче до міста чи зони полювання.';
      listEl.appendChild(li2);
    }
    updateMobPager(pagerEl, prevBtn, nextBtn, indEl, p, pages, total);
  }

  function renderPartyNearbyBlock(members, blockEl) {
    if (!blockEl) return;
    var list = members && members.length ? members : [];
    var sig = list.map(function (m) {
      return String(m.characterId || '') + ':' + String(m.name || '');
    }).join('|');
    if (blockEl.dataset.l2PartyNearbySig === sig) {
      blockEl.hidden = !list.length;
      return;
    }
    blockEl.dataset.l2PartyNearbySig = sig;
    blockEl.hidden = !list.length;
    while (blockEl.firstChild) blockEl.removeChild(blockEl.firstChild);
    if (!list.length) return;
    var label = document.createElement('span');
    label.className = 'l2-map-party-nearby__label';
    label.textContent = 'У локації з вами:';
    blockEl.appendChild(label);
    var names = document.createElement('span');
    names.className = 'l2-map-party-nearby__names';
    names.textContent = list
      .map(function (m) {
        return String(m.name || '—');
      })
      .join(', ');
    blockEl.appendChild(names);
  }

  function render(c, img, dot, viewRadiusEl, heroViewRadiusEl, moveTargetEl, viewport, around, centerOnPlayer) {
    if (!c) return;
    var wx = num(c.worldX, 83400);
    var wy = num(c.worldY, 147943);
    placeDot(img, dot, wx, wy);
    var mobR = mobInteractionRadiusUnits();
    var heroR = playerVisibilityRadiusUnits();
    if (Number.isFinite(mobR) && mobR > 0) {
      placeViewRadius(img, viewRadiusEl, wx, wy, mobR);
    } else if (viewRadiusEl) {
      viewRadiusEl.style.display = 'none';
    }
    if (Number.isFinite(heroR) && heroR > 0) {
      placeViewRadius(img, heroViewRadiusEl, wx, wy, heroR);
    } else if (heroViewRadiusEl) {
      heroViewRadiusEl.style.display = 'none';
    }
    var tgx = c.targetX != null ? Number(c.targetX) : 0;
    var tgy = c.targetY != null ? Number(c.targetY) : 0;
    var hasTarget = Number.isFinite(tgx) && Number.isFinite(tgy) && (tgx !== 0 || tgy !== 0);
    if (moveTargetEl) {
      if (hasTarget) {
        moveTargetEl.hidden = false;
        moveTargetEl.setAttribute('aria-hidden', 'false');
        placeDot(img, moveTargetEl, tgx, tgy);
      } else {
        moveTargetEl.hidden = true;
        moveTargetEl.setAttribute('aria-hidden', 'true');
      }
    }
    if (centerOnPlayer && viewport && img && img.naturalWidth) {
      centerMapOnPlayer(viewport, img, wx, wy);
    }
  }

  async function init() {
    initialMapSyncResolved = false;
    hideMapDefeatBlock();
    if (window.L2 && typeof L2.mountL2Nav === 'function') {
      L2.mountL2Nav({
        onStub: function (label) {
          alert('«' + label + '» — заглушка.');
        },
      });
    }

    var errEl = $('map-load-err');
    var content = $('map-content');
    var mapStack = $('map-stack');
    var mobSection = $('map-mob-section');
    var mapDetail = $('map-mob-detail');
    var detailList = $('map-mob-detail-list');
    var backBtn = $('map-back-to-map');
    var viewport = $('map-viewport');
    var img = $('map-img');
    var dot = $('map-dot');
    var viewRadius = $('map-view-radius');
    var heroViewRadius = $('map-hero-view-radius');
    var dungeonEnterEl = $('map-dungeon-enter');
    var dungeonEnterLink = $('map-dungeon-enter-link');
    var dungeonEnterLabel = $('map-dungeon-enter-label');
    var heroMarkersLayer = $('map-hero-markers');
    var heroSection = $('map-hero-section');
    var partyNearbyBlock = $('map-party-nearby');
    var heroList = $('map-hero-list');
    var moveTarget = $('map-move-target');
    var markersLayer = $('map-mob-markers');
    var npcMarkersLayer = $('map-npc-markers');
    var listModeNpcBtn = $('map-list-mode-npc');
    var listModeMobsBtn = $('map-list-mode-mobs');

    var MAP_LIST_MODE_KEY = 'l2mapListMode';
    var listMode = 'mobs';
    try {
      var savedMode = sessionStorage.getItem(MAP_LIST_MODE_KEY);
      if (savedMode === 'npc' || savedMode === 'mobs') listMode = savedMode;
    } catch (eMode) {
      /* ignore */
    }

    var mammonMerchant = null;
    var mammonBlacksmith = null;
    var dungeonEntrance = null;

    function renderDungeonEntrance(imgEl, entrance) {
      if (!entrance) {
        if (dungeonEnterEl) dungeonEnterEl.hidden = true;
        return;
      }
      if (dungeonEnterEl) dungeonEnterEl.hidden = false;
      if (dungeonEnterLink) {
        dungeonEnterLink.href =
          '/dungeon.html?dungeonId=' +
          encodeURIComponent(entrance.id || '') +
          '&enter=1';
      }
      if (dungeonEnterLabel) {
        dungeonEnterLabel.textContent = entrance.labelUk
          ? ' · ' + entrance.labelUk
          : entrance.labelEn
            ? ' · ' + entrance.labelEn
            : '';
      }
    }

    function applyListModeUi() {
      var isNpc = listMode === 'npc';
      if (listModeNpcBtn) {
        listModeNpcBtn.classList.toggle('is-active', isNpc);
        listModeNpcBtn.setAttribute('aria-selected', isNpc ? 'true' : 'false');
      }
      if (listModeMobsBtn) {
        listModeMobsBtn.classList.toggle('is-active', !isNpc);
        listModeMobsBtn.setAttribute('aria-selected', !isNpc ? 'true' : 'false');
      }
    }

    function reloadWithListMode(mode) {
      if (mode !== 'npc' && mode !== 'mobs') return;
      try {
        sessionStorage.setItem(MAP_LIST_MODE_KEY, mode);
      } catch (eSave) {
        /* ignore */
      }
      window.location.reload();
    }

    applyListModeUi();
    if (listModeNpcBtn) {
      listModeNpcBtn.addEventListener('click', function () {
        reloadWithListMode('npc');
      });
    }
    if (listModeMobsBtn) {
      listModeMobsBtn.addEventListener('click', function () {
        reloadWithListMode('mobs');
      });
    }

    var t = localStorage.getItem('token');
    if (!t) {
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent = 'Потрібен вхід.';
      }
      return;
    }

    var c = window.L2 && typeof L2.lastSnapshot === 'function' ? L2.lastSnapshot() : null;
    if (!c) c = readCachedMapSnapshot();
    if (c) {
      if (window.L2 && typeof L2.applyCharacterSnapshot === 'function') {
        L2.applyCharacterSnapshot(c);
      } else if (window.L2 && typeof L2.setLastSnapshot === 'function') {
        L2.setLastSnapshot(c);
        if (typeof L2.applyHudFromSnapshot === 'function') {
          L2.applyHudFromSnapshot(c);
        }
      }
      writeCachedMapSnapshot(c);
    }

    var snapshotPromise = loadSnapshot();
    var syncPromise = loadMapSync();

    var aroundData = { nearbySpawns: [], nearbyHeroes: [] };
    var worldSpawns = [];
    var lastMapPaintPosSig = '';

    var MAP_SCALE_MIN = 0.45;
    var MAP_SCALE_MAX = 2.75;
    var MAP_SCALE_STEP = 0.15;
    var MAP_SCALE_KEY = 'l2mapScale';

    var mapScale = 1;
    try {
      var sv = sessionStorage.getItem(MAP_SCALE_KEY);
      if (sv) {
        var parsed = parseFloat(sv);
        if (Number.isFinite(parsed)) {
          mapScale = Math.min(MAP_SCALE_MAX, Math.max(MAP_SCALE_MIN, parsed));
        }
      }
    } catch (e) {
      /* ignore */
    }

    var lastPinchEnd = 0;
    /** Остання позиція курсора над вікном карти — для +/− якоря біля «точки погляду». */
    var lastMapPointerClientX = null;
    var lastMapPointerClientY = null;

    function applyMapScale() {
      if (!img || !img.naturalWidth) return;
      img.style.width = Math.round(img.naturalWidth * mapScale) + 'px';
      img.style.height = 'auto';
      if (viewport) {
        viewport.setAttribute('data-map-zoom', Math.round(mapScale * 100) + '%');
      }
      try {
        sessionStorage.setItem(MAP_SCALE_KEY, String(mapScale));
      } catch (e2) {
        /* ignore */
      }
    }

    /**
     * Масштаб відносно точки на екрані (clientX/clientY): та сама ділянка карти лишається під курсором.
     */
    function zoomToScale(newScale, clientX, clientY) {
      if (!viewport || !img || !img.naturalWidth) return;
      newScale = Math.min(MAP_SCALE_MAX, Math.max(MAP_SCALE_MIN, newScale));
      var oldScale = mapScale;
      if (Math.abs(newScale - oldScale) < 1e-9) return;

      var rect = viewport.getBoundingClientRect();
      var mx = clientX - rect.left;
      var my = clientY - rect.top;
      var cx = viewport.scrollLeft + mx;
      var cy = viewport.scrollTop + my;
      var ratio = newScale / oldScale;

      mapScale = newScale;
      applyMapScale();

      function fixScroll() {
        var rw = viewport.getBoundingClientRect();
        var mx2 = clientX - rw.left;
        var my2 = clientY - rw.top;
        var newCx = cx * ratio;
        var newCy = cy * ratio;
        var maxL = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
        var maxT = Math.max(0, viewport.scrollHeight - viewport.clientHeight);
        viewport.scrollLeft = Math.max(0, Math.min(newCx - mx2, maxL));
        viewport.scrollTop = Math.max(0, Math.min(newCy - my2, maxT));
      }
      fixScroll();
      requestAnimationFrame(fixScroll);
    }

    function playerLevelNow() {
      return c && c.level != null ? c.level : 1;
    }

    function applyMapSyncPayload(sync, opts) {
      opts = opts || {};
      if (!sync || !sync.mapState) return false;
      if (shouldRejectIncomingMapSync(sync)) return false;
      initialMapSyncResolved = true;

      applyMapRadiiFromSync(sync);

      if (typeof sync.mapCatalogVersion === 'number') {
        lastMapCatalogVersion = Math.floor(sync.mapCatalogVersion);
      }
      if (typeof sync.personalMapSig === 'string') {
        lastPersonalMapSig = sync.personalMapSig;
      }
      if (typeof sync.revision === 'number') {
        lastMapSyncRevision = Math.floor(sync.revision);
      }

      if (typeof sync.mammonRotationSig === 'string') {
        lastMammonRotationSig = sync.mammonRotationSig;
      }
      if (sync.mammonMerchant !== undefined) {
        mammonMerchant = sync.mammonMerchant || null;
      }
      if (sync.mammonBlacksmith !== undefined) {
        mammonBlacksmith = sync.mammonBlacksmith || null;
      }
      if (sync.dungeonEntrance !== undefined) {
        dungeonEntrance = sync.dungeonEntrance || null;
      }

      if (sync.changed === false) {
        var msLite = sync.mapState;
        if (window.L2 && typeof L2.mergeMapStateIntoSnapshot === 'function') {
          L2.mergeMapStateIntoSnapshot(msLite);
        }
        c = window.L2 && typeof L2.lastSnapshot === 'function' ? L2.lastSnapshot() : msLite;
        if (c) writeCachedMapSnapshot(c);
        if (sync.around) {
          aroundData = Object.assign({}, aroundData || {}, {
            nearbyHeroes: normalizeSyncNearbyHeroes(sync.around.nearbyHeroes || []),
            partyNearbyMembers: sync.around.partyNearbyMembers || [],
          });
        }
        applyPvpIncomingFromSync(sync);
        if (!opts.skipDefeatRedirect) {
          handleMapDefeatFromSync(sync, c);
        }
        renderHeroList(aroundData, heroList, heroSection);
        renderHeroMarkers(img, heroMarkersLayer, (aroundData && aroundData.nearbyHeroes) || []);
        renderPartyNearbyBlock(
          aroundData && aroundData.partyNearbyMembers
            ? aroundData.partyNearbyMembers
            : [],
          partyNearbyBlock
        );
        renderNpcMarker(img, npcMarkersLayer, mammonMerchant);
        renderDungeonEntrance(img, dungeonEntrance);
        if (listMode === 'npc') {
          paintNpcList();
        }
        return false;
      }

      var ms = sync.mapState;
      var posSig = mapPositionSig(ms);
      var spawnSig = compactSpawnListSig(
        sync.around && sync.around.nearbySpawns ? sync.around.nearbySpawns : []
      );
      var heroSig = compactHeroSig(
        normalizeSyncNearbyHeroes(
          sync.around && sync.around.nearbyHeroes ? sync.around.nearbyHeroes : []
        )
      );
      var markerSig = compactMarkerSig(sync.spawns || []);
      var fullSig = posSig + '||' + spawnSig + '||' + heroSig + '||' + markerSig;
      if (!opts.force && fullSig === lastMapPaintPosSig) {
        if (sync.around && sync.around.nearbyHeroes) {
          aroundData = Object.assign({}, aroundData || {}, {
            nearbyHeroes: normalizeSyncNearbyHeroes(sync.around.nearbyHeroes || []),
            partyNearbyMembers:
              sync.around.partyNearbyMembers ||
              (aroundData && aroundData.partyNearbyMembers) ||
              [],
          });
          renderHeroList(aroundData, heroList, heroSection);
          renderHeroMarkers(
            img,
            heroMarkersLayer,
            (aroundData && aroundData.nearbyHeroes) || []
          );
        }
        return false;
      }
      lastMapPaintPosSig = fullSig;

      if (window.L2 && typeof L2.mergeMapStateIntoSnapshot === 'function') {
        L2.mergeMapStateIntoSnapshot(ms);
      }
      c = window.L2 && typeof L2.lastSnapshot === 'function' ? L2.lastSnapshot() : ms;
      if (c) writeCachedMapSnapshot(c);
      if (c && window.L2 && typeof L2.applyHudFromSnapshot === 'function') {
        L2.applyHudFromSnapshot(c);
      }
      if (sync.around) {
        aroundData = Object.assign({}, sync.around, {
          nearbyHeroes: normalizeSyncNearbyHeroes(sync.around.nearbyHeroes || []),
        });
      }
      worldSpawns = sync.spawns || [];
      applyPvpIncomingFromSync(sync);
      if (!opts.skipDefeatRedirect) {
        handleMapDefeatFromSync(sync, c);
      }
      paintMain(!!opts.centerOnPlayer);
      renderMobMarkers(img, markersLayer, worldSpawns, markerSig);
      return true;
    }

    if (window.__L2_MAP_SYNC_TEST_MODE) {
      window.L2MapSyncTest = {
        applyMapSyncPayload: applyMapSyncPayload,
        heroList: heroList,
        heroSection: heroSection,
        getAroundData: function () {
          return aroundData;
        },
        isInitialMapSyncResolved: function () {
          return initialMapSyncResolved;
        },
        isMapDefeatVisible: function () {
          var defRoot = $('map-defeat-root');
          return !!(defRoot && !defRoot.hidden);
        },
      };
      return;
    }

    function paintNpcList() {
      if (listMode !== 'npc') return;
      var px = c && c.worldX != null ? c.worldX : 0;
      var py = c && c.worldY != null ? c.worldY : 0;
      var vis = npcListForPlayer(mammonMerchant, mammonBlacksmith, px, py);
      renderNpcList(
        $('map-mob-list'),
        $('map-mob-pager'),
        $('map-mob-page-prev'),
        $('map-mob-page-next'),
        $('map-mob-page-ind'),
        vis.merchant,
        vis.blacksmith,
        px,
        py
      );
    }

    function paintMain(centerOnPlayer) {
      render(c, img, dot, viewRadius, heroViewRadius, moveTarget, viewport, aroundData, centerOnPlayer);
      renderHeroList(aroundData, heroList, heroSection);
      renderHeroMarkers(img, heroMarkersLayer, aroundData.nearbyHeroes || []);
      renderPartyNearbyBlock(
        aroundData && aroundData.partyNearbyMembers ? aroundData.partyNearbyMembers : [],
        partyNearbyBlock
      );
      renderNpcMarker(img, npcMarkersLayer, mammonMerchant);
      renderDungeonEntrance(img, dungeonEntrance);
      if (listMode === 'npc') {
        paintNpcList();
        return;
      }
      renderAround(
        aroundData,
        $('map-mob-list'),
        $('map-mob-pager'),
        $('map-mob-page-prev'),
        $('map-mob-page-next'),
        $('map-mob-page-ind'),
        mobListPage,
        function (p) {
          mobListPage = p;
        },
        playerLevelNow()
      );
    }

    function paintDetail() {
      renderDetail(
        aroundData,
        detailList,
        $('map-mob-detail-pager'),
        $('map-mob-detail-prev'),
        $('map-mob-detail-next'),
        $('map-mob-detail-ind'),
        mobDetailPage,
        function (p) {
          mobDetailPage = p;
        },
        playerLevelNow()
      );
    }

    function zoomBy(delta) {
      if (!viewport) return;
      var rect = viewport.getBoundingClientRect();
      var ax = rect.left + rect.width / 2;
      var ay = rect.top + rect.height / 2;
      if (
        lastMapPointerClientX != null &&
        lastMapPointerClientY != null &&
        lastMapPointerClientX >= rect.left &&
        lastMapPointerClientX <= rect.right &&
        lastMapPointerClientY >= rect.top &&
        lastMapPointerClientY <= rect.bottom
      ) {
        ax = lastMapPointerClientX;
        ay = lastMapPointerClientY;
      }
      zoomToScale(mapScale + delta, ax, ay);
    }

    var mapMode = 'map';

    function showMapView() {
      mapMode = 'map';
      if (mapStack) mapStack.hidden = false;
      if (viewport) viewport.hidden = false;
      if (mobSection) mobSection.hidden = false;
      if (mapDetail) mapDetail.hidden = true;
    }

    /** Карта лишається зверху; ховається лише блок «Моби в околицях». Під картою — повний список. */
    function showMobDetailView() {
      mapMode = 'mobs';
      if (mapStack) mapStack.hidden = false;
      if (viewport) viewport.hidden = false;
      if (mobSection) mobSection.hidden = true;
      if (mapDetail) mapDetail.hidden = false;
      mobDetailPage = 0;
      paintDetail();
    }

    function imgReady() {
      applyMapScale();
      paintMain(true);
      renderMobMarkers(img, markersLayer, worldSpawns);
      if (content) content.hidden = false;
      if (errEl) errEl.hidden = true;
    }

    if (content) content.hidden = false;
    if (errEl) errEl.hidden = true;
    if (listMode === 'npc') {
      var npcListEl = $('map-mob-list');
      if (npcListEl) {
        npcListEl.innerHTML = '';
        npcListEl.classList.add('l2-map-mob-list--npc');
      }
    } else {
      renderAroundSkeleton($('map-mob-list'));
    }
    if (c) paintMain(false);

    var freshSnapshot = await snapshotPromise;
    if (!freshSnapshot && !c) {
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent =
          'Не вдалося завантажити персонажа. Якщо щойно додавали карту в БД — виконай у корені: npm run db:push і перезапусти сервер.';
      }
      return;
    }
    if (freshSnapshot) {
      c = freshSnapshot;
      writeCachedMapSnapshot(c);
      if (window.L2 && typeof L2.setLastSnapshot === 'function') {
        L2.setLastSnapshot(c);
      }
      if (window.L2 && typeof L2.applyHudFromSnapshot === 'function') {
        L2.applyHudFromSnapshot(c);
      }
    }

    var sync0 = await syncPromise;
    if (sync0) {
      if (applyMapSyncPayload(sync0, { force: true, skipDefeatRedirect: false }) === 'redirect') {
        return;
      }
    } else if (c) {
      paintMain(false);
    }

    var mobModal = $('map-mob-modal');
    var mobModalBackdrop = $('map-mob-modal-backdrop');
    var mobModalClose = $('map-mob-modal-close');
    var mobModalIcon = $('map-mob-modal-icon');
    var mobModalTitle = $('map-mob-modal-title');
    var mobModalSub = $('map-mob-modal-sub');
    var mobModalStats = $('map-mob-modal-stats');
    var mobModalDrops = $('map-mob-modal-drops');
    var mobModalSpoil = $('map-mob-modal-spoil');
    var mobModalNote = $('map-mob-modal-note');
    var mobModalBattle = $('map-mob-modal-battle');
    var mapMobListEl = $('map-mob-list');
    var mapMobDetailListEl = $('map-mob-detail-list');

    function closeMobModal() {
      if (mobModal) mobModal.hidden = true;
    }

    async function openMobCatalog(spawnId) {
      if (!spawnId) return;
      if (window.L2 && typeof L2.onHelperMobClicked === 'function') {
        L2.onHelperMobClicked();
      }
      var tok = localStorage.getItem('token');
      if (!tok) return;
      var r = await fetch('/game/spawn/' + encodeURIComponent(spawnId) + '/info', {
        headers: { Authorization: 'Bearer ' + tok },
      });
      if (r.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/';
        return;
      }
      if (!r.ok) return;
      var j = await r.json();
      if (mobModalIcon) {
        mobModalIcon.src = j.icon || '/mobs/1.png';
        mobModalIcon.onerror = function () {
          mobModalIcon.src = '/mobs/1.png';
        };
      }
      if (mobModalTitle) mobModalTitle.textContent = j.name || '—';
      var sub =
        'рів. ' +
        (j.level != null ? j.level : '—') +
        ' · ' +
        kindModalUk(j.kind) +
        (j.aggressive ? ' · агресивний' : '');
      if (j.npcId != null) sub += ' · NPC ' + j.npcId;
      if (mobModalSub) mobModalSub.textContent = sub;
      if (mobModalStats) {
        mobModalStats.innerHTML = '';
        var st = j.stats || {};
        function addStat(k, v) {
          var dt = document.createElement('dt');
          dt.textContent = k;
          var dd = document.createElement('dd');
          dd.textContent = v != null ? String(v) : '—';
          mobModalStats.appendChild(dt);
          mobModalStats.appendChild(dd);
        }
        addStat('HP (max)', st.maxHp);
        addStat('P.Atk', st.pAtk);
        addStat('P.Def', st.pDef);
        addStat('M.Atk', st.mAtk);
        addStat('M.Def', st.mDef);
        if (j.rewardExp != null && j.rewardExp !== undefined)
          addStat('EXP (за кілл)', j.rewardExp);
        if (j.rewardSp != null && j.rewardSp !== undefined)
          addStat('SP (за кілл)', j.rewardSp);
      }
      renderDropList(mobModalDrops, j.drops);
      var spoilSecWrap =
        mobModalSpoil && mobModalSpoil.closest
          ? mobModalSpoil.closest('.l2-map-mob-modal__section')
          : null;
      var spoilOk = j.viewerMaySeeSpoil === true;
      if (spoilSecWrap) spoilSecWrap.hidden = !spoilOk;
      if (mobModalSpoil) {
        if (spoilOk) {
          renderDropList(mobModalSpoil, j.spoil || []);
        } else {
          mobModalSpoil.innerHTML = '';
        }
      }
      if (mobModalNote) {
        if (j.raidBossAttackBlockedReasonUk) {
          mobModalNote.hidden = false;
          mobModalNote.textContent = j.raidBossAttackBlockedReasonUk;
        } else {
          mobModalNote.hidden = true;
          mobModalNote.textContent = '';
        }
      }
      if (mobModalBattle) {
        var canAttackRb = j.canAttackRaidBoss !== false;
        mobModalBattle.href = '/battle.html?spawnId=' + encodeURIComponent(spawnId);
        mobModalBattle.classList.toggle(
          'l2-map-mob-modal__battle--disabled',
          !canAttackRb
        );
        mobModalBattle.setAttribute('aria-disabled', canAttackRb ? 'false' : 'true');
        if (!canAttackRb) {
          mobModalBattle.onclick = function (ev) {
            ev.preventDefault();
            var blockedMsg =
              j.raidBossAttackBlockedReasonUk ||
              'Недоступно: РБ нижче дозволеного рівня.';
            if (window.L2 && typeof L2.showToast === 'function') {
              L2.showToast(blockedMsg);
            }
          };
        } else {
          mobModalBattle.onclick = function (ev) {
            ev.preventDefault();
            closeMobModal();
            startBattleFromMap(spawnId);
          };
        }
      }
      if (mobModal) mobModal.hidden = false;
    }

    function onMobListClick(e) {
      var btn = e.target && e.target.closest ? e.target.closest('.l2-map-mob-icon-btn') : null;
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      var sid = btn.dataset.spawnId;
      if (sid) openMobCatalog(sid);
    }
    if (mapMobListEl) mapMobListEl.addEventListener('click', onMobListClick);
    if (mapMobDetailListEl) mapMobDetailListEl.addEventListener('click', onMobListClick);

    if (mobModalBackdrop) mobModalBackdrop.addEventListener('click', closeMobModal);
    if (mobModalClose) mobModalClose.addEventListener('click', closeMobModal);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobModal && !mobModal.hidden) closeMobModal();
    });

    var zIn = $('map-zoom-in');
    var zOut = $('map-zoom-out');
    if (zIn) {
      zIn.addEventListener('click', function () {
        zoomBy(MAP_SCALE_STEP);
      });
    }
    if (zOut) {
      zOut.addEventListener('click', function () {
        zoomBy(-MAP_SCALE_STEP);
      });
    }

    if (markersLayer) {
      markersLayer.addEventListener('click', function (e) {
        var pin = e.target && e.target.closest ? e.target.closest('.l2-map-mob-pin') : null;
        if (!pin) return;
        e.stopPropagation();
        e.preventDefault();
        var sid = pin.dataset.spawnId;
        if (sid) openMobCatalog(sid);
      });
    }

    if (heroMarkersLayer) {
      heroMarkersLayer.addEventListener('click', function (e) {
        var pin = e.target && e.target.closest ? e.target.closest('.l2-map-hero-pin') : null;
        if (!pin) return;
        e.stopPropagation();
        e.preventDefault();
        var name = pin.dataset.heroName;
        if (name) {
          window.location.href = '/player.html?name=' + encodeURIComponent(name);
        }
      });
    }

    /** Щипок двома пальцями (масштаб як у mapcreate). */
    var pinchStartDist = 0;
    var pinchBaseScale = 1;
    if (viewport) {
      viewport.addEventListener(
        'mousemove',
        function (e) {
          lastMapPointerClientX = e.clientX;
          lastMapPointerClientY = e.clientY;
        },
        { passive: true }
      );
      viewport.addEventListener(
        'touchstart',
        function (e) {
          if (e.touches.length === 2) {
            var a = e.touches[0];
            var b = e.touches[1];
            pinchStartDist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
            pinchBaseScale = mapScale;
          }
        },
        { passive: true }
      );
      viewport.addEventListener(
        'touchmove',
        function (e) {
          if (e.touches.length !== 2 || pinchStartDist < 8) return;
          e.preventDefault();
          var a = e.touches[0];
          var b = e.touches[1];
          var d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
          var ratio = d / pinchStartDist;
          var midX = (a.clientX + b.clientX) / 2;
          var midY = (a.clientY + b.clientY) / 2;
          var newScale = Math.min(MAP_SCALE_MAX, Math.max(MAP_SCALE_MIN, pinchBaseScale * ratio));
          zoomToScale(newScale, midX, midY);
        },
        { passive: false }
      );
      viewport.addEventListener('touchend', function () {
        if (pinchStartDist > 0) {
          lastPinchEnd = Date.now();
          pinchStartDist = 0;
        }
      });
      viewport.addEventListener('touchcancel', function () {
        pinchStartDist = 0;
      });

      /** ПК: Ctrl + колесо. */
      viewport.addEventListener(
        'wheel',
        function (e) {
          if (!e.ctrlKey) return;
          e.preventDefault();
          var d = e.deltaY > 0 ? -MAP_SCALE_STEP : MAP_SCALE_STEP;
          zoomToScale(mapScale + d, e.clientX, e.clientY);
        },
        { passive: false }
      );
    }

    if (backBtn) {
      backBtn.addEventListener('click', function () {
        showMapView();
      });
    }

    var pagePrev = $('map-mob-page-prev');
    var pageNext = $('map-mob-page-next');
    if (pagePrev) {
      pagePrev.addEventListener('click', function () {
        mobListPage -= 1;
        paintMain(false);
      });
    }
    if (pageNext) {
      pageNext.addEventListener('click', function () {
        mobListPage += 1;
        paintMain(false);
      });
    }
    var detPrev = $('map-mob-detail-prev');
    var detNext = $('map-mob-detail-next');
    if (detPrev) {
      detPrev.addEventListener('click', function () {
        mobDetailPage -= 1;
        paintDetail();
      });
    }
    if (detNext) {
      detNext.addEventListener('click', function () {
        mobDetailPage += 1;
        paintDetail();
      });
    }

    /** Перегляд карти — прокрутка вікна (як crop у mapcreate); клік по зображенню = бігти. */

    if (img) {
      img.addEventListener('error', function () {
        if (errEl) {
          errEl.hidden = false;
          errEl.textContent =
            'Не вдалося завантажити карту (/assets/maps/aden2.jpg). Скопіюй з l2dop/img/aden2.jpg у server/public/assets/maps/.';
        }
      });
      if (img.complete && img.naturalWidth > 0) {
        imgReady();
      } else {
        img.addEventListener('load', imgReady);
        var tries = 0;
        var pollImg = setInterval(function () {
          tries += 1;
          if (img.naturalWidth > 0) {
            clearInterval(pollImg);
            imgReady();
          } else if (tries > 80) {
            clearInterval(pollImg);
            imgReady();
          }
        }, 50);
      }
      img.addEventListener('click', async function (e) {
        if (mapMode !== 'map') return;
        if (e.target && e.target.closest && e.target.closest('.l2-map-mob-pin')) return;
        if (e.target && e.target.closest && e.target.closest('.l2-map-npc-pin')) return;
        if (e.target && e.target.closest && e.target.closest('.l2-map-hero-pin')) return;
        if (Date.now() - lastPinchEnd < 380) return;
        var snap = window.L2 && L2.lastSnapshot ? L2.lastSnapshot() : null;
        if (!snap) return;
        var pix = clickToPixel(e, img);
        var w = mapPixelToWorld(pix.mx, pix.my);
        var r = await postMove(w.x, w.y);
        if (r.ok && r.character) {
          c = r.character;
          writeCachedMapSnapshot(c);
          mobListPage = 0;
          var syncMove = await loadMapSync();
          if (syncMove) {
            applyMapSyncPayload(syncMove, { force: true, centerOnPlayer: true });
          } else {
            paintMain(true);
          }
          if (errEl) errEl.hidden = true;
        } else if (r.err === '409') {
          var fresh = await loadSnapshot();
          if (fresh) {
            c = fresh;
            writeCachedMapSnapshot(c);
            mobListPage = 0;
            var sync409 = await loadMapSync();
            if (sync409) {
              applyMapSyncPayload(sync409, { force: true, centerOnPlayer: true });
            } else {
              paintMain(true);
            }
          }
          if (errEl) {
            errEl.hidden = false;
            errEl.textContent = 'Конфлікт ревізії — оновлено з сервера. Спробуй ще раз.';
          }
        } else if (errEl && typeof r.err === 'string' && r.err !== '401') {
          errEl.hidden = false;
          errEl.textContent = r.err;
        }
      });
    }

    var poll = setInterval(async function () {
      if (mapSyncInFlight || mapPollStopped) return;
      mapSyncInFlight = true;
      try {
        var sync = await loadMapSync();
        applyMapSyncPayload(sync, { centerOnPlayer: false });
      } finally {
        mapSyncInFlight = false;
      }
    }, MAP_POLL_MS);
    mapPollTimer = poll;

    var mapDefeatTownBtn = $('map-defeat-tocity');
    if (mapDefeatTownBtn) {
      mapDefeatTownBtn.addEventListener('click', function () {
        void mapReturnToTownAndGoCity();
      });
    }

    window.addEventListener('beforeunload', function () {
      stopMapPoll();
    });
  }

  init();
})();
