/**
 * Ринок — продати речі (список інвентаря).
 */
(function () {
  var PAGE_SIZE = 15;
  var currentPage = 0;
  var activeCat = 'all';
  var COIN_OF_LUCK_ITEM_ID = 4037;

  var CAT_TABS = [
    ['all', 'Все'],
    ['weapon', 'Зброя'],
    ['armor', 'Броня'],
    ['accessor', 'Аксесуари'],
    ['consumable', 'Розхідники'],
  ];

  function $(id) {
    return document.getElementById(id);
  }

  function itemDisplayName(id) {
    if (window.L2 && typeof L2.itemDisplayNameWithGrade === 'function') {
      return L2.itemDisplayNameWithGrade(id);
    }
    var n = window.L2 && L2.itemNameById && L2.itemNameById[id];
    return n != null ? n : '#' + id;
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

  function qtySuffix(itemId, qty) {
    var q = Number(qty);
    if (!Number.isFinite(q) || q <= 1) return '';
    return ' (x' + String(q) + ')';
  }

  function itemStatsParts(id) {
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
        sep.textContent = ' · ';
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

  function inventoryStacks(snap) {
    if (!snap || !snap.inventory || !Array.isArray(snap.inventory.stacks)) {
      return [];
    }
    return snap.inventory.stacks.filter(function (st) {
      return Number(st && st.itemId) !== COIN_OF_LUCK_ITEM_ID;
    });
  }

  function stackMatchesCat(st) {
    if (!window.MarketSellFilters) return true;
    return MarketSellFilters.itemMatchesInvCat(
      st.itemId,
      activeCat,
      activeCat === 'all'
    );
  }

  function buildTabs() {
    var root = $('market-sell-tabs');
    if (!root || root.getAttribute('data-built')) return;
    root.setAttribute('data-built', '1');
    root.innerHTML = '';

    CAT_TABS.forEach(function (row) {
      var key = row[0];
      var label = row[1];
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'l2-market-sell-tab';
      if (key === activeCat) btn.classList.add('l2-market-sell-tab--active');
      btn.setAttribute('data-cat', key);
      btn.textContent = label;
      btn.addEventListener('click', function () {
        if (activeCat === key) return;
        activeCat = key;
        currentPage = 0;
        syncTabsUi();
        renderList(window.L2 && L2.lastSnapshot ? L2.lastSnapshot() : null);
      });
      root.appendChild(btn);
    });
  }

  function syncTabsUi() {
    var root = $('market-sell-tabs');
    if (!root) return;
    var btns = root.querySelectorAll('[data-cat]');
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i];
      var on = b.getAttribute('data-cat') === activeCat;
      b.classList.toggle('l2-market-sell-tab--active', on);
    }
  }

  function renderPager(totalItems) {
    var pager = $('market-sell-pager');
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
    prev.className = 'l2-char-bag-pager__btn';
    prev.textContent = '<<';
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
    next.className = 'l2-char-bag-pager__btn';
    next.textContent = '>>';
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

  function renderList(snap) {
    var root = $('market-sell-list');
    var empty = $('market-sell-empty');
    var filtEmpty = $('market-sell-filter-empty');
    if (!root) return;

    var stacks = inventoryStacks(snap);
    root.innerHTML = '';

    if (stacks.length === 0) {
      if (empty) empty.hidden = false;
      if (filtEmpty) filtEmpty.hidden = true;
      renderPager(0);
      return;
    }
    if (empty) empty.hidden = true;

    var filtered = stacks.filter(stackMatchesCat);
    if (filtered.length === 0) {
      if (filtEmpty) filtEmpty.hidden = false;
      renderPager(0);
      return;
    }
    if (filtEmpty) filtEmpty.hidden = true;

    var pageStart = currentPage * PAGE_SIZE;
    var pageItems = filtered.slice(pageStart, pageStart + PAGE_SIZE);
    renderPager(filtered.length);

    pageItems.forEach(function (st) {
      var itemId = Number(st.itemId);
      var qty = Number(st.qty);
      var enchant = st.enchant != null ? Number(st.enchant) : 0;
      if (!Number.isFinite(enchant) || enchant < 0) enchant = 0;

      var row = document.createElement('div');
      row.className = 'l2-char-bag-row';

      var ico = document.createElement('img');
      ico.className = 'l2-char-bag-icon';
      ico.alt = '';
      ico.width = 28;
      ico.height = 28;
      setItemIconSrc(ico, itemId);

      var mid = document.createElement('div');
      mid.className = 'l2-char-bag-row-text';

      var name = document.createElement('a');
      name.className =
        window.L2 && typeof L2.itemNameClassNames === 'function'
          ? L2.itemNameClassNames(itemId, 'l2-char-bag-name')
          : 'l2-char-bag-name';
      name.href =
        '/market-sell-item.html?itemId=' +
        encodeURIComponent(String(itemId)) +
        '&enchant=' +
        encodeURIComponent(String(enchant)) +
        '&qty=' +
        encodeURIComponent(String(qty));
      var line = itemDisplayName(itemId) + qtySuffix(itemId, qty);
      if (enchant > 0) line += ' +' + enchant;
      name.textContent = line;
      mid.appendChild(name);

      var statParts = itemStatsParts(itemId);
      if (statParts.length) {
        var statsEl = document.createElement('span');
        statsEl.className = 'l2-char-bag-stats';
        appendRowStats(statsEl, statParts);
        mid.appendChild(statsEl);
      }

      row.appendChild(ico);
      row.appendChild(mid);
      root.appendChild(row);
    });
  }

  async function init() {
    buildTabs();

    if (window.L2 && typeof L2.mountL2Nav === 'function') {
      L2.mountL2Nav();
    }
    if (window.L2 && typeof L2.mountFootLinkBar === 'function') {
      L2.mountFootLinkBar('l2-foot-links', { inset: true });
    }

    var t = localStorage.getItem('token');
    var errEl = $('market-sell-load-err');
    var content = $('market-sell-content');

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
      try {
        await L2.fetchCatalogHints();
      } catch (_) {}
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
    renderList(c || (window.L2 && L2.lastSnapshot ? L2.lastSnapshot() : null));
  }

  init();
})();
