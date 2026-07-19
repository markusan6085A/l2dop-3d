/**
 * КланХолл — покупка та таблиця пасивних бонусів.
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

  function clearErr() {
    var el = $('clan-hall-err');
    if (!el) return;
    el.hidden = true;
    el.textContent = '';
  }

  function setPanelVisible(el, visible) {
    if (!el) return;
    el.classList.toggle('l2-clan-hall-panel--hide', !visible);
  }

  function fmtBonus(n) {
    return '+' + String(n);
  }

  function renderStatus(hall) {
    var levelEl = $('clan-hall-clan-level');
    if (levelEl) {
      levelEl.textContent = hall && hall.clanLevel != null ? String(hall.clanLevel) : '0';
    }

    var noneEl = $('clan-hall-active-none');
    var statsEl = $('clan-hall-active-stats');
    var bonus = hall && hall.activeBonus ? hall.activeBonus : null;
    var showStats =
      !!hall &&
      hall.hasBlessing &&
      Number(hall.clanLevel) >= 1 &&
      bonus &&
      Number(bonus.level) >= 1;

    if (noneEl) noneEl.hidden = showStats;
    if (statsEl) statsEl.hidden = !showStats;
    if (!showStats || !bonus) return;

    var patk = $('clan-hall-active-patk');
    var matk = $('clan-hall-active-matk');
    var pdef = $('clan-hall-active-pdef');
    var mdef = $('clan-hall-active-mdef');
    var hp = $('clan-hall-active-hp');
    if (patk) patk.textContent = fmtBonus(bonus.pAtk);
    if (matk) matk.textContent = fmtBonus(bonus.mAtk);
    if (pdef) pdef.textContent = fmtBonus(bonus.pDef);
    if (mdef) mdef.textContent = fmtBonus(bonus.mDef);
    if (hp) hp.textContent = fmtBonus(bonus.maxHp);
  }

  function renderBonusTable(hall) {
    var body = $('clan-hall-stats-body');
    if (!body || !hall || !Array.isArray(hall.bonusTable)) {
      if (body) body.innerHTML = '';
      return;
    }
    var clanLevel = hall.clanLevel != null ? Number(hall.clanLevel) : 0;
    var html = '';
    hall.bonusTable.forEach(function (row) {
      var active =
        hall.hasBlessing && clanLevel >= 1 && row.level === clanLevel;
      var achieved =
        hall.hasBlessing && clanLevel >= 1 && row.level >= 1 && row.level < clanLevel;
      var rowClass = 'l2-clan-hall-stats__row';
      if (active) rowClass += ' l2-clan-hall-stats__row--active';
      else if (achieved) rowClass += ' l2-clan-hall-stats__row--achieved';
      html +=
        '<tr class="' +
        rowClass +
        '">' +
        '<td>' +
        String(row.level) +
        '</td>' +
        '<td>' +
        fmtBonus(row.pAtk) +
        '</td>' +
        '<td>' +
        fmtBonus(row.mAtk) +
        '</td>' +
        '<td>' +
        fmtBonus(row.pDef) +
        '</td>' +
        '<td>' +
        fmtBonus(row.mDef) +
        '</td>' +
        '<td>' +
        fmtBonus(row.maxHp) +
        '</td>' +
        '</tr>';
    });
    body.innerHTML = html;
  }

  function renderBuyLabel(hall) {
    var label = $('clan-hall-buy-label');
    if (!label || !hall) return;
    var cost = hall.costAdena != null ? String(hall.costAdena) : '1';
    label.textContent =
      '«Благословення Клан-холу». Ціна ' + cost + ':Adena';
  }

  function applyHallView(hall) {
    var buyWrap = $('clan-hall-buy-wrap');
    var ownedWrap = $('clan-hall-owned-wrap');
    if (!hall) return;

    renderStatus(hall);
    renderBuyLabel(hall);

    if (hall.hasBlessing) {
      setPanelVisible(buyWrap, false);
      setPanelVisible(ownedWrap, true);
      renderBonusTable(hall);
      clearErr();
      return;
    }

    setPanelVisible(ownedWrap, false);
    setPanelVisible(buyWrap, !!hall.canBuy);
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
          var ownedHall = await loadClanHall(state.token);
          if (ownedHall) applyHallView(ownedHall);
          clearErr();
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
    if (buyBtn) buyBtn.addEventListener('click', buyHallBlessing);

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
