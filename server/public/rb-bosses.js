/**
 * Сторінка «РБ-боси»: список, модалка інфо/дроп, телепорт на карту.
 */
(function () {
  var SKELETON_ROWS = 15;
  var teleportInFlight = false;
  var listInFlight = false;
  var listLoadedOnce = false;
  var modalSpawnId = null;

  function $(id) {
    return document.getElementById(id);
  }

  function authHeaders() {
    var tok = localStorage.getItem('token');
    return tok ? { Authorization: 'Bearer ' + tok } : {};
  }

  function readPageFromUrl() {
    var u = new URL(window.location.href);
    var p = parseInt(u.searchParams.get('page') || '1', 10);
    return isFinite(p) && p > 0 ? p : 1;
  }

  function setPageInUrl(page) {
    var u = new URL(window.location.href);
    u.searchParams.set('page', String(page));
    window.history.replaceState({}, '', u.pathname + u.search);
  }

  function replaceListContent(listEl, frag) {
    listEl.innerHTML = '';
    listEl.appendChild(frag);
  }

  function formatDropChance(d) {
    if (d.chancePerMillion != null) {
      var p = d.chancePerMillion / 10000;
      if (!isFinite(p) || p <= 0) return '0%';
      return p.toFixed(p < 1 ? 2 : 1) + '%';
    }
    if (d.chance != null) return (d.chance * 100).toFixed(1) + '%';
    return '—';
  }

  function formatDropQty(r) {
    var min = r.min;
    var max = r.max;
    if (min == null && max == null) return '';
    if (min == null) min = max;
    if (max == null) max = min;
    if (r.kind === 'adena' || r.l2ItemId === 57) {
      if (min === max) return String(min) + ' ад.';
      return String(min) + '–' + String(max) + ' ад.';
    }
    if (min === max) return '×' + String(min);
    return '×' + String(min) + '–' + String(max);
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
      img.src = r.iconUrl || '/icons/drops/other.svg';
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

  function closeModal() {
    var modal = $('rb-modal');
    if (modal) modal.hidden = true;
    modalSpawnId = null;
  }

  async function openModal(spawnId) {
    if (!spawnId) return;
    modalSpawnId = spawnId;
    var tok = localStorage.getItem('token');
    if (!tok) {
      window.location.href = '/';
      return;
    }
    var r = await fetch('/game/spawn/' + encodeURIComponent(spawnId) + '/info', {
      headers: authHeaders(),
    });
    if (r.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
      return;
    }
    if (!r.ok) return;
    var j = await r.json();
    var icon = $('rb-modal-icon');
    if (icon) {
      icon.src = j.icon || '/mobs/1.png';
      icon.onerror = function () {
        icon.src = '/mobs/1.png';
      };
    }
    var title = $('rb-modal-title');
    if (title) title.textContent = j.name || '—';
    var sub = $('rb-modal-sub');
    if (sub) {
      sub.textContent =
        'рів. ' +
        (j.level != null ? j.level : '—') +
        ' · рейд-бос' +
        (j.aggressive ? ' · агресивний' : '');
    }
    var stats = $('rb-modal-stats');
    if (stats) {
      stats.innerHTML = '';
      var st = j.stats || {};
      function addStat(k, v) {
        var dt = document.createElement('dt');
        dt.textContent = k;
        var dd = document.createElement('dd');
        dd.textContent = v != null ? String(v) : '—';
        stats.appendChild(dt);
        stats.appendChild(dd);
      }
      addStat('HP (max)', st.maxHp);
      addStat('P.Atk', st.pAtk);
      addStat('P.Def', st.pDef);
      addStat('M.Atk', st.mAtk);
      addStat('M.Def', st.mDef);
      if (j.rewardExp != null) addStat('EXP (за кілл)', j.rewardExp);
      if (j.rewardSp != null) addStat('SP (за кілл)', j.rewardSp);
    }
    renderDropList($('rb-modal-drops'), j.drops);
    var spoilWrap = $('rb-modal-spoil-wrap');
    if (spoilWrap) spoilWrap.hidden = j.viewerMaySeeSpoil !== true;
    renderDropList($('rb-modal-spoil'), j.spoil || []);
    var modal = $('rb-modal');
    if (modal) modal.hidden = false;
  }

  function createSkeletonRow() {
    var row = document.createElement('div');
    row.className = 'l2-rb-row l2-rb-row--skeleton';
    row.setAttribute('aria-hidden', 'true');

    var left = document.createElement('div');
    left.className = 'l2-rb-row__name';
    var ico = document.createElement('img');
    ico.className = 'l2-rb-row__ico';
    ico.src = '/mobs/1.png';
    ico.alt = '';
    ico.width = 24;
    ico.height = 24;
    ico.decoding = 'async';
    var label = document.createElement('span');
    label.className = 'l2-rb-row__label';
    label.textContent = '…';
    left.appendChild(ico);
    left.appendChild(label);

    var right = document.createElement('div');
    right.className = 'l2-rb-row__actions';
    var price = document.createElement('span');
    price.className = 'l2-rb-row__price';
    price.textContent = '( … )';
    var tp = document.createElement('span');
    tp.className = 'l2-rb-row__tp';
    tp.textContent = '…';
    right.appendChild(price);
    right.appendChild(tp);

    row.appendChild(left);
    row.appendChild(right);
    return row;
  }

  function renderListSkeleton() {
    var list = $('rb-list');
    if (!list) return;
    var frag = document.createDocumentFragment();
    for (var i = 0; i < SKELETON_ROWS; i++) {
      frag.appendChild(createSkeletonRow());
    }
    replaceListContent(list, frag);
  }

  function renderListError(message) {
    var list = $('rb-list');
    if (!list) return;
    var err = document.createElement('p');
    err.className = 'l2-rb-list__error';
    err.textContent = message || 'Не вдалося завантажити список РБ.';
    var frag = document.createDocumentFragment();
    frag.appendChild(err);
    replaceListContent(list, frag);
  }

  function buildBossRow(b) {
    var row = document.createElement('div');
    row.className = 'l2-rb-row';

    var left = document.createElement('button');
    left.type = 'button';
    left.className = 'l2-rb-row__name';
    left.setAttribute('data-spawn-id', b.spawnId);

    var ico = document.createElement('img');
    ico.className = 'l2-rb-row__ico';
    ico.src = b.icon || '/mobs/1.png';
    ico.alt = '';
    ico.width = 24;
    ico.height = 24;
    ico.decoding = 'async';
    ico.onerror = function () {
      ico.src = '/mobs/1.png';
    };

    var label = document.createElement('span');
    label.className = 'l2-rb-row__label';
    label.textContent = b.name + ' · рів. ' + b.level;

    left.appendChild(ico);
    left.appendChild(label);

    var right = document.createElement('div');
    right.className = 'l2-rb-row__actions';

    var price = document.createElement('span');
    price.className = 'l2-rb-row__price';
    var cost = b.adenaCost != null ? b.adenaCost : 1;
    price.appendChild(document.createTextNode('('));
    var gold = document.createElement('span');
    gold.className = 'l2-rb-row__price-gold';
    gold.textContent = 'Аден ' + String(cost);
    price.appendChild(gold);
    price.appendChild(document.createTextNode(')'));

    var tp = document.createElement('button');
    tp.type = 'button';
    tp.className = 'l2-rb-row__tp';
    tp.textContent = 'Телепорт';
    tp.setAttribute('data-spawn-id', b.spawnId);

    right.appendChild(price);
    right.appendChild(tp);
    row.appendChild(left);
    row.appendChild(right);
    return row;
  }

  function renderPager(data) {
    var pager = $('rb-pager');
    var ind = $('rb-pager-ind');
    var prev = $('rb-pager-prev');
    var next = $('rb-pager-next');
    if (!pager || !ind) return;
    if (!data || data.totalPages <= 1) {
      pager.hidden = true;
      return;
    }
    pager.hidden = false;
    ind.textContent = data.page + ' / ' + data.totalPages + ' (' + data.total + ')';
    if (prev) prev.disabled = data.page <= 1;
    if (next) next.disabled = data.page >= data.totalPages;
  }

  function renderList(data) {
    var list = $('rb-list');
    if (!list) return;
    var bosses = (data && data.bosses) || [];
    if (!bosses.length) {
      var empty = document.createElement('p');
      empty.className = 'l2-rb-list__error';
      empty.textContent = 'Рейд-босів не знайдено.';
      var frag = document.createDocumentFragment();
      frag.appendChild(empty);
      replaceListContent(list, frag);
      renderPager(data);
      return;
    }

    var frag = document.createDocumentFragment();
    for (var i = 0; i < bosses.length; i++) {
      frag.appendChild(buildBossRow(bosses[i]));
    }
    replaceListContent(list, frag);
    renderPager(data);
  }

  function wireListDelegation() {
    var list = $('rb-list');
    if (!list || list.dataset.rbDelegated === '1') return;
    list.dataset.rbDelegated = '1';
    list.addEventListener('click', function (e) {
      var tpBtn =
        e.target && e.target.closest ? e.target.closest('.l2-rb-row__tp') : null;
      if (tpBtn) {
        var tpId = tpBtn.getAttribute('data-spawn-id');
        if (tpId) doTeleport(tpId);
        return;
      }
      var nameBtn =
        e.target && e.target.closest ? e.target.closest('.l2-rb-row__name') : null;
      if (nameBtn) {
        var spawnId = nameBtn.getAttribute('data-spawn-id');
        if (spawnId) openModal(spawnId);
      }
    });
  }

  async function loadPage(page) {
    if (listInFlight) return null;
    var err = $('rb-load-err');
    if (err) {
      err.hidden = true;
      err.textContent = '';
    }
    var tok = localStorage.getItem('token');
    if (!tok) {
      window.location.href = '/';
      return null;
    }

    listInFlight = true;
    if (!listLoadedOnce) {
      renderListSkeleton();
    }

    try {
      var r = await fetch('/game/raid-bosses?page=' + encodeURIComponent(String(page)), {
        headers: authHeaders(),
      });
      if (r.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/';
        return null;
      }
      if (!r.ok) {
        if (err) {
          err.hidden = false;
          err.textContent = 'Не вдалося завантажити список РБ.';
        }
        if (!listLoadedOnce) {
          renderListError('Не вдалося завантажити список РБ.');
        }
        return null;
      }
      var data = await r.json();
      renderList(data);
      setPageInUrl(data.page || page);
      listLoadedOnce = true;
      return data;
    } catch (_e) {
      if (err) {
        err.hidden = false;
        err.textContent = 'Не вдалося завантажити список РБ.';
      }
      if (!listLoadedOnce) {
        renderListError('Не вдалося завантажити список РБ.');
      }
      return null;
    } finally {
      listInFlight = false;
    }
  }

  async function doTeleport(spawnId) {
    if (!spawnId || teleportInFlight) return;
    var snap = window.L2 && L2.lastSnapshot ? L2.lastSnapshot() : null;
    if (!snap || snap.revision == null) {
      alert('Завантаж персонажа (онови сторінку).');
      return;
    }
    teleportInFlight = true;
    try {
      var r = await fetch('/game/raid-boss/teleport', {
        method: 'POST',
        headers: Object.assign({ 'Content-Type': 'application/json' }, authHeaders()),
        body: JSON.stringify({
          spawnId: spawnId,
          expectedRevision: snap.revision,
        }),
      });
      if (r.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/';
        return;
      }
      if (r.status === 409 && window.L2 && L2.resyncCharacterAfterConflict) {
        await L2.resyncCharacterAfterConflict();
        alert('Стан оновлено — спробуй телепорт ще раз.');
        return;
      }
      var j = null;
      try {
        j = await r.json();
      } catch (eJson) {
        j = null;
      }
      if (!r.ok) {
        alert((j && j.messageUk) || 'Телепорт не вдався.');
        return;
      }
      if (j && j.character && L2.applyCharacterSnapshot) {
        L2.applyCharacterSnapshot(j.character);
      }
      window.location.href = '/map.html';
    } finally {
      teleportInFlight = false;
    }
  }

  function wirePager() {
    var prev = $('rb-pager-prev');
    var next = $('rb-pager-next');
    if (prev) {
      prev.addEventListener('click', function () {
        var p = readPageFromUrl();
        if (p > 1) loadPage(p - 1);
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        var p = readPageFromUrl();
        loadPage(p + 1);
      });
    }
  }

  function init() {
    if (window.L2 && typeof L2.mountL2Nav === 'function') {
      L2.mountL2Nav({});
    }
    wirePager();
    wireListDelegation();

    var closeBtn = $('rb-modal-close');
    var backdrop = $('rb-modal-backdrop');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (backdrop) backdrop.addEventListener('click', closeModal);

    var tok = localStorage.getItem('token');
    if (!tok) {
      window.location.href = '/';
      return;
    }

    if (window.L2 && typeof L2.renderCharacterFromCache === 'function') {
      L2.renderCharacterFromCache();
    }
    if (window.L2 && typeof L2.resyncCharacterWhenRequired === 'function') {
      void L2.resyncCharacterWhenRequired()
        .then(function (c) {
          if (c && typeof L2.applyMutationSnapshot === 'function') {
            L2.applyMutationSnapshot(c);
          }
        })
        .catch(function () {
          /* optional for list reveal */
        });
    }

    loadPage(readPageFromUrl());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
