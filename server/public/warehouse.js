/**
 * Склад у місті — перегляд і забрати предмети в інвентар.
 */
(function () {
  var PAGE_SIZE = 10;
  var currentPage = 0;
  var withdrawInFlight = false;

  function $(id) {
    return document.getElementById(id);
  }

  function setMsg(text) {
    var el = $('warehouse-msg');
    if (el) el.textContent = text || '';
  }

  function itemDisplayName(id) {
    var n = window.L2 && L2.itemNameById && L2.itemNameById[id];
    return n != null ? n : '#' + id;
  }

  function warehouseShortName(id) {
    var n = itemDisplayName(id);
    if (!n || n.charAt(0) === '#') return n;
    return n
      .replace(/\s+[A-Za-z]+-grade\.?$/i, '')
      .replace(/\.+$/, '')
      .trim();
  }

  function itemIconUrlForId(id) {
    if (window.L2 && typeof L2.resolveItemIconUrl === 'function') {
      return L2.resolveItemIconUrl(id, '/icons/drops/other.svg');
    }
    if (id > 0) return '/game/item-icon/' + id;
    return '/icons/drops/other.svg';
  }

  function setItemIconSrc(img, itemId) {
    if (!img) return;
    img.decoding = 'async';
    img.src = itemIconUrlForId(itemId);
    img.onerror = function () {
      img.onerror = null;
      img.src = '/icons/drops/other.svg';
    };
  }

  function qtySuffix(qty) {
    var q = Number(qty);
    if (!Number.isFinite(q) || q <= 1) return '';
    return ' (x' + String(q) + ')';
  }

  function warehouseStacks(snap) {
    if (!snap || !snap.warehouse || !Array.isArray(snap.warehouse.stacks)) {
      return [];
    }
    return snap.warehouse.stacks.slice();
  }

  function renderCapacity(snap) {
    var capEl = $('warehouse-capacity-text');
    if (!capEl || !snap || !snap.warehouse) return;
    var used = snap.warehouse.usedSlots != null ? snap.warehouse.usedSlots : 0;
    var max = snap.warehouse.maxSlots != null ? snap.warehouse.maxSlots : 100;
    capEl.textContent = 'Вмістимість: ' + used + '/' + max;
  }

  function renderPager(totalItems) {
    var pager = $('warehouse-pager');
    if (!pager) return;
    pager.innerHTML = '';
    if (totalItems <= PAGE_SIZE) {
      pager.hidden = true;
      return;
    }
    pager.hidden = false;
    var totalPages = Math.ceil(totalItems / PAGE_SIZE);

    var prev = document.createElement('button');
    prev.type = 'button';
    prev.className = 'l2-warehouse-pager-btn';
    prev.textContent = '<<<';
    prev.disabled = currentPage <= 0;
    prev.addEventListener('click', function () {
      if (currentPage > 0) {
        currentPage -= 1;
        renderList(window.L2 && L2.lastSnapshot ? L2.lastSnapshot() : null);
      }
    });
    pager.appendChild(prev);

    for (var p = 0; p < totalPages; p++) {
      (function (pageIdx) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className =
          'l2-warehouse-pager-btn' +
          (pageIdx === currentPage ? ' l2-warehouse-pager-btn--active' : '');
        btn.textContent = String(pageIdx + 1);
        if (pageIdx !== currentPage) {
          btn.addEventListener('click', function () {
            currentPage = pageIdx;
            renderList(window.L2 && L2.lastSnapshot ? L2.lastSnapshot() : null);
          });
        }
        pager.appendChild(btn);
      })(p);
    }

    var next = document.createElement('button');
    next.type = 'button';
    next.className = 'l2-warehouse-pager-btn';
    next.textContent = '>>>';
    next.disabled = currentPage >= totalPages - 1;
    next.addEventListener('click', function () {
      if (currentPage < totalPages - 1) {
        currentPage += 1;
        renderList(window.L2 && L2.lastSnapshot ? L2.lastSnapshot() : null);
      }
    });
    pager.appendChild(next);
  }

  async function withdrawStack(itemId, enchant, qty) {
    if (withdrawInFlight) return;
    var t = localStorage.getItem('token');
    if (!t || !window.L2 || typeof L2.lastSnapshot !== 'function') return;
    var snap = L2.lastSnapshot();
    if (!snap || snap.revision == null) return;

    withdrawInFlight = true;
    setMsg('Забираємо зі складу…');
    try {
      var body = {
        itemId: itemId,
        enchant: enchant,
        expectedRevision: snap.revision,
      };
      if (qty != null) body.qty = qty;

      var r = await fetch('/character/warehouse/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + t,
        },
        body: JSON.stringify(body),
      });

      if (r.status === 409) {
        if (typeof L2.resyncCharacterAfterConflict === 'function') {
          await L2.resyncCharacterAfterConflict(function (c) {
            renderList(c);
          });
        }
        setMsg('Стан оновлено — спробуй ще раз.');
        return;
      }

      var j = {};
      try {
        j = await r.json();
      } catch (eJson) {
        j = {};
      }

      if (!r.ok) {
        setMsg(j && j.messageUk ? j.messageUk : 'Не вдалося забрати предмет.');
        return;
      }

      if (j.character) {
        if (typeof L2.applyCharacterSnapshot === 'function') {
          L2.applyCharacterSnapshot(j.character);
        } else {
          L2.setLastSnapshot(j.character);
          if (typeof L2.applyHudFromSnapshot === 'function') {
            L2.applyHudFromSnapshot(j.character);
          }
        }
        renderList(j.character);
      }
      setMsg('Предмет у сумці.');
    } finally {
      withdrawInFlight = false;
    }
  }

  function renderList(snap) {
    var root = $('warehouse-list');
    var empty = $('warehouse-empty');
    if (!root) return;

    var stacks = warehouseStacks(snap);
    renderCapacity(snap);
    root.innerHTML = '';

    if (stacks.length === 0) {
      if (empty) empty.hidden = false;
      renderPager(0);
      return;
    }
    if (empty) empty.hidden = true;

    var pageStart = currentPage * PAGE_SIZE;
    var pageItems = stacks.slice(pageStart, pageStart + PAGE_SIZE);
    renderPager(stacks.length);

    pageItems.forEach(function (st) {
      var itemId = Number(st.itemId);
      var qty = Number(st.qty);
      var enchant = st.enchant != null ? Number(st.enchant) : 0;
      if (!Number.isFinite(enchant) || enchant < 0) enchant = 0;

      var row = document.createElement('div');
      row.className = 'l2-warehouse-row';

      var ico = document.createElement('img');
      ico.className = 'l2-warehouse-ico';
      ico.alt = '';
      setItemIconSrc(ico, itemId);

      var mid = document.createElement('div');
      mid.className = 'l2-warehouse-mid';

      var name = document.createElement('div');
      name.className = 'l2-warehouse-name';
      var line = warehouseShortName(itemId) + qtySuffix(qty);
      if (enchant > 0) line += ' +' + enchant;
      name.textContent = line;
      mid.appendChild(name);

      var statsRow = document.createElement('div');
      statsRow.className = 'l2-warehouse-stats-row';

      if (window.L2 && typeof L2.buildItemStatsCompactLine === 'function') {
        var compact = L2.buildItemStatsCompactLine(itemId);
        if (compact) {
          var statsEl = document.createElement('div');
          statsEl.className = 'l2-warehouse-stats';
          statsEl.textContent = compact;
          statsRow.appendChild(statsEl);
        }
      }

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'l2-warehouse-action';
      btn.textContent = '[Забрати зі складу]';
      btn.addEventListener('click', function () {
        withdrawStack(itemId, enchant, qty);
      });

      statsRow.appendChild(btn);
      mid.appendChild(statsRow);
      row.appendChild(ico);
      row.appendChild(mid);
      root.appendChild(row);
    });
  }

  async function init() {
    if (window.L2 && typeof L2.mountL2Nav === 'function') {
      L2.mountL2Nav();
    }
    if (window.L2 && typeof L2.mountFootLinkBar === 'function') {
      L2.mountFootLinkBar('l2-foot-links', { inset: true });
    }

    var expandBtn = $('warehouse-expand-stub');
    if (expandBtn) {
      expandBtn.hidden = false;
      expandBtn.addEventListener('click', function () {
        setMsg('«Збільшити (+)» — з’явиться пізніше.');
      });
    }

    var t = localStorage.getItem('token');
    var errEl = $('warehouse-load-err');
    var content = $('warehouse-content');

    if (!t) {
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent = 'Потрібен вхід. Перейди на головну.';
      }
      if (window.L2 && typeof L2.clearHudPanel === 'function') L2.clearHudPanel();
      return;
    }

    var r = await fetch('/character', {
      headers: { Authorization: 'Bearer ' + t },
    });
    if (r.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
      return;
    }
    if (!r.ok) {
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent = 'Не вдалося завантажити героя.';
      }
      return;
    }

    var j = await r.json();
    var c = j.character;
    if (window.L2 && typeof L2.fetchCatalogHints === 'function') {
      await L2.fetchCatalogHints();
    }
    if (window.L2) {
      L2.setLastSnapshot(c);
      if (j.gearCatalog && typeof L2.mergeGearCatalog === 'function') {
        L2.mergeGearCatalog(j.gearCatalog);
      }
      if (typeof L2.applyHudFromSnapshot === 'function') {
        L2.applyHudFromSnapshot(c);
      }
    }

    if (content) content.removeAttribute('hidden');
    renderList(c);
  }

  init();
})();
