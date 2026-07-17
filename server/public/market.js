/**
 * Ринок у місті — список оголошень і «Мої лоти».
 */
(function () {
  var showMyLots = false;
  var cancelInFlight = false;
  var authToken = '';
  var myCharName = '';
  var COIN_OF_LUCK_ITEM_ID = 4037;
  var COIN_OF_LUCK_ICON_URL = '/assets/l2dop/4037.jpg';

  function $(id) {
    return document.getElementById(id);
  }

  function setMsg(text) {
    var el = $('market-msg');
    if (!el) return;
    if (!text) {
      el.hidden = true;
      el.textContent = '';
      return;
    }
    el.hidden = false;
    el.textContent = text;
  }

  function itemDisplayName(id) {
    var n = window.L2 && L2.itemNameById && L2.itemNameById[id];
    return n != null ? n : '#' + id;
  }

  function itemIconUrlForId(id) {
    var fallback =
      Number(id) === COIN_OF_LUCK_ITEM_ID
        ? COIN_OF_LUCK_ICON_URL
        : '/icons/drops/other.svg';
    if (window.L2 && typeof L2.resolveItemIconUrl === 'function') {
      return L2.resolveItemIconUrl(id, fallback);
    }
    if (id > 0) return '/game/item-icon/' + id;
    return fallback;
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

  function createSellerEl(entry) {
    var name = entry && entry.sellerName ? String(entry.sellerName) : '—';
    if (window.L2 && typeof L2.createPlayerProfileNickEl === 'function') {
      return L2.createPlayerProfileNickEl({
        name: name,
        className: 'l2-hud-nick l2-market-seller',
      });
    }
    var seller = document.createElement('span');
    seller.className = 'l2-hud-nick l2-market-seller';
    seller.textContent = name;
    return seller;
  }

  function itemNameText(itemId, qty, enchant) {
    var q = Number(qty);
    if (!Number.isFinite(q) || q < 1) q = 1;
    var e = Number(enchant);
    if (!Number.isFinite(e) || e < 0) e = 0;

    var name = itemDisplayName(itemId);
    if (e > 0) name += ' +' + String(e);
    if (q > 1) return String(q) + ' ' + name;
    return name;
  }

  function priceSuffix(entry) {
    var parts = [];
    var adena = entry.priceAdena != null ? String(entry.priceAdena) : '0';
    var coin = Number(entry.priceCoinOfLuck);
    if (adena !== '0') parts.push(formatAdena(adena) + ' Адена');
    if (Number.isFinite(coin) && coin > 0) {
      parts.push(String(coin) + ' Coin of Luck');
    }
    if (!parts.length) return '';
    return ' по ' + parts.join(' · ');
  }

  function openItemStats(itemId, qty, enchant) {
    if (!window.L2ItemStatsModal || typeof L2ItemStatsModal.open !== 'function') return;
    L2ItemStatsModal.open(itemId, { qty: qty, enchant: enchant });
  }

  function isOwnListing(entry) {
    if (!entry || !myCharName) return false;
    return String(entry.sellerName || '') === myCharName;
  }

  function goToBuyConfirm(entry) {
    if (!entry || !entry.id) return;
    var url =
      '/market-buy-item.html?listingId=' + encodeURIComponent(String(entry.id));
    window.location.href = url;
  }

  function appendListingMain(rowMain, entry, buyDisabled) {
    var itemId = Number(entry.itemId);
    var qty = Number(entry.qty);
    var enchant = entry.enchant != null ? Number(entry.enchant) : 0;

    var buyBtn = document.createElement('button');
    buyBtn.type = 'button';
    buyBtn.className = 'l2-market-buy';
    buyBtn.textContent = '[Купити]';
    if (buyDisabled || !entry.id) {
      buyBtn.disabled = true;
    } else {
      buyBtn.addEventListener('click', function () {
        goToBuyConfirm(entry);
      });
    }
    rowMain.appendChild(buyBtn);

    rowMain.appendChild(document.createTextNode(' у '));
    rowMain.appendChild(createSellerEl(entry));
    rowMain.appendChild(document.createTextNode(' '));

    var ico = document.createElement('img');
    ico.className = 'l2-market-item-ico';
    ico.alt = '';
    ico.width = 20;
    ico.height = 20;
    setItemIconSrc(ico, itemId);
    rowMain.appendChild(ico);

    rowMain.appendChild(document.createTextNode(' '));

    var nameBtn = document.createElement('button');
    nameBtn.type = 'button';
    nameBtn.className =
      window.L2 && typeof L2.itemNameClassNames === 'function'
        ? L2.itemNameClassNames(itemId, 'l2-market-item-name')
        : 'l2-market-item-name';
    nameBtn.textContent = itemNameText(itemId, qty, enchant);
    nameBtn.addEventListener('click', function () {
      openItemStats(itemId, qty, enchant);
    });
    rowMain.appendChild(nameBtn);

    rowMain.appendChild(document.createTextNode(priceSuffix(entry)));
  }

  async function cancelListing(listingId, cancelBtn) {
    if (cancelInFlight) return;
    if (!authToken) return;

    var snap = window.L2 && typeof L2.lastSnapshot === 'function' ? L2.lastSnapshot() : null;
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
      } catch (_) {
        j = {};
      }

      if (!r.ok) {
        setMsg(j && j.messageUk ? j.messageUk : 'Не вдалося скасувати лот.');
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

      setMsg('Лот скасовано — предмет у сумці.');
      await refreshList();
    } finally {
      cancelInFlight = false;
      if (cancelBtn) cancelBtn.disabled = false;
    }
  }

  function renderList(listings, mineMode) {
    var root = $('market-list');
    var empty = $('market-empty');
    if (!root) return;
    root.innerHTML = '';

    var visible = (Array.isArray(listings) ? listings : []).filter(function (entry) {
      return Number(entry && entry.itemId) !== COIN_OF_LUCK_ITEM_ID;
    });

    if (visible.length === 0) {
      if (empty) {
        empty.hidden = false;
        empty.textContent = mineMode
          ? 'У тебе немає активних лотів.'
          : 'Поки що немає оголошень.';
      }
      return;
    }
    if (empty) empty.hidden = true;

    visible.forEach(function (entry) {
      var row = document.createElement('p');
      row.className = mineMode ? 'l2-market-row l2-market-row--mine' : 'l2-market-row';

      var rowMain = document.createElement('span');
      rowMain.className = 'l2-market-row__main';
      appendListingMain(rowMain, entry, mineMode || isOwnListing(entry));
      row.appendChild(rowMain);

      if (mineMode && entry.id) {
        var cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.className = 'l2-market-cancel';
        cancelBtn.textContent = 'Скасувати';
        cancelBtn.addEventListener('click', function () {
          cancelListing(String(entry.id), cancelBtn);
        });
        row.appendChild(cancelBtn);
      }

      root.appendChild(row);
    });
  }

  async function loadAllListings() {
    try {
      var r = await fetch('/game/market/listings');
      if (!r.ok) return [];
      var j = await r.json();
      return Array.isArray(j.listings) ? j.listings : [];
    } catch (_) {
      return [];
    }
  }

  async function loadMyListings() {
    if (!authToken) return [];
    try {
      var r = await fetch('/character/market/my-listings', {
        headers: { Authorization: 'Bearer ' + authToken },
      });
      if (!r.ok) return [];
      var j = await r.json();
      return Array.isArray(j.listings) ? j.listings : [];
    } catch (_) {
      return [];
    }
  }

  function syncMyLotsBtn() {
    var btn = $('market-my-lots-btn');
    if (!btn) return;
    btn.classList.toggle('l2-market-my-lots-btn--active', showMyLots);
    btn.setAttribute('aria-pressed', showMyLots ? 'true' : 'false');
  }

  async function refreshList() {
    syncMyLotsBtn();
    var listings = showMyLots ? await loadMyListings() : await loadAllListings();
    renderList(listings, showMyLots);
  }

  function wireMyLotsBtn() {
    var btn = $('market-my-lots-btn');
    if (!btn) return;
    btn.addEventListener('click', async function () {
      showMyLots = !showMyLots;
      setMsg('');
      await refreshList();
    });
  }

  async function init() {
    if (window.L2 && typeof L2.mountL2Nav === 'function') {
      L2.mountL2Nav();
    }
    if (window.L2 && typeof L2.mountFootLinkBar === 'function') {
      L2.mountFootLinkBar('l2-foot-links', { inset: true });
    }

    authToken = localStorage.getItem('token') || '';
    var errEl = $('market-load-err');
    var content = $('market-content');

    if (!authToken) {
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
    myCharName = c && c.name != null ? String(c.name) : '';
    if (window.L2 && typeof L2.fetchCatalogHints === 'function') {
      try {
        await L2.fetchCatalogHints();
      } catch (_) {}
    }
    if (window.L2 && typeof L2.applyMutationSnapshot === 'function') {
      L2.applyMutationSnapshot(c);
    }

    if (content) content.removeAttribute('hidden');
    wireMyLotsBtn();
    await refreshList();
  }

  init();
})();
