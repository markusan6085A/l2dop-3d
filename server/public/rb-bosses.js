/**
 * Сторінка «РБ-боси»: список, модалка інфо/дроп, телепорт на карту.
 */
(function () {
  var teleportInFlight = false;
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

  function renderList(data) {
    var list = $('rb-list');
    if (!list) return;
    list.innerHTML = '';
    var bosses = (data && data.bosses) || [];
    if (!bosses.length) {
      list.textContent = 'Рейд-босів не знайдено.';
      return;
    }
    for (var i = 0; i < bosses.length; i++) {
      var b = bosses[i];
      var row = document.createElement('div');
      row.className = 'l2-rb-row';

      var left = document.createElement('button');
      left.type = 'button';
      left.className = 'l2-rb-row__name';
      left.setAttribute('data-spawn-id', b.spawnId);
      left.addEventListener('click', function () {
        openModal(this.getAttribute('data-spawn-id'));
      });

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
      tp.addEventListener('click', function () {
        doTeleport(this.getAttribute('data-spawn-id'));
      });

      right.appendChild(price);
      right.appendChild(tp);
      row.appendChild(left);
      row.appendChild(right);
      list.appendChild(row);
    }

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

  async function loadPage(page) {
    var err = $('rb-load-err');
    if (err) err.hidden = true;
    var tok = localStorage.getItem('token');
    if (!tok) {
      window.location.href = '/';
      return;
    }
    var r = await fetch('/game/raid-bosses?page=' + encodeURIComponent(String(page)), {
      headers: authHeaders(),
    });
    if (r.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
      return;
    }
    if (!r.ok) {
      if (err) {
        err.hidden = false;
        err.textContent = 'Не вдалося завантажити список РБ.';
      }
      return;
    }
    var data = await r.json();
    renderList(data);
    setPageInUrl(data.page || page);
    return data;
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
        headers: Object.assign(
          { 'Content-Type': 'application/json' },
          authHeaders()
        ),
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
        alert(
          (j && j.messageUk) ||
            'Телепорт не вдався.'
        );
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
      L2.mountL2Nav();
    }
    wirePager();

    var closeBtn = $('rb-modal-close');
    var backdrop = $('rb-modal-backdrop');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (backdrop) backdrop.addEventListener('click', closeModal);

    var tok = localStorage.getItem('token');
    if (!tok) {
      window.location.href = '/';
      return;
    }
    (function () {
      if (window.L2 && typeof L2.renderCharacterFromCache === 'function') {
        L2.renderCharacterFromCache();
      }
      return window.L2 && typeof L2.resyncCharacterWhenRequired === 'function'
        ? L2.resyncCharacterWhenRequired()
        : Promise.resolve(null);
    })()
      .then(function (c) {
        if (c && typeof L2.applyMutationSnapshot === 'function') {
          L2.applyMutationSnapshot(c);
        }
      })
      .finally(function () {
        loadPage(readPageFromUrl());
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
