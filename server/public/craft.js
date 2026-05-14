/**
 * Крафт ресурсів: рецепти з сервера, іконки `/icons/drops/resours/l2dop-by-itemid/`.
 */
(function () {
  function $(id) {
    return document.getElementById(id);
  }

  function itemLabel(itemId, namesUk) {
    var idNum = Number(itemId);
    var n =
      namesUk &&
      (namesUk[idNum] || namesUk[String(idNum)] || namesUk[itemId]);
    if (n && String(n).trim()) return n;
    return '#' + itemId;
  }

  function bindCraftIcon(img, itemId) {
    if (!img) return;
    img.alt = '';
    var id = Number(itemId);
    img.onerror = function () {
      img.onerror = null;
      img.src = '/icons/drops/other.svg';
    };
    if (window.L2 && typeof L2.resolveItemIconUrl === 'function') {
      img.src = L2.resolveItemIconUrl(id, '/icons/drops/other.svg');
      return;
    }
    img.src = id > 0 ? '/game/item-icon/' + id : '/icons/drops/other.svg';
  }

  function bagQty(inv, itemId) {
    var id = Number(itemId);
    var n = 0;
    var stacks = inv && inv.stacks;
    if (!Array.isArray(stacks)) return 0;
    for (var i = 0; i < stacks.length; i++) {
      var s = stacks[i];
      if (!s || Number(s.itemId) !== id) continue;
      var q = Number(s.qty);
      n += Number.isFinite(q) && q > 0 ? q : 0;
    }
    return n;
  }

  function maxCraftable(inv, recipe) {
    var max = Infinity;
    var ings = recipe.ingredients;
    for (var i = 0; i < ings.length; i++) {
      var ing = ings[i];
      var need = Math.max(1, Math.floor(Number(ing.count)));
      if (need <= 0) return 0;
      var have = bagQty(inv, ing.l2ItemId);
      max = Math.min(max, Math.floor(have / need));
    }
    return !Number.isFinite(max) || max <= 0 ? 0 : max;
  }

  function showGate(canCraft) {
    var denied = $('l2-craft-denied');
    var main = $('l2-craft-main');
    if (!denied || !main) return;
    denied.hidden = !!canCraft;
    main.hidden = !canCraft;
  }

  function showErr(msg) {
    var el = $('l2-craft-stub-msg');
    if (!el) return;
    el.hidden = !msg;
    el.textContent = msg || '';
  }

  function applyCraftSnapshot(snapshot, tiers, namesUk, token) {
    if (!snapshot) return;
    if (window.L2 && typeof L2.applyCharacterSnapshot === 'function') {
      L2.applyCharacterSnapshot(snapshot);
    } else {
      if (window.L2 && typeof L2.setLastSnapshot === 'function') {
        L2.setLastSnapshot(snapshot);
      }
      if (window.L2 && typeof L2.applyHudFromSnapshot === 'function') {
        L2.applyHudFromSnapshot(snapshot);
      }
    }
    renderBook(tiers, snapshot, namesUk, token);
  }

  function postCraft(tier, recipeIndex, qty, token, revision, onOk, onFail) {
    fetch('/game/resource-craft', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
      body: JSON.stringify({
        expectedRevision: revision,
        tier: tier,
        recipeIndex: recipeIndex,
        quantity: qty,
      }),
    })
      .then(function (r) {
        if (r.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/';
          return null;
        }
        return r.json().then(function (j) {
          return { status: r.status, j: j };
        });
      })
      .then(function (pack) {
        if (!pack) return;
        if (pack.status === 409) {
          if (window.L2 && typeof L2.resyncCharacterAfterConflict === 'function') {
            L2.resyncCharacterAfterConflict()
              .then(function () {
                onFail('Стан персонажа оновлено. Повтори дію.');
              })
              .catch(function () {
                onFail('Конфлікт ревізії — не вдалося синхронізувати стан.');
              });
            return;
          }
          onFail('Конфлікт ревізії — онови сторінку.');
          return;
        }
        if (pack.status === 403 && pack.j && pack.j.messageUk) {
          onFail(pack.j.messageUk);
          return;
        }
        if (pack.status !== 200 || !pack.j || !pack.j.character) {
          var m =
            (pack.j && pack.j.messageUk) ||
            (pack.j && pack.j.error) ||
            'Не вдалося виконати крафт.';
          onFail(m);
          return;
        }
        onOk(pack.j.character);
      })
      .catch(function () {
        onFail('Помилка мережі.');
      });
  }

  var craftModalCtx = null;
  var craftModalWired = false;

  function closeCraftModal() {
    var m = $('l2-craft-modal');
    if (m) m.hidden = true;
    craftModalCtx = null;
  }

  function openCraftModal(ctx) {
    craftModalCtx = ctx;
    var recipe = ctx.recipe;
    var inv = ctx.inv;
    var namesUk = ctx.namesUk;
    var mc = ctx.mc;
    var tierNum = ctx.tierNum;

    var titleEl = $('l2-craft-modal-title');
    var subEl = $('l2-craft-modal-sub');
    var outIco = $('l2-craft-modal-out-ico');
    var sum = $('l2-craft-modal-summary');
    var qtyIn = $('l2-craft-modal-qty');
    var hintEl = $('l2-craft-modal-qty-hint');
    var errEl = $('l2-craft-modal-err');
    var confBtn = $('l2-craft-modal-confirm');
    var modal = $('l2-craft-modal');

    if (
      !titleEl ||
      !subEl ||
      !outIco ||
      !sum ||
      !qtyIn ||
      !hintEl ||
      !errEl ||
      !confBtn ||
      !modal
    ) {
      return;
    }

    titleEl.textContent = itemLabel(recipe.outputL2ItemId, namesUk);
    subEl.textContent = 'Ряд ' + tierNum + ' · матеріали зі сумки';
    bindCraftIcon(outIco, recipe.outputL2ItemId);

    sum.innerHTML = '';
    var ul = document.createElement('ul');
    ul.className = 'l2-craft-modal__ing-list';
    for (var ii = 0; ii < recipe.ingredients.length; ii++) {
      var ing = recipe.ingredients[ii];
      var have = bagQty(inv, ing.l2ItemId);
      var need = Number(ing.count);
      var li = document.createElement('li');
      li.className = 'l2-craft-modal__ing-li';
      var img = document.createElement('img');
      img.className = 'l2-craft-modal__ing-ico';
      bindCraftIcon(img, ing.l2ItemId);
      var meta = document.createElement('div');
      meta.className = 'l2-craft-modal__ing-meta';
      meta.innerHTML =
        '<strong>' +
        have +
        '</strong> шт. · ' +
        itemLabel(ing.l2ItemId, namesUk) +
        ' (×' +
        need +
        ' за 1 результат)';
      li.appendChild(img);
      li.appendChild(meta);
      ul.appendChild(li);
    }
    sum.appendChild(ul);
    var cap = document.createElement('p');
    cap.className = 'l2-craft-modal__cap';
    cap.innerHTML = 'Можна скрафтити за раз: <strong>' + mc + '</strong> шт.';
    sum.appendChild(cap);

    qtyIn.min = 1;
    qtyIn.max = mc;
    qtyIn.value = 1;
    hintEl.textContent = 'Введи кількість від 1 до ' + mc + ' і натисни «Крафт».';
    errEl.textContent = '';
    errEl.hidden = true;
    confBtn.disabled = false;

    modal.hidden = false;
    setTimeout(function () {
      qtyIn.focus();
      if (typeof qtyIn.select === 'function') qtyIn.select();
    }, 0);
  }

  function wireCraftModal() {
    if (craftModalWired) return;
    craftModalWired = true;

    var backdrop = $('l2-craft-modal-backdrop');
    var closeBtn = $('l2-craft-modal-close');
    var confBtn = $('l2-craft-modal-confirm');
    var qtyIn = $('l2-craft-modal-qty');
    var errEl = $('l2-craft-modal-err');

    if (backdrop) {
      backdrop.addEventListener('click', closeCraftModal);
    }
    if (closeBtn) {
      closeBtn.addEventListener('click', closeCraftModal);
    }
    if (qtyIn && errEl) {
      qtyIn.addEventListener('input', function () {
        errEl.hidden = true;
      });
      qtyIn.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (confBtn && !confBtn.disabled) confBtn.click();
        }
      });
    }
    if (confBtn) {
      confBtn.addEventListener('click', function () {
        if (!craftModalCtx) return;
        var ctx = craftModalCtx;
        var qEl = $('l2-craft-modal-qty');
        var err = $('l2-craft-modal-err');
        if (!qEl || !err) return;
        var q = Math.floor(Number(qEl.value));
        err.hidden = true;
        if (!Number.isFinite(q) || q < 1 || q > ctx.mc) {
          err.textContent = 'Введи кількість від 1 до ' + ctx.mc + '.';
          err.hidden = false;
          return;
        }
        confBtn.disabled = true;
        showErr('');
        postCraft(
          ctx.tierNum,
          ctx.recipeIdx,
          q,
          ctx.token,
          ctx.rev,
          function (nextChar) {
            closeCraftModal();
            applyCraftSnapshot(nextChar, ctx.tiers, ctx.namesUk, ctx.token);
            showErr('');
          },
          function (msg) {
            err.textContent = msg;
            err.hidden = false;
            confBtn.disabled = false;
          }
        );
      });
    }

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      var m = $('l2-craft-modal');
      if (!m || m.hidden) return;
      closeCraftModal();
    });
  }

  function renderBook(tiers, char, namesUk, token) {
    var host = $('l2-craft-body');
    if (!host) return;
    host.innerHTML = '';
    var lv = Number(char.level) || 1;
    var rev = Number(char.revision);
    var inv = char.inventory || { stacks: [] };

    for (var ti = 0; ti < tiers.length; ti++) {
      var tier = tiers[ti];
      var unlock = Number(tier.unlockLevel);
      var unlocked = lv >= unlock;
      var sec = document.createElement('section');
      sec.className = 'l2-craft-tier';
      var h = document.createElement('h2');
      h.className = 'l2-pers-h2';
      h.textContent =
        'Ряд ' +
        tier.tier +
        ' (з ' +
        unlock +
        ' р.)' +
        (unlocked ? '' : ' — замалий рівень');
      sec.appendChild(h);
      var grid = document.createElement('div');
      grid.className = 'l2-craft-grid';

      for (var ri = 0; ri < tier.recipes.length; ri++) {
        (function (tierNum, recipeIdx, recipe) {
          var card = document.createElement('div');
          card.className = 'l2-craft-card';

          var title = document.createElement('div');
          title.className = 'l2-craft-card__title';
          title.textContent = 'Результат';
          card.appendChild(title);

          var outRow = document.createElement('div');
          outRow.className = 'l2-craft-out';
          var outImg = document.createElement('img');
          outImg.className = 'l2-craft-icon l2-craft-icon--lg';
          bindCraftIcon(outImg, recipe.outputL2ItemId);
          var outName = document.createElement('span');
          outName.textContent = itemLabel(recipe.outputL2ItemId, namesUk);
          outRow.appendChild(outImg);
          outRow.appendChild(outName);
          card.appendChild(outRow);

          var ingTitle = document.createElement('div');
          ingTitle.className = 'l2-craft-ing-title';
          ingTitle.textContent = 'Матеріали';
          card.appendChild(ingTitle);

          var mc = maxCraftable(inv, recipe);
          for (var ii = 0; ii < recipe.ingredients.length; ii++) {
            var ing = recipe.ingredients[ii];
            var row = document.createElement('div');
            row.className = 'l2-craft-ing';
            var iimg = document.createElement('img');
            iimg.className = 'l2-craft-icon';
            bindCraftIcon(iimg, ing.l2ItemId);
            var have = bagQty(inv, ing.l2ItemId);
            var need = Number(ing.count);
            var span = document.createElement('span');
            span.innerHTML =
              itemLabel(ing.l2ItemId, namesUk) +
              ' <span class="' +
              (have >= need ? 'l2-craft-ok' : 'l2-craft-bad') +
              '">(' +
              have +
              '/' +
              need +
              ')</span>';
            row.appendChild(iimg);
            row.appendChild(span);
            card.appendChild(row);
          }

          if (mc >= 1) {
            var hint = document.createElement('p');
            hint.className = 'l2-craft-max';
            hint.textContent = 'Максимум за раз: ' + mc + ' шт.';
            card.appendChild(hint);
          }

          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'btn-l2 l2-craft-btn';
          btn.textContent = 'Крафт';
          var canDo = unlocked && mc >= 1;
          btn.disabled = !canDo;
          btn.addEventListener('click', function () {
            if (btn.disabled) return;
            openCraftModal({
              tierNum: tierNum,
              recipeIdx: recipeIdx,
              recipe: recipe,
              mc: mc,
              inv: inv,
              namesUk: namesUk,
              token: token,
              rev: rev,
              tiers: tiers,
            });
          });
          card.appendChild(btn);
          grid.appendChild(card);
        })(tier.tier, ri, tier.recipes[ri]);
      }
      sec.appendChild(grid);
      host.appendChild(sec);
    }
  }

  function init() {
    if (window.L2 && typeof L2.mountL2Nav === 'function') {
      L2.mountL2Nav({
        onStub: function (label) {
          var el = $('l2-craft-stub-msg');
          if (el) {
            el.hidden = false;
            el.textContent = '«' + label + '» — заглушка, з’явиться пізніше.';
          }
        },
      });
    }

    var t = localStorage.getItem('token');
    if (!t || !window.L2) {
      if (window.L2 && typeof L2.clearHudPanel === 'function') L2.clearHudPanel();
      showGate(false);
      return;
    }

    wireCraftModal();

    var charJson = null;
    var namesUk = {};

    fetch('/character', { headers: { Authorization: 'Bearer ' + t } })
      .then(function (r) {
        if (r.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/';
          return null;
        }
        return r.json();
      })
      .then(function (j) {
        if (!j || !j.character) {
          showGate(false);
          return null;
        }
        charJson = j.character;
        namesUk = j.itemNamesUk || {};
        if (window.L2 && typeof L2.mergeCraftResourceIconHints === 'function') {
          L2.mergeCraftResourceIconHints(j);
        }
        if (L2.setLastSnapshot) L2.setLastSnapshot(j.character);
        if (typeof L2.applyHudFromSnapshot === 'function') {
          L2.applyHudFromSnapshot(j.character);
        }
        var ok = typeof L2.canOpenCraft === 'function' && L2.canOpenCraft(j.character);
        showGate(!!ok);
        if (!ok) return null;
        return fetch('/game/resource-craft/book', {
          headers: { Authorization: 'Bearer ' + t },
        });
      })
      .then(function (r) {
        if (!r) return;
        if (!r.ok) {
          showErr('Не вдалося завантажити рецепти.');
          return;
        }
        return r.json();
      })
      .then(function (book) {
        if (!book || !charJson || !book.tiers) return;
        $('l2-craft-hint').hidden = true;
        renderBook(book.tiers, charJson, namesUk, t);
      })
      .catch(function () {
        showGate(false);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
