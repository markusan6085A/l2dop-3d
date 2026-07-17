/**
 * Торговець Маммона — NPC (карта) або сторінка телепорту (-loc).
 */
(function () {
  var MAMMON_ICON = '/nps/38.png';
  var buyInFlight = false;

  function isLocPage() {
    return /mammon-merchant-loc\.html$/i.test(String(window.location.pathname || ''));
  }

  function initIcon() {
    var iconEl = document.getElementById('mammon-merchant-icon');
    if (!iconEl) return;
    iconEl.src = MAMMON_ICON;
    iconEl.onerror = function () {
      iconEl.src = '/icons/drops/other.svg';
    };
  }

  function setShopMsg(text, isErr) {
    var el = document.getElementById('mammon-merchant-shop-msg');
    if (!el) return;
    if (!text) {
      el.textContent = '';
      el.hidden = true;
      el.style.color = '';
      return;
    }
    el.textContent = text;
    el.hidden = false;
    el.style.color = isErr ? '#e05050' : '#a89a70';
  }

  function clearRowError(block) {
    var err = block && block.querySelector('.l2-mammon-merchant-shop__err');
    if (!err) return;
    err.textContent = '';
    err.hidden = true;
  }

  function showRowError(block, msg) {
    var err = block && block.querySelector('.l2-mammon-merchant-shop__err');
    if (!err) return;
    err.textContent = msg;
    err.hidden = false;
  }

  function renderShopRow(categoryId, item) {
    var row = document.createElement('div');
    row.className = 'l2-mammon-merchant-shop__row';
    row.dataset.category = categoryId;
    row.dataset.itemKey = item.itemKey || item.grade || '';

    var grid = document.createElement('div');
    grid.className = 'l2-mammon-merchant-shop__grid';

    var icon = document.createElement('img');
    icon.className = 'l2-mammon-merchant-shop__icon';
    icon.alt = '';
    icon.width = 22;
    icon.height = 22;
    icon.loading = 'lazy';
    icon.src = item.iconUrl || '/icons/drops/other.svg';
    icon.onerror = function () {
      icon.src = '/icons/drops/other.svg';
    };

    var name = document.createElement('p');
    name.className = 'l2-mammon-merchant-shop__name';
    name.innerHTML =
      (item.nameEn || item.nameUk || '—') +
      ' · <span class="l2-mammon-merchant-shop__aa">' +
      String(item.aaPrice) +
      ' aa</span>';

    var input = document.createElement('input');
    input.className = 'l2-mammon-merchant-shop__input';
    input.type = 'number';
    input.min = '1';
    input.step = '1';
    input.inputMode = 'numeric';
    input.value = '1';
    input.setAttribute(
      'aria-label',
      'Кількість ' + (item.nameEn || item.nameUk || '')
    );

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className =
      'l2-magister-profession-confirm-btn l2-mammon-merchant-shop__btn';
    btn.textContent = 'Купити';

    grid.appendChild(icon);
    grid.appendChild(name);
    grid.appendChild(input);
    grid.appendChild(btn);
    row.appendChild(grid);

    var err = document.createElement('p');
    err.className = 'l2-mammon-merchant-shop__err';
    err.hidden = true;
    row.appendChild(err);

    var itemKey = item.itemKey || item.grade;

    btn.addEventListener('click', function () {
      var qty = Math.floor(Number(input.value));
      if (!Number.isFinite(qty) || qty < 1) {
        showRowError(row, 'Введи кількість від 1.');
        input.value = '1';
        input.focus();
        return;
      }
      input.value = String(qty);
      performBuy(row, categoryId, itemKey, qty, btn);
    });

    input.addEventListener('input', function () {
      clearRowError(row);
      setShopMsg('');
    });

    return row;
  }

  function renderShopPanel(category, isActive) {
    var panel = document.createElement('div');
    panel.className = 'l2-mammon-merchant-shop__panel';
    panel.dataset.category = category.categoryId;
    panel.hidden = !isActive;

    var list = document.createElement('div');
    list.className = 'l2-mammon-merchant-shop__list';

    var items = category.items || [];
    for (var i = 0; i < items.length; i++) {
      list.appendChild(renderShopRow(category.categoryId, items[i]));
    }

    panel.appendChild(list);
    return panel;
  }

  function renderShopTab(category, isActive, onSelect) {
    var tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'l2-mammon-merchant-shop__tab';
    if (isActive) tab.classList.add('is-active');
    tab.textContent = category.categoryUk || category.categoryId || '—';
    tab.dataset.category = category.categoryId;
    tab.setAttribute(
      'aria-selected',
      isActive ? 'true' : 'false'
    );
    tab.addEventListener('click', function () {
      onSelect(category.categoryId);
    });
    return tab;
  }

  function renderShop(categories) {
    var shop = document.createElement('section');
    shop.className = 'l2-mammon-merchant-shop';
    shop.setAttribute('aria-label', 'Магазин Торговця Маммона');

    var tabsEl = document.createElement('div');
    tabsEl.className = 'l2-mammon-merchant-shop__tabs';
    tabsEl.setAttribute('role', 'tablist');

    var panelsEl = document.createElement('div');
    panelsEl.className = 'l2-mammon-merchant-shop__panels';

    var activeCategoryId =
      categories[0] && categories[0].categoryId ? categories[0].categoryId : '';

    function selectCategory(categoryId) {
      activeCategoryId = categoryId;
      var tabs = tabsEl.querySelectorAll('.l2-mammon-merchant-shop__tab');
      for (var t = 0; t < tabs.length; t++) {
        var isActive = tabs[t].dataset.category === categoryId;
        tabs[t].classList.toggle('is-active', isActive);
        tabs[t].setAttribute('aria-selected', isActive ? 'true' : 'false');
      }
      var panels = panelsEl.querySelectorAll('.l2-mammon-merchant-shop__panel');
      for (var p = 0; p < panels.length; p++) {
        panels[p].hidden = panels[p].dataset.category !== categoryId;
      }
    }

    for (var i = 0; i < categories.length; i++) {
      var cat = categories[i];
      var active = i === 0;
      tabsEl.appendChild(renderShopTab(cat, active, selectCategory));
      panelsEl.appendChild(renderShopPanel(cat, active));
    }

    shop.appendChild(tabsEl);
    shop.appendChild(panelsEl);
    return shop;
  }

  async function performBuy(block, categoryId, itemKey, qty, btn) {
    if (buyInFlight) return;
    var t = localStorage.getItem('token');
    if (!t || !window.L2 || typeof L2.lastSnapshot !== 'function') return;
    var snap = L2.lastSnapshot();
    if (!snap || snap.revision == null) {
      setShopMsg('Завантаж персонажа.', true);
      return;
    }

    buyInFlight = true;
    setShopMsg('');
    clearRowError(block);
    if (btn) btn.disabled = true;

    try {
      var r = await fetch('/game/mammon/merchant/buy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + t,
        },
        body: JSON.stringify({
          category: categoryId,
          itemKey: itemKey,
          qty: qty,
          expectedRevision: snap.revision,
        }),
      });

      if (r.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/';
        return;
      }

      if (r.status === 409) {
        if (typeof L2.resyncCharacterAfterConflict === 'function') {
          await L2.resyncCharacterAfterConflict();
        }
        showRowError(block, 'Стан оновлено — спробуй ще раз.');
        return;
      }

      var j = {};
      try {
        j = await r.json();
      } catch (eJson) {
        j = {};
      }

      if (!r.ok) {
        showRowError(block, (j && j.messageUk) || 'Не вдалося купити.');
        return;
      }

      if (j && j.character) {
        if (typeof L2.applyCharacterSnapshot === 'function') {
          L2.applyCharacterSnapshot(j.character);
        } else if (L2.setLastSnapshot) {
          L2.setLastSnapshot(j.character);
          if (typeof L2.applyHudFromSnapshot === 'function') {
            L2.applyHudFromSnapshot(j.character);
          }
        }
      }
      setShopMsg('Куплено.');
    } catch (e) {
      showRowError(block, 'Помилка мережі.');
    } finally {
      buyInFlight = false;
      if (btn) btn.disabled = false;
    }
  }

  async function initShop() {
    var rootEl = document.getElementById('mammon-merchant-shop-root');
    if (!rootEl) return;
    var t = localStorage.getItem('token');
    if (!t) return;

    rootEl.innerHTML = '';
    setShopMsg('Завантаження…');

    try {
      var r = await fetch('/game/mammon/merchant/shop', {
        headers: { Authorization: 'Bearer ' + t },
        cache: 'no-store',
      });
      if (!r.ok) {
        setShopMsg('Не вдалося завантажити каталог.', true);
        return;
      }
      var j = await r.json();
      var categories = j && j.categories ? j.categories : [];
      rootEl.innerHTML = '';
      if (!categories.length) {
        setShopMsg('Каталог порожній.', true);
        return;
      }
      setShopMsg('');
      rootEl.appendChild(renderShop(categories));
    } catch (e) {
      setShopMsg('Помилка мережі.', true);
    }
  }

  async function loadCharacterHud() {
    var t = localStorage.getItem('token');
    if (!t || !window.L2) return;

    fetch('/character', { headers: { Authorization: 'Bearer ' + t }, cache: 'no-store' })
      .then(function (r) {
        if (r.status === 401) return null;
        return r.json();
      })
      .then(function (j) {
        if (!j || !j.character) return;
        if (L2.setLastSnapshot) L2.setLastSnapshot(j.character);
        if (typeof L2.applyHudFromSnapshot === 'function') {
          L2.applyHudFromSnapshot(j.character);
        }
      })
      .catch(function () {});
  }

  async function init() {
    if (window.L2 && typeof L2.mountL2Nav === 'function') {
      L2.mountL2Nav({});
    }

    initIcon();

    var t = localStorage.getItem('token');
    if (!t || !window.L2) {
      if (window.L2 && typeof L2.clearHudPanel === 'function') L2.clearHudPanel();
      return;
    }

    if (isLocPage() && window.MammonLocationPage && typeof MammonLocationPage.init === 'function') {
      await MammonLocationPage.init({
        kind: 'merchant',
        stateUrl: '/game/mammon/merchant',
        stateKey: 'mammonMerchant',
        teleportLabelUk: 'Телепорт до Торговця Маммона',
      });
      return;
    }

    await loadCharacterHud();
    await initShop();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
