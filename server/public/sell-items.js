/**
 * sell-items.html — продаж предметів з сумки (ліва колонка: речі, центр: категорії + грейди).
 */
(function () {
  var PAGE_SIZE = 10;
  var CAT_ORDER = ['all', 'weapon', 'armor', 'accessor', 'consumable'];
  var CAT_LABEL_UK = {
    all: 'Все',
    weapon: 'Зброя',
    armor: 'Броня',
    accessor: 'Аксесуари',
    consumable: 'Розхідники',
  };
  var GRADE_ORDER = ['all', 'NG', 'D', 'C', 'B', 'A', 'S'];
  var GRADE_LABEL_UK = {
    all: 'Все',
    NG: 'NG',
    D: 'D',
    C: 'C',
    B: 'B',
    A: 'A',
    S: 'S',
  };
  var GRADE_KEY = {
    all: '',
    NG: 'ng',
    D: 'd',
    C: 'c',
    B: 'b',
    A: 'a',
    S: 's',
  };

  var stateCat = 'all';
  var stateGrade = 'all';
  var statePage = 0;
  var snap = null;
  var sellPrices = {};
  var sellInFlight = false;

  var SELL_CONFIRM_MODAL_ID = 'l2-sell-items-confirm-modal';
  var SELL_QTY_MODAL_ID = 'l2-sell-items-qty-modal';
  var sellModalKeybound = false;

  function $(id) {
    return document.getElementById(id);
  }

  function setSellCongrats(stack, qty, totalAdena) {
    var el = $('sell-items-msg');
    if (!el) return;
    var name = formatEnchantedName(itemDisplayName(stack.itemId), stack.enchant);
    el.hidden = false;
    el.classList.remove('err');
    el.classList.add('l2-drops-shop-purchase-ok');
    if (window.L2 && typeof L2.renderShopCongratsMessage === 'function') {
      L2.renderShopCongratsMessage(el, 'sell', {
        itemName: name,
        qty: Math.max(1, Math.floor(Number(qty) || 1)),
        adenaLabel: formatAdena(totalAdena),
      });
      return;
    }
    setMsg(buildSellCongratsMsg(stack, qty, totalAdena), true);
  }

  function setMsg(text, ok) {
    var el = $('sell-items-msg');
    if (!el) return;
    if (!text) {
      el.hidden = true;
      el.textContent = '';
      el.classList.remove('l2-drops-shop-purchase-ok');
      el.classList.add('err');
      return;
    }
    el.hidden = false;
    el.textContent = text;
    if (ok) {
      el.classList.remove('err');
      el.classList.add('l2-drops-shop-purchase-ok');
    } else {
      el.classList.remove('l2-drops-shop-purchase-ok');
      el.classList.add('err');
    }
  }

  function buildSellCongratsMsg(stack, qty, totalAdena) {
    var name = formatEnchantedName(itemDisplayName(stack.itemId), stack.enchant);
    var q = Math.max(1, Math.floor(Number(qty) || 1));
    var adenaStr = formatAdena(totalAdena);
    if (q > 1) {
      return (
        'Вітаємо! Ви продали «' +
        name +
        '» × ' +
        q +
        ' — +' +
        adenaStr +
        ' адени.'
      );
    }
    return 'Вітаємо! Ви продали «' + name + '» — +' + adenaStr + ' адени.';
  }

  function fmtAdena(s) {
    if (s == null || s === '') return '—';
    try {
      return BigInt(String(s))
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f');
    } catch (_) {
      return String(s);
    }
  }

  function syncAdenaHeader(character) {
    var wrap = $('sell-items-adena');
    var amountEl = $('sell-items-adena-amount');
    if (!wrap || !amountEl) return;
    var adena =
      character && character.adena != null ? String(character.adena) : '';
    if (!adena) {
      wrap.hidden = true;
      amountEl.textContent = '';
      return;
    }
    amountEl.textContent = fmtAdena(adena);
    wrap.hidden = false;
  }

  function itemDisplayName(id) {
    if (window.L2 && typeof L2.itemDisplayNameWithGrade === 'function') {
      return L2.itemDisplayNameWithGrade(id);
    }
    var map = window.L2 && L2.itemNameById;
    if (!map) return '#' + id;
    var n = map[id] != null ? map[id] : map[String(id)];
    if (n != null && String(n).trim() !== '') return String(n).trim();
    return '#' + id;
  }

  function formatEnchantedName(name, enchant) {
    if (window.L2 && typeof L2.formatEnchantedItemName === 'function') {
      return L2.formatEnchantedItemName(name, enchant);
    }
    var en = Math.floor(Number(enchant));
    if (!Number.isFinite(en) || en <= 0) return String(name || '');
    return '+' + String(en) + ' ' + String(name || '');
  }

  function itemShowsStats(itemId) {
    var seg = bagEquipSegment(itemId);
    return (
      seg === 'weapon' ||
      seg === 'armor' ||
      seg === 'shield' ||
      seg === 'accessor'
    );
  }

  function itemStatsParts(id) {
    if (!itemShowsStats(id)) return [];
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
      } else if (
        window.L2 &&
        typeof L2.appendColoredItemStatSegments === 'function'
      ) {
        L2.appendColoredItemStatSegments(
          container,
          part.label,
          part.value
        );
      } else {
        var plain = document.createElement('span');
        plain.className = 'l2-item-stat-plain';
        plain.textContent = part.label + ' ' + part.value;
        container.appendChild(plain);
      }
    }
  }

  function itemIconUrlForId(id) {
    if (window.L2 && typeof L2.resolveItemIconUrl === 'function') {
      return L2.resolveItemIconUrl(id, '/icons/drops/other.svg');
    }
    if (id > 0) return '/game/item-icon/' + id;
    return '/icons/drops/other.svg';
  }

  function bagEquipSegment(itemId) {
    var sl = window.L2 && L2.itemSlotById && L2.itemSlotById[itemId];
    if (sl === 'rhand') return 'weapon';
    if (sl === 'lhand' || sl === 'shield') return 'shield';
    if (
      sl === 'chest' ||
      sl === 'legs' ||
      sl === 'head' ||
      sl === 'gloves' ||
      sl === 'feet' ||
      sl === 'fullarmor'
    ) {
      return 'armor';
    }
    if (sl === 'ring' || sl === 'neck' || sl === 'earring') return 'accessor';
    return null;
  }

  function itemInConsumableBucket(itemId) {
    var seg = bagEquipSegment(itemId);
    if (seg === 'weapon' || seg === 'armor' || seg === 'shield' || seg === 'accessor') {
      return false;
    }
    var tab =
      window.L2 && L2.itemInventoryTabById && L2.itemInventoryTabById[itemId];
    if (tab != null) {
      var t = String(tab);
      if (
        t === 'consumable' ||
        t === 'recipe' ||
        t === 'resource' ||
        t === 'quest' ||
        t === 'book' ||
        t === 'enchantment'
      ) {
        return true;
      }
      if (t === 'equipment' || t === 'armor' || t === 'weapon') return false;
    }
    return seg == null;
  }

  function itemMatchesCat(itemId, cat) {
    if (cat === 'all') return true;
    var seg = bagEquipSegment(itemId);
    if (cat === 'weapon') return seg === 'weapon';
    if (cat === 'armor') return seg === 'armor' || seg === 'shield';
    if (cat === 'accessor') return seg === 'accessor';
    if (cat === 'consumable') return itemInConsumableBucket(itemId);
    return false;
  }

  function normalizedGradeKey(itemId) {
    var g = window.L2 && L2.itemGradeById && L2.itemGradeById[itemId];
    if (g == null || String(g).trim() === '') return '';
    return String(g).trim().toLowerCase();
  }

  function itemMatchesGrade(itemId, gradeUk) {
    if (gradeUk === 'all') return true;
    var want = GRADE_KEY[gradeUk] || '';
    if (!want) return true;
    return normalizedGradeKey(itemId) === want;
  }

  function sellPriceFor(itemId) {
    var p = sellPrices[String(itemId)];
    return typeof p === 'number' && p > 0 ? p : null;
  }

  function sellTotalFor(itemId, qty) {
    var unit = sellPriceFor(itemId);
    if (unit == null) return null;
    var q = Math.max(1, Math.floor(qty || 1));
    return unit * q;
  }

  function closeSellModals() {
    var a = $(SELL_CONFIRM_MODAL_ID);
    var b = $(SELL_QTY_MODAL_ID);
    if (a) a.hidden = true;
    if (b) b.hidden = true;
    try {
      document.body.style.overflow = '';
    } catch (_) {}
    if (sellModalKeybound) {
      document.removeEventListener('keydown', sellModalEsc);
      sellModalKeybound = false;
    }
  }

  function sellModalEsc(e) {
    if (e.key === 'Escape') closeSellModals();
  }

  function bindSellModalEsc() {
    if (sellModalKeybound) return;
    document.addEventListener('keydown', sellModalEsc);
    sellModalKeybound = true;
  }

  function ensureSellConfirmModalDom() {
    var el = $(SELL_CONFIRM_MODAL_ID);
    if (el) return el;
    el = document.createElement('div');
    el.id = SELL_CONFIRM_MODAL_ID;
    el.className = 'l2-drops-stats-modal';
    el.hidden = true;
    var bd = document.createElement('button');
    bd.type = 'button';
    bd.className = 'l2-drops-stats-modal__backdrop';
    bd.setAttribute('aria-label', 'Закрити');
    bd.addEventListener('click', closeSellModals);
    var pan = document.createElement('div');
    pan.className = 'l2-drops-stats-modal__panel';
    pan.setAttribute('role', 'dialog');
    pan.setAttribute('aria-modal', 'true');
    pan.setAttribute('aria-labelledby', 'l2-sell-confirm-title');
    var clo = document.createElement('button');
    clo.type = 'button';
    clo.className = 'l2-drops-stats-modal__close';
    clo.setAttribute('aria-label', 'Закрити');
    clo.appendChild(document.createTextNode('\u00D7'));
    clo.addEventListener('click', closeSellModals);
    var head = document.createElement('div');
    head.className = 'l2-drops-stats-modal__head';
    var tit = document.createElement('div');
    tit.className = 'l2-drops-stats-modal__title';
    tit.id = 'l2-sell-confirm-title';
    tit.setAttribute('data-sell-confirm-title', '');
    head.appendChild(tit);
    var msg = document.createElement('p');
    msg.className = 'l2-drops-stats-modal__hint';
    msg.setAttribute('data-sell-confirm-msg', '');
    var row = document.createElement('div');
    row.className = 'l2-drops-buy-qty-actions';
    var cancel = document.createElement('button');
    cancel.type = 'button';
    cancel.className = 'l2-drops-buy-qty-btn l2-drops-buy-qty-btn--muted';
    cancel.textContent = 'Скасувати';
    cancel.addEventListener('click', closeSellModals);
    var ok = document.createElement('button');
    ok.type = 'button';
    ok.className =
      'l2-drops-buy-qty-btn l2-drops-buy-qty-btn--primary l2-sell-items-modal-sell-btn';
    ok.textContent = 'Продати';
    ok.setAttribute('data-sell-confirm-ok', '');
    row.appendChild(cancel);
    row.appendChild(ok);
    pan.appendChild(clo);
    pan.appendChild(head);
    pan.appendChild(msg);
    pan.appendChild(row);
    el.appendChild(bd);
    el.appendChild(pan);
    document.body.appendChild(el);
    return el;
  }

  function ensureSellQtyModalDom() {
    var el = $(SELL_QTY_MODAL_ID);
    if (el) return el;
    el = document.createElement('div');
    el.id = SELL_QTY_MODAL_ID;
    el.className = 'l2-drops-stats-modal';
    el.hidden = true;
    var bd = document.createElement('button');
    bd.type = 'button';
    bd.className = 'l2-drops-stats-modal__backdrop';
    bd.setAttribute('aria-label', 'Закрити');
    bd.addEventListener('click', closeSellModals);
    var pan = document.createElement('div');
    pan.className = 'l2-drops-stats-modal__panel';
    pan.setAttribute('role', 'dialog');
    pan.setAttribute('aria-modal', 'true');
    pan.setAttribute('aria-labelledby', 'l2-sell-qty-title');
    var clo = document.createElement('button');
    clo.type = 'button';
    clo.className = 'l2-drops-stats-modal__close';
    clo.setAttribute('aria-label', 'Закрити');
    clo.appendChild(document.createTextNode('\u00D7'));
    clo.addEventListener('click', closeSellModals);
    var head = document.createElement('div');
    head.className = 'l2-drops-stats-modal__head';
    var tit = document.createElement('div');
    tit.className = 'l2-drops-stats-modal__title';
    tit.id = 'l2-sell-qty-title';
    tit.setAttribute('data-sell-qty-title', '');
    head.appendChild(tit);
    var unit = document.createElement('p');
    unit.className = 'l2-drops-stats-modal__hint';
    unit.setAttribute('data-sell-qty-unit', '');
    unit.style.marginTop = '6px';
    var lab = document.createElement('label');
    lab.className = 'l2-drops-buy-qty-label';
    lab.setAttribute('for', 'l2-sell-qty-input');
    lab.textContent = 'Кількість';
    var inp = document.createElement('input');
    inp.type = 'number';
    inp.id = 'l2-sell-qty-input';
    inp.className = 'l2-drops-buy-qty-input';
    inp.min = '1';
    inp.max = '9999';
    inp.step = '1';
    inp.value = '1';
    inp.setAttribute('data-sell-qty-input', '');
    var total = document.createElement('p');
    total.className = 'l2-drops-stats-modal__hint';
    total.setAttribute('data-sell-qty-total', '');
    total.style.marginTop = '4px';
    var row = document.createElement('div');
    row.className = 'l2-drops-buy-qty-actions';
    var cancel = document.createElement('button');
    cancel.type = 'button';
    cancel.className = 'l2-drops-buy-qty-btn l2-drops-buy-qty-btn--muted';
    cancel.textContent = 'Скасувати';
    cancel.addEventListener('click', closeSellModals);
    var ok = document.createElement('button');
    ok.type = 'button';
    ok.className =
      'l2-drops-buy-qty-btn l2-drops-buy-qty-btn--primary l2-sell-items-modal-sell-btn';
    ok.textContent = 'Продати';
    ok.setAttribute('data-sell-qty-confirm', '');
    row.appendChild(cancel);
    row.appendChild(ok);
    pan.appendChild(clo);
    pan.appendChild(head);
    pan.appendChild(unit);
    pan.appendChild(lab);
    pan.appendChild(inp);
    pan.appendChild(total);
    pan.appendChild(row);
    el.appendChild(bd);
    el.appendChild(pan);
    document.body.appendChild(el);
    return el;
  }

  function clampSellListPage() {
    var stacks = filteredStacks();
    if (!stacks.length) {
      statePage = 0;
      return;
    }
    var totalPages = Math.ceil(stacks.length / PAGE_SIZE);
    if (statePage >= totalPages) statePage = Math.max(0, totalPages - 1);
    if (statePage < 0) statePage = 0;
  }

  function refetchSellCharacter() {
    if (window.L2 && typeof L2.resyncCharacterWhenRequired === 'function') {
      return L2.resyncCharacterWhenRequired();
    }
    return Promise.resolve(null);
  }

  function releaseSellLock() {
    sellInFlight = false;
  }

  function finishSellUi(stack, qty, total) {
    releaseSellLock();
    closeSellModals();
    clampSellListPage();
    paint();
    setSellCongrats(stack, qty, total);
  }

  /** Snapshot з POST /game/shop/sell — єдине джерело правди; refetch лише якщо немає в тілі. */
  function resolveCharacterAfterSell(responseCharacter) {
    if (responseCharacter && typeof responseCharacter === 'object') {
      return Promise.resolve(responseCharacter);
    }
    return refetchSellCharacter();
  }

  function refreshPageAfterSell(character, stack, qty, total) {
    releaseSellLock();
    if (!character) {
      setMsg('Продано, але не вдалося оновити список — онови сторінку.');
      closeSellModals();
      paint();
      return;
    }
    applySnapshotFromServer(character);
    finishSellUi(stack, qty, total);
  }

  function setModalSellBusy(okBtn, busy) {
    if (!okBtn) return;
    if (busy) {
      if (!okBtn.dataset.sellLabel) {
        okBtn.dataset.sellLabel = okBtn.textContent || 'Продати';
      }
      okBtn.disabled = true;
      okBtn.textContent = '…';
      return;
    }
    okBtn.disabled = sellInFlight;
    okBtn.textContent = okBtn.dataset.sellLabel || 'Продати';
  }

  function performSellFromModal(stack, qty, okBtn) {
    if (sellInFlight || !snap) return Promise.resolve();
    var itemId = stack.itemId;
    var enchant = stack.enchant || 0;
    var total = sellTotalFor(itemId, qty);
    if (total == null) {
      setMsg('Цей предмет не продається.');
      return Promise.resolve();
    }

    var token = localStorage.getItem('token');
    if (!token) {
      setMsg('Потрібен вхід.');
      return Promise.resolve();
    }
    var rev = snap.revision;
    if (!rev) {
      setMsg('Немає revision — онови сторінку.');
      return Promise.resolve();
    }

    sellInFlight = true;
    setModalSellBusy(okBtn, true);
    setMsg('');

    return fetch('/game/shop/sell', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        itemId: itemId,
        enchant: enchant,
        qty: qty,
        expectedRevision: rev,
      }),
    })
      .then(function (r) {
        if (r.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/';
          return null;
        }
        if (r.status === 409) {
          return r.json().then(function (j409) {
            return window.L2 &&
              typeof L2.resyncCharacterAfterConflict === 'function'
              ? L2.resyncCharacterAfterConflict(function (s) {
                  snap = s;
                }, j409).then(function () {
                  releaseSellLock();
                  paint();
                  setMsg('Стан оновлено — спробуй ще раз.');
                })
              : Promise.resolve().then(function () {
                  releaseSellLock();
                  paint();
                  setMsg('Конфлікт ревізії — онови сторінку.');
                });
          });
        }
        return r.json().then(function (j) {
          if (!r.ok) {
            setMsg((j && j.messageUk) || 'Не вдалося продати.');
            if (j && j.error === 'shop_sell_not_in_bag') {
              return refetchSellCharacter().then(function (fresh) {
                if (fresh) {
                  applySnapshotFromServer(fresh);
                  clampSellListPage();
                }
              });
            }
            return null;
          }
          if (j && j.character) {
            refreshPageAfterSell(j.character, stack, qty, total);
            return j.character;
          }
          return resolveCharacterAfterSell(null).then(function (fresh) {
            refreshPageAfterSell(fresh, stack, qty, total);
          });
        });
      })
      .catch(function () {
        setMsg('Помилка мережі.');
      })
      .finally(function () {
        setModalSellBusy(okBtn, false);
        if (!sellInFlight) return;
        releaseSellLock();
        paint();
      });
  }

  function openSellConfirmModal(stack) {
    var maxQty = stack.qty || 1;
    var unit = sellPriceFor(stack.itemId);
    if (unit == null) {
      setMsg('Цей предмет не продається.');
      return;
    }
    var el = ensureSellConfirmModalDom();
    closeSellModals();
    var tit = el.querySelector('[data-sell-confirm-title]');
    var msg = el.querySelector('[data-sell-confirm-msg]');
    var ok = el.querySelector('[data-sell-confirm-ok]');
    var name = formatEnchantedName(itemDisplayName(stack.itemId), stack.enchant);
    var total = sellTotalFor(stack.itemId, maxQty);
    if (tit) tit.textContent = 'Продаж';
    if (msg) {
      msg.textContent =
        'Продати «' +
        name +
        '» за ' +
        formatAdena(total) +
        ' адени?';
    }
    if (ok) {
      ok.disabled = sellInFlight;
      ok.onclick = function () {
        if (sellInFlight) return;
        performSellFromModal(stack, maxQty, ok);
      };
    }
    el.hidden = false;
    try {
      document.body.style.overflow = 'hidden';
    } catch (_) {}
    bindSellModalEsc();
  }

  function openSellQtyModal(stack) {
    var maxQty = Math.max(1, Math.floor(stack.qty || 1));
    var unit = sellPriceFor(stack.itemId);
    if (unit == null) {
      setMsg('Цей предмет не продається.');
      return;
    }
    var el = ensureSellQtyModalDom();
    closeSellModals();
    var tit = el.querySelector('[data-sell-qty-title]');
    var unitEl = el.querySelector('[data-sell-qty-unit]');
    var inp = el.querySelector('[data-sell-qty-input]');
    var totalEl = el.querySelector('[data-sell-qty-total]');
    var ok = el.querySelector('[data-sell-qty-confirm]');
    var name = formatEnchantedName(itemDisplayName(stack.itemId), stack.enchant);
    if (tit) tit.textContent = 'Продаж: ' + name;
    if (unitEl) {
      unitEl.textContent =
        'Ціна за шт.: ' + formatAdena(unit) + ' адена (у сумці: ' + maxQty + ')';
    }
    if (inp) {
      inp.max = String(maxQty);
      inp.value = String(maxQty);
    }
    function refreshTotal() {
      if (!inp || !totalEl) return;
      var q = parseInt(String(inp.value), 10);
      if (!Number.isFinite(q) || q < 1) q = 1;
      if (q > maxQty) q = maxQty;
      var t = sellTotalFor(stack.itemId, q);
      totalEl.textContent =
        'Сума: ' + formatAdena(t != null ? t : 0) + ' адена';
    }
    if (inp) {
      inp.oninput = refreshTotal;
      inp.onchange = refreshTotal;
    }
    refreshTotal();
    if (ok) {
      ok.disabled = sellInFlight;
      ok.onclick = function () {
        if (sellInFlight || !inp) return;
        var q = parseInt(String(inp.value), 10);
        if (!Number.isFinite(q) || q < 1 || q > maxQty) {
          setMsg('Вкажи кількість від 1 до ' + maxQty + '.');
          return;
        }
        performSellFromModal(stack, q, ok);
      };
    }
    el.hidden = false;
    try {
      document.body.style.overflow = 'hidden';
    } catch (_) {}
    bindSellModalEsc();
    if (inp) {
      try {
        inp.focus();
        inp.select();
      } catch (_) {}
    }
  }

  function filteredStacks() {
    var inv = (snap && snap.inventory) || { stacks: [] };
    var stacks = inv.stacks || [];
    var out = [];
    for (var i = 0; i < stacks.length; i++) {
      var st = stacks[i];
      if (!st || !st.itemId) continue;
      if (!itemMatchesCat(st.itemId, stateCat)) continue;
      if (!itemMatchesGrade(st.itemId, stateGrade)) continue;
      out.push(st);
    }
    out.sort(function (a, b) {
      var na = itemDisplayName(a.itemId);
      var nb = itemDisplayName(b.itemId);
      return na.localeCompare(nb, 'uk');
    });
    return out;
  }

  function formatAdena(n) {
    var x = Number(n);
    if (!Number.isFinite(x)) return '0';
    return String(Math.floor(x)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  function appendFilterBtn(parent, label, active, onClick, btnClass) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = btnClass || 'l2-sell-items-tab';
    if (active) btn.classList.add('l2-sell-items-tab--active');
    btn.textContent = label;
    btn.addEventListener('click', onClick);
    parent.appendChild(btn);
  }

  function buildFilterRow(items, rowClass) {
    var row = document.createElement('div');
    row.className = 'l2-sell-items-filter-row ' + rowClass;
    row.setAttribute('role', 'tablist');
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      appendFilterBtn(row, it.label, it.active, it.onClick);
    }
    return row;
  }

  function appendPager(parent, totalItems, onPage) {
    if (totalItems <= PAGE_SIZE) return;
    var totalPages = Math.ceil(totalItems / PAGE_SIZE);
    if (statePage >= totalPages) statePage = totalPages - 1;
    if (statePage < 0) statePage = 0;

    var pager = document.createElement('div');
    pager.className = 'l2-gm-shop-pager l2-gm-shop-pager--arrow';
    var prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.className = 'l2-gm-shop-pager-btn';
    prevBtn.textContent = '<';
    prevBtn.disabled = statePage <= 0;
    var nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'l2-gm-shop-pager-btn';
    nextBtn.textContent = '>';
    nextBtn.disabled = statePage >= totalPages - 1;
    prevBtn.addEventListener('click', function () {
      if (statePage <= 0) return;
      statePage -= 1;
      onPage();
    });
    nextBtn.addEventListener('click', function () {
      if (statePage >= totalPages - 1) return;
      statePage += 1;
      onPage();
    });
    pager.appendChild(prevBtn);
    pager.appendChild(nextBtn);
    parent.appendChild(pager);
  }

  function sellStack(stack) {
    if (sellInFlight || !snap) return;
    if (sellPriceFor(stack.itemId) == null) {
      setMsg('Цей предмет не продається.');
      return;
    }
    var qty = stack.qty || 1;
    if (qty > 1) {
      openSellQtyModal(stack);
      return;
    }
    openSellConfirmModal(stack);
  }

  function buildItemRow(stack) {
    var row = document.createElement('div');
    row.className = 'l2-sell-items-row';

    var icon = document.createElement('img');
    icon.className = 'l2-sell-items-row__icon';
    icon.alt = '';
    icon.width = 32;
    icon.height = 32;
    icon.src = itemIconUrlForId(stack.itemId);
    icon.onerror = function () {
      icon.onerror = null;
      icon.src = '/icons/drops/other.svg';
    };

    var body = document.createElement('div');
    body.className = 'l2-sell-items-row__body';
    var name = document.createElement('div');
    name.className =
      window.L2 && typeof L2.itemNameClassNames === 'function'
        ? L2.itemNameClassNames(stack.itemId, 'l2-sell-items-row__name')
        : 'l2-sell-items-row__name';
    var label = formatEnchantedName(itemDisplayName(stack.itemId), stack.enchant);
    if (stack.qty > 1) label += ' ×' + stack.qty;
    name.textContent = label;

    var statParts = itemStatsParts(stack.itemId);
    if (statParts.length) {
      var statEl = document.createElement('div');
      statEl.className = 'l2-sell-items-row__stats';
      appendRowStats(statEl, statParts);
      body.appendChild(statEl);
    }

    var price = document.createElement('div');
    price.className = 'l2-sell-items-row__price';
    var total = sellTotalFor(stack.itemId, stack.qty || 1);
    var canSell = total != null;
    price.textContent =
      canSell ? formatAdena(total) + ' адена' : 'Не продається';

    body.appendChild(name);
    body.appendChild(price);

    var sellBtn = document.createElement('button');
    sellBtn.type = 'button';
    sellBtn.className = 'l2-sell-items-row__sell';
    sellBtn.textContent = 'Продати';
    sellBtn.disabled = sellInFlight || !canSell;
    sellBtn.addEventListener('click', function () {
      sellStack(stack);
    });

    row.appendChild(icon);
    row.appendChild(body);
    row.appendChild(sellBtn);
    return row;
  }

  function paint() {
    var mount = $('sell-items-mount');
    if (!mount) return;
    mount.innerHTML = '';

    var layout = document.createElement('div');
    layout.className = 'l2-sell-items-layout';

    var filtersBlock = document.createElement('div');
    filtersBlock.className = 'l2-sell-items-filters';
    filtersBlock.setAttribute('aria-label', 'Фільтри');

    var catItems = [];
    for (var ci = 0; ci < CAT_ORDER.length; ci++) {
      (function (c) {
        catItems.push({
          label: CAT_LABEL_UK[c],
          active: stateCat === c,
          onClick: function () {
            stateCat = c;
            statePage = 0;
            paint();
          },
        });
      })(CAT_ORDER[ci]);
    }
    filtersBlock.appendChild(
      buildFilterRow(catItems, 'l2-sell-items-filter-row--cats')
    );

    var gradeSep = document.createElement('div');
    gradeSep.className = 'l2-sell-items-filter-row-sep';
    gradeSep.setAttribute('aria-hidden', 'true');
    filtersBlock.appendChild(gradeSep);

    var gradeItems = [];
    for (var gi = 0; gi < GRADE_ORDER.length; gi++) {
      (function (g) {
        gradeItems.push({
          label: GRADE_LABEL_UK[g] || g,
          active: stateGrade === g,
          onClick: function () {
            stateGrade = g;
            statePage = 0;
            paint();
          },
        });
      })(GRADE_ORDER[gi]);
    }
    filtersBlock.appendChild(
      buildFilterRow(gradeItems, 'l2-sell-items-filter-row--grades')
    );

    var itemsCol = document.createElement('div');
    itemsCol.className = 'l2-sell-items-list-col';

    var stacks = filteredStacks();
    var pageStart = statePage * PAGE_SIZE;
    var pageStacks = stacks.slice(pageStart, pageStart + PAGE_SIZE);

    if (!stacks.length) {
      var empty = document.createElement('p');
      empty.className = 'l2-sell-items-empty';
      empty.textContent = 'У сумці немає предметів у цій категорії.';
      itemsCol.appendChild(empty);
    } else {
      var list = document.createElement('div');
      list.className = 'l2-sell-items-list';
      for (var i = 0; i < pageStacks.length; i++) {
        list.appendChild(buildItemRow(pageStacks[i]));
      }
      itemsCol.appendChild(list);
      appendPager(itemsCol, stacks.length, paint);
    }

    layout.appendChild(filtersBlock);
    layout.appendChild(itemsCol);
    mount.appendChild(layout);
  }

  function applySnapshotFromServer(character) {
    if (!character) return;
    snap = character;
    syncAdenaHeader(character);
    if (window.L2 && typeof L2.applyCharacterSnapshot === 'function') {
      L2.applyCharacterSnapshot(character);
      return;
    }
    if (window.L2 && typeof L2.setLastSnapshot === 'function') {
      L2.setLastSnapshot(character);
    }
    if (window.L2 && typeof L2.applyHudFromSnapshot === 'function') {
      L2.applyHudFromSnapshot(character);
    }
    try {
      sessionStorage.setItem(
        'l2-char-snapshot-cache-v1',
        JSON.stringify(character)
      );
    } catch (_e) {
      /* ignore cache quota */
    }
  }

  function initPage() {
    stateCat = 'all';
    stateGrade = 'all';
    statePage = 0;
    var token = localStorage.getItem('token');
    if (!token) {
      setMsg('Потрібен вхід.');
      return;
    }

    Promise.all([
      (function () {
        if (window.L2 && typeof L2.renderCharacterFromCache === 'function') {
          L2.renderCharacterFromCache();
        }
        return window.L2 && typeof L2.resyncCharacterWhenRequired === 'function'
          ? L2.resyncCharacterWhenRequired()
          : Promise.resolve(null);
      })(),
      fetch('/game/shop/sell/prices', {
        headers: { Authorization: 'Bearer ' + token },
      }).then(function (r) {
        if (r.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/';
          return null;
        }
        return r.ok ? r.json() : null;
      }),
    ])
      .then(function (pair) {
        var snap = pair[0];
        var pricesResp = pair[1];
        if (!snap) {
          setMsg('Не вдалося завантажити персонажа.');
          return;
        }
        sellPrices = (pricesResp && pricesResp.prices) || {};
        applySnapshotFromServer(snap);
        var hintsReady =
          window.L2 && typeof L2.fetchCatalogHints === 'function'
            ? L2.fetchCatalogHints()
            : Promise.resolve(true);
        return hintsReady.then(function () {
          paint();
        });
      })
      .catch(function () {
        setMsg('Не вдалося завантажити дані.');
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPage);
  } else {
    initPage();
  }
})();
