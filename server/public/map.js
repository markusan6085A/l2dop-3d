/**
 * Карта як l2dop: вікно перегляду, точки мобів на карті (як mapcr у mapcreate), список околиць (around.php).
 * Клік по карті — рух; рядок моба з посиланням — /battle.html?spawnId=…; клік по маркеру — те саме.
 */
(function () {
  /** Як BATTLE_RANGE у server/src/domain/battle.ts. */
  var MAP_BATTLE_RANGE_UNITS = 28000;
  var MOBS_PER_PAGE = 15;
  var mobListPage = 0;
  var mobDetailPage = 0;
  var MAP_SNAPSHOT_CACHE_KEY = 'l2-map-snapshot-cache-v1';

  function $(id) {
    return document.getElementById(id);
  }

  function readCachedMapSnapshot() {
    try {
      var raw = sessionStorage.getItem(MAP_SNAPSHOT_CACHE_KEY);
      if (!raw) return null;
      var j = JSON.parse(raw);
      if (!j || typeof j !== 'object') return null;
      return j;
    } catch (e) {
      return null;
    }
  }

  function writeCachedMapSnapshot(snapshot) {
    if (!snapshot || typeof snapshot !== 'object') return;
    try {
      sessionStorage.setItem(MAP_SNAPSHOT_CACHE_KEY, JSON.stringify(snapshot));
    } catch (e) {
      /* ignore */
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

  /** Кожні 10 с — легкий GET /game/map/sync (не повний /character). */
  var MAP_POLL_MS = 10000;

  async function loadMapSync() {
    var t = localStorage.getItem('token');
    if (!t) return null;
    var r = await fetch('/game/map/sync', {
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
    var r = await fetch('/character', {
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
  function renderMobMarkers(img, layer, spawns) {
    if (!layer) return;
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
    a.textContent = mobDisplayLine(s);
    li.appendChild(btn);
    li.appendChild(a);
    listEl.appendChild(li);
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

  function render(c, img, dot, moveTargetEl, viewport, around, centerOnPlayer) {
    if (!c) return;
    var wx = num(c.worldX, 83400);
    var wy = num(c.worldY, 147943);
    placeDot(img, dot, wx, wy);
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
    var moveTarget = $('map-move-target');
    var markersLayer = $('map-mob-markers');

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
      if (window.L2 && typeof L2.setLastSnapshot === 'function') {
        L2.setLastSnapshot(c);
      }
      if (window.L2 && typeof L2.applyHudFromSnapshot === 'function') {
        L2.applyHudFromSnapshot(c);
      }
      writeCachedMapSnapshot(c);
    }

    var snapshotPromise = loadSnapshot();
    var aroundPromise = loadMapAround();
    var spawnsPromise = loadMapSpawns();

    var aroundData = { nearbySpawns: [] };
    var worldSpawns = [];

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

    function paintMain(centerOnPlayer) {
      render(c, img, dot, moveTarget, viewport, aroundData, centerOnPlayer);
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
    }

    aroundData = (await aroundPromise) || { nearbySpawns: [] };
    worldSpawns = (await spawnsPromise) || [];
    if (c) paintMain(false);

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
        var noteParts = [];
        if (j.npcId == null) {
          noteParts.push(
            'NPC у каталозі l2dop за іменем не знайдено — EXP/SP за рівнем моба.'
          );
        } else {
          if (j.rewardExpSynthetic) {
            noteParts.push('EXP/SP за формулою рівня (у дампі 0 або немає рядка npc).');
          }
        }
        if (noteParts.length) {
          mobModalNote.hidden = false;
          mobModalNote.textContent = noteParts.join(' ');
        } else {
          mobModalNote.hidden = true;
        }
      }
      if (mobModalBattle) {
        mobModalBattle.href = '/battle.html?spawnId=' + encodeURIComponent(spawnId);
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

    var openDetailBtn = $('map-mob-open-detail');
    if (openDetailBtn) {
      openDetailBtn.addEventListener('click', function () {
        showMobDetailView();
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
          aroundData = await loadMapAround();
          worldSpawns = await loadMapSpawns();
          if (errEl) errEl.hidden = true;
          paintMain(true);
          renderMobMarkers(img, markersLayer, worldSpawns);
        } else if (r.err === '409') {
          var fresh = await loadSnapshot();
          if (fresh) {
            c = fresh;
            writeCachedMapSnapshot(c);
            mobListPage = 0;
            aroundData = await loadMapAround();
            worldSpawns = await loadMapSpawns();
            paintMain(true);
            renderMobMarkers(img, markersLayer, worldSpawns);
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
      var sync = await loadMapSync();
      if (sync && sync.mapState && img && dot) {
        if (window.L2 && typeof L2.mergeMapStateIntoSnapshot === 'function') {
          L2.mergeMapStateIntoSnapshot(sync.mapState);
        }
        c = window.L2 && typeof L2.lastSnapshot === 'function' ? L2.lastSnapshot() : sync.mapState;
        if (c) writeCachedMapSnapshot(c);
        if (c && window.L2 && typeof L2.applyHudFromSnapshot === 'function') {
          L2.applyHudFromSnapshot(c);
        }
        aroundData = sync.around;
        worldSpawns = sync.spawns || [];
        paintMain(false);
        renderMobMarkers(img, markersLayer, worldSpawns);
      }
    }, MAP_POLL_MS);

    window.addEventListener('beforeunload', function () {
      clearInterval(poll);
    });
  }

  init();
})();
