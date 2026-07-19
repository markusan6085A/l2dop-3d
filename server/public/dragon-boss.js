/**
 * Бій з клановим драконом.
 */
(function () {
  var state = {
    token: '',
    dungeonId: '',
    battle: null,
    attackInFlight: false,
    pollTimer: null,
    entered: false,
  };

  function $(id) {
    return document.getElementById(id);
  }

  function fmtNum(n) {
    var x = Number(n);
    if (!Number.isFinite(x)) return String(n);
    return x.toLocaleString('uk-UA');
  }

  function fmtTime(sec) {
    var s = Math.max(0, Math.floor(Number(sec) || 0));
    var m = Math.floor(s / 60);
    var r = s % 60;
    return (m < 10 ? '0' : '') + m + ':' + (r < 10 ? '0' : '') + r;
  }

  function queryDungeonId() {
    var q = new URLSearchParams(window.location.search);
    return String(q.get('dungeonId') || '').trim();
  }

  function showErr(msg) {
    var el = $('dragon-boss-err');
    if (!el) return;
    el.hidden = false;
    el.textContent = msg;
  }

  function renderBattle(b) {
    state.battle = b;
    if (!b) return;
    var img = $('dragon-boss-img');
    if (img) {
      img.src = b.imageUrl;
      img.alt = b.nameUk;
    }
    $('dragon-boss-name').textContent = b.nameUk + ' — ' + b.nameEn;
    $('dragon-boss-hp').textContent =
      'HP дракона: ' + fmtNum(b.currentHp) + ' / ' + fmtNum(b.maxHp);
    $('dragon-boss-hp-bar').style.width = Math.max(0, Math.min(100, b.hpPercent)) + '%';
    $('dragon-boss-player-hp').textContent =
      'HP персонажа: ' + b.playerHp + ' / ' + b.playerMaxHp;
    $('dragon-boss-player-mp').textContent =
      'MP персонажа: ' + b.playerMp + ' / ' + b.playerMaxMp;
    $('dragon-boss-damage').textContent = 'Ваш урон: ' + fmtNum(b.damageDealt);
    $('dragon-boss-timer').textContent =
      'Час спроби: ' + fmtTime(b.battleRemainingSeconds);
    var stunEl = $('dragon-boss-stun');
    if (stunEl) {
      if (b.stunRemainingSeconds > 0) {
        stunEl.hidden = false;
        stunEl.textContent = 'Оглушення: ' + b.stunRemainingSeconds + ' сек';
      } else {
        stunEl.hidden = true;
      }
    }
    var logEl = $('dragon-boss-log');
    if (logEl && Array.isArray(b.logTail)) {
      logEl.textContent = '';
      b.logTail.forEach(function (line) {
        var li = document.createElement('li');
        li.textContent = line;
        logEl.appendChild(li);
      });
    }
    var atkBtn = $('dragon-boss-attack');
    if (atkBtn) {
      atkBtn.disabled =
        state.attackInFlight || b.stunRemainingSeconds > 0 || !b.battleActive;
    }
  }

  function stopPoll() {
    if (state.pollTimer) {
      clearInterval(state.pollTimer);
      state.pollTimer = null;
    }
  }

  function startPoll() {
    stopPoll();
    if (document.hidden || !state.token || !state.dungeonId) return;
    state.pollTimer = setInterval(function () {
      if (document.hidden || state.attackInFlight) return;
      void syncBattle().catch(function () {});
    }, 3500);
  }

  async function api(path, opts) {
    var r = await fetch(path, Object.assign({}, opts || {}, {
      headers: Object.assign(
        { Authorization: 'Bearer ' + state.token },
        (opts && opts.headers) || {}
      ),
    }));
    var data = await r.json().catch(function () {
      return {};
    });
    if (!r.ok) {
      var err = new Error(data.messageUk || 'dragon_boss_fail');
      err.status = r.status;
      err.code = data.error;
      throw err;
    }
    return data;
  }

  async function enterBattle() {
    return api('/game/dragon-dungeon/active/enter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dungeonId: state.dungeonId }),
    });
  }

  async function syncBattle() {
    var b = await api(
      '/game/dragon-dungeon/active/sync?dungeonId=' + encodeURIComponent(state.dungeonId)
    );
    renderBattle(b);
    return b;
  }

  async function attack() {
    if (state.attackInFlight || !state.dungeonId) return;
    state.attackInFlight = true;
    var atkBtn = $('dragon-boss-attack');
    if (atkBtn) atkBtn.disabled = true;
    try {
      var b = await api('/game/dragon-dungeon/active/attack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dungeonId: state.dungeonId, action: 'attack' }),
      });
      renderBattle(b);
    } catch (e) {
      if (e && e.code === 'dragon_battle_player_dead') {
        showErr('Ви загинули. Кулдаун 4 години.');
        stopPoll();
      } else if (e && e.message) {
        showErr(e.message);
      }
      await syncBattle().catch(function () {});
    } finally {
      state.attackInFlight = false;
      if (state.battle) renderBattle(state.battle);
    }
  }

  async function leaveBattle() {
    if (!state.dungeonId) return;
    try {
      await api('/game/dragon-dungeon/active/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dungeonId: state.dungeonId }),
      });
    } catch (_e) {
      /* leave best-effort */
    }
    window.location.href = '/dragon-dungeon.html';
  }

  async function init() {
    if (window.L2 && typeof L2.mountL2Nav === 'function') L2.mountL2Nav({});
    if (window.L2 && typeof L2.mountFootLinkBar === 'function') {
      L2.mountFootLinkBar('l2-foot-links', { inset: true });
    }
    state.dungeonId = queryDungeonId();
    var t = localStorage.getItem('token');
    if (!t || !state.dungeonId) {
      showErr('Потрібен вхід і dungeonId.');
      return;
    }
    state.token = t;
    $('dragon-boss-attack').addEventListener('click', function () {
      void attack();
    });
    $('dragon-boss-leave').addEventListener('click', function () {
      void leaveBattle();
    });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stopPoll();
      else startPoll();
    });
    try {
      var b = await enterBattle();
      state.entered = true;
      renderBattle(b);
      startPoll();
    } catch (e) {
      try {
        var synced = await syncBattle();
        if (synced && synced.battleActive) {
          state.entered = true;
          renderBattle(synced);
          startPoll();
          return;
        }
      } catch (_e2) {
        /* fallthrough */
      }
      showErr((e && e.message) || 'Не вдалося увійти в бій.');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
