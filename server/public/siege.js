/**
 * Clan City Siege Stage A — стіна, ручний удар, adaptive polling.
 */
(function () {
  'use strict';

  var SIEGE_ACTIVE_POLL_MS = 4000;
  var SIEGE_WAITING_SYNC_MS = 60000;
  var ATTACK_MIN_INTERVAL_MS = 350;

  var cityId = '';
  var stateData = null;
  var serverSkewMs = 0;
  var pollTimer = null;
  var pollActive = false;
  var fetchInFlight = false;
  var attackInFlight = false;
  var lastAttackAtMs = 0;
  var countdownTimer = null;
  var startsAtRefreshDone = false;

  function $(id) {
    return document.getElementById(id);
  }

  function token() {
    try {
      return localStorage.getItem('token');
    } catch (_e) {
      return null;
    }
  }

  function parseCityIdFromUrl() {
    var params = new URLSearchParams(window.location.search);
    return String(params.get('cityId') || '').trim();
  }

  function resolvePollDelay(data) {
    if (data && data.state === 'active') return SIEGE_ACTIVE_POLL_MS;
    if (data && data.state === 'finished') return 0;
    return SIEGE_WAITING_SYNC_MS;
  }

  function stopSiegePolling() {
    pollActive = false;
    if (pollTimer) {
      clearTimeout(pollTimer);
      pollTimer = null;
    }
    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
  }

  function scheduleNextSiegePoll(delayMs) {
    if (!pollActive) return;
    if (document.visibilityState !== 'visible') return;
    if (!delayMs || delayMs <= 0) return;
    if (pollTimer) {
      clearTimeout(pollTimer);
      pollTimer = null;
    }
    pollTimer = setTimeout(function () {
      pollTimer = null;
      void fetchState(false);
    }, delayMs);
  }

  function startSiegePolling() {
    if (pollActive) return;
    pollActive = true;
    void fetchState(false);
  }

  function refreshSiegeNow() {
    if (document.visibilityState !== 'visible') return;
    if (pollTimer) {
      clearTimeout(pollTimer);
      pollTimer = null;
    }
    void fetchState(false);
  }

  function formatKyivTime(iso) {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleString('uk-UA', {
        timeZone: 'Europe/Kyiv',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (_eFmt) {
      return iso;
    }
  }

  function formatCountdown(targetMs) {
    var left = Math.max(0, targetMs - Date.now());
    var sec = Math.floor(left / 1000);
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return String(m) + ':' + (s < 10 ? '0' : '') + String(s);
  }

  function clanLine(clan) {
    return clan && clan.name ? clan.name : '—';
  }

  function renderTopClans(list) {
    var ul = $('siege-top-clans');
    if (!ul) return;
    ul.innerHTML = '';
    if (!list || !list.length) {
      ul.hidden = true;
      return;
    }
    ul.hidden = false;
    list.forEach(function (row) {
      var li = document.createElement('li');
      li.textContent =
        String(row.place) +
        '. ' +
        String(row.clanName) +
        ' — ' +
        String(row.totalDamage);
      ul.appendChild(li);
    });
  }

  function blockedMessage(reason) {
    if (reason === 'siege_no_clan') {
      return 'Для участі в облозі потрібно перебувати в клані';
    }
    if (reason === 'siege_defender') {
      return 'Ваш клан захищає це місто';
    }
    if (reason === 'siege_not_started') {
      return 'Захоплення міста ще не розпочалось';
    }
    if (reason === 'siege_finished') {
      return 'Облога завершилась';
    }
    return '';
  }

  function renderState(data) {
    stateData = data;
    var title = $('siege-city-name');
    var ownerLine = $('siege-owner-line');
    var timeLine = $('siege-time-line');
    var wallLine = $('siege-wall-line');
    var dmgLine = $('siege-damage-line');
    var myLine = $('siege-my-damage-line');
    var msgEl = $('siege-msg');
    var resultEl = $('siege-result');
    var attackBtn = $('siege-attack-btn');

    if (title) title.textContent = data.cityName || data.cityId || '—';
    if (ownerLine) {
      ownerLine.textContent = 'Власник: клан ' + clanLine(data.ownerClan);
    }

    if (timeLine) {
      if (data.state === 'scheduled' && data.startsAt) {
        timeLine.textContent =
          'Захоплення міста розпочнеться о ' +
          formatKyivTime(data.startsAt) +
          ' за київським часом';
      } else if (data.state === 'active' && data.endsAt) {
        timeLine.textContent =
          'Облога триває. До завершення: ' +
          formatCountdown(new Date(data.endsAt).getTime());
      } else if (data.state === 'finished') {
        timeLine.textContent = 'Облога завершена';
      } else {
        timeLine.textContent = '—';
      }
    }

    if (wallLine) {
      if (data.state === 'active' || data.state === 'finished') {
        wallLine.hidden = false;
        wallLine.textContent =
          'HP стіни: ' + String(data.wallHp) + ' / ' + String(data.wallMaxHp);
      } else {
        wallLine.hidden = true;
      }
    }

    if (dmgLine) {
      dmgLine.hidden = data.state === 'scheduled';
      dmgLine.textContent = 'Урон мого клану: ' + String(data.viewerClanDamage || 0);
    }
    if (myLine) {
      myLine.hidden = data.state === 'scheduled';
      myLine.textContent = 'Мій урон: ' + String(data.viewerCharacterDamage || 0);
    }

    renderTopClans(data.topClans);

    if (msgEl) {
      var msg = blockedMessage(data.attackBlockedReason);
      if (msg && data.state === 'active') {
        msgEl.hidden = false;
        msgEl.textContent = msg;
      } else if (msg && data.state === 'scheduled' && data.attackBlockedReason === 'siege_no_clan') {
        msgEl.hidden = false;
        msgEl.textContent = msg;
      } else {
        msgEl.hidden = true;
        msgEl.textContent = '';
      }
    }

    if (resultEl) {
      if (data.state === 'finished') {
        resultEl.hidden = false;
        if (data.finishReason === 'wall_destroyed' && data.winnerClan) {
          resultEl.textContent =
            'Місто захопив клан ' +
            data.winnerClan.name +
            '. Клан отримав ' +
            String(data.rewardPoints || 8000) +
            ' очок';
        } else if (data.finishReason === 'time_expired') {
          resultEl.textContent =
            'Облога завершилася. Стіна не була зруйнована';
        } else {
          resultEl.textContent = 'Облога завершена';
        }
      } else {
        resultEl.hidden = true;
        resultEl.textContent = '';
      }
    }

    if (attackBtn) {
      var showAttack = data.state === 'active' && data.canAttack;
      attackBtn.hidden = !showAttack;
      attackBtn.disabled = attackInFlight;
    }

    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
    if (data.state === 'scheduled' || data.state === 'active') {
      countdownTimer = setInterval(function () {
        if (!stateData) return;
        renderState(stateData);
        if (
          stateData.state === 'scheduled' &&
          stateData.startsAt &&
          !startsAtRefreshDone
        ) {
          var startMs = new Date(stateData.startsAt).getTime();
          if (Date.now() + serverSkewMs >= startMs) {
            startsAtRefreshDone = true;
            refreshSiegeNow();
          }
        }
      }, 1000);
    }
  }

  function applyAttackResponse(resp) {
    if (!stateData) stateData = {};
    stateData.wallHp = resp.wallHp;
    stateData.wallMaxHp = resp.wallMaxHp;
    stateData.version = resp.siegeVersion;
    stateData.viewerClanDamage = resp.clanTotalDamage;
    stateData.viewerCharacterDamage = resp.characterTotalDamage;
    stateData.state = resp.state;
    if (resp.finished) {
      stateData.state = 'finished';
      stateData.finishReason = resp.rewardPoints ? 'wall_destroyed' : stateData.finishReason;
      stateData.winnerClan = resp.winnerClan;
      stateData.canAttack = false;
      stopSiegePolling();
    }
    if (resp.damage > 0) {
      var wallLine = $('siege-wall-line');
      if (wallLine) {
        wallLine.textContent =
          'Останній удар: ' +
          String(resp.damage) +
          '. HP стіни: ' +
          String(resp.wallHp) +
          ' / ' +
          String(resp.wallMaxHp);
        wallLine.hidden = false;
      }
    }
    renderState(stateData);
  }

  async function fetchState(fromManual) {
    if (!token()) {
      window.location.href = '/';
      return;
    }
    if (document.visibilityState !== 'visible') return;
    if (fetchInFlight) return;

    if (pollTimer) {
      clearTimeout(pollTimer);
      pollTimer = null;
    }

    fetchInFlight = true;
    try {
      var r = await fetch(
        '/game/siege/' + encodeURIComponent(cityId) + '/state',
        { headers: { Authorization: 'Bearer ' + token() } }
      );
      if (r.status === 401) {
        window.location.href = '/';
        return;
      }
      if (!r.ok) {
        var ej = null;
        try {
          ej = await r.json();
        } catch (_eJ) {
          ej = null;
        }
        var errEl = $('siege-load-err');
        if (errEl) {
          errEl.hidden = false;
          errEl.textContent =
            (ej && ej.messageUk) || 'Не вдалося завантажити облогу.';
        }
        return;
      }
      var data = await r.json();
      if (data.serverTime) {
        serverSkewMs = new Date(data.serverTime).getTime() - Date.now();
      }
      if (data.state !== 'scheduled') {
        startsAtRefreshDone = true;
      }
      renderState(data);
      if (data.state === 'finished') {
        pollActive = false;
        return;
      }
      if (pollActive) {
        scheduleNextSiegePoll(resolvePollDelay(data));
      }
    } catch (_eNet) {
      if (pollActive) scheduleNextSiegePoll(SIEGE_WAITING_SYNC_MS);
    } finally {
      fetchInFlight = false;
    }
  }

  function newActionId() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
      return window.crypto.randomUUID();
    }
    return 'a' + String(Date.now()) + '-' + String(Math.random()).slice(2, 10);
  }

  async function attackWall() {
    if (attackInFlight) return;
    if (document.visibilityState !== 'visible') return;
    var now = Date.now();
    if (now - lastAttackAtMs < ATTACK_MIN_INTERVAL_MS) return;

    attackInFlight = true;
    var attackBtn = $('siege-attack-btn');
    if (attackBtn) attackBtn.disabled = true;
    try {
      var r = await fetch(
        '/game/siege/' + encodeURIComponent(cityId) + '/attack-wall',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token(),
          },
          body: JSON.stringify({ actionId: newActionId() }),
        }
      );
      var j = null;
      try {
        j = await r.json();
      } catch (_eJson) {
        j = null;
      }
      if (!r.ok) {
        var msgEl = $('siege-msg');
        if (msgEl && j && j.messageUk) {
          msgEl.hidden = false;
          msgEl.textContent = j.messageUk;
        }
        return;
      }
      lastAttackAtMs = Date.now();
      applyAttackResponse(j);
    } catch (_eNet) {
      var err = $('siege-msg');
      if (err) {
        err.hidden = false;
        err.textContent = 'Збій мережі. Спробуйте ще раз.';
      }
    } finally {
      attackInFlight = false;
      if (attackBtn && stateData && stateData.canAttack) {
        attackBtn.disabled = false;
      }
    }
  }

  function onVisibilityChange() {
    if (document.visibilityState === 'visible') {
      pollActive = true;
      startsAtRefreshDone = false;
      refreshSiegeNow();
    } else {
      stopSiegePolling();
    }
  }

  async function init() {
    cityId = parseCityIdFromUrl();
    if (!cityId) {
      var errEl = $('siege-load-err');
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent = 'Не вказано cityId.';
      }
      return;
    }

    if (window.L2 && typeof L2.mountL2Nav === 'function') {
      L2.mountL2Nav({});
    }
    if (window.L2 && typeof L2.renderCharacterFromCache === 'function') {
      L2.renderCharacterFromCache();
    }
    if (window.L2 && typeof L2.fetchSnapshot === 'function') {
      await L2.fetchSnapshot();
    }

    var refreshBtn = $('siege-refresh-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', function () {
        refreshSiegeNow();
      });
    }
    var attackBtn = $('siege-attack-btn');
    if (attackBtn) {
      attackBtn.addEventListener('click', function () {
        void attackWall();
      });
    }

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('pagehide', stopSiegePolling);

    pollActive = true;
    void fetchState(false);
  }

  init();
})();
