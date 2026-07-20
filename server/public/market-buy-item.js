/**
 * Ринок — підтвердження покупки лоту.
 */
(function () {
  var listingCtx = null;
  var returnUrl = '/market.html';

  function $(id) {
    return document.getElementById(id);
  }

  function setMsg(text) {
    var el = $('market-buy-item-msg');
    if (el) el.textContent = text || '';
  }

  function parseQuery() {
    var q = new URLSearchParams(window.location.search);
    var listingId = q.get('listingId');
    var from = q.get('from');
    if (from === 'coin') returnUrl = '/market-coin-of-luck.html';
    if (!listingId || String(listingId).trim() === '') return null;
    return { listingId: String(listingId).trim() };
  }

  function itemDisplayName(id) {
    var n = window.L2 && L2.itemNameById && L2.itemNameById[id];
    return n != null ? n : '#' + id;
  }

  function formatEnchantedName(name, enchant) {
    if (window.L2 && typeof L2.formatEnchantedItemName === 'function') {
      return L2.formatEnchantedItemName(name, enchant);
    }
    var en = Math.floor(Number(enchant));
    if (!Number.isFinite(en) || en <= 0) return String(name || '');
    return '+' + String(en) + ' ' + String(name || '');
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

  function formatAdena(raw) {
    var s = String(raw == null ? '0' : raw);
    try {
      return BigInt(s).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'");
    } catch (_) {
      return s;
    }
  }

  function listingMaxQty(entry) {
    var q = Number(entry && entry.qty);
    if (!Number.isFinite(q) || q < 1) return 1;
    return Math.floor(q);
  }

  function readBuyQty() {
    if (!listingCtx) return 1;
    var maxQty = listingMaxQty(listingCtx);
    if (maxQty <= 1) return 1;

    var el = $('market-buy-item-qty');
    var q = el ? Number(el.value) : maxQty;
    if (!Number.isFinite(q) || q <= 0) return NaN;
    if (q > maxQty) return NaN;
    return Math.floor(q);
  }

  function totalPriceLabel(entry, buyQty) {
    var parts = [];
    var unitAdena = entry.priceAdena != null ? String(entry.priceAdena) : '0';
    var unitCoin = Number(entry.priceCoinOfLuck);
    var q = Math.max(1, Math.floor(Number(buyQty) || 1));

    if (unitAdena !== '0') {
      try {
        var totalAdena = BigInt(unitAdena) * BigInt(q);
        parts.push(formatAdena(totalAdena.toString()) + ' Адена');
      } catch (_) {
        parts.push(formatAdena(unitAdena) + ' Адена');
      }
    }
    if (Number.isFinite(unitCoin) && unitCoin > 0) {
      parts.push(String(unitCoin * q) + ' Coin of Luck');
    }
    if (!parts.length) return '—';

    if (q > 1) {
      var unitParts = [];
      if (unitAdena !== '0') unitParts.push(formatAdena(unitAdena) + ' за шт.');
      if (Number.isFinite(unitCoin) && unitCoin > 0) {
        unitParts.push(String(unitCoin) + ' Coin of Luck за шт.');
      }
      return parts.join(' · ') + ' (' + unitParts.join(' · ') + ')';
    }
    return parts.join(' · ');
  }

  function syncPriceDisplay() {
    var priceEl = $('market-buy-item-price');
    if (!priceEl || !listingCtx) return;
    var buyQty = readBuyQty();
    if (!Number.isFinite(buyQty)) {
      priceEl.textContent = 'Ціна: —';
      return;
    }
    priceEl.textContent = 'Ціна: ' + totalPriceLabel(listingCtx, buyQty);
  }

  function setupQtyField(entry) {
    var row = $('market-buy-item-qty-row');
    var input = $('market-buy-item-qty');
    var maxQty = listingMaxQty(entry);
    if (!row || !input) return;

    if (maxQty <= 1) {
      row.hidden = true;
      row.setAttribute('hidden', '');
      return;
    }

    row.hidden = false;
    row.removeAttribute('hidden');
    input.min = '1';
    input.max = String(maxQty);
    input.value = String(maxQty);
    input.addEventListener('input', syncPriceDisplay);
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

  function itemNameLine(entry) {
    var itemId = Number(entry.itemId);
    var qty = listingMaxQty(entry);
    var enchant = entry.enchant != null ? Number(entry.enchant) : 0;
    if (!Number.isFinite(enchant) || enchant < 0) enchant = 0;

    var line = formatEnchantedName(itemDisplayName(itemId), enchant);
    if (qty > 1) line = String(qty) + ' ' + line;
    return { itemId: itemId, line: line };
  }

  function renderPreview(entry) {
    var root = $('market-buy-item-preview');
    if (!root || !entry) return;
    root.innerHTML = '';

    var meta = itemNameLine(entry);
    var row = document.createElement('div');
    row.className = 'l2-char-bag-row';

    var ico = document.createElement('img');
    ico.className = 'l2-char-bag-icon';
    ico.alt = '';
    ico.width = 28;
    ico.height = 28;
    setItemIconSrc(ico, meta.itemId);

    var mid = document.createElement('div');
    mid.className = 'l2-char-bag-row-text';

    var name = document.createElement('span');
    name.className =
      window.L2 && typeof L2.itemNameClassNames === 'function'
        ? L2.itemNameClassNames(meta.itemId, 'l2-char-bag-name')
        : 'l2-char-bag-name';
    name.textContent = meta.line;
    mid.appendChild(name);

    var statParts = itemStatsParts(meta.itemId);
    if (statParts.length) {
      var statsEl = document.createElement('span');
      statsEl.className = 'l2-char-bag-stats';
      appendRowStats(statsEl, statParts);
      mid.appendChild(statsEl);
    }

    row.appendChild(ico);
    row.appendChild(mid);
    root.appendChild(row);

    var sellerEl = $('market-buy-item-seller');
    if (sellerEl) {
      sellerEl.textContent = 'Продавець: ' + (entry.sellerName || '—');
    }

    setupQtyField(entry);
    syncPriceDisplay();
  }

  async function fetchListingById(listingId) {
    try {
      var r = await fetch('/game/market/listings');
      if (r.ok) {
        var j = await r.json();
        var list = Array.isArray(j.listings) ? j.listings : [];
        for (var i = 0; i < list.length; i++) {
          if (String(list[i].id) === listingId) return list[i];
        }
      }
    } catch (_) {}

    try {
      var r2 = await fetch('/game/market/coin-of-luck/listings');
      if (r2.ok) {
        var j2 = await r2.json();
        var list2 = Array.isArray(j2.listings) ? j2.listings : [];
        for (var k = 0; k < list2.length; k++) {
          if (String(list2[k].id) === listingId) return list2[k];
        }
      }
    } catch (_) {}

    return null;
  }

  async function confirmBuy() {
    if (!listingCtx || !listingCtx.id) return;
    if (!window.L2MarketListingBuy || typeof L2MarketListingBuy.buy !== 'function') return;

    var buyQty = readBuyQty();
    if (!Number.isFinite(buyQty)) {
      setMsg('Некоректна кількість.');
      return;
    }

    var btn = $('market-buy-item-submit');
    setMsg('Купуємо…');
    var result = await L2MarketListingBuy.buy(String(listingCtx.id), {
      button: btn,
      qty: buyQty,
    });
    if (!result.ok) {
      if (result.messageUk) setMsg(result.messageUk);
      return;
    }
    window.location.href = returnUrl;
  }

  async function init() {
    var q = parseQuery();
    if (!q) {
      var err = $('market-buy-item-load-err');
      if (err) {
        err.hidden = false;
        err.textContent = 'Некоректне оголошення.';
      }
      return;
    }

    if (window.L2 && typeof L2.mountL2Nav === 'function') {
      L2.mountL2Nav();
    }
    if (window.L2 && typeof L2.mountFootLinkBar === 'function') {
      L2.mountFootLinkBar('l2-foot-links', { inset: true });
    }

    var t = localStorage.getItem('token');
    var errEl = $('market-buy-item-load-err');
    var content = $('market-buy-item-content');

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
      try {
        await L2.fetchCatalogHints();
      } catch (_) {}
    }
    if (window.L2 && typeof L2.applyMutationSnapshot === 'function') {
      L2.applyMutationSnapshot(c);
    }

    var entry = await fetchListingById(q.listingId);
    if (!entry) {
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent = 'Оголошення не знайдено або вже продано.';
      }
      return;
    }

    if (c && c.name && String(entry.sellerName) === String(c.name)) {
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent = 'Не можна купити власний лот.';
      }
      return;
    }

    listingCtx = entry;
    renderPreview(entry);

    var btn = $('market-buy-item-submit');
    if (btn) {
      btn.addEventListener('click', confirmBuy);
    }

    if (content) content.removeAttribute('hidden');
  }

  init();
})();
