/**
 * Подземелля Seven Signs — карта зверху, рух по коридорах (клік → біг по сірих зонах).
 */
(function () {
  var DUNGEON_POLL_IDLE_MS = 5000;
  var DUNGEON_POLL_MOVE_MS = 1000;
  var DUNGEON_POLL_HIDDEN_MS = 30000;
  /** Як DUNGEON_NEARBY_RADIUS_PX — єдиний червоний радіус: моби + гравці. */
  var DUNGEON_NEARBY_RADIUS_PX = 70;
  var MAP_SCALE_MIN = 0.45;
  var MAP_SCALE_MAX = 2.75;
  var MAP_SCALE_STEP = 0.15;
  var MAP_SCALE_KEY = 'l2dungeonMapScale';
  var DRAG_CLICK_MAX_PX = 8;

  function isInteractiveDungeonTarget(target) {
    return !!(
      target &&
      target.closest &&
      target.closest(
        'button, a, input, select, textarea, ' +
          '.l2-map-mob-pin, ' +
          '.l2-map-hero-pin, ' +
          '.l2-map-zoom-btns'
      )
    );
  }

  function $(id) {
    return document.getElementById(id);
  }

  function dungeonNotify(msg) {
    if (window.L2 && typeof L2.showToast === 'function') {
      L2.showToast(msg);
    } else {
      alert(msg);
    }
  }

  function queryDungeonId() {
    var params = new URLSearchParams(window.location.search);
    return params.get('dungeonId') || '';
  }

  function clickToPixel(e, img) {
    var rect = img.getBoundingClientRect();
    var rx = (e.clientX - rect.left) / rect.width;
    var ry = (e.clientY - rect.top) / rect.height;
    return {
      mx: rx * img.naturalWidth,
      my: ry * img.naturalHeight,
    };
  }

  function placeMapPixelDot(img, dot, mapX, mapY) {
    if (!img || !dot || !img.naturalWidth) return;
    var lx = (mapX / img.naturalWidth) * 100;
    var ly = (mapY / img.naturalHeight) * 100;
    dot.style.left = lx + '%';
    dot.style.top = ly + '%';
  }

  function centerMapOnPlayer(viewport, img, mapX, mapY) {
    if (!viewport || !img || !img.naturalWidth) return;
    var rect = img.getBoundingClientRect();
    var scaleX = rect.width / img.naturalWidth;
    var scaleY = rect.height / img.naturalHeight;
    var px = mapX * scaleX;
    var py = mapY * scaleY;
    var sl = px - viewport.clientWidth * 0.5;
    var st = py - viewport.clientHeight * 0.5;
    viewport.scrollLeft = Math.max(
      0,
      Math.min(sl, viewport.scrollWidth - viewport.clientWidth)
    );
    viewport.scrollTop = Math.max(
      0,
      Math.min(st, viewport.scrollHeight - viewport.clientHeight)
    );
  }

  function placeDungeonRadiusCircle(img, el, mapX, mapY, radiusPx) {
    if (!img || !el || !img.naturalWidth || !radiusPx) return;
    var lx = (mapX / img.naturalWidth) * 100;
    var ly = (mapY / img.naturalHeight) * 100;
    var wPct = ((radiusPx * 2) / img.naturalWidth) * 100;
    var hPct = ((radiusPx * 2) / img.naturalHeight) * 100;
    el.style.left = lx + '%';
    el.style.top = ly + '%';
    el.style.width = wPct + '%';
    el.style.height = hPct + '%';
  }

  function renderPlayer(dungeon, img, dot, moveTarget, nearbyRadiusEl) {
    if (!dungeon || !dungeon.player) return;
    var p = dungeon.player;
    placeMapPixelDot(img, dot, p.mapX, p.mapY);
    placeDungeonRadiusCircle(
      img,
      nearbyRadiusEl,
      p.mapX,
      p.mapY,
      DUNGEON_NEARBY_RADIUS_PX
    );
    if (moveTarget) {
      if (p.mapMoving && p.targetMapX && p.targetMapY) {
        moveTarget.hidden = false;
        moveTarget.setAttribute('aria-hidden', 'false');
        placeMapPixelDot(img, moveTarget, p.targetMapX, p.targetMapY);
      } else {
        moveTarget.hidden = true;
        moveTarget.setAttribute('aria-hidden', 'true');
      }
    }
  }

  function heroNickHex(h) {
    if (h.pvpNickColor === 'pk') return '#e85840';
    if (h.pvpNickColor === 'aggressor') return '#a060d8';
    return '#bfa88a';
  }

  function heroLevelPart(h) {
    var lv = Number(h.level);
    return Number.isFinite(lv) ? ' · ур. ' + Math.floor(lv) : '';
  }

  function compactHeroSig(heroes) {
    if (!heroes || !heroes.length) return '0';
    var parts = [];
    for (var i = 0; i < heroes.length; i++) {
      var h = heroes[i];
      parts.push(
        String(h.characterId || '') +
          ':' +
          String(h.mapX != null ? h.mapX : '') +
          ':' +
          String(h.mapY != null ? h.mapY : '') +
          ':' +
          String(h.distance != null ? h.distance : '') +
          ':' +
          (h.isPartyMember ? '1' : '0') +
          ':' +
          (h.isPartyLeader ? '1' : '0')
      );
    }
    return String(heroes.length) + '|' + parts.join(',');
  }

  function renderDungeonHeroMarkers(img, layer, heroes) {
    if (!layer) return;
    var sig = compactHeroSig(heroes);
    if (layer.dataset.l2HeroMarkerSig === sig) return;
    layer.dataset.l2HeroMarkerSig = sig;
    layer.innerHTML = '';
    if (!img || !img.naturalWidth || !heroes || !heroes.length) return;
    for (var hj = 0; hj < heroes.length; hj++) {
      var h = heroes[hj];
      var lx = (h.mapX / img.naturalWidth) * 100;
      var ly = (h.mapY / img.naturalHeight) * 100;
      var pin = document.createElement('div');
      pin.className = 'l2-map-hero-pin';
      if (h.pvpNickColor === 'pk') pin.className += ' l2-map-hero-pin--pk';
      else if (h.pvpNickColor === 'aggressor') {
        pin.className += ' l2-map-hero-pin--aggressor';
      }
      pin.style.left = lx + '%';
      pin.style.top = ly + '%';
      var title = (h.name || '—') + heroLevelPart(h);
      pin.setAttribute('aria-label', title);
      pin.title = title;
      pin.dataset.characterId = h.characterId || '';
      pin.dataset.heroName = h.name || '';
      if (h.isPartyMember) {
        pin.classList.add('l2-map-hero-pin--party');
        pin.title = (pin.title || '') + (h.isPartyLeader ? ' · Паті (лідер)' : ' · Паті');
      }
      layer.appendChild(pin);
    }
  }

  function renderDungeonHeroList(listEl, sectionEl, heroes, onPkClick) {
    if (!listEl) return;
    var sig = compactHeroSig(heroes);
    if (listEl.dataset.l2HeroListSig === sig) {
      if (sectionEl) sectionEl.hidden = !heroes || !heroes.length;
      return;
    }
    listEl.dataset.l2HeroListSig = sig;
    listEl.innerHTML = '';
    if (sectionEl) sectionEl.hidden = !heroes || !heroes.length;
    if (!heroes || !heroes.length) return;
    for (var hi = 0; hi < heroes.length; hi++) {
      var h = heroes[hi];
      var li = document.createElement('li');
      li.className = 'l2-map-hero-item';
      var main = document.createElement('div');
      main.className = 'l2-map-hero-item__main';
      main.style.setProperty('--l2-map-hero-nick-color', heroNickHex(h) || '#bfa88a');

      var titleLine = document.createElement('div');
      titleLine.className = 'l2-map-hero-item__title';

      var profileOnName = h.profileOnNameClick === true;
      var nameClass = 'l2-map-hero-name-link';
      if (h.pvpNickColor === 'pk') nameClass += ' l2-pvp-nick--pk';
      else if (h.pvpNickColor === 'aggressor') {
        nameClass += ' l2-pvp-nick--aggressor';
      }
      if (profileOnName) {
        var nameLink = document.createElement('a');
        nameLink.className = nameClass;
        nameLink.href = '/player.html?name=' + encodeURIComponent(h.name || '');
        nameLink.textContent = h.name || '—';
        titleLine.appendChild(nameLink);
      } else {
        var nameSpan = document.createElement('span');
        nameSpan.className = nameClass;
        nameSpan.textContent = h.name || '—';
        titleLine.appendChild(nameSpan);
      }

      var levelSpan = document.createElement('span');
      levelSpan.className = 'l2-map-hero-level';
      levelSpan.textContent = heroLevelPart(h);
      titleLine.appendChild(levelSpan);

      if (h.showPkButton === true) {
        var pkBtn = document.createElement('button');
        pkBtn.type = 'button';
        pkBtn.className = 'l2-map-hero-link__pk';
        pkBtn.textContent = ' [PK]';
        pkBtn.setAttribute('aria-label', 'Атакувати ' + (h.name || ''));
        pkBtn.addEventListener('click', (function (heroId) {
          return function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (heroId) onPkClick(heroId);
          };
        })(h.characterId));
        titleLine.appendChild(pkBtn);
      }

      if (h.isPartyMember) {
        var partyTag = document.createElement('span');
        partyTag.className = 'l2-map-hero-party-tag';
        partyTag.textContent = h.isPartyLeader ? ' · Паті★' : ' · Паті';
        partyTag.title = h.isPartyLeader ? 'Лідер паті' : 'Член паті';
        titleLine.appendChild(partyTag);
      }

      main.appendChild(titleLine);
      li.appendChild(main);
      listEl.appendChild(li);
    }
  }

  function mobDisplayLine(s) {
    var n = s.name || '—';
    var lvNum = Number(s.level);
    var lvPart = Number.isFinite(lvNum) ? ' · ур. ' + Math.floor(lvNum) : '';
    return n + lvPart;
  }

  function mobLinkClass(s, playerLevel) {
    var pl = Number(playerLevel);
    if (!Number.isFinite(pl)) pl = 1;
    var lv = Number(s.level);
    if (!Number.isFinite(lv)) lv = 1;
    var d = lv - pl;
    var tier = 'l2-map-mob-link--lvl-same';
    if (d >= 10) tier = 'l2-map-mob-link--lvl-deadly';
    else if (d >= 5) tier = 'l2-map-mob-link--lvl-hard';
    else if (d >= 3) tier = 'l2-map-mob-link--lvl-warn';
    else if (d <= -6) tier = 'l2-map-mob-link--lvl-trivial';
    else if (d <= -3) tier = 'l2-map-mob-link--lvl-easy';
    return 'l2-map-mob-link ' + tier;
  }

  function renderDungeonMobMarkers(img, layer, spawns) {
    if (!layer) return;
    layer.innerHTML = '';
    if (!img || !img.naturalWidth || !spawns || !spawns.length) return;
    for (var i = 0; i < spawns.length; i++) {
      var s = spawns[i];
      var lx = (s.mapX / img.naturalWidth) * 100;
      var ly = (s.mapY / img.naturalHeight) * 100;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className =
        'l2-map-mob-pin l2-map-mob-pin--' + (s.aggressive ? 'aggressive' : 'passive');
      btn.style.left = lx + '%';
      btn.style.top = ly + '%';
      btn.title = mobDisplayLine(s);
      btn.setAttribute('aria-label', mobDisplayLine(s));
      btn.dataset.spawnId = s.id || '';
      layer.appendChild(btn);
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
      var img = document.createElement('img');
      img.className = 'l2-map-mob-modal__drop-ico';
      img.width = 28;
      img.height = 28;
      img.alt = '';
      img.src = r.iconUrl || '/icons/slot_weapon.png';
      img.onerror = function () {
        img.src = '/icons/drops/other.svg';
      };
      var label = r.displayName || r.id || '—';
      var qty = formatDropQty(r);
      var ch = formatDropChance(r);
      var span = document.createElement('span');
      span.className = 'l2-map-mob-modal__drop-txt';
      if (r.l2ItemId && window.L2 && typeof L2.itemNameClassNames === 'function') {
        span.className = L2.itemNameClassNames(
          r.l2ItemId,
          'l2-map-mob-modal__drop-txt l2-item-name'
        );
      }
      span.textContent = qty ? label + ' — ' + qty + ' · ' + ch : label + ' — ' + ch;
      li.appendChild(img);
      li.appendChild(span);
      ul.appendChild(li);
    }
    container.appendChild(ul);
  }

  function renderDungeonMobList(listEl, mobs, playerLevel, onBattleClick) {
    if (!listEl) return;
    listEl.innerHTML = '';
    if (!mobs || !mobs.length) {
      var hint = document.createElement('li');
      hint.className = 'l2-map-mob-item l2-map-mob-item--hint';
      hint.textContent =
        'У радіусі обзору немає мобів — клікни по мобу на карті, щоб підійти.';
      listEl.appendChild(hint);
      return;
    }
    for (var i = 0; i < mobs.length; i++) {
      var s = mobs[i];
      var li = document.createElement('li');
      li.className =
        'l2-map-mob-item l2-map-mob-item--battle l2-map-mob-item--with-icon';
      var iconBtn = document.createElement('button');
      iconBtn.type = 'button';
      iconBtn.className = 'l2-map-mob-icon-btn';
      iconBtn.setAttribute('aria-label', 'Інформація про моба');
      iconBtn.dataset.spawnId = s.id || '';
      var iconImg = document.createElement('img');
      iconImg.className = 'l2-map-mob-icon-img';
      iconImg.alt = '';
      iconImg.width = 20;
      iconImg.height = 20;
      iconImg.loading = 'lazy';
      iconImg.src = s.icon || '/mobs/1.png';
      iconImg.onerror = function () {
        iconImg.src = '/mobs/1.png';
      };
      iconBtn.appendChild(iconImg);
      var a = document.createElement('a');
      a.className = mobLinkClass(s, playerLevel);
      a.href = '/battle.html?spawnId=' + encodeURIComponent(s.id || '');
      a.setAttribute(
        'aria-label',
        s.inBattleRange ? 'Атакувати моба' : 'Підійти до моба'
      );
      a.addEventListener('click', onBattleClick);
      a.textContent = mobDisplayLine(s);
      li.appendChild(iconBtn);
      li.appendChild(a);
      listEl.appendChild(li);
    }
  }

  function queryEnterFlag() {
    return new URLSearchParams(window.location.search).get('enter') === '1';
  }

  function stripEnterFromUrl(dungeonId) {
    var clean =
      '/dungeon.html?dungeonId=' + encodeURIComponent(dungeonId);
    history.replaceState(null, '', clean);
  }

  async function postDungeonEnter(dungeonId) {
    var t = localStorage.getItem('token');
    var snap = window.L2 && typeof L2.lastSnapshot === 'function' ? L2.lastSnapshot() : null;
    if (!t || !snap) return { ok: false, err: 'no_session' };
    var r = await fetch('/game/dungeon/enter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + t,
      },
      body: JSON.stringify({
        dungeonId: dungeonId,
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
      var msg = 'Не вдалося увійти в подземелля.';
      try {
        var jErr = await r.json();
        if (jErr && jErr.messageUk) msg = jErr.messageUk;
      } catch (e) {
        /* ignore */
      }
      return { ok: false, err: msg };
    }
    var j = await r.json();
    if (j && j.character && L2.applyCharacterSnapshot) {
      L2.applyCharacterSnapshot(j.character);
    }
    return {
      ok: true,
      dungeon: j && j.dungeon ? j.dungeon : null,
    };
  }

  async function fetchDungeonView(dungeonId) {
    var t = localStorage.getItem('token');
    if (!t) return null;
    var r = await fetch(
      '/game/dungeon/view?dungeonId=' + encodeURIComponent(dungeonId),
      {
        headers: { Authorization: 'Bearer ' + t },
        cache: 'no-store',
      }
    );
    if (r.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
      return null;
    }
    if (r.status === 403) {
      var msg403 = 'Персонаж більше не в цьому подземеллі.';
      try {
        var j403 = await r.json();
        if (j403 && j403.messageUk) msg403 = j403.messageUk;
      } catch (e403) {
        /* ignore */
      }
      return { forbidden: true, messageUk: msg403 };
    }
    if (!r.ok) return null;
    var j = await r.json();
    return j && j.dungeon ? j.dungeon : null;
  }

  async function resyncAndLeaveDungeon(reasonUk) {
    if (window.L2 && typeof L2.fetchSnapshot === 'function') {
      try {
        await L2.fetchSnapshot();
      } catch (eSync) {
        /* ignore */
      }
    }
    dungeonNotify(reasonUk || 'Персонаж перемістився — оновлюємо карту.');
    window.location.href = '/map.html';
  }

  async function postDungeonMove(dungeonId, targetMapX, targetMapY) {
    var t = localStorage.getItem('token');
    var snap = window.L2 && typeof L2.lastSnapshot === 'function' ? L2.lastSnapshot() : null;
    if (!t || !snap) return { ok: false, err: 'no_session' };
    var r = await fetch('/game/dungeon/move', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + t,
      },
      body: JSON.stringify({
        dungeonId: dungeonId,
        targetMapX: targetMapX,
        targetMapY: targetMapY,
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
        var jErr = await r.json();
        if (jErr && jErr.messageUk) msg = jErr.messageUk;
      } catch (e) {
        /* ignore */
      }
      return { ok: false, err: msg };
    }
    var j = await r.json();
    if (j && j.character && L2.applyCharacterSnapshot) {
      L2.applyCharacterSnapshot(j.character);
    }
    return {
      ok: true,
      dungeon: j && j.dungeon ? j.dungeon : null,
    };
  }

  function setupMapControls(viewport, inner, img, opts) {
    opts = opts || {};
    var mapScale = 1;
    var lastPinchEnd = 0;
    var lastPointerX = null;
    var lastPointerY = null;
    var panDrag = null;
    var lastDragWasPan = false;
    var userMovedMap = false;

    function markUserMoved() {
      userMovedMap = true;
    }

    try {
      var sv = sessionStorage.getItem(MAP_SCALE_KEY);
      if (sv) {
        var parsed = parseFloat(sv);
        if (Number.isFinite(parsed)) {
          mapScale = Math.min(MAP_SCALE_MAX, Math.max(MAP_SCALE_MIN, parsed));
        }
      }
    } catch (e0) {
      /* ignore */
    }

    function applyMapScale() {
      if (!img || !img.naturalWidth) return;
      img.style.width = Math.round(img.naturalWidth * mapScale) + 'px';
      img.style.height = 'auto';
      if (viewport) {
        viewport.setAttribute('data-map-zoom', Math.round(mapScale * 100) + '%');
      }
      try {
        sessionStorage.setItem(MAP_SCALE_KEY, String(mapScale));
      } catch (e1) {
        /* ignore */
      }
    }

    function zoomToScale(newScale, clientX, clientY) {
      if (!viewport || !img || !img.naturalWidth) return;
      newScale = Math.min(MAP_SCALE_MAX, Math.max(MAP_SCALE_MIN, newScale));
      var oldScale = mapScale;
      if (Math.abs(newScale - oldScale) < 1e-9) return;
      markUserMoved();

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

    function zoomBy(delta) {
      var ax = lastPointerX != null ? lastPointerX : window.innerWidth / 2;
      var ay = lastPointerY != null ? lastPointerY : window.innerHeight / 2;
      zoomToScale(mapScale + delta, ax, ay);
    }

    function bindPan(el) {
      if (!el) return;
      el.addEventListener('mousedown', function (e) {
        if (e.button !== 0) return;
        if (isInteractiveDungeonTarget(e.target)) return;
        lastDragWasPan = false;
        panDrag = {
          x: e.clientX,
          y: e.clientY,
          sl: viewport.scrollLeft,
          st: viewport.scrollTop,
        };
        e.preventDefault();
      });
    }

    applyMapScale();

    var zIn = $('dungeon-map-zoom-in');
    var zOut = $('dungeon-map-zoom-out');
    if (zIn) {
      zIn.addEventListener('click', function (e) {
        e.stopPropagation();
        zoomBy(MAP_SCALE_STEP);
      });
    }
    if (zOut) {
      zOut.addEventListener('click', function (e) {
        e.stopPropagation();
        zoomBy(-MAP_SCALE_STEP);
      });
    }

    if (viewport) {
      viewport.style.cursor = 'grab';
      bindPan(viewport);

      viewport.addEventListener(
        'mousemove',
        function (e) {
          lastPointerX = e.clientX;
          lastPointerY = e.clientY;
        },
        { passive: true }
      );

      viewport.addEventListener(
        'scroll',
        function () {
          markUserMoved();
        },
        { passive: true }
      );

      window.addEventListener('mousemove', function (e) {
        if (!panDrag) return;
        var dx = e.clientX - panDrag.x;
        var dy = e.clientY - panDrag.y;
        if (Math.abs(dx) > DRAG_CLICK_MAX_PX || Math.abs(dy) > DRAG_CLICK_MAX_PX) {
          lastDragWasPan = true;
          markUserMoved();
          if (viewport.style.cursor !== 'grabbing') viewport.style.cursor = 'grabbing';
        }
        viewport.scrollLeft = panDrag.sl - dx;
        viewport.scrollTop = panDrag.st - dy;
      });

      window.addEventListener('mouseup', function () {
        panDrag = null;
        if (viewport) viewport.style.cursor = 'grab';
      });

      var pinchStartDist = 0;
      var pinchBaseScale = 1;
      viewport.addEventListener(
        'touchstart',
        function (e) {
          if (e.touches.length === 2) {
            var a = e.touches[0];
            var b = e.touches[1];
            pinchStartDist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
            pinchBaseScale = mapScale;
          } else if (e.touches.length === 1) {
            markUserMoved();
          }
        },
        { passive: true }
      );
      viewport.addEventListener(
        'touchmove',
        function (e) {
          if (e.touches.length !== 2 || pinchStartDist < 8) return;
          e.preventDefault();
          markUserMoved();
          var ta = e.touches[0];
          var tb = e.touches[1];
          var d = Math.hypot(ta.clientX - tb.clientX, ta.clientY - tb.clientY);
          var ratio = d / pinchStartDist;
          var midX = (ta.clientX + tb.clientX) / 2;
          var midY = (ta.clientY + tb.clientY) / 2;
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

      viewport.addEventListener(
        'wheel',
        function (e) {
          markUserMoved();
          if (e.ctrlKey) {
            e.preventDefault();
            var d = e.deltaY > 0 ? -MAP_SCALE_STEP : MAP_SCALE_STEP;
            zoomToScale(mapScale + d, e.clientX, e.clientY);
          }
        },
        { passive: false }
      );
    }

    if (img && typeof opts.onImageClick === 'function') {
      img.addEventListener('click', function (e) {
        if (isInteractiveDungeonTarget(e.target)) return;
        if (Date.now() - lastPinchEnd < 380) return;
        if (lastDragWasPan) {
          lastDragWasPan = false;
          return;
        }
        opts.onImageClick(e);
      });
    }

    return {
      applyMapScale: applyMapScale,
      maybeCenterOnPlayer: function (mapX, mapY) {
        if (userMovedMap) return;
        centerMapOnPlayer(viewport, img, mapX, mapY);
      },
      forceCenterOnPlayer: function (mapX, mapY) {
        centerMapOnPlayer(viewport, img, mapX, mapY);
      },
    };
  }

  async function init() {
    if (window.L2 && typeof L2.mountL2Nav === 'function') {
      L2.mountL2Nav({});
    }

    var t = localStorage.getItem('token');
    if (!t || !window.L2) {
      if (window.L2 && typeof L2.clearHudPanel === 'function') L2.clearHudPanel();
      return;
    }

    var dungeonId = queryDungeonId();
    var shouldEnter = queryEnterFlag();
    if (shouldEnter && dungeonId) stripEnterFromUrl(dungeonId);

    try {
      if (window.L2 && typeof L2.renderCharacterFromCache === 'function') {
        L2.renderCharacterFromCache();
      }
      var c =
        window.L2 && typeof L2.resyncCharacterWhenRequired === 'function'
          ? await L2.resyncCharacterWhenRequired()
          : null;
      if (c) {
        if (typeof L2.applyMutationSnapshot === 'function') {
          L2.applyMutationSnapshot(c);
        }
        var activeDid =
          c.activeDungeonId != null &&
          String(c.activeDungeonId).trim() !== ''
            ? String(c.activeDungeonId).trim()
            : null;
        if (activeDid && activeDid !== dungeonId) {
          window.location.replace(
            '/dungeon.html?dungeonId=' + encodeURIComponent(activeDid)
          );
          return;
        }
      }
    } catch (eChar) {
      /* ignore */
    }

    var errEl = $('dungeon-load-err');
    var content = $('dungeon-content');
    var titleEl = $('dungeon-title');
    var subEl = $('dungeon-sub');
    var imgEl = $('dungeon-map-img');
    var innerEl = $('dungeon-map-inner');
    var mobList = $('dungeon-mob-list');
    var mobMarkers = $('dungeon-mob-markers');
    var heroList = $('dungeon-hero-list');
    var heroSection = $('dungeon-hero-section');
    var heroMarkers = $('dungeon-hero-markers');
    var viewport = $('dungeon-map-viewport');
    var dot = $('dungeon-dot');
    var moveTarget = $('dungeon-move-target');
    var nearbyRadiusEl = $('dungeon-nearby-radius');
    var moveInFlight = false;
    var battleStartInFlight = false;
    var pvpStartInFlight = false;
    var currentDungeon = null;
    var nearbyMobById = {};
    var mapControls = null;
    var pollTimer = null;
    var didInitialCenter = false;

    if (!dungeonId) {
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent = 'Не вказано подземелля.';
      }
      return;
    }

    function playerLevelFromSnapshot() {
      var snap =
        window.L2 && typeof L2.lastSnapshot === 'function' ? L2.lastSnapshot() : null;
      var lv = snap && Number(snap.level);
      return Number.isFinite(lv) ? lv : 1;
    }

    function findNearbyMob(spawnId) {
      if (!spawnId) return null;
      return nearbyMobById[spawnId] || null;
    }

    function isMobInBattleRange(spawnId) {
      var mob = findNearbyMob(spawnId);
      if (!mob) return true;
      return mob.inBattleRange !== false;
    }

    async function startPvpFromDungeon(targetCharacterId) {
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
          if (window.L2 && typeof L2.resyncCharacterAfterConflict === 'function') {
            await L2.resyncCharacterAfterConflict(null, await r.json().catch(function () {
              return null;
            }));
          }
          snap =
            window.L2 && typeof L2.lastSnapshot === 'function' ? L2.lastSnapshot() : null;
          if (!snap) return;
          r = await postStart(snap.revision);
        }
        if (!r.ok) {
          var errMsg = 'Не вдалося розпочати PvP.';
          try {
            var ej = await r.json();
            if (ej && ej.messageUk) errMsg = ej.messageUk;
          } catch (eErr) {
            /* ignore */
          }
          dungeonNotify(errMsg);
          return;
        }
        var j = await r.json();
        if (j.character && L2.applyCharacterSnapshot) {
          L2.applyCharacterSnapshot(j.character);
        }
        window.location.href =
          '/battle.html?pvpTargetId=' + encodeURIComponent(targetCharacterId);
      } finally {
        pvpStartInFlight = false;
      }
    }

    async function walkToMobOnMap(mapX, mapY) {
      if (moveInFlight) return;
      if (!Number.isFinite(mapX) || !Number.isFinite(mapY)) return;
      moveInFlight = true;
      try {
        var r = await postDungeonMove(
          dungeonId,
          Math.floor(mapX),
          Math.floor(mapY)
        );
        if (r.ok && r.dungeon) {
          paintDungeon(r.dungeon);
          if (errEl) errEl.hidden = true;
        } else if (r.err === '409') {
          var fresh = await fetchDungeonView(dungeonId);
          if (fresh) paintDungeon(fresh);
          if (errEl) {
            errEl.hidden = false;
            errEl.textContent =
              'Конфлікт ревізії — оновлено з сервера. Спробуй ще раз.';
          }
        } else if (errEl && typeof r.err === 'string' && r.err !== '401') {
          errEl.hidden = false;
          errEl.textContent = r.err;
        }
      } finally {
        moveInFlight = false;
      }
    }

    async function walkToMobBySpawnId(spawnId) {
      var mob = findNearbyMob(spawnId);
      if (!mob) {
        dungeonNotify('Моб недоступний — оновлюю карту…');
        var freshMob = await fetchDungeonView(dungeonId);
        if (freshMob && freshMob.forbidden) {
          await resyncAndLeaveDungeon(freshMob.messageUk);
          return;
        }
        if (freshMob) paintDungeon(freshMob);
        return;
      }
      await walkToMobOnMap(mob.mapX, mob.mapY);
    }

    async function startBattleFromDungeon(spawnId) {
      if (!spawnId || battleStartInFlight) return;
      if (!isMobInBattleRange(spawnId)) {
        dungeonNotify('Підійди ближче до моба на карті подземелля.');
        return;
      }
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
          if (window.L2 && typeof L2.resyncCharacterAfterConflict === 'function') {
            await L2.resyncCharacterAfterConflict(null, await r.json().catch(function () {
              return null;
            }));
          }
          snap =
            window.L2 && typeof L2.lastSnapshot === 'function' ? L2.lastSnapshot() : null;
          if (!snap) return;
          r = await postStart(snap.revision);
        }
        if (!r.ok) {
          var errMsg = 'Не вдалося розпочати бій.';
          try {
            var ej = await r.json();
            if (ej && ej.messageUk) errMsg = ej.messageUk;
          } catch (eErr) {
            /* ignore */
          }
          dungeonNotify(errMsg);
          return;
        }
        var j = await r.json();
        if (j.character && L2.applyCharacterSnapshot) {
          L2.applyCharacterSnapshot(j.character);
        }
        window.location.href =
          '/battle.html?spawnId=' + encodeURIComponent(spawnId);
      } finally {
        battleStartInFlight = false;
      }
    }

    function onDungeonMobBattleClick(e) {
      e.preventDefault();
      e.stopPropagation();
      var a = e.currentTarget;
      if (!a) return;
      var href = a.getAttribute('href') || '';
      var m = href.match(/[?&]spawnId=([^&]+)/);
      var spawnId = m ? decodeURIComponent(m[1]) : '';
      if (!spawnId) return;
      var mob = findNearbyMob(spawnId);
      if (mob && mob.inBattleRange) {
        startBattleFromDungeon(spawnId);
        return;
      }
      walkToMobBySpawnId(spawnId);
    }

    var mobModal = $('dungeon-mob-modal');
    var mobModalBackdrop = $('dungeon-mob-modal-backdrop');
    var mobModalClose = $('dungeon-mob-modal-close');
    var mobModalIcon = $('dungeon-mob-modal-icon');
    var mobModalTitle = $('dungeon-mob-modal-title');
    var mobModalSub = $('dungeon-mob-modal-sub');
    var mobModalStats = $('dungeon-mob-modal-stats');
    var mobModalDrops = $('dungeon-mob-modal-drops');
    var mobModalSpoil = $('dungeon-mob-modal-spoil');
    var mobModalNote = $('dungeon-mob-modal-note');
    var mobModalBattle = $('dungeon-mob-modal-battle');

    function closeMobModal() {
      if (mobModal) mobModal.hidden = true;
    }

    function showMobModalLoading(spawnId) {
      if (mobModalIcon) {
        mobModalIcon.src = '/mobs/1.png';
        mobModalIcon.onerror = null;
      }
      if (mobModalTitle) mobModalTitle.textContent = 'Завантаження…';
      if (mobModalSub) mobModalSub.textContent = '';
      if (mobModalStats) mobModalStats.innerHTML = '';
      if (mobModalDrops) mobModalDrops.textContent = '…';
      if (mobModalSpoil) mobModalSpoil.innerHTML = '';
      if (mobModalNote) {
        mobModalNote.hidden = true;
        mobModalNote.textContent = '';
      }
      if (mobModalBattle) {
        mobModalBattle.href = '#';
        mobModalBattle.onclick = function (ev) {
          ev.preventDefault();
          closeMobModal();
          startBattleFromDungeon(spawnId);
        };
      }
      if (mobModal) mobModal.hidden = false;
    }

    async function openMobCatalog(spawnId) {
      if (!spawnId) return;
      if (window.L2 && typeof L2.onHelperMobClicked === 'function') {
        L2.onHelperMobClicked();
      }
      var tok = localStorage.getItem('token');
      if (!tok) return;
      showMobModalLoading(spawnId);
      try {
        var r = await fetch('/game/spawn/' + encodeURIComponent(spawnId) + '/info', {
          headers: { Authorization: 'Bearer ' + tok },
        });
        if (r.status === 401) {
          closeMobModal();
          localStorage.removeItem('token');
          window.location.href = '/';
          return;
        }
        if (!r.ok) {
          closeMobModal();
          dungeonNotify('Не вдалося завантажити дані моба.');
          return;
        }
        var j = await r.json();
      } catch (eFetch) {
        closeMobModal();
        dungeonNotify('Помилка мережі — не вдалося завантажити дані моба.');
        return;
      }
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
        if (j.rewardExp != null && j.rewardExp !== undefined) {
          addStat('EXP (за кілл)', j.rewardExp);
        }
        if (j.rewardSp != null && j.rewardSp !== undefined) {
          addStat('SP (за кілл)', j.rewardSp);
        }
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
        mobModalNote.hidden = true;
        mobModalNote.textContent = '';
      }
      if (mobModalBattle) {
        mobModalBattle.href = '#';
        mobModalBattle.textContent = isMobInBattleRange(spawnId)
          ? 'У бій'
          : 'У бій (підійди ближче)';
        mobModalBattle.onclick = function (ev) {
          ev.preventDefault();
          closeMobModal();
          startBattleFromDungeon(spawnId);
        };
      }
      if (mobModal) mobModal.hidden = false;
    }

    function onDungeonMobListClick(e) {
      var btn =
        e.target && e.target.closest ? e.target.closest('.l2-map-mob-icon-btn') : null;
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      var sid = btn.dataset.spawnId;
      if (sid) openMobCatalog(sid);
    }

    if (mobList) mobList.addEventListener('click', onDungeonMobListClick);
    if (mobModalBackdrop) mobModalBackdrop.addEventListener('click', closeMobModal);
    if (mobModalClose) mobModalClose.addEventListener('click', closeMobModal);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobModal && !mobModal.hidden) closeMobModal();
    });
    function onDungeonMobPinClick(e, pin) {
      e.preventDefault();
      e.stopPropagation();
      var sid = pin.dataset.spawnId;
      if (!sid) return;
      var mob = findNearbyMob(sid);
      if (mob && mob.inBattleRange) {
        startBattleFromDungeon(sid);
        return;
      }
      walkToMobBySpawnId(sid);
    }

    if (mobMarkers) {
      mobMarkers.addEventListener('pointerdown', function (e) {
        var pin =
          e.target && e.target.closest ? e.target.closest('.l2-map-mob-pin') : null;
        if (!pin) return;
        e.stopPropagation();
      });
      mobMarkers.addEventListener('click', function (e) {
        var pin =
          e.target && e.target.closest ? e.target.closest('.l2-map-mob-pin') : null;
        if (!pin) return;
        onDungeonMobPinClick(e, pin);
      });
    }

    function paintDungeon(d) {
      if (!d) return;
      currentDungeon = d;
      nearbyMobById = {};
      var mobRows = d.nearbyMobs || [];
      for (var mi = 0; mi < mobRows.length; mi++) {
        if (mobRows[mi] && mobRows[mi].id) {
          nearbyMobById[mobRows[mi].id] = mobRows[mi];
        }
      }
      var markerRows = d.mobMarkers || [];
      for (var mk = 0; mk < markerRows.length; mk++) {
        if (markerRows[mk] && markerRows[mk].id && !nearbyMobById[markerRows[mk].id]) {
          nearbyMobById[markerRows[mk].id] = markerRows[mk];
        }
      }
      if (titleEl) titleEl.textContent = d.labelEn || '—';
      if (subEl) subEl.textContent = d.labelUk || '';
      if (imgEl && d.mapImageUrl && imgEl.src !== d.mapImageUrl) {
        imgEl.src = d.mapImageUrl;
      }
      renderPlayer(d, imgEl, dot, moveTarget, nearbyRadiusEl);
      renderDungeonMobMarkers(imgEl, mobMarkers, d.mobMarkers || []);
      renderDungeonHeroMarkers(imgEl, heroMarkers, d.nearbyHeroes || []);
      renderDungeonHeroList(
        heroList,
        heroSection,
        d.nearbyHeroes || [],
        startPvpFromDungeon
      );
      renderDungeonMobList(
        mobList,
        d.nearbyMobs || [],
        playerLevelFromSnapshot(),
        onDungeonMobBattleClick
      );
      if (mapControls && d.player && imgEl && imgEl.naturalWidth) {
        if (
          !didInitialCenter &&
          typeof mapControls.forceCenterOnPlayer === 'function'
        ) {
          mapControls.forceCenterOnPlayer(d.player.mapX, d.player.mapY);
          didInitialCenter = true;
        } else if (
          d.player.mapMoving &&
          typeof mapControls.maybeCenterOnPlayer === 'function'
        ) {
          mapControls.maybeCenterOnPlayer(d.player.mapX, d.player.mapY);
        }
      }
    }

    function schedulePoll() {
      if (pollTimer) clearTimeout(pollTimer);
      var delay = document.hidden
        ? DUNGEON_POLL_HIDDEN_MS
        : currentDungeon &&
            currentDungeon.player &&
            currentDungeon.player.mapMoving
          ? DUNGEON_POLL_MOVE_MS
          : DUNGEON_POLL_IDLE_MS;
      pollTimer = setTimeout(async function () {
        pollTimer = null;
        if (document.hidden) {
          schedulePoll();
          return;
        }
        if (moveInFlight) {
          schedulePoll();
          return;
        }
        var d = await fetchDungeonView(dungeonId);
        if (d && d.forbidden) {
          if (currentDungeon && currentDungeon.player) {
            await resyncAndLeaveDungeon(
              d.messageUk ||
                'Сесію подземелля закрито (місто або карта на іншому пристрої).'
            );
            return;
          }
          schedulePoll();
          return;
        }
        if (d && d.player) paintDungeon(d);
        schedulePoll();
      }, delay);
    }

    function fillMobHint() {
      renderDungeonMobList(mobList, [], playerLevelFromSnapshot(), onDungeonMobBattleClick);
    }

    var first = null;
    if (shouldEnter) {
      var enterResult = await postDungeonEnter(dungeonId);
      if (enterResult.ok && enterResult.dungeon) {
        first = enterResult.dungeon;
      } else if (enterResult.err === '409') {
        var retryEnter = await postDungeonEnter(dungeonId);
        if (retryEnter.ok && retryEnter.dungeon) first = retryEnter.dungeon;
      }
    }
    if (!first) {
      first = await fetchDungeonView(dungeonId);
    }
    if (first && first.forbidden) {
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent =
          first.messageUk ||
          'Підійди до входу в некрополь або катакомби (телепорт зі списку катакомб).';
      }
      return;
    }
    if (!first) {
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent = 'Не вдалося увійти в подземелля.';
      }
      return;
    }

    fillMobHint();
    if (content) content.hidden = false;
    if (errEl) errEl.hidden = true;

    function onImgReady() {
      if (mapControls && mapControls.applyMapScale) mapControls.applyMapScale();
      paintDungeon(currentDungeon || first);
      if (
        mapControls &&
        first &&
        first.player &&
        !didInitialCenter &&
        typeof mapControls.forceCenterOnPlayer === 'function'
      ) {
        mapControls.forceCenterOnPlayer(first.player.mapX, first.player.mapY);
        didInitialCenter = true;
      }
    }

    if (imgEl) {
      mapControls = setupMapControls(viewport, innerEl, imgEl, {
        onImageClick: async function (e) {
          if (moveInFlight) return;
          if (!imgEl.naturalWidth) return;
          var pix = clickToPixel(e, imgEl);
          moveInFlight = true;
          try {
            var r = await postDungeonMove(
              dungeonId,
              Math.floor(pix.mx),
              Math.floor(pix.my)
            );
            if (r.ok && r.dungeon) {
              paintDungeon(r.dungeon);
              if (errEl) errEl.hidden = true;
            } else if (r.err === '409') {
              var fresh = await fetchDungeonView(dungeonId);
              if (fresh) paintDungeon(fresh);
              if (errEl) {
                errEl.hidden = false;
                errEl.textContent =
                  'Конфлікт ревізії — оновлено з сервера. Спробуй ще раз.';
              }
            } else if (errEl && typeof r.err === 'string' && r.err !== '401') {
              errEl.hidden = false;
              errEl.textContent = r.err;
            }
          } finally {
            moveInFlight = false;
          }
        },
      });

      imgEl.addEventListener('load', onImgReady);
      currentDungeon = first;
      if (first.mapImageUrl) imgEl.src = first.mapImageUrl;
      if (imgEl.complete && imgEl.naturalWidth > 0) onImgReady();
      else paintDungeon(first);
    }

    schedulePoll();

    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) schedulePoll();
    });

    window.addEventListener('beforeunload', function () {
      if (pollTimer) clearTimeout(pollTimer);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
