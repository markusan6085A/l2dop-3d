/**
 * КланХолл — опис і покупка благословення (лише лідер).
 */
(function () {
  var state = { token: '', buyInFlight: false };

  function $(id) {
    return document.getElementById(id);
  }

  function showErr(msg) {
    var el = $('clan-hall-err');
    if (!el) return;
    el.hidden = false;
    el.textContent = msg;
  }

  function applyHallView(hall) {
    var buyWrap = $('clan-hall-buy-wrap');
    if (!buyWrap || !hall) return;
    buyWrap.hidden = !!(hall.hasBlessing || !hall.canBuy);
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

    var buyBtn = $('clan-hall-buy-btn');
    if (buyBtn) {
      buyBtn.addEventListener('click', buyHallBlessing);
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
