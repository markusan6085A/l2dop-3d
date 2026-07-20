/**
 * Склад у місті — перегляд і забрати предмети в інвентар.
 */
(function () {
  var PAGE_SIZE = 15;
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

  function formatEnchantedName(name, enchant) {
    if (window.L2 && typeof L2.formatEnchantedItemName === 'function') {
      return L2.formatEnchantedItemName(name, enchant);
    }
    var en = Number(enchant);
    if (!Number.isFinite(en) || en <= 0) return String(name || '');
    return '+' + String(Math.floor(en)) + ' ' + String(name || '');
  }

  function itemIconUrlForId(id) {
    if (window.L2 && typeof L2.resolveItemIconUrl === 'function') {
      return L2.resolveItemIconUrl(id, '/icons/drops/other.svg');
    }
    if (id > 0) return '/game/item-icon/' + id;
    return '/icons/drops/other.svg';
  }

  function setItemIconSrc(img, itemId, enchantLevel) {
    if (window.L2 && typeof L2.setItemIconWithEnchantBadge === 'function') {
      L2.setItemIconWithEnchantBadge(img, itemId, enchantLevel != null ? enchantLevel : 0);
      return;
    }
    if (!img) return;
    img.decoding = 'async';
    img.src = itemIconUrlForId(itemId);
    img.onerror = function () {
      img.onerror = null;
      img.src = '/icons/drops/other.svg';
    };
  }

  function itemStatsParts(id, enchant) {
    var sl = window.L2 && L2.itemSlotById && L2.itemSlotById[id];
    var seg = null;
    if (sl === 'rhand') seg = 'weapon';
    else if (sl === 'lhand' || sl === 'shield') seg = 'shield';
    else if (
      sl === 'chest' ||
      sl === 'legs' ||
      sl === 'head' ||
      sl === 'gloves' ||
      sl === 'feet' ||
      sl === 'fullarmor'
    ) {
      seg = 'armor';
    } else if (sl === 'ring' || sl === 'neck' || sl === 'earring') {
      seg = 'accessor';
    }
    if (
      seg !== 'weapon' &&
      seg !== 'armor' &&
      seg !== 'shield' &&
      seg !== 'accessor'
    ) {
      return [];
    }
    if (window.L2 && typeof L2.buildItemEnchantAwareStatLines === 'function') {
      return L2.buildItemEnchantAwareStatLines(id, enchant, { compact: true }).map(
        function (ln) {
          return { label: ln.labelUk, value: ln.valueUk };
        }
      );
    }
    if (window.L2 && typeof L2.buildItemStatsPreviewLines === 'function') {
      return L2.buildItemStatsPreviewLines(id).map(function (ln) {
        return { label: ln.labelUk, value: ln.valueUk };
      });
    }
    return [];
  }

  function appendRowStats(container, parts) {
    if (!container || !parts || !parts.length) return;
    for (var pi = 0; pi < parts.length; pi++) {
      if (pi > 0) {
        var sep = document.createElement('span');
        sep.className = 'l2-item-stat-sep';
        sep.textContent = ' | ';
        container.appendChild(sep);
      }
      var part = parts[pi];
      if (window.L2 && typeof L2.appendColoredItemStatPair === 'function') {
        L2.appendColoredItemStatPair(container, part.label, part.value);
      } else {
        var plain = document.createElement('span');
        plain.className = 'l2-item-stat-plain';
        plain.textContent = part.label + ' ' + part.value;
        container.appendChild(plain);
      }
    }
  }

  function itemNameClasses(itemId) {
    if (window.L2 && typeof L2.itemNameClassNames === 'function') {
      return L2.itemNameClassNames(itemId, 'l2-warehouse-name l2-item-name');
    }
    return 'l2-warehouse-name l2-item-name';
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
    if (currentPage >= totalPages) currentPage = Math.max(0, totalPages - 1);

    var prev = document.createElement('button');
    prev.type = 'button';
    prev.className = 'l2-warehouse-pager-btn';
    prev.textContent = '<';
    prev.setAttribute('aria-label', 'Попередня сторінка');
    prev.disabled = currentPage <= 0;
    prev.addEventListener('click', function () {
      if (currentPage > 0) {
        currentPage -= 1;
        renderList(window.L2 && L2.lastSnapshot ? L2.lastSnapshot() : null);
      }
    });
    pager.appendChild(prev);

    var next = document.createElement('button');
    next.type = 'button';
    next.className = 'l2-warehouse-pager-btn';
    next.textContent = '>';
    next.setAttribute('aria-label', 'Наступна сторінка');
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
      setItemIconSrc(ico, itemId, enchant);

      var mid = document.createElement('div');
      mid.className = 'l2-warehouse-mid';

      var name = document.createElement('div');
      name.className = itemNameClasses(itemId);
      var line = warehouseShortName(itemId) + qtySuffix(qty);
      name.textContent = line;
      mid.appendChild(name);

      var statsRow = document.createElement('div');
      statsRow.className = 'l2-warehouse-stats-row';

      var statParts = itemStatsParts(itemId, enchant);
      if (statParts.length) {
        var statsEl = document.createElement('div');
        statsEl.className = 'l2-warehouse-stats';
        appendRowStats(statsEl, statParts);
        statsRow.appendChild(statsEl);
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

    if (window.L2 && typeof L2.renderCharacterFromCache === 'function') {
      L2.renderCharacterFromCache();
    }
    var c =
      window.L2 && typeof L2.resyncCharacterWhenRequired === 'function'
        ? await L2.resyncCharacterWhenRequired()
        : null;
    if (!c) {
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent = 'Не вдалося завантажити героя.';
      }
      return;
    }
    if (window.L2 && typeof L2.fetchCatalogHints === 'function') {
      await L2.fetchCatalogHints();
    }
    if (window.L2 && typeof L2.applyMutationSnapshot === 'function') {
      L2.applyMutationSnapshot(c);
    }

    if (content) content.removeAttribute('hidden');
    renderList(c);
  }

  init();
})();
