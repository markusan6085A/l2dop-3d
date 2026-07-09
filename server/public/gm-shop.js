/**
 * Магазин екіпу: GET /game/drops-shop.
 * Ряд 1: Зброя / Щити / Броня / Аксесуари / Розхідники.
 * Ряд 2: грейд NG…S для обраної вкладки.
 * Ряд 3: підтип для Зброя / Броня / Аксесуари / Розхідники (інші вкладки — приховано).
 */
(function () {
  var SS_UI = 'drops-shop-ui';
  /** Повідомлення після успішної покупки (під заголовком грейду). */
  var lastPurchaseMsg = null;

  function setPurchaseCongrats(nameUk, qty) {
    var name = String(nameUk || 'предмет').trim();
    var q = Math.max(1, Math.floor(Number(qty) || 1));
    if (q > 1) {
      lastPurchaseMsg = 'Вітаємо! Ви придбали «' + name + '» × ' + q;
    } else {
      lastPurchaseMsg = 'Вітаємо! Ви придбали «' + name + '»';
    }
  }

  function clearPurchaseCongrats() {
    lastPurchaseMsg = null;
  }

  /** Порядок кнопок підкатегорій у UI (ключі як у API). */
  var CAT_ORDER = ['weapon', 'shield', 'armor', 'earring', 'consumable'];

  var CAT_LABEL_UK = {
    weapon: 'Зброя',
    shield: 'Щити',
    armor: 'Броня',
    earring: 'Аксесуари',
    consumable: 'Розхідники',
  };

  /** Порядок табів грейду. */
  var GRADE_ORDER = ['NG', 'D', 'C', 'B', 'A', 'S'];

  /** Підкатегорія зброї (під грейдом), лише категорія «Зброя». Перший ключ — усім типам. */
  var WEAPON_SUB_KEYS = [
    'all',
    'sword',
    'dagger',
    'bow',
    'blunt',
    'pole',
    'fist',
    'dual',
    'magic',
  ];

  var WEAPON_SUB_LABEL_UK = {
    all: 'Усі',
    sword: 'Мечі',
    dagger: 'Кинжали',
    bow: 'Луки',
    blunt: 'Булави',
    pole: 'Списи',
    fist: 'Кастети',
    dual: 'Дуалі',
    magic: 'Магія',
  };

  /** Підрозділи броні (ключі збігаються з armorPiece від сервера). */
  var ARMOR_SUB_KEYS = ['all', 'head', 'torso', 'legs', 'gloves', 'feet'];

  var ARMOR_SUB_LABEL_UK = {
    all: 'Усі',
    head: 'Шолом',
    torso: 'Торс',
    legs: 'Штани',
    gloves: 'Перчатки',
    feet: 'Чоботи',
  };

  /** Аксесуари — jewelrySubtype від сервера; category API лишається earring. */
  var JEWELRY_SUB_KEYS = ['all', 'neck', 'earring', 'ring'];

  var JEWELRY_SUB_LABEL_UK = {
    all: 'Усі',
    neck: 'Амулет',
    earring: 'Сережки',
    ring: 'Кільця',
  };

  /** Підвкладки «Розхідники» (відповідає `consumableSubtype` у відповіді API). */
  var CONSUMABLE_SUB_KEYS = ['all', 'vials', 'arrows', 'charges'];

  var CONSUMABLE_SUB_LABEL_UK = {
    all: 'Усі',
    vials: 'Банки',
    arrows: 'Стріли',
    charges: 'Заряди',
  };

  function $(id) {
    return document.getElementById(id);
  }

  function fmtAdena(s) {
    if (s == null || s === '') return '—';
    try {
      return BigInt(String(s)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f');
    } catch (_) {
      return String(s);
    }
  }

  function resolveShopItemIcon(it) {
    var fallback = (it && it.iconUrl) || '/icons/drops/other.svg';
    var id =
      it && it.previewItemId != null
        ? it.previewItemId
        : it && it.itemId != null
          ? it.itemId
          : 0;
    if (window.L2 && typeof window.L2.rememberItemIconHint === 'function') {
      if (it && it.itemId != null && it.iconUrl) {
        window.L2.rememberItemIconHint(it.itemId, it.iconUrl);
      }
      if (it && it.previewItemId != null && it.iconUrl) {
        window.L2.rememberItemIconHint(it.previewItemId, it.iconUrl);
      }
    }
    if (window.L2 && typeof window.L2.resolveItemIconUrl === 'function') {
      return window.L2.resolveItemIconUrl(id, fallback);
    }
    return fallback;
  }

  var STATS_MODAL_ID = 'l2-drops-shop-stats-modal';
  var dropsStatsKeybound = false;

  function closeDropsStatsModal() {
    var el = $(STATS_MODAL_ID);
    if (!el || el.hidden) return;
    el.hidden = true;
    try {
      document.body.style.overflow = '';
    } catch (_) {}
    if (dropsStatsKeybound) {
      document.removeEventListener('keydown', dropsStatsEsc);
      dropsStatsKeybound = false;
    }
  }

  function dropsStatsEsc(e) {
    if (e.key === 'Escape') closeDropsStatsModal();
  }

  function ensureStatsModalDom() {
    var el = $(STATS_MODAL_ID);
    if (el) return el;
    el = document.createElement('div');
    el.id = STATS_MODAL_ID;
    el.className = 'l2-drops-stats-modal';
    el.hidden = true;
    var bd = document.createElement('button');
    bd.type = 'button';
    bd.className = 'l2-drops-stats-modal__backdrop';
    bd.setAttribute('aria-label', 'Закрити');
    bd.addEventListener('click', closeDropsStatsModal);
    var pan = document.createElement('div');
    pan.className = 'l2-drops-stats-modal__panel';
    pan.setAttribute('role', 'dialog');
    pan.setAttribute('aria-modal', 'true');
    var clo = document.createElement('button');
    clo.type = 'button';
    clo.className = 'l2-drops-stats-modal__close';
    clo.setAttribute('aria-label', 'Закрити');
    clo.appendChild(document.createTextNode('\u00D7'));
    clo.addEventListener('click', closeDropsStatsModal);
    var sectTitle = document.createElement('h2');
    sectTitle.className = 'l2-item-modal-heading';
    sectTitle.textContent = 'Інформація про предмет';
    var head = document.createElement('div');
    head.className = 'l2-drops-stats-modal__head';
    var ico = document.createElement('img');
    ico.className = 'l2-drops-stats-modal__ico';
    ico.alt = '';
    var tit = document.createElement('div');
    tit.className = 'l2-drops-stats-modal__title';
    tit.setAttribute('data-modal-title', '');
    head.appendChild(ico);
    head.appendChild(tit);
    var statsMount = document.createElement('div');
    statsMount.className = 'l2-drops-stats-modal__stats-mount';
    statsMount.setAttribute('data-modal-stats', '');
    var hin = document.createElement('p');
    hin.className = 'l2-drops-stats-modal__hint';
    hin.setAttribute('data-modal-hint', '');
    var armorSets = document.createElement('div');
    armorSets.className = 'l2-drops-stats-modal__armor-sets';
    armorSets.setAttribute('data-modal-armor-sets', '');
    armorSets.hidden = true;
    pan.appendChild(clo);
    pan.appendChild(sectTitle);
    pan.appendChild(head);
    pan.appendChild(statsMount);
    pan.appendChild(hin);
    pan.appendChild(armorSets);
    el.appendChild(bd);
    el.appendChild(pan);
    document.body.appendChild(el);
    return el;
  }

  var BUY_QTY_MODAL_ID = 'l2-drops-shop-buy-qty-modal';
  var buyQtyKeybound = false;

  function closeBuyQtyModal() {
    var el = $(BUY_QTY_MODAL_ID);
    if (!el || el.hidden) return;
    el.hidden = true;
    try {
      document.body.style.overflow = '';
    } catch (_) {}
    if (buyQtyKeybound) {
      document.removeEventListener('keydown', buyQtyEsc);
      buyQtyKeybound = false;
    }
  }

  function buyQtyEsc(e) {
    if (e.key === 'Escape') closeBuyQtyModal();
  }

  function ensureBuyQtyModalDom() {
    var el = $(BUY_QTY_MODAL_ID);
    if (el) return el;
    el = document.createElement('div');
    el.id = BUY_QTY_MODAL_ID;
    el.className = 'l2-drops-stats-modal';
    el.hidden = true;
    var bd = document.createElement('button');
    bd.type = 'button';
    bd.className = 'l2-drops-stats-modal__backdrop';
    bd.setAttribute('aria-label', 'Закрити');
    bd.addEventListener('click', closeBuyQtyModal);
    var pan = document.createElement('div');
    pan.className = 'l2-drops-stats-modal__panel';
    pan.setAttribute('role', 'dialog');
    pan.setAttribute('aria-modal', 'true');
    pan.setAttribute('aria-labelledby', 'l2-drops-buy-qty-title');
    var clo = document.createElement('button');
    clo.type = 'button';
    clo.className = 'l2-drops-stats-modal__close';
    clo.setAttribute('aria-label', 'Закрити');
    clo.appendChild(document.createTextNode('\u00D7'));
    clo.addEventListener('click', closeBuyQtyModal);
    var head = document.createElement('div');
    head.className = 'l2-drops-stats-modal__head';
    var tit = document.createElement('div');
    tit.className = 'l2-drops-stats-modal__title';
    tit.id = 'l2-drops-buy-qty-title';
    tit.setAttribute('data-buy-title', '');
    head.appendChild(tit);
    var unit = document.createElement('p');
    unit.className = 'l2-drops-stats-modal__hint';
    unit.setAttribute('data-buy-unit', '');
    unit.style.marginTop = '6px';
    var lab = document.createElement('label');
    lab.className = 'l2-drops-buy-qty-label';
    lab.setAttribute('for', 'l2-drops-buy-qty-input');
    lab.textContent = 'Кількість';
    var inp = document.createElement('input');
    inp.type = 'number';
    inp.id = 'l2-drops-buy-qty-input';
    inp.className = 'l2-drops-buy-qty-input';
    inp.min = '1';
    inp.max = '9999';
    inp.step = '1';
    inp.value = '1';
    inp.setAttribute('data-buy-qty-input', '');
    var total = document.createElement('p');
    total.className = 'l2-drops-stats-modal__hint';
    total.setAttribute('data-buy-total', '');
    total.style.marginTop = '4px';
    var row = document.createElement('div');
    row.className = 'l2-drops-buy-qty-actions';
    var cancel = document.createElement('button');
    cancel.type = 'button';
    cancel.className = 'l2-drops-buy-qty-btn l2-drops-buy-qty-btn--muted';
    cancel.textContent = 'Скасувати';
    cancel.addEventListener('click', closeBuyQtyModal);
    var ok = document.createElement('button');
    ok.type = 'button';
    ok.className = 'l2-drops-buy-qty-btn l2-drops-buy-qty-btn--primary';
    ok.textContent = 'Купити';
    ok.setAttribute('data-buy-qty-confirm', '');
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

  /**
   * POST /game/drops-shop/buy; lockElts — елементи, які блокувати під час запиту.
   * closeModalOnSuccess — закрити модалку кількості; focusAfterBtn — повернути фокус після успіху.
   */
  function performDropsShopBuy(
    it,
    qty,
    snap,
    tok,
    rerender,
    metaEl,
    mount,
    shopData,
    lockElts,
    closeModalOnSuccess,
    focusAfterBtn
  ) {
    var lock =
      lockElts == null ? [] : Array.isArray(lockElts) ? lockElts : [lockElts];
    function setLocked(dis) {
      for (var li = 0; li < lock.length; li++) {
        if (lock[li]) lock[li].disabled = dis;
      }
    }
    setLocked(true);
    fetch('/game/drops-shop/buy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + tok,
      },
      body: JSON.stringify({
        shopKey: it.shopKey,
        expectedRevision: snap.revision,
        qty: qty,
      }),
    })
      .then(function (r) {
        if (r.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/';
          return null;
        }
        return r.json().then(function (j) {
          return { r: r, j: j };
        });
      })
      .then(function (pair) {
        setLocked(false);
        if (!pair) return;
        if (pair.r.status === 409) {
          return fetch('/character', {
            headers: { Authorization: 'Bearer ' + tok },
          })
            .then(function (rx) {
              return rx.ok ? rx.json() : null;
            })
            .then(function (jch) {
              if (jch && jch.character && window.L2) {
                if (window.L2.setLastSnapshot)
                  window.L2.setLastSnapshot(jch.character);
                if (typeof window.L2.applyHudFromSnapshot === 'function')
                  window.L2.applyHudFromSnapshot(jch.character);
              }
              alert(
                pair.j.messageUk ||
                  'Конфлікт ревізії — дані оновлено, спробуй ще раз.'
              );
              if (jch && jch.character)
                rerender(metaEl, mount, shopData, jch.character);
            });
        }
        if (!pair.r.ok) {
          var msgUk =
            (pair.j && pair.j.messageUk) ||
            (pair.j && pair.j.error) ||
            pair.r.status;
          alert(String(msgUk));
          return;
        }
        if (closeModalOnSuccess) closeBuyQtyModal();
        var nc = pair.j.character;
        setPurchaseCongrats(it.nameUk || it.shopKey, qty);
        if (
          window.L2 &&
          typeof window.L2.rememberItemIconHint === 'function' &&
          it &&
          it.itemId != null &&
          it.iconUrl
        ) {
          window.L2.rememberItemIconHint(it.itemId, it.iconUrl);
        }
        if (window.L2 && window.L2.setLastSnapshot)
          window.L2.setLastSnapshot(nc);
        if (
          window.L2 &&
          typeof window.L2.applyHudFromSnapshot === 'function'
        )
          window.L2.applyHudFromSnapshot(nc);
        rerender(metaEl, mount, shopData, nc);
        cloFocus(focusAfterBtn);
      })
      .catch(function () {
        setLocked(false);
        alert('Помилка мережі.');
      });
  }

  function openDropsShopBuyQty(
    it,
    snap,
    tok,
    rerender,
    metaEl,
    mount,
    shopData,
    srcBtn
  ) {
    var modal = ensureBuyQtyModalDom();
    var titleEl = modal.querySelector('[data-buy-title]');
    var unitEl = modal.querySelector('[data-buy-unit]');
    var inp = modal.querySelector('[data-buy-qty-input]');
    var totalEl = modal.querySelector('[data-buy-total]');
    var okBtn = modal.querySelector('[data-buy-qty-confirm]');
    if (
      !titleEl ||
      !unitEl ||
      !inp ||
      !totalEl ||
      !okBtn ||
      !snap ||
      snap.revision == null
    ) {
      return;
    }
    titleEl.textContent = it.nameUk || it.shopKey || '';
    var unitTxt =
      it.priceAdena != null
        ? fmtAdena(String(it.priceAdena)) + ' аден.'
        : '—';
    unitEl.textContent = 'За одиницю: ' + unitTxt;
    inp.value = '1';

    function syncTotal() {
      var raw = parseInt(String(inp.value || '1'), 10);
      var q = Number.isFinite(raw) && raw >= 1 ? raw : 1;
      if (it.priceAdena == null) {
        totalEl.textContent = '—';
        return;
      }
      try {
        var t = BigInt(String(it.priceAdena)) * BigInt(q);
        totalEl.textContent =
          'Разом: ' + fmtAdena(String(t)) + ' аден.';
      } catch (_) {
        totalEl.textContent = '—';
      }
    }

    inp.oninput = syncTotal;
    syncTotal();

    okBtn.onclick = function () {
      var rawQ = parseInt(String(inp.value || '1'), 10);
      var qty =
        Number.isFinite(rawQ) && rawQ >= 1 && rawQ <= 9999 ? rawQ : NaN;
      if (!Number.isFinite(qty)) {
        alert('Вкажи кількість від 1 до 9999.');
        return;
      }
      performDropsShopBuy(
        it,
        qty,
        snap,
        tok,
        rerender,
        metaEl,
        mount,
        shopData,
        okBtn,
        true,
        srcBtn
      );
    };

    modal.hidden = false;
    try {
      document.body.style.overflow = 'hidden';
    } catch (_) {}
    if (!buyQtyKeybound) {
      document.addEventListener('keydown', buyQtyEsc);
      buyQtyKeybound = true;
    }
    try {
      inp.focus();
      inp.select();
    } catch (_) {}
  }

  function cloFocus(btn) {
    try {
      if (btn && btn.focus) btn.focus();
    } catch (_) {}
  }

  function openDropsShopStats(it) {
    var modal = ensureStatsModalDom();
    var titleEl = modal.querySelector('[data-modal-title]');
    var statsMount = modal.querySelector('[data-modal-stats]');
    var hintEl = modal.querySelector('[data-modal-hint]');
    var ico = modal.querySelector('.l2-drops-stats-modal__ico');

    titleEl.textContent = it.nameUk || it.shopKey || '';
    if (ico) {
      ico.src = resolveShopItemIcon(it);
      ico.onerror = function () {
        ico.src = '/icons/drops/other.svg';
      };
    }

    while (statsMount.firstChild) statsMount.removeChild(statsMount.firstChild);
    var lines =
      it.statsPreview && it.statsPreview.lines ? it.statsPreview.lines : [];

    if (!lines.length) {
      var fallback = document.createElement('p');
      fallback.className = 'l2-drops-stats-modal__empty';
      fallback.textContent =
        'Для цього предмета в каталозі ще нема числових характеристик або не зібраний GM-каталог за іконкою.';
      statsMount.appendChild(fallback);
    } else {
      var statsBox = document.createElement('div');
      statsBox.className = 'l2-item-modal-stats';
      for (var li = 0; li < lines.length; li++) {
        var ln = lines[li];
        if (window.L2 && typeof window.L2.appendItemStatLine === 'function') {
          window.L2.appendItemStatLine(statsBox, ln.labelUk, ln.valueUk);
        } else {
          var sp = document.createElement('p');
          sp.className = 'l2-item-modal-stat l2-item-modal-stat--default';
          var lbl = ln.labelUk != null ? String(ln.labelUk).trim() : '';
          var val = ln.valueUk != null ? String(ln.valueUk) : '';
          sp.textContent = lbl ? lbl + ': ' + val : val;
          statsBox.appendChild(sp);
        }
      }
      statsMount.appendChild(statsBox);
    }

    if (it.purchasable && it.priceAdena != null) {
      hintEl.hidden = false;
      hintEl.textContent = fmtAdena(String(it.priceAdena)) + ' аден.';
    } else {
      hintEl.hidden = true;
      hintEl.textContent = '';
    }

    var armorHost = modal.querySelector('[data-modal-armor-sets]');
    if (armorHost && window.L2ArmorSetBonusesUI) {
      if (it.category === 'armor' && it.grade !== 'NG') {
        var armorPid =
          it.previewItemId != null ? it.previewItemId : it.itemId;
        window.L2ArmorSetBonusesUI.showIn(armorHost, it.grade, armorPid);
      } else {
        window.L2ArmorSetBonusesUI.hide(armorHost);
      }
    }

    modal.hidden = false;
    try {
      document.body.style.overflow = 'hidden';
    } catch (_) {}
    if (!dropsStatsKeybound) {
      document.addEventListener('keydown', dropsStatsEsc);
      dropsStatsKeybound = true;
    }
    cloFocus(modal.querySelector('.l2-drops-stats-modal__close'));
  }

  function setMsg(el, text) {
    if (!el) return;
    if (!text) {
      el.hidden = true;
      el.textContent = '';
      return;
    }
    el.hidden = false;
    el.textContent = text;
  }

  function sortGrades(grList) {
    return grList.slice().sort(function (a, b) {
      var ia = GRADE_ORDER.indexOf(a.grade);
      var ib = GRADE_ORDER.indexOf(b.grade);
      if (ia === -1) ia = 99;
      if (ib === -1) ib = 99;
      return ia - ib;
    });
  }

  function findSection(gEnt, category) {
    var secs = gEnt.sections || [];
    for (var i = 0; i < secs.length; i++) {
      if (secs[i].category === category) return secs[i];
    }
    return null;
  }

  function categoryHasItems(gradesSorted, category) {
    for (var i = 0; i < gradesSorted.length; i++) {
      var sec = findSection(gradesSorted[i], category);
      if (sec && sec.items && sec.items.length) return true;
    }
    return false;
  }

  function categoryUkFromData(gradesSorted, category) {
    for (var i = 0; i < gradesSorted.length; i++) {
      var sec = findSection(gradesSorted[i], category);
      if (sec && sec.categoryUk) return sec.categoryUk;
    }
    return CAT_LABEL_UK[category] || category;
  }

  /** Грейди, у яких є хоч один предмет у цій категорії (у порядку GRADE_ORDER). */
  function gradesWithItemsForCategory(gradesSorted, category) {
    var out = [];
    for (var gi = 0; gi < GRADE_ORDER.length; gi++) {
      var g = GRADE_ORDER[gi];
      for (var j = 0; j < gradesSorted.length; j++) {
        if (gradesSorted[j].grade !== g) continue;
        var sec = findSection(gradesSorted[j], category);
        if (sec && sec.items && sec.items.length) {
          out.push(g);
          break;
        }
      }
    }
    return out;
  }

  function findGradeEntity(gradesSorted, grade) {
    for (var i = 0; i < gradesSorted.length; i++) {
      if (gradesSorted[i].grade === grade) return gradesSorted[i];
    }
    return null;
  }

  function loadUiState() {
    try {
      if (typeof sessionStorage === 'undefined') return null;
      var raw = sessionStorage.getItem(SS_UI);
      if (raw) {
        var o = JSON.parse(raw);
        if (o && typeof o.cat === 'string' && typeof o.grade === 'string') {
          var wsub =
            o.wsub && typeof o.wsub === 'string' ? o.wsub : 'all';
          var asub =
            o.asub && typeof o.asub === 'string' ? o.asub : 'all';
          var jsub =
            o.jsub && typeof o.jsub === 'string' ? o.jsub : 'all';
          var csub =
            o.csub && typeof o.csub === 'string' ? o.csub : 'all';
          return {
            cat: o.cat,
            grade: o.grade,
            wsub: wsub,
            asub: asub,
            jsub: jsub,
            csub: csub,
          };
        }
      }
      var legacy = sessionStorage.getItem('drops-shop-grade');
      if (legacy) {
        return {
          cat: null,
          grade: legacy,
          wsub: 'all',
          asub: 'all',
          jsub: 'all',
          csub: 'all',
        };
      }
    } catch (_) {}
    return null;
  }

  function saveUiState(
    cat,
    grade,
    weaponSub,
    armorSub,
    jewelrySub,
    consumableSub
  ) {
    try {
      if (typeof sessionStorage !== 'undefined') {
        var sto = {
          cat: cat,
          grade: grade,
          wsub: weaponSub != null ? weaponSub : 'all',
          asub: armorSub != null ? armorSub : 'all',
          jsub: jewelrySub != null ? jewelrySub : 'all',
          csub: consumableSub != null ? consumableSub : 'all',
        };
        sessionStorage.setItem(SS_UI, JSON.stringify(sto));
      }
    } catch (_) {}
  }

  function syncMeta(metaEl, snap) {
    if (!metaEl || !snap) return;
    metaEl.innerHTML =
      '<span class="l2-gm-shop-adena">Адена: <strong class="l2-gm-shop-adena__amount">' +
      fmtAdena(snap.adena) +
      '</strong></span>';
  }

  function addPurchaseRows(
    listEl,
    items,
    snap,
    shopData,
    metaEl,
    mount,
    rerender,
    shopCategory
  ) {
    var rev = snap && snap.revision != null ? snap.revision : null;
    var EPIC_SKIP = new Set([
      'necklace of frintessa i00',
      'necklace of valakas i00',
      'earring of antaras i00',
      'earring of zaken i00',
      'earring orfen',
      'ring of baium i00',
      'ring of core i00',
      'ring of queen ant',
    ]);
    for (var ii = 0; ii < items.length; ii++) {
      (function (it) {
        var nameLc = String(it.nameUk || it.shopKey || '').trim().toLowerCase();
        if (EPIC_SKIP.has(nameLc)) return;
        var row = document.createElement('div');
        row.className = 'l2-gm-shop-row';

        var iconWrap = document.createElement('button');
        iconWrap.type = 'button';
        iconWrap.className = 'l2-gm-shop-icon-btn';
        iconWrap.title = 'Показати характеристики';
        iconWrap.setAttribute('aria-label', 'Характеристики предмета');
        var img = document.createElement('img');
        img.alt = '';
        img.className = 'l2-gm-shop-icon-img';
        img.src = resolveShopItemIcon(it);
        img.addEventListener('error', function () {
          this.src = '/icons/drops/other.svg';
        });
        iconWrap.appendChild(img);
        iconWrap.addEventListener('click', function () {
          openDropsShopStats(it);
        });

        var main = document.createElement('div');
        main.className = 'l2-gm-shop-row-main';
        var nameEl = document.createElement('div');
        nameEl.className = 'l2-gm-shop-name';
        nameEl.textContent = it.nameUk || it.shopKey;
        main.appendChild(nameEl);
        if (it.statsPreview && it.statsPreview.lines && it.statsPreview.lines.length) {
          var statEl = document.createElement('div');
          statEl.className = 'l2-gm-shop-row-stat';
          var statParts = [];
          for (var si = 0; si < it.statsPreview.lines.length; si++) {
            var ln = it.statsPreview.lines[si];
            if (ln.labelUk) {
              statParts.push(ln.labelUk + ': ' + ln.valueUk);
            } else {
              statParts.push(ln.valueUk);
            }
          }
          statEl.textContent = statParts.join(' · ');
          main.appendChild(statEl);
        }
        if (it.purchasable && it.priceAdena != null) {
          var priceEl = document.createElement('div');
          priceEl.className = 'l2-gm-shop-price';
          priceEl.textContent = fmtAdena(String(it.priceAdena)) + ' аден.';
          main.appendChild(priceEl);
        }

        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'l2-gm-shop-buy';
        btn.textContent = 'Купити';
        btn.disabled =
          !it.purchasable || rev == null || !localStorage.getItem('token');
        btn.addEventListener('click', function () {
          if (btn.disabled) return;
          var tok = localStorage.getItem('token');
          if (!tok) return;
          if (shopCategory === 'consumable') {
            openDropsShopBuyQty(
              it,
              snap,
              tok,
              rerender,
              metaEl,
              mount,
              shopData,
              btn
            );
            return;
          }
          performDropsShopBuy(
            it,
            1,
            snap,
            tok,
            rerender,
            metaEl,
            mount,
            shopData,
            btn,
            false,
            btn
          );
        });

        row.appendChild(iconWrap);
        row.appendChild(main);
        row.appendChild(btn);
        listEl.appendChild(row);
      })(items[ii]);
    }
  }

  function render(metaEl, mount, shopData, snap) {
    if (!mount) return;

    mount.innerHTML = '';

    var rawGrades = (shopData && shopData.grades) || [];
    if (!rawGrades.length) {
      mount.textContent =
        'Каталог порожній — перевір server/public/icons/drops і npm run gen:drops-shop-catalog.';
      return;
    }

    var gradesSorted = sortGrades(rawGrades);

    var saved = loadUiState();

    var activeCats = CAT_ORDER.filter(function (c) {
      return categoryHasItems(gradesSorted, c);
    });
    if (!activeCats.length) {
      mount.textContent = 'У каталозі немає позицій за типами.';
      return;
    }

    var chosenCat = activeCats[0];
    var chosenGrade = '';

    if (saved && saved.cat && activeCats.indexOf(saved.cat) !== -1) {
      chosenCat = saved.cat;
    } else if (saved && saved.grade && !saved.cat) {
      for (var ac = 0; ac < activeCats.length; ac++) {
        var av = gradesWithItemsForCategory(gradesSorted, activeCats[ac]);
        if (av.indexOf(saved.grade) !== -1) {
          chosenCat = activeCats[ac];
          break;
        }
      }
    }

    function resolveGradeForCat(cat, preferGrade) {
      var avail = gradesWithItemsForCategory(gradesSorted, cat);
      if (!avail.length) return '';
      if (preferGrade && avail.indexOf(preferGrade) !== -1) {
        return preferGrade;
      }
      return avail[0];
    }

    chosenGrade = resolveGradeForCat(
      chosenCat,
      saved && saved.grade ? saved.grade : null
    );

    syncMeta(metaEl, snap);

    var catBar = document.createElement('div');
    catBar.className =
      'l2-drops-shop-tablist l2-drops-shop-tablist--cats';
    catBar.setAttribute('role', 'tablist');
    catBar.setAttribute('aria-label', 'Тип предмета');

    var gradeBar = document.createElement('div');
    gradeBar.className =
      'l2-drops-shop-tablist l2-drops-shop-tablist--grades';

    var weaponKindBar = document.createElement('div');
    weaponKindBar.className =
      'l2-drops-shop-tablist l2-drops-shop-tablist--weapon-kind';
    weaponKindBar.setAttribute('role', 'tablist');
    weaponKindBar.setAttribute('aria-label', 'Тип зброї');
    weaponKindBar.hidden = true;

    var armorPieceBar = document.createElement('div');
    armorPieceBar.className =
      'l2-drops-shop-tablist l2-drops-shop-tablist--armor-piece';
    armorPieceBar.setAttribute('role', 'tablist');
    armorPieceBar.setAttribute('aria-label', 'Частина броні');
    armorPieceBar.hidden = true;

    var jewelryKindBar = document.createElement('div');
    jewelryKindBar.className =
      'l2-drops-shop-tablist l2-drops-shop-tablist--jewelry-sub';
    jewelryKindBar.setAttribute('role', 'tablist');
    jewelryKindBar.setAttribute('aria-label', 'Тип аксесуара');
    jewelryKindBar.hidden = true;

    var consumableSubBar = document.createElement('div');
    consumableSubBar.className =
      'l2-drops-shop-tablist l2-drops-shop-tablist--consumable-sub';
    consumableSubBar.setAttribute('role', 'tablist');
    consumableSubBar.setAttribute('aria-label', 'Підкатегорія розхідників');
    consumableSubBar.hidden = true;

    var panelWrap = document.createElement('div');
    panelWrap.className = 'l2-drops-shop-panels';

    var pane = document.createElement('section');
    pane.className = 'l2-drops-grade';
    pane.setAttribute('role', 'tabpanel');
    panelWrap.appendChild(pane);

    var stateCat = chosenCat;
    var stateGrade = chosenGrade;
    var stateWeaponSub =
      saved && saved.wsub && WEAPON_SUB_KEYS.indexOf(saved.wsub) !== -1
        ? saved.wsub
        : 'all';
    var stateArmorSub =
      saved && saved.asub && ARMOR_SUB_KEYS.indexOf(saved.asub) !== -1
        ? saved.asub
        : 'all';
    var stateJewelrySub =
      saved && saved.jsub && JEWELRY_SUB_KEYS.indexOf(saved.jsub) !== -1
        ? saved.jsub
        : 'all';
    var stateConsumableSub =
      saved &&
      saved.csub &&
      CONSUMABLE_SUB_KEYS.indexOf(saved.csub) !== -1
        ? saved.csub
        : 'all';

    function filterWeaponItems(master, subKey) {
      if (
        master.length &&
        WEAPON_SUB_KEYS.indexOf(subKey) === -1
      )
        subKey = 'all';
      if (subKey === 'all') return master;
      var out = [];
      for (var fi = 0; fi < master.length; fi++) {
        var it = master[fi];
        var st =
          it && it.weaponSubtype != null && it.weaponSubtype !== ''
            ? it.weaponSubtype
            : null;
        if (!st) {
          if (subKey === 'all') out.push(it);
        } else if (st === subKey) {
          out.push(it);
        }
      }
      return out;
    }

    function filterArmorItems(master, subKey) {
      if (
        master.length &&
        ARMOR_SUB_KEYS.indexOf(subKey) === -1
      )
        subKey = 'all';
      if (subKey === 'all') return master;
      var outA = [];
      for (var ai = 0; ai < master.length; ai++) {
        var ita = master[ai];
        var ap =
          ita &&
          ita.armorPiece != null &&
          ita.armorPiece !== ''
            ? ita.armorPiece
            : null;
        if (!ap) continue;
        if (ap === subKey) outA.push(ita);
      }
      return outA;
    }

    function filterJewelryItems(master, subKey) {
      if (
        master.length &&
        JEWELRY_SUB_KEYS.indexOf(subKey) === -1
      )
        subKey = 'all';
      if (subKey === 'all') return master;
      var outJ = [];
      for (var ji = 0; ji < master.length; ji++) {
        var itj = master[ji];
        var jp =
          itj &&
          itj.jewelrySubtype != null &&
          itj.jewelrySubtype !== ''
            ? itj.jewelrySubtype
            : null;
        if (!jp) continue;
        if (jp === subKey) outJ.push(itj);
      }
      return outJ;
    }

    function filterConsumableItems(master, subKey) {
      if (
        master.length &&
        CONSUMABLE_SUB_KEYS.indexOf(subKey) === -1
      )
        subKey = 'all';
      if (subKey === 'all') return master;
      var outC = [];
      for (var ci = 0; ci < master.length; ci++) {
        var itc = master[ci];
        var cs =
          itc &&
          itc.consumableSubtype != null &&
          itc.consumableSubtype !== ''
            ? itc.consumableSubtype
            : null;
        if (!cs) continue;
        if (cs === subKey) outC.push(itc);
      }
      return outC;
    }

    function paint() {
      var catUk = categoryUkFromData(gradesSorted, stateCat);
      var availGrades = gradesWithItemsForCategory(gradesSorted, stateCat);
      if (availGrades.indexOf(stateGrade) === -1) {
        stateGrade = availGrades.length ? availGrades[0] : '';
      }

      pane.innerHTML = '';

      gradeBar.innerHTML = '';
      gradeBar.setAttribute('role', 'tablist');
      gradeBar.setAttribute('aria-label', 'Грейд');

      weaponKindBar.innerHTML = '';
      armorPieceBar.innerHTML = '';
      jewelryKindBar.innerHTML = '';
      consumableSubBar.innerHTML = '';
      weaponKindBar.hidden = stateCat !== 'weapon';
      armorPieceBar.hidden = stateCat !== 'armor';
      jewelryKindBar.hidden = stateCat !== 'earring';
      consumableSubBar.hidden = stateCat !== 'consumable';

      if (!availGrades.length) {
        var emptyGr = document.createElement('p');
        emptyGr.className = 'l2-drops-shop-empty';
        emptyGr.textContent = 'У цій категорії немає предметів у каталозі.';
        pane.appendChild(emptyGr);
        syncMeta(metaEl, snap);
        saveUiState(
          stateCat,
          stateGrade,
          stateWeaponSub,
          stateArmorSub,
          stateJewelrySub,
          stateConsumableSub
        );
        return;
      }

      for (var gi = 0; gi < availGrades.length; gi++) {
        var gg = availGrades[gi];
        var gbtn = document.createElement('button');
        gbtn.type = 'button';
        gbtn.className = 'l2-drops-shop-tab';
        gbtn.setAttribute('role', 'tab');
        gbtn.setAttribute('data-grade', gg);
        gbtn.textContent = gg === 'NG' ? 'NG' : gg;
        gbtn.setAttribute(
          'aria-selected',
          gg === stateGrade ? 'true' : 'false'
        );
        if (gg === stateGrade) gbtn.classList.add('l2-drops-shop-tab--active');
        gradeBar.appendChild(gbtn);
      }

      var gEnt = findGradeEntity(gradesSorted, stateGrade);
      var sec = gEnt ? findSection(gEnt, stateCat) : null;
      var itemsAll = (sec && sec.items) || [];
      var items = itemsAll;
      if (stateCat === 'weapon') {
        if (WEAPON_SUB_KEYS.indexOf(stateWeaponSub) === -1) {
          stateWeaponSub = 'all';
        }
        items = filterWeaponItems(itemsAll, stateWeaponSub);
        if (
          itemsAll.length &&
          items.length === 0 &&
          stateWeaponSub !== 'all'
        ) {
          stateWeaponSub = 'all';
          items = filterWeaponItems(itemsAll, 'all');
        }

        for (var wi = 0; wi < WEAPON_SUB_KEYS.length; wi++) {
          var sk = WEAPON_SUB_KEYS[wi];
          var wbtn = document.createElement('button');
          wbtn.type = 'button';
          wbtn.className = 'l2-drops-shop-tab';
          wbtn.setAttribute('role', 'tab');
          wbtn.setAttribute('data-weaponsub', sk);
          wbtn.textContent = WEAPON_SUB_LABEL_UK[sk] || sk;
          var onWs = sk === stateWeaponSub;
          wbtn.setAttribute('aria-selected', onWs ? 'true' : 'false');
          if (onWs) wbtn.classList.add('l2-drops-shop-tab--active');
          weaponKindBar.appendChild(wbtn);
        }

        var wbtns = weaponKindBar.querySelectorAll('[data-weaponsub]');
        for (var wb = 0; wb < wbtns.length; wb++) {
          (function (b) {
            b.addEventListener('click', function () {
              var wx = b.getAttribute('data-weaponsub');
              if (!wx) return;
              stateWeaponSub = wx;
              saveUiState(
                stateCat,
                stateGrade,
                stateWeaponSub,
                stateArmorSub,
                stateJewelrySub,
                stateConsumableSub
              );
              paint();
            });
          })(wbtns[wb]);
        }
      } else if (stateCat === 'armor') {
        if (ARMOR_SUB_KEYS.indexOf(stateArmorSub) === -1) {
          stateArmorSub = 'all';
        }
        items = filterArmorItems(itemsAll, stateArmorSub);
        if (
          itemsAll.length &&
          items.length === 0 &&
          stateArmorSub !== 'all'
        ) {
          stateArmorSub = 'all';
          items = filterArmorItems(itemsAll, 'all');
        }

        for (var ai2 = 0; ai2 < ARMOR_SUB_KEYS.length; ai2++) {
          var ak = ARMOR_SUB_KEYS[ai2];
          var abtn = document.createElement('button');
          abtn.type = 'button';
          abtn.className = 'l2-drops-shop-tab';
          abtn.setAttribute('role', 'tab');
          abtn.setAttribute('data-armorpiece', ak);
          abtn.textContent = ARMOR_SUB_LABEL_UK[ak] || ak;
          var onA = ak === stateArmorSub;
          abtn.setAttribute('aria-selected', onA ? 'true' : 'false');
          if (onA) abtn.classList.add('l2-drops-shop-tab--active');
          armorPieceBar.appendChild(abtn);
        }

        var abtns = armorPieceBar.querySelectorAll('[data-armorpiece]');
        for (var ab = 0; ab < abtns.length; ab++) {
          (function (b) {
            b.addEventListener('click', function () {
              var ax = b.getAttribute('data-armorpiece');
              if (!ax) return;
              stateArmorSub = ax;
              saveUiState(
                stateCat,
                stateGrade,
                stateWeaponSub,
                stateArmorSub,
                stateJewelrySub,
                stateConsumableSub
              );
              paint();
            });
          })(abtns[ab]);
        }
      } else if (stateCat === 'earring') {
        if (JEWELRY_SUB_KEYS.indexOf(stateJewelrySub) === -1) {
          stateJewelrySub = 'all';
        }
        items = filterJewelryItems(itemsAll, stateJewelrySub);
        if (
          itemsAll.length &&
          items.length === 0 &&
          stateJewelrySub !== 'all'
        ) {
          stateJewelrySub = 'all';
          items = filterJewelryItems(itemsAll, 'all');
        }

        for (var ji2 = 0; ji2 < JEWELRY_SUB_KEYS.length; ji2++) {
          var jk = JEWELRY_SUB_KEYS[ji2];
          var jbtn = document.createElement('button');
          jbtn.type = 'button';
          jbtn.className = 'l2-drops-shop-tab';
          jbtn.setAttribute('role', 'tab');
          jbtn.setAttribute('data-jewelrysub', jk);
          jbtn.textContent = JEWELRY_SUB_LABEL_UK[jk] || jk;
          var onJ = jk === stateJewelrySub;
          jbtn.setAttribute('aria-selected', onJ ? 'true' : 'false');
          if (onJ) jbtn.classList.add('l2-drops-shop-tab--active');
          jewelryKindBar.appendChild(jbtn);
        }

        var jbtns = jewelryKindBar.querySelectorAll('[data-jewelrysub]');
        for (var jb = 0; jb < jbtns.length; jb++) {
          (function (b2) {
            b2.addEventListener('click', function () {
              var jx = b2.getAttribute('data-jewelrysub');
              if (!jx) return;
              stateJewelrySub = jx;
              saveUiState(
                stateCat,
                stateGrade,
                stateWeaponSub,
                stateArmorSub,
                stateJewelrySub,
                stateConsumableSub
              );
              paint();
            });
          })(jbtns[jb]);
        }
      } else if (stateCat === 'consumable') {
        if (CONSUMABLE_SUB_KEYS.indexOf(stateConsumableSub) === -1) {
          stateConsumableSub = 'all';
        }
        items = filterConsumableItems(itemsAll, stateConsumableSub);

        for (var ci2 = 0; ci2 < CONSUMABLE_SUB_KEYS.length; ci2++) {
          var ck = CONSUMABLE_SUB_KEYS[ci2];
          var cbCons = document.createElement('button');
          cbCons.type = 'button';
          cbCons.className = 'l2-drops-shop-tab';
          cbCons.setAttribute('role', 'tab');
          cbCons.setAttribute('data-consumablesub', ck);
          cbCons.textContent = CONSUMABLE_SUB_LABEL_UK[ck] || ck;
          var onCs = ck === stateConsumableSub;
          cbCons.setAttribute('aria-selected', onCs ? 'true' : 'false');
          if (onCs) cbCons.classList.add('l2-drops-shop-tab--active');
          consumableSubBar.appendChild(cbCons);
        }

        var consBtns =
          consumableSubBar.querySelectorAll('[data-consumablesub]');
        for (var ib = 0; ib < consBtns.length; ib++) {
          (function (btnCons) {
            btnCons.addEventListener('click', function () {
              var csx = btnCons.getAttribute('data-consumablesub');
              if (!csx) return;
              stateConsumableSub = csx;
              saveUiState(
                stateCat,
                stateGrade,
                stateWeaponSub,
                stateArmorSub,
                stateJewelrySub,
                stateConsumableSub
              );
              paint();
            });
          })(consBtns[ib]);
        }
      }

      var titles = document.createElement('div');
      titles.className = 'l2-drops-shop-pane-head';
      var ht = document.createElement('div');
      ht.className = 'l2-drops-grade__title';
      ht.textContent = 'Грейд ' + stateGrade;
      titles.appendChild(ht);
      if (lastPurchaseMsg) {
        var okMsg = document.createElement('div');
        okMsg.className = 'l2-drops-shop-purchase-ok';
        okMsg.textContent = lastPurchaseMsg;
        titles.appendChild(okMsg);
      }
      var sub = document.createElement('div');
      sub.className = 'l2-drops-shop-pane-cat';
      sub.textContent = catUk;
      titles.appendChild(sub);
      pane.appendChild(titles);

      var list = document.createElement('div');
      list.className = 'l2-gm-shop-list';
      if (!items.length) {
        var emptyIt = document.createElement('p');
        emptyIt.className = 'l2-drops-shop-empty';
        emptyIt.textContent = 'Немає позицій.';
        pane.appendChild(emptyIt);
      } else {
        addPurchaseRows(
          list,
          items,
          snap,
          shopData,
          metaEl,
          mount,
          render,
          stateCat
        );
        pane.appendChild(list);
      }

      syncMeta(metaEl, snap);
      saveUiState(
        stateCat,
        stateGrade,
        stateWeaponSub,
        stateArmorSub,
        stateJewelrySub,
        stateConsumableSub
      );
      var gb = gradeBar.querySelectorAll('.l2-drops-shop-tab');
      for (var b = 0; b < gb.length; b++) {
        (function (btn) {
          btn.addEventListener('click', function () {
            var gx = btn.getAttribute('data-grade');
            if (!gx) return;
            clearPurchaseCongrats();
            stateGrade = gx;
            saveUiState(
              stateCat,
              stateGrade,
              stateWeaponSub,
              stateArmorSub,
              stateJewelrySub,
              stateConsumableSub
            );
            paint();
          });
        })(gb[b]);
      }
    }

    for (var ci = 0; ci < activeCats.length; ci++) {
      var cc = activeCats[ci];
      var cbtn = document.createElement('button');
      cbtn.type = 'button';
      cbtn.className = 'l2-drops-shop-tab';
      cbtn.setAttribute('role', 'tab');
      cbtn.setAttribute('data-category', cc);
      cbtn.textContent = categoryUkFromData(gradesSorted, cc);
      cbtn.setAttribute(
        'aria-selected',
        cc === stateCat ? 'true' : 'false'
      );
      if (cc === stateCat) cbtn.classList.add('l2-drops-shop-tab--active');
      catBar.appendChild(cbtn);
    }

    function syncCatTabs() {
      var cb = catBar.querySelectorAll('.l2-drops-shop-tab');
      for (var i = 0; i < cb.length; i++) {
        var el = cb[i];
        var on = el.getAttribute('data-category') === stateCat;
        el.classList.toggle('l2-drops-shop-tab--active', on);
        el.setAttribute('aria-selected', on ? 'true' : 'false');
      }
    }

    for (var ct = 0; ct < catBar.children.length; ct++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          var cx = btn.getAttribute('data-category');
          if (!cx) return;
          clearPurchaseCongrats();
          stateCat = cx;
          var avail = gradesWithItemsForCategory(gradesSorted, stateCat);
          if (avail.indexOf(stateGrade) === -1) {
            stateGrade = avail.length ? avail[0] : '';
          }
          saveUiState(
            stateCat,
            stateGrade,
            stateWeaponSub,
            stateArmorSub,
            stateJewelrySub,
            stateConsumableSub
          );
          syncCatTabs();
          paint();
        });
      })(catBar.children[ct]);
    }

    mount.appendChild(catBar);
    mount.appendChild(gradeBar);
    mount.appendChild(weaponKindBar);
    mount.appendChild(armorPieceBar);
    mount.appendChild(jewelryKindBar);
    mount.appendChild(consumableSubBar);
    mount.appendChild(panelWrap);
    saveUiState(
      stateCat,
      stateGrade,
      stateWeaponSub,
      stateArmorSub,
      stateJewelrySub,
      stateConsumableSub
    );
    paint();
  }

  function initPage() {
    var msgEl = $('drops-shop-msg');
    var metaEl = $('drops-shop-meta');
    var mount = $('drops-shop-mount');
    var t = localStorage.getItem('token');
    if (!t) {
      setMsg(msgEl, 'Потрібен вхід.');
      return;
    }

    setMsg(msgEl, '');

    Promise.all([
      fetch('/character', {
        headers: { Authorization: 'Bearer ' + t },
      }).then(function (r) {
        if (r.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/';
          return null;
        }
        return r.ok ? r.json() : null;
      }),
      fetch('/game/drops-shop', {
        headers: { Authorization: 'Bearer ' + t },
      }).then(function (r) {
        if (r.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/';
          return null;
        }
        return r.ok ? r.json() : null;
      }),
    ])
      .then(function (pairs) {
        var jChar = pairs[0];
        var shop = pairs[1];
        if (!jChar || !jChar.character) {
          setMsg(msgEl, 'Не вдалося завантажити персонажа.');
          return;
        }
        var snap = jChar.character;
        if (window.L2 && window.L2.setLastSnapshot)
          window.L2.setLastSnapshot(snap);
        if (
          window.L2 &&
          typeof window.L2.applyHudFromSnapshot === 'function'
        )
          window.L2.applyHudFromSnapshot(snap);

        if (!shop) {
          setMsg(msgEl, 'Не вдалося завантажити магазин.');
          return;
        }

        render(metaEl, mount, shop, snap);
      })
      .catch(function () {
        setMsg(msgEl, 'Збій завантаження.');
      });
  }

  window.addEventListener('DOMContentLoaded', initPage);
})();
