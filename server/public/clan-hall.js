/**
 * КланХолл — покупка, таблиця бонусів, накладення бафу.
 */
(function () {
  var state = { token: '', buyInFlight: false };

  function $(id) {
    return document.getElementById(id);
  }

  function tr(key, fallback) {
    return window.L2 && typeof L2.tr === 'function' ? L2.tr(key) : fallback;
  }

  function stubTail() {
    return tr('stub_later', 'заглушка, з’явиться пізніше.');
  }

  function showErr(msg) {
    var el = $('clan-hall-err');
    if (!el) return;
    el.hidden = false;
    el.textContent = msg;
  }

  function clearErr() {
    var el = $('clan-hall-err');
    if (!el) return;
    el.hidden = true;
    el.textContent = '';
  }

  function showStub(label) {
    showErr('«' + label + '» — ' + stubTail());
  }

  function fmtBonus(n) {
    return '+' + String(n);
  }

  function renderBuffRow(buff) {
    var body = $('clan-hall-stats-body');
    if (!body || !buff) {
      if (body) body.innerHTML = '';
      return;
    }
    body.innerHTML =
      '<tr class="l2-clan-hall-stats__row l2-clan-hall-stats__row--active">' +
      '<td>' +
      String(buff.level) +
      '</td>' +
      '<td>' +
      fmtBonus(buff.pAtk) +
      '</td>' +
      '<td>' +
      fmtBonus(buff.mAtk) +
      '</td>' +
      '<td>' +
      fmtBonus(buff.pDef) +
      '</td>' +
      '<td>' +
      fmtBonus(buff.mDef) +
      '</td>' +
      '<td>' +
      fmtBonus(buff.maxHp) +
      '</td>' +
      '</tr>';
  }

  function applyHallView(hall) {
    var buyWrap = $('clan-hall-buy-wrap');
    var ownedWrap = $('clan-hall-owned-wrap');
    if (!hall) return;

    if (hall.hasBlessing) {
      if (buyWrap) buyWrap.hidden = true;
      if (ownedWrap) ownedWrap.hidden = false;
      renderBuffRow(hall.buff);
      clearErr();
      return;
    }

    if (ownedWrap) ownedWrap.hidden = true;
    if (buyWrap) buyWrap.hidden = !hall.canBuy;
  }

  async function loadClanHall(token) {
    var r = await fetch('/game/clans/hall', {
      headers: { Authorization: 'Bearer ' + token },
    });
    if (!r.ok) throw new Error('hall_fail');
    var data = await r.json().catch(function () {
      return {};
    });
    return data.hall || null;
  }

  async function buyHallBlessing() {
    if (state.buyInFlight) return;
    var rev =
      window.L2 && typeof L2.lastSnapshot === 'function'
        ? (L2.lastSnapshot() || {}).revision
        : null;
    if (rev == null) {
      showErr('Немає revision — онови сторінку.');
      return;
    }

    state.buyInFlight = true;
    var btn = $('clan-hall-buy-btn');
    if (btn) btn.disabled = true;
    try {
      var r = await fetch('/game/clans/hall/buy', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + state.token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ expectedRevision: rev }),
      });
      if (r.status === 409) {
        if (window.L2 && typeof L2.resyncCharacterAfterConflict === 'function') {
          await L2.resyncCharacterAfterConflict(function () {});
        }
        return;
      }
      var data = await r.json().catch(function () {
        return {};
      });
      if (!r.ok) {
        if (data.error === 'clan_hall_already_owned') {
          var hall = await loadClanHall(state.token);
          if (hall) applyHallView(hall);
          return;
        }
        showErr(data.messageUk || 'Не вдалося купити Клан-хол.');
        return;
      }
      if (data.character && window.L2 && typeof L2.applyCharacterSnapshot === 'function') {
        L2.applyCharacterSnapshot(data.character);
      }
      if (data.hall) {
        applyHallView(data.hall);
      }
    } finally {
      state.buyInFlight = false;
      if (btn) btn.disabled = false;
    }
  }

  function bindActions() {
    var buyBtn = $('clan-hall-buy-btn');
    if (buyBtn) buyBtn.addEventListener('click', buyHallBlessing);

    var applyBtn = $('clan-hall-apply-btn');
    if (applyBtn) {
      applyBtn.addEventListener('click', function () {
        showStub(tr('clan_hall_apply_buff', 'Накласти баф'));
      });
    }
  }

  async function init() {
    if (window.L2 && typeof L2.mountL2Nav === 'function') {
      L2.mountL2Nav({});
    }
    if (window.L2 && typeof L2.mountFootLinkBar === 'function') {
      L2.mountFootLinkBar('l2-foot-links', { inset: true });
    }
    if (window.L2 && typeof L2.applyPageI18n === 'function') {
      L2.applyPageI18n(document);
    }

    bindActions();

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
    var c =
      typeof L2.resyncCharacterWhenRequired === 'function'
        ? await L2.resyncCharacterWhenRequired()
        : null;
    if (typeof L2.applyMutationSnapshot === 'function') {
      L2.applyMutationSnapshot(c);
    }
    if (!c || !c.clanId) {
      window.location.replace('/clan-my.html');
      return;
    }

    try {
      var hall = await loadClanHall(t);
      if (!hall) {
        window.location.replace('/clan-my.html');
        return;
      }
      applyHallView(hall);
    } catch (_e) {
      showErr('Не вдалося завантажити Клан-хол.');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
