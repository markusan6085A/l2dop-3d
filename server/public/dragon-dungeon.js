/**
 * Підземелля драконів — список босів і відкриття за алмази.
 */
(function () {
  var state = {
    token: '',
    view: null,
    unlockInFlight: false,
    unlockDragonId: '',
  };

  function $(id) {
    return document.getElementById(id);
  }

  function showErr(msg) {
    var el = $('dragon-dungeon-err');
    var ok = $('dragon-dungeon-ok');
    if (ok) ok.hidden = true;
    if (!el) return;
    el.hidden = false;
    el.textContent = msg;
  }

  function showOk(msg) {
    var el = $('dragon-dungeon-ok');
    var err = $('dragon-dungeon-err');
    if (err) err.hidden = true;
    if (!el) return;
    el.hidden = false;
    el.textContent = msg;
  }

  function clearMsgs() {
    var err = $('dragon-dungeon-err');
    var ok = $('dragon-dungeon-ok');
    if (err) err.hidden = true;
    if (ok) ok.hidden = true;
  }

  function setText(el, text) {
    if (!el) return;
    el.textContent = text == null ? '' : String(text);
  }

  function appendCard(listEl, boss) {
    var card = document.createElement('article');
    card.className = 'l2-dragon-card';
    card.dataset.dragonId = boss.id;

    var imgWrap = document.createElement('div');
    imgWrap.className = 'l2-dragon-card__img-wrap';
    var img = document.createElement('img');
    img.className = 'l2-dragon-card__img';
    img.src = boss.imageUrl;
    img.alt = boss.nameUk;
    img.loading = 'lazy';
    img.decoding = 'async';
    img.addEventListener('error', function onImgErr() {
      img.removeEventListener('error', onImgErr);
      img.src = '/icons/drops/other.svg';
    });
    imgWrap.appendChild(img);
    card.appendChild(imgWrap);

    var name = document.createElement('p');
    name.className = 'l2-dragon-card__name';
    setText(name, boss.nameUk);
    card.appendChild(name);

    var subtitle = document.createElement('p');
    subtitle.className = 'l2-dragon-card__subtitle';
    setText(subtitle, boss.nameEn + ' — ' + boss.titleEn);
    card.appendChild(subtitle);

    var cost = document.createElement('p');
    cost.className = 'l2-dragon-card__cost';
    setText(cost, 'Вартість відкриття: ' + String(boss.unlockCostDiamonds) + ' алмазів');
    card.appendChild(cost);

    var missing = document.createElement('p');
    missing.className = 'l2-dragon-card__missing';
    card.appendChild(missing);

    var unlocked = document.createElement('p');
    unlocked.className = 'l2-dragon-card__unlocked';
    setText(unlocked, 'Дракона відкрито');
    card.appendChild(unlocked);

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'l2-dragon-card__btn';
    btn.addEventListener('click', function () {
      void unlockDragon(boss.id);
    });
    card.appendChild(btn);

    var enter = document.createElement('a');
    enter.className = 'l2-dragon-card__enter';
    enter.href = '/dragon-boss.html?dragonId=' + encodeURIComponent(boss.id);
    setText(enter, 'Увійти до підземелля');
    card.appendChild(enter);

    listEl.appendChild(card);
    return card;
  }

  function updateCard(card, boss) {
    if (!card || !boss) return;
    var missing = card.querySelector('.l2-dragon-card__missing');
    var unlocked = card.querySelector('.l2-dragon-card__unlocked');
    var btn = card.querySelector('.l2-dragon-card__btn');
    var enter = card.querySelector('.l2-dragon-card__enter');
    var inFlight = state.unlockInFlight && state.unlockDragonId === boss.id;

    if (boss.unlocked) {
      if (missing) missing.hidden = true;
      if (unlocked) unlocked.hidden = false;
      if (btn) btn.hidden = true;
      if (enter) enter.hidden = false;
      return;
    }

    if (unlocked) unlocked.hidden = true;
    if (enter) enter.hidden = true;
    if (btn) btn.hidden = false;

    if (boss.canUnlock) {
      if (missing) missing.hidden = true;
      if (btn) {
        btn.disabled = inFlight;
        setText(
          btn,
          inFlight
            ? 'Відкриття…'
            : 'Відкрити за ' + String(boss.unlockCostDiamonds) + ' алмазів'
        );
      }
      return;
    }

    if (missing) {
      missing.hidden = false;
      setText(missing, 'Не вистачає: ' + String(boss.missingDiamonds) + ' алмазів');
    }
    if (btn) {
      btn.disabled = true;
      setText(btn, 'Відкрити за ' + String(boss.unlockCostDiamonds) + ' алмазів');
    }
  }

  function renderView(view) {
    state.view = view;
    if (!view) return;

    setText($('dragon-dungeon-diamonds'), view.diamonds);

    var listEl = $('dragon-dungeon-list');
    if (!listEl || !Array.isArray(view.bosses)) return;

    if (!listEl.dataset.built) {
      listEl.textContent = '';
      view.bosses.forEach(function (boss) {
        appendCard(listEl, boss);
      });
      listEl.dataset.built = '1';
    }

    view.bosses.forEach(function (boss) {
      var card = listEl.querySelector('[data-dragon-id="' + boss.id + '"]');
      updateCard(card, boss);
    });
  }

  async function loadView(token) {
    var r = await fetch('/game/dragon-dungeon', {
      headers: { Authorization: 'Bearer ' + token },
    });
    var data = await r.json().catch(function () {
      return {};
    });
    if (!r.ok) {
      throw new Error(data.messageUk || 'dragon_dungeon_load_fail');
    }
    return data;
  }

  function unlockSuccessMessage(boss) {
    var msgs = {
      green: 'Зеленого дракона відкрито!',
      blue: 'Синього дракона відкрито!',
      red: 'Червоного дракона відкрито!',
    };
    if (boss && boss.id && msgs[boss.id]) return msgs[boss.id];
    return 'Дракона відкрито!';
  }

  async function unlockDragon(dragonId) {
    if (state.unlockInFlight || !state.token || !dragonId) return;
    var boss =
      state.view && Array.isArray(state.view.bosses)
        ? state.view.bosses.find(function (b) {
            return b.id === dragonId;
          })
        : null;
    if (!boss || boss.unlocked || !boss.canUnlock) return;

    state.unlockInFlight = true;
    state.unlockDragonId = dragonId;
    renderView(state.view);
    try {
      var r = await fetch(
        '/game/dragon-dungeon/' + encodeURIComponent(dragonId) + '/unlock',
        {
          method: 'POST',
          headers: {
            Authorization: 'Bearer ' + state.token,
            'Content-Type': 'application/json',
          },
          body: '{}',
        }
      );
      var data = await r.json().catch(function () {
        return {};
      });
      if (r.status === 409) {
        state.view = await loadView(state.token);
        renderView(state.view);
        showErr(data.messageUk || 'Стан підземелля змінився. Оновіть сторінку.');
        return;
      }
      if (!r.ok) {
        showErr(data.messageUk || 'Не вдалося відкрити дракона.');
        return;
      }
      state.view = data;
      renderView(state.view);
      var opened =
        state.view.bosses && state.view.bosses.find(function (b) {
          return b.id === dragonId;
        });
      showOk(unlockSuccessMessage(opened || boss));
    } catch (_e) {
      showErr('Не вдалося відкрити дракона.');
    } finally {
      state.unlockInFlight = false;
      state.unlockDragonId = '';
      if (state.view) renderView(state.view);
    }
  }

  async function init() {
    if (window.L2 && typeof L2.mountL2Nav === 'function') {
      L2.mountL2Nav({});
    }
    if (window.L2 && typeof L2.mountFootLinkBar === 'function') {
      L2.mountFootLinkBar('l2-foot-links', { inset: true });
    }

    var t = localStorage.getItem('token');
    if (!t || !window.L2) {
      if (window.L2 && typeof L2.clearHudPanel === 'function') L2.clearHudPanel();
      showErr('Потрібен вхід.');
      return;
    }
    state.token = t;

    if (typeof L2.renderCharacterFromCache === 'function') {
      L2.renderCharacterFromCache();
    }
    if (typeof L2.resyncCharacterWhenRequired === 'function') {
      void L2.resyncCharacterWhenRequired()
        .then(function (snap) {
          if (snap && typeof L2.applyMutationSnapshot === 'function') {
            L2.applyMutationSnapshot(snap);
          }
        })
        .catch(function () {
          /* optional */
        });
    }

    try {
      var view = await loadView(t);
      renderView(view);
      clearMsgs();
    } catch (_e) {
      showErr('Не вдалося завантажити підземелля драконів.');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
