/**
 * Ринок — форма виставлення предмета на продаж.
 */
(function () {
  var sellInFlight = false;
  var stackCtx = null;

  function $(id) {
    return document.getElementById(id);
  }

  function setMsg(text) {
    var el = $('market-sell-item-msg');
    if (el) el.textContent = text || '';
  }

  function parseQuery() {
    var q = new URLSearchParams(window.location.search);
    var itemId = Number(q.get('itemId'));
    var enchant = Number(q.get('enchant'));
    var qty = Number(q.get('qty'));
    if (!Number.isFinite(itemId) || itemId <= 0) return null;
    if (!Number.isFinite(enchant) || enchant < 0) enchant = 0;
    if (enchant > 20) enchant = 20;
    if (!Number.isFinite(qty) || qty <= 0) qty = 1;
    return { itemId: itemId, enchant: enchant, qty: Math.floor(qty) };
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

  function qtySuffix(qty) {
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

  function stackInSnapshot(snap, ctx) {
    if (!snap || !snap.inventory || !Array.isArray(snap.inventory.stacks) || !ctx) {
      return null;
    }
    for (var i = 0; i < snap.inventory.stacks.length; i++) {
      var st = snap.inventory.stacks[i];
      var itemId = Number(st.itemId);
      var enchant = st.enchant != null ? Number(st.enchant) : 0;
      var qty = Number(st.qty);
      if (itemId === ctx.itemId && enchant === ctx.enchant) {
        return { itemId: itemId, enchant: enchant, qty: qty };
      }
    }
    return null;
  }

  function setupQtyFields(maxQty) {
    var showQty = maxQty > 1;
    var form = $('market-sell-item-form');
    if (form) {
      form.classList.toggle('l2-market-sell-item-form--has-qty', showQty);
      form.classList.toggle('l2-market-sell-item-form--no-qty', !showQty);
    }
    document.querySelectorAll('.l2-market-sell-item-qty-wrap').forEach(function (el) {
      el.hidden = !showQty;
    });
    var maxStr = String(maxQty);
    var qtyEl = $('market-sell-item-qty');
    var qtyEl2 = $('market-sell-item-qty-2');
    if (qtyEl) {
      qtyEl.max = maxStr;
      qtyEl.value = maxStr;
    }
    if (qtyEl2) {
      qtyEl2.max = maxStr;
      qtyEl2.value = maxStr;
    }
  }

  function bindQtySync() {
    var q1 = $('market-sell-item-qty');
    var q2 = $('market-sell-item-qty-2');
    if (!q1 || !q2) return;

    function onQtyInput(from, to) {
      if (to.value !== from.value) to.value = from.value;
      if (!stackCtx) return;
      var maxQty = stackCtx.maxQty != null ? stackCtx.maxQty : stackCtx.qty;
      var q = readSellQty(maxQty);
      stackCtx.qty = Number.isFinite(q) ? q : maxQty;
      renderPreview(stackCtx);
    }

    q1.addEventListener('input', function () {
      onQtyInput(q1, q2);
    });
    q2.addEventListener('input', function () {
      onQtyInput(q2, q1);
    });
  }

  function readSellQty(maxQty) {
    if (maxQty <= 1) return 1;
    var qty = parsePriceInput($('market-sell-item-qty') && $('market-sell-item-qty').value);
    if (!Number.isFinite(qty) || qty <= 0) return NaN;
    if (qty > maxQty) return NaN;
    return qty;
  }

  function renderPreview(ctx) {
    var root = $('market-sell-item-preview');
    if (!root || !ctx) return;
    root.innerHTML = '';

    var row = document.createElement('div');
    row.className = 'l2-char-bag-row';

    var ico = document.createElement('img');
    ico.className = 'l2-char-bag-icon';
    ico.alt = '';
    ico.width = 28;
    ico.height = 28;
    setItemIconSrc(ico, ctx.itemId);

    var mid = document.createElement('div');
    mid.className = 'l2-char-bag-row-text';

    var name = document.createElement('span');
    name.className =
      window.L2 && typeof L2.itemNameClassNames === 'function'
        ? L2.itemNameClassNames(ctx.itemId, 'l2-char-bag-name')
        : 'l2-char-bag-name';
    var line = itemDisplayName(ctx.itemId) + qtySuffix(ctx.qty);
    if (ctx.enchant > 0) line += ' +' + ctx.enchant;
    name.textContent = line;
    mid.appendChild(name);

    var statParts = itemStatsParts(ctx.itemId);
    if (statParts.length) {
      var statsEl = document.createElement('span');
      statsEl.className = 'l2-char-bag-stats';
      appendRowStats(statsEl, statParts);
      mid.appendChild(statsEl);
    }

    row.appendChild(ico);
    row.appendChild(mid);
    root.appendChild(row);
  }

  function parsePriceInput(raw) {
    var s = String(raw == null ? '' : raw).trim();
    if (!s) return 0;
    var n = Number(s);
    if (!Number.isFinite(n) || n < 0) return NaN;
    return Math.floor(n);
  }

  async function submitSell(ev) {
    ev.preventDefault();
    if (sellInFlight || !stackCtx) return;

    var snap = window.L2 && L2.lastSnapshot ? L2.lastSnapshot() : null;
    if (!snap || snap.revision == null) {
      setMsg('Стан не завантажено — онови сторінку.');
      return;
    }
    if (!stackInSnapshot(snap, stackCtx)) {
      setMsg('Предмета вже немає в сумці.');
      return;
    }

    var maxQty = stackCtx.maxQty != null ? stackCtx.maxQty : stackCtx.qty;
    var sellQty = readSellQty(maxQty);
    if (!Number.isFinite(sellQty)) {
      setMsg('Некоректна кількість.');
      return;
    }

    var adena = parsePriceInput($('market-sell-item-adena') && $('market-sell-item-adena').value);
    var coin = parsePriceInput($('market-sell-item-coin') && $('market-sell-item-coin').value);
    if (!Number.isFinite(adena) || !Number.isFinite(coin)) {
      setMsg('Некоректна ціна.');
      return;
    }
    if (adena <= 0 && coin <= 0) {
      setMsg('Вкажи ціну в адені або Coin of Luck.');
      return;
    }

    var t = localStorage.getItem('token');
    if (!t) return;

    sellInFlight = true;
    var btn = $('market-sell-item-submit');
    if (btn) btn.disabled = true;
    setMsg('Виставляємо на продаж…');

    try {
      var r = await fetch('/character/market/list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + t,
        },
        body: JSON.stringify({
          itemId: stackCtx.itemId,
          enchant: stackCtx.enchant,
          qty: sellQty,
          priceAdena: adena,
          priceCoinOfLuck: coin,
          expectedRevision: snap.revision,
        }),
      });

      if (r.status === 409) {
        if (typeof L2.resyncCharacterAfterConflict === 'function') {
          await L2.resyncCharacterAfterConflict();
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
        setMsg(j && j.messageUk ? j.messageUk : 'Не вдалося виставити на продаж.');
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
      }

      window.location.href = '/market.html';
    } finally {
      sellInFlight = false;
      if (btn) btn.disabled = false;
    }
  }

  async function init() {
    stackCtx = parseQuery();
    if (!stackCtx) {
      var err = $('market-sell-item-load-err');
      if (err) {
        err.hidden = false;
        err.textContent = 'Некоректний предмет.';
      }
      return;
    }

    if (window.L2 && typeof L2.mountL2Nav === 'function') {
      L2.mountL2Nav();
    }
    if (window.L2 && typeof L2.mountFootLinkBar === 'function') {
      L2.mountFootLinkBar('l2-foot-links', { inset: true });
    }

    var form = $('market-sell-item-form');
    if (form) form.addEventListener('submit', submitSell);

    var t = localStorage.getItem('token');
    var errEl = $('market-sell-item-load-err');
    var content = $('market-sell-item-content');

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

    if (!stackInSnapshot(c, stackCtx)) {
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent = 'Предмета немає в сумці.';
      }
      return;
    }

    var st = stackInSnapshot(c, stackCtx);
    stackCtx.maxQty = st ? Math.max(1, Math.floor(Number(st.qty) || 1)) : stackCtx.qty;
    stackCtx.qty = stackCtx.maxQty;
    setupQtyFields(stackCtx.maxQty);
    bindQtySync();

    if (content) content.removeAttribute('hidden');
    renderPreview(stackCtx);
  }

  init();
})();
