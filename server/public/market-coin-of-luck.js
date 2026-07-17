/**
 * Ринок Coin of Luck — список продавців.
 */
(function () {
  var COIN_ITEM_ID = 4037;
  var COIN_ICON = '/assets/l2dop/4037.jpg';
  var authToken = '';
  var myCharName = '';
  var cancelInFlight = false;

  function $(id) {
    return document.getElementById(id);
  }

  function setMsg(text) {
    var el = $('market-col-msg');
    if (el) el.textContent = text || '';
  }

  function formatAdena(raw) {
    var s = String(raw == null ? '0' : raw);
    try {
      return BigInt(s).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'");
    } catch (_) {
      return s;
    }
  }

  function isOwnListing(entry) {
    if (!entry || !myCharName) return false;
    return String(entry.sellerName || '') === myCharName;
  }

  function goToBuyConfirm(entry) {
    if (!entry || !entry.id) return;
    window.location.href =
      '/market-buy-item.html?listingId=' +
      encodeURIComponent(String(entry.id)) +
      '&from=coin';
  }

  async function loadListings() {
    try {
      var r = await fetch('/game/market/coin-of-luck/listings');
      if (!r.ok) return [];
      var j = await r.json();
      return Array.isArray(j.listings) ? j.listings : [];
    } catch (_) {
      return [];
    }
  }

  async function cancelListing(listingId, cancelBtn) {
    if (cancelInFlight || !authToken) return;

    var snap =
      window.L2 && typeof L2.lastSnapshot === 'function'
        ? L2.lastSnapshot()
        : null;
    if (!snap || snap.revision == null) {
      setMsg('Не вдалося прочитати revision — онови сторінку.');
      return;
    }

    cancelInFlight = true;
    if (cancelBtn) cancelBtn.disabled = true;
    setMsg('Скасовуємо лот…');

    try {
      var r = await fetch('/character/market/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + authToken,
        },
        body: JSON.stringify({
          listingId: listingId,
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
        setMsg(j && j.messageUk ? j.messageUk : 'Не вдалося скасувати лот.');
        return;
      }

      if (j.character && window.L2) {
        if (typeof L2.applyCharacterSnapshot === 'function') {
          L2.applyCharacterSnapshot(j.character);
        } else {
          L2.setLastSnapshot(j.character);
          if (typeof L2.applyHudFromSnapshot === 'function') {
            L2.applyHudFromSnapshot(j.character);
          }
        }
      }

      setMsg('Лот скасовано — Coin of Luck у сумці.');
      renderList(await loadListings());
    } finally {
      cancelInFlight = false;
      if (cancelBtn) cancelBtn.disabled = false;
    }
  }

  function renderList(listings) {
    var root = $('market-col-list');
    var empty = $('market-col-empty');
    if (!root) return;
    root.innerHTML = '';

    if (!Array.isArray(listings) || listings.length === 0) {
      if (empty) empty.hidden = false;
      return;
    }
    if (empty) empty.hidden = true;

    listings.forEach(function (entry) {
      var row = document.createElement('p');
      row.className = 'l2-market-col-row';
      var own = isOwnListing(entry);

      var buyBtn = document.createElement('button');
      buyBtn.type = 'button';
      buyBtn.className = 'l2-market-col-buy';
      buyBtn.textContent = '[Купити]';
      if (entry.id && !own) {
        buyBtn.addEventListener('click', function () {
          goToBuyConfirm(entry);
        });
      } else {
        buyBtn.disabled = true;
      }
      row.appendChild(buyBtn);

      row.appendChild(document.createTextNode(' '));

      var ico = document.createElement('img');
      ico.className = 'l2-market-col-coin-ico';
      ico.alt = '';
      ico.width = 16;
      ico.height = 16;
      ico.src =
        window.L2 && typeof L2.resolveItemIconUrl === 'function'
          ? L2.resolveItemIconUrl(COIN_ITEM_ID, COIN_ICON)
          : COIN_ICON;
      ico.onerror = function () {
        ico.onerror = null;
        ico.src = COIN_ICON;
      };
      row.appendChild(ico);

      var qty = Number(entry.qty);
      if (!Number.isFinite(qty) || qty < 1) qty = 1;
      row.appendChild(
        document.createTextNode(
          String(qty) + ' Coin of Luck по ' + formatAdena(entry.priceAdena) + ' Адена'
        )
      );

      if (own && entry.id) {
        row.appendChild(document.createTextNode(' '));
        var cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.className = 'l2-market-col-cancel';
        cancelBtn.textContent = 'Скасувати';
        cancelBtn.addEventListener('click', function () {
          void cancelListing(String(entry.id), cancelBtn);
        });
        row.appendChild(cancelBtn);
      }

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

    var orderBtn = $('market-col-order-btn');
    if (orderBtn) {
      orderBtn.addEventListener('click', function () {
        setMsg('«Замовити Coin of Luck» — з’явиться пізніше.');
      });
    }

    authToken = localStorage.getItem('token') || '';
    var errEl = $('market-col-load-err');
    var content = $('market-col-content');

    if (!authToken) {
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent = 'Потрібен вхід. Перейди на головну.';
      }
      if (window.L2 && typeof L2.clearHudPanel === 'function') L2.clearHudPanel();
      return;
    }

    var r = await fetch('/character', {
      headers: { Authorization: 'Bearer ' + authToken },
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
    myCharName = c && c.name != null ? String(c.name) : '';
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
    if (errEl) errEl.hidden = true;
    renderList(await loadListings());
  }

  init();
})();
