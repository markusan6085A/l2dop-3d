/**
 * Підвищення рівня клану — лише для лідера.
 */
(function () {
  var state = {
    token: '',
    view: null,
    levelUpInFlight: false,
  };

  function $(id) {
    return document.getElementById(id);
  }

  function showErr(msg) {
    var el = $('clan-level-err');
    var ok = $('clan-level-ok');
    if (ok) ok.hidden = true;
    if (!el) return;
    el.hidden = false;
    el.textContent = msg;
  }

  function showOk(msg) {
    var el = $('clan-level-ok');
    var err = $('clan-level-err');
    if (err) err.hidden = true;
    if (!el) return;
    el.hidden = false;
    el.textContent = msg;
  }

  function formatPoints(n) {
    var num = Number(n);
    if (!Number.isFinite(num)) return '0';
    return String(Math.trunc(num)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  function revealPanel() {
    var panel = $('clan-level-panel');
    if (panel) panel.classList.remove('l2-clan-level-panel--loading');
  }

  function renderClanName(clan) {
    var nameEl = $('clan-level-name');
    if (!nameEl) return;
    nameEl.textContent = '';
    if (window.L2 && typeof L2.renderClanIdentity === 'function') {
      nameEl.appendChild(
        L2.renderClanIdentity({
          name: clan.name,
          emblemId: clan.emblemId,
          emblemSize: 32,
        })
      );
    } else {
      nameEl.textContent = clan.name || '—';
    }
  }

  function renderProgressionTables(view) {
    var progEl = $('clan-level-progression');
    var cumEl = $('clan-level-cumulative');
    if (!progEl || !cumEl || !view || !Array.isArray(view.progression)) return;

    var progHtml = '';
    view.progression.forEach(function (row) {
      progHtml +=
        '<p class="l2-clan-level-table-row">Рівень ' +
        row.fromLevel +
        ' → ' +
        row.toLevel +
        ' — ' +
        formatPoints(row.cost) +
        ' очок</p>';
    });
    progEl.innerHTML = progHtml;

    var cumHtml = '';
    view.progression.forEach(function (row) {
      cumHtml +=
        '<p class="l2-clan-level-table-row">До ' +
        row.toLevel +
        ' рівня — ' +
        formatPoints(row.cumulativeCost) +
        '</p>';
    });
    cumEl.innerHTML = cumHtml;
  }

  function applyView(view) {
    state.view = view;
    if (!view || !view.clan) return;

    renderClanName(view.clan);
    var levelEl = $('clan-level-current');
    if (levelEl) levelEl.textContent = String(view.clan.level ?? 0);
    var pointsEl = $('clan-level-points');
    if (pointsEl) pointsEl.textContent = formatPoints(view.clan.clanPoints);

    var nextWrap = $('clan-level-next-wrap');
    var maxMsg = $('clan-level-max-msg');
    var upBtn = $('clan-level-up-btn');
    var missingWrap = $('clan-level-missing-wrap');

    if (!view.nextUpgrade) {
      if (nextWrap) nextWrap.hidden = true;
      if (maxMsg) maxMsg.hidden = false;
      return;
    }

    if (nextWrap) nextWrap.hidden = false;
    if (maxMsg) maxMsg.hidden = true;

    var next = view.nextUpgrade;
    var nextEl = $('clan-level-next');
    if (nextEl) nextEl.textContent = String(next.targetLevel);
    var costEl = $('clan-level-cost');
    if (costEl) costEl.textContent = formatPoints(next.cost) + ' очок';
    var missingEl = $('clan-level-missing');
    if (missingEl) {
      missingEl.textContent = formatPoints(next.missingPoints) + ' очок';
    }
    if (missingWrap) {
      missingWrap.hidden = next.canUpgrade;
    }
    if (upBtn) {
      upBtn.disabled = !next.canUpgrade || state.levelUpInFlight;
      upBtn.textContent = state.levelUpInFlight
        ? 'Підвищення…'
        : 'Підвищити рівень';
    }

    renderProgressionTables(view);
  }

  async function loadLevelView(token) {
    var r = await fetch('/game/clans/level', {
      headers: { Authorization: 'Bearer ' + token },
    });
    var data = await r.json().catch(function () {
      return {};
    });
    if (!r.ok) {
      throw new Error(data.messageUk || 'level_load_fail');
    }
    return data;
  }

  async function resyncHud() {
    if (!window.L2 || typeof L2.fetchSnapshot !== 'function') return;
    try {
      var snap = await L2.fetchSnapshot();
      if (snap && typeof L2.applyMutationSnapshot === 'function') {
        L2.applyMutationSnapshot(snap);
      }
    } catch (_e) {
      /* optional */
    }
  }

  async function levelUp() {
    if (state.levelUpInFlight || !state.token || !state.view || !state.view.clan) {
      return;
    }
    if (!state.view.clan.isLeader) {
      showErr('Підвищувати рівень клану може лише лідер.');
      return;
    }
    if (!state.view.nextUpgrade || !state.view.nextUpgrade.canUpgrade) {
      return;
    }

    state.levelUpInFlight = true;
    applyView(state.view);
    try {
      var r = await fetch('/game/clans/level-up', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + state.token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          expectedClanLevel: state.view.clan.level,
        }),
      });
      var data = await r.json().catch(function () {
        return {};
      });
      if (r.status === 409 && data.error === 'clan_level_conflict') {
        if (window.L2 && typeof L2.resyncCharacterAfterConflict === 'function') {
          await L2.resyncCharacterAfterConflict();
        }
        state.view = await loadLevelView(state.token);
        applyView(state.view);
        showErr(data.messageUk || 'Рівень клану змінився. Оновіть сторінку.');
        return;
      }
      if (!r.ok) {
        showErr(data.messageUk || 'Не вдалося підвищити рівень клану.');
        return;
      }
      state.view = data;
      applyView(state.view);
      showOk(
        'Рівень клану підвищено до ' + String(state.view.clan.level) + '!'
      );
      await resyncHud();
    } catch (_e) {
      showErr('Не вдалося підвищити рівень клану.');
    } finally {
      state.levelUpInFlight = false;
      if (state.view) applyView(state.view);
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
      var view = await loadLevelView(t);
      if (!view.clan || !view.clan.isLeader) {
        window.location.replace('/clan-my.html');
        return;
      }
      applyView(view);
      revealPanel();
      var upBtn = $('clan-level-up-btn');
      if (upBtn) {
        upBtn.addEventListener('click', function () {
          void levelUp();
        });
      }
    } catch (_e) {
      showErr('Не вдалося завантажити дані клану.');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
