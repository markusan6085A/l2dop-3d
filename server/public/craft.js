/**
 * craft.html — crafted-ресурси + D-grade зброя.
 */
(function () {
  var materialsBook = null;
  var weaponsBook = null;
  var snap = null;
  var craftInFlight = false;
  var activeTab = 'materials';
  var countsByCode = Object.create(null);

  function $(id) {
    return document.getElementById(id);
  }

  function setMsg(text, ok) {
    var el = $('craft-msg');
    if (!el) return;
    if (!text) {
      el.hidden = true;
      el.textContent = '';
      el.classList.remove('ok', 'err');
      return;
    }
    el.hidden = false;
    el.textContent = text;
    el.classList.toggle('ok', !!ok);
    el.classList.toggle('err', !ok);
  }

  function iconUrl(itemId, hint) {
    if (window.L2 && typeof L2.resolveItemIconUrl === 'function') {
      return L2.resolveItemIconUrl(itemId, hint || '/icons/drops/other.svg');
    }
    return hint || '/icons/drops/other.svg';
  }

  function wireIconFallback(img) {
    if (!img || img.dataset.fallbackWired === '1') return;
    img.dataset.fallbackWired = '1';
    img.addEventListener('error', function onErr() {
      img.removeEventListener('error', onErr);
      img.src = '/icons/drops/other.svg';
    });
  }

  function getCount(code) {
    var n = Math.floor(Number(countsByCode[code]) || 1);
    if (!Number.isFinite(n) || n < 1) n = 1;
    return n;
  }

  function setCount(code, n, maxCraftable) {
    var v = Math.floor(Number(n) || 1);
    if (!Number.isFinite(v) || v < 1) v = 1;
    if (maxCraftable > 0) v = Math.min(v, maxCraftable);
    countsByCode[code] = v;
    return v;
  }

  function authHeaders(extra) {
    var h = extra ? Object.assign({}, extra) : {};
    var t = window.L2 && typeof L2.token === 'function' ? L2.token() : localStorage.getItem('token');
    if (t) h.Authorization = 'Bearer ' + t;
    return h;
  }

  function onUnauthorized() {
    if (window.L2 && typeof L2.setToken === 'function') {
      L2.setToken(null);
    } else {
      localStorage.removeItem('token');
    }
    window.location.href = '/';
  }

  function applyScreenFromSnapshot(character) {
    snap = character || snap;
    if (window.L2 && typeof L2.applyHudFromSnapshot === 'function' && snap) {
      L2.applyHudFromSnapshot(snap);
    }
  }

  function renderMeta(book) {
    var el = $('craft-meta');
    if (!el || !book) return;
    if (!book.canCraftProfession) {
      el.textContent =
        'Крафт доступний тільки професіям Artisan, Warsmith і Maestro.';
      return;
    }
    el.textContent =
      'Create Item: ' +
      book.createItemLevel +
      ' · MP: ' +
      book.currentMp +
      ' / ' +
      book.maxMp;
  }

  function recipeBlocked(recipe) {
    if (!materialsBook) return true;
    if (!materialsBook.canCraftProfession) return true;
    if (materialsBook.createItemLevel < recipe.createItemLevel) return true;
    if (materialsBook.currentMp < recipe.mpCost * getCount(recipe.code)) return true;
    if (recipe.maxCraftable < 1) return true;
    if (getCount(recipe.code) > recipe.maxCraftable) return true;
    for (var i = 0; i < recipe.ingredients.length; i++) {
      var ing = recipe.ingredients[i];
      if (ing.have < ing.quantity * getCount(recipe.code)) return true;
    }
    return false;
  }

  function weaponRecipeBlocked(recipe) {
    if (!weaponsBook) return true;
    if (!recipe.learned) return true;
    if (!recipe.unlockedByProfession) return true;
    if (recipe.currentCreateItemLevel < recipe.requiredCreateItemLevel) return true;
    if (weaponsBook.currentMp < recipe.mpCost) return true;
    for (var i = 0; i < recipe.materials.length; i++) {
      if (!recipe.materials[i].enough) return true;
    }
    return false;
  }

  function renderMaterials() {
    var mount = $('craft-materials-mount');
    var stub = $('craft-stub-mount');
    if (!mount) return;
    mount.innerHTML = '';
    if (stub) stub.hidden = true;

    if (!materialsBook || !materialsBook.recipes || !materialsBook.recipes.length) {
      mount.textContent = 'Немає рецептів.';
      return;
    }

    materialsBook.recipes.forEach(function (recipe) {
      var count = getCount(recipe.code);
      var card = document.createElement('div');
      card.className = 'l2-craft-recipe';
      if (recipe.lockedReason) card.classList.add('is-locked');

      var head = document.createElement('div');
      head.className = 'l2-craft-recipe-head';

      var outIcon = document.createElement('img');
      outIcon.className = 'l2-craft-recipe-icon';
      outIcon.alt = '';
      outIcon.src = iconUrl(recipe.output.itemId, recipe.output.iconUrl);
      wireIconFallback(outIcon);

      var headText = document.createElement('div');
      var title = document.createElement('div');
      title.className = 'l2-craft-recipe-title';
      title.textContent = recipe.output.nameUk;
      var sub = document.createElement('div');
      sub.className = 'l2-craft-recipe-sub';
      sub.textContent =
        'D · 100% · Create Item ' +
        recipe.createItemLevel +
        ' · MP ' +
        recipe.mpCost;
      headText.appendChild(title);
      headText.appendChild(sub);
      head.appendChild(outIcon);
      head.appendChild(headText);
      card.appendChild(head);

      var ul = document.createElement('ul');
      ul.className = 'l2-craft-ing-list';
      recipe.ingredients.forEach(function (ing) {
        var li = document.createElement('li');
        li.className = 'l2-craft-ing-row';
        var img = document.createElement('img');
        img.className = 'l2-craft-ing-icon';
        img.alt = '';
        img.src = iconUrl(ing.itemId, ing.iconUrl);
        wireIconFallback(img);
        var qty = document.createElement('span');
        qty.className = 'l2-craft-ing-qty';
        var need = ing.quantity * count;
        qty.classList.add(ing.have >= need ? 'is-ok' : 'is-bad');
        qty.textContent = ing.have + ' / ' + need;
        var name = document.createElement('span');
        name.textContent = ing.nameUk + ' (×' + ing.quantity + ')';
        li.appendChild(img);
        li.appendChild(name);
        li.appendChild(qty);
        ul.appendChild(li);
      });
      card.appendChild(ul);

      var controls = document.createElement('div');
      controls.className = 'l2-craft-controls';

      var input = document.createElement('input');
      input.type = 'number';
      input.min = '1';
      input.className = 'l2-craft-count-input';
      input.value = String(count);
      input.setAttribute('aria-label', 'Кількість craft');

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'l2-craft-btn';
      btn.textContent = 'Створити';

      function refreshCard() {
        count = setCount(recipe.code, input.value, recipe.maxCraftable);
        input.value = String(count);
        ul.querySelectorAll('.l2-craft-ing-qty').forEach(function (el, idx) {
          var ing = recipe.ingredients[idx];
          if (!ing) return;
          var need = ing.quantity * count;
          el.textContent = ing.have + ' / ' + need;
          el.classList.toggle('is-ok', ing.have >= need);
          el.classList.toggle('is-bad', ing.have < need);
        });
        btn.disabled = craftInFlight || recipeBlocked(recipe);
      }

      input.addEventListener('change', refreshCard);

      ['+1', '+10', '+100', 'MAX'].forEach(function (label) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'l2-craft-btn';
        b.textContent = label;
        b.addEventListener('click', function () {
          if (label === 'MAX') {
            setCount(recipe.code, recipe.maxCraftable, recipe.maxCraftable);
          } else {
            setCount(recipe.code, getCount(recipe.code) + Number(label.slice(1)), recipe.maxCraftable);
          }
          refreshCard();
        });
        controls.appendChild(b);
      });

      controls.appendChild(input);
      btn.addEventListener('click', function () {
        doMaterialCraft(recipe.code, btn);
      });
      controls.appendChild(btn);
      card.appendChild(controls);

      if (recipe.lockedReason) {
        var lock = document.createElement('div');
        lock.className = 'l2-craft-lock-reason';
        lock.textContent = recipe.lockedReason;
        card.appendChild(lock);
      }

      btn.disabled = craftInFlight || recipeBlocked(recipe);
      mount.appendChild(card);
    });
  }

  function renderWeapons() {
    var mount = $('craft-weapons-mount');
    if (!mount) return;
    mount.innerHTML = '';

    if (!weaponsBook || !weaponsBook.recipes || !weaponsBook.recipes.length) {
      mount.textContent = 'Немає рецептів зброї.';
      return;
    }

    weaponsBook.recipes.forEach(function (recipe) {
      var card = document.createElement('div');
      card.className = 'l2-craft-recipe';
      if (recipe.blockedReason) card.classList.add('is-locked');

      var head = document.createElement('div');
      head.className = 'l2-craft-recipe-head';

      var outIcon = document.createElement('img');
      outIcon.className = 'l2-craft-recipe-icon';
      outIcon.alt = '';
      outIcon.src = iconUrl(recipe.output.itemId, recipe.output.iconUrl);
      wireIconFallback(outIcon);

      var headText = document.createElement('div');
      var title = document.createElement('div');
      title.className = 'l2-craft-recipe-title';
      title.textContent = recipe.output.nameUk;
      var sub = document.createElement('div');
      sub.className = 'l2-craft-recipe-sub';
      sub.textContent =
        'D · ' +
        recipe.successRate +
        '% · Create Item ' +
        recipe.requiredCreateItemLevel +
        ' · MP ' +
        recipe.mpCost;
      var status = document.createElement('div');
      status.className = 'l2-craft-recipe-sub';
      if (!recipe.learned) {
        status.textContent = 'Рецепт не вивчено';
      } else if (recipe.currentCreateItemLevel < recipe.requiredCreateItemLevel) {
        status.textContent = 'Потрібен Create Item рівня ' + recipe.requiredCreateItemLevel;
      } else if (weaponsBook.currentMp < recipe.mpCost) {
        status.textContent = 'Недостатньо MP';
      } else if (recipe.canCraft) {
        status.textContent = 'Готово до крафту';
      } else if (recipe.blockedReason) {
        status.textContent = recipe.blockedReason;
      }
      headText.appendChild(title);
      headText.appendChild(sub);
      headText.appendChild(status);
      head.appendChild(outIcon);
      head.appendChild(headText);
      card.appendChild(head);

      var ul = document.createElement('ul');
      ul.className = 'l2-craft-ing-list';
      recipe.materials.forEach(function (mat) {
        var li = document.createElement('li');
        li.className = 'l2-craft-ing-row';
        var img = document.createElement('img');
        img.className = 'l2-craft-ing-icon';
        img.alt = '';
        img.src = iconUrl(mat.itemId, mat.iconUrl);
        wireIconFallback(img);
        var qty = document.createElement('span');
        qty.className = 'l2-craft-ing-qty';
        qty.classList.add(mat.enough ? 'is-ok' : 'is-bad');
        qty.textContent = mat.ownedCount + ' / ' + mat.requiredCount;
        var name = document.createElement('span');
        name.textContent = mat.nameUk + ' (×' + mat.requiredCount + ')';
        li.appendChild(img);
        li.appendChild(name);
        li.appendChild(qty);
        ul.appendChild(li);
      });
      card.appendChild(ul);

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'l2-craft-btn';
      btn.textContent = 'Створити';
      btn.disabled = craftInFlight || weaponRecipeBlocked(recipe);
      btn.addEventListener('click', function () {
        doWeaponCraft(recipe.recipeCode, btn, recipe.output.nameUk);
      });
      card.appendChild(btn);

      mount.appendChild(card);
    });
  }

  function showTab(tab) {
    activeTab = tab;
    var mats = $('craft-materials-mount');
    var weps = $('craft-weapons-mount');
    var stub = $('craft-stub-mount');
    document.querySelectorAll('.l2-craft-tab').forEach(function (btn) {
      var t = btn.getAttribute('data-tab');
      btn.classList.toggle('is-active', t === tab);
      btn.setAttribute('aria-selected', t === tab ? 'true' : 'false');
    });
    if (mats) mats.hidden = tab !== 'materials';
    if (weps) weps.hidden = tab !== 'weapon';
    if (stub) stub.hidden = tab === 'materials' || tab === 'weapon';
    if (tab === 'materials') renderMeta(materialsBook);
    else if (tab === 'weapon') renderMeta(weaponsBook);
  }

  async function loadMaterialsBook() {
    var r = await fetch('/game/craft/materials', {
      headers: authHeaders(),
      cache: 'no-store',
    });
    if (r.status === 401) {
      onUnauthorized();
      return;
    }
    if (!r.ok) throw new Error('book_load_failed');
    materialsBook = await r.json();
    if (activeTab === 'materials') renderMeta(materialsBook);
    renderMaterials();
  }

  async function loadWeaponsBook() {
    var r = await fetch('/game/craft/weapons', {
      headers: authHeaders(),
      cache: 'no-store',
    });
    if (r.status === 401) {
      onUnauthorized();
      return;
    }
    if (!r.ok) throw new Error('weapon_book_load_failed');
    weaponsBook = await r.json();
    if (activeTab === 'weapon') renderMeta(weaponsBook);
    renderWeapons();
  }

  async function reloadActiveBooks() {
    await Promise.all([loadMaterialsBook(), loadWeaponsBook()]);
  }

  async function doMaterialCraft(recipeCode, btn) {
    if (craftInFlight) return;
    if (!snap || !snap.revision) {
      setMsg('Завантаження персонажа…', false);
      return;
    }
    craftInFlight = true;
    if (btn) btn.disabled = true;
    try {
      var r = await fetch('/game/craft/materials', {
        method: 'POST',
        headers: authHeaders({ 'content-type': 'application/json' }),
        body: JSON.stringify({
          recipeCode: recipeCode,
          craftCount: getCount(recipeCode),
          expectedRevision: snap.revision,
        }),
      });
      if (r.status === 401) {
        onUnauthorized();
        return;
      }
      if (r.status === 409) {
        if (window.L2 && typeof L2.resyncCharacterAfterConflict === 'function') {
          await L2.resyncCharacterAfterConflict(null, await r.json().catch(function () { return null; }));
          snap = window.L2.lastSnapshot ? L2.lastSnapshot() : snap;
        }
        await reloadActiveBooks();
        setMsg('Стан оновлено — спробуйте ще раз.', false);
        return;
      }
      var j = await r.json().catch(function () { return null; });
      if (!r.ok) {
        setMsg((j && j.messageUk) || 'Помилка крафту.', false);
        return;
      }
      if (window.L2 && typeof L2.applyCharacterSnapshot === 'function' && j.character) {
        L2.applyCharacterSnapshot(j.character, applyScreenFromSnapshot);
        snap = j.character;
      }
      var recipe = (materialsBook && materialsBook.recipes || []).find(function (x) { return x.code === recipeCode; });
      var outName = recipe ? recipe.output.nameUk : recipeCode;
      setMsg('Створено: ' + outName, true);
      await reloadActiveBooks();
    } catch (e) {
      setMsg('Помилка мережі.', false);
    } finally {
      craftInFlight = false;
      renderMaterials();
    }
  }

  async function doWeaponCraft(recipeCode, btn, outNameHint) {
    if (craftInFlight) return;
    if (!snap || !snap.revision) {
      setMsg('Завантаження персонажа…', false);
      return;
    }
    craftInFlight = true;
    if (btn) btn.disabled = true;
    try {
      var r = await fetch('/game/craft/weapons', {
        method: 'POST',
        headers: authHeaders({ 'content-type': 'application/json' }),
        body: JSON.stringify({
          recipeCode: recipeCode,
          expectedRevision: snap.revision,
        }),
      });
      if (r.status === 401) {
        onUnauthorized();
        return;
      }
      if (r.status === 409) {
        if (window.L2 && typeof L2.resyncCharacterAfterConflict === 'function') {
          await L2.resyncCharacterAfterConflict(null, await r.json().catch(function () { return null; }));
          snap = window.L2.lastSnapshot ? L2.lastSnapshot() : snap;
        }
        await reloadActiveBooks();
        setMsg('Стан оновлено — спробуйте ще раз.', false);
        return;
      }
      var j = await r.json().catch(function () { return null; });
      if (!r.ok) {
        setMsg((j && j.messageUk) || 'Помилка крафту.', false);
        return;
      }
      if (window.L2 && typeof L2.applyCharacterSnapshot === 'function' && j.character) {
        L2.applyCharacterSnapshot(j.character, applyScreenFromSnapshot);
        snap = j.character;
      }
      var recipe = (weaponsBook && weaponsBook.recipes || []).find(function (x) { return x.recipeCode === recipeCode; });
      var outName = outNameHint || (recipe ? recipe.output.nameUk : recipeCode);
      setMsg('Створено: ' + outName, true);
      await reloadActiveBooks();
    } catch (e) {
      setMsg('Помилка мережі.', false);
    } finally {
      craftInFlight = false;
      renderWeapons();
    }
  }

  function wireTabs() {
    document.querySelectorAll('.l2-craft-tab').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var tab = btn.getAttribute('data-tab');
        if (!tab || btn.disabled) return;
        showTab(tab);
      });
    });
  }

  async function init() {
    try {
      var t = window.L2 && typeof L2.token === 'function' ? L2.token() : localStorage.getItem('token');
      if (!t) {
        onUnauthorized();
        return;
      }
      wireTabs();
      if (window.L2 && typeof L2.mountL2Nav === 'function') {
        L2.mountL2Nav({});
      }
      if (window.L2 && typeof L2.ensureCatalogHintsLoaded === 'function') {
        await L2.ensureCatalogHintsLoaded();
      }
      if (window.L2 && typeof L2.fetchSnapshot === 'function') {
        snap = await L2.fetchSnapshot();
      } else {
        var cr = await fetch('/character', {
          headers: authHeaders(),
          cache: 'no-store',
        });
        if (cr.status === 401) {
          onUnauthorized();
          return;
        }
        if (cr.ok) {
          var cj = await cr.json();
          snap = cj.character || cj;
          if (window.L2 && typeof L2.setLastSnapshot === 'function') {
            L2.setLastSnapshot(snap);
          }
        }
      }
      if (!snap) {
        setMsg('Увійдіть у гру, щоб відкрити крафт.', false);
        return;
      }
      applyScreenFromSnapshot(snap);
      await reloadActiveBooks();
      showTab('materials');
    } catch (e) {
      setMsg('Не вдалося завантажити крафт.', false);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
