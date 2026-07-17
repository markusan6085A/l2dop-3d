/**
 * Продати Coin of Luck на ринку.
 */
(function () {
  var COIN_ITEM_ID = 4037;
  var sellInFlight = false;

  function $(id) {
    return document.getElementById(id);
  }

  function setMsg(text) {
    var el = $('market-coin-sell-msg');
    if (el) el.textContent = text || '';
  }

  function coinQtyInSnapshot(snap) {
    if (!snap || !snap.inventory || !Array.isArray(snap.inventory.stacks)) return 0;
    var total = 0;
    snap.inventory.stacks.forEach(function (st) {
      if (Number(st.itemId) === COIN_ITEM_ID) {
        total += Math.max(0, Math.floor(Number(st.qty) || 0));
      }
    });
    return total;
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
    if (sellInFlight) return;

    var snap = window.L2 && L2.lastSnapshot ? L2.lastSnapshot() : null;
    if (!snap || snap.revision == null) {
      setMsg('Стан не завантажено — онови сторінку.');
      return;
    }

    var maxQty = coinQtyInSnapshot(snap);
    var qty = parsePriceInput($('market-coin-sell-qty') && $('market-coin-sell-qty').value);
    var adena = parsePriceInput($('market-coin-sell-adena') && $('market-coin-sell-adena').value);

    if (!Number.isFinite(qty) || qty <= 0) {
      setMsg('Вкажи кількість Coin of Luck.');
      return;
    }
    if (qty > maxQty) {
      setMsg('У сумці лише ' + maxQty + ' Coin of Luck.');
      return;
    }
    if (!Number.isFinite(adena) || adena <= 0) {
      setMsg('Вкажи ціну в адені.');
      return;
    }

    var t = localStorage.getItem('token');
    if (!t) return;

    sellInFlight = true;
    var btn = $('market-coin-sell-submit');
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
          itemId: COIN_ITEM_ID,
          enchant: 0,
          qty: qty,
          priceAdena: adena,
          priceCoinOfLuck: 0,
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

      window.location.href = '/market-coin-of-luck.html';
    } finally {
      sellInFlight = false;
      if (btn) btn.disabled = false;
    }
  }

  async function init() {
    if (window.L2 && typeof L2.mountL2Nav === 'function') {
      L2.mountL2Nav();
    }
    if (window.L2 && typeof L2.mountFootLinkBar === 'function') {
      L2.mountFootLinkBar('l2-foot-links', { inset: true });
    }

    var form = $('market-coin-sell-form');
    if (form) form.addEventListener('submit', submitSell);

    var t = localStorage.getItem('token');
    var errEl = $('market-coin-sell-load-err');
    var content = $('market-coin-sell-content');

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

    var qtyEl = $('market-coin-sell-qty');
    var have = coinQtyInSnapshot(c);
    if (qtyEl) {
      qtyEl.max = String(Math.max(1, have));
      if (have > 0) qtyEl.value = String(have);
    }

    if (have <= 0) {
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent = 'У сумці немає Coin of Luck.';
      }
      return;
    }

    if (content) content.removeAttribute('hidden');
  }

  init();
})();
