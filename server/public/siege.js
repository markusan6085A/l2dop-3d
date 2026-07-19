/**
 * Clan City Siege Stage A — WAP UI, стіна, ручний удар, adaptive polling.
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
  var lastOwnDamage = null;

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

  function pad2(n) {
    return n < 10 ? '0' + String(n) : String(n);
  }

  function formatCountdownHms(targetMs) {
    var left = Math.max(0, targetMs - Date.now());
    var sec = Math.floor(left / 1000);
    var h = Math.floor(sec / 3600);
    var m = Math.floor((sec % 3600) / 60);
    var s = sec % 60;
    return pad2(h) + ':' + pad2(m) + ':' + pad2(s);
  }

  function formatNum(n) {
    return String(Math.max(0, Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  function clanLine(clan) {
    return clan && clan.name ? clan.name : '—';
  }

  function cityLabel(data) {
    if (data && data.cityName) return data.cityName;
    if (window.L2 && typeof L2.cityDisplayName === 'function') {
      return L2.cityDisplayName(data && data.cityId ? data.cityId : cityId);
    }
    return (data && data.cityId) || cityId || '—';
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

  function addLine(parent, text, id) {
    var p = document.createElement('p');
    p.className = 'l2-siege-line';
    if (id) p.id = id;
    p.textContent = text;
    parent.appendChild(p);
    return p;
  }

  function addActionLink(parent, text, id, disabled) {
    var p = document.createElement('p');
    p.className = 'l2-siege-line';
    var link = document.createElement('a');
    link.className = 'l2-siege-link' + (disabled ? ' l2-siege-link--disabled' : '');
    link.href = '#';
    link.id = id;
    link.textContent = text;
    p.appendChild(link);
    parent.appendChild(p);
    return link;
  }

  function winnerClanDamage(data) {
    if (!data || !data.winnerClan || !data.topClans || !data.topClans.length) {
      return data ? data.viewerClanDamage || 0 : 0;
    }
    for (var i = 0; i < data.topClans.length; i++) {
      if (data.topClans[i].clanId === data.winnerClan.id) {
        return data.topClans[i].totalDamage;
      }
    }
    return data.viewerClanDamage || 0;
  }

  function renderTopClans(parent, list) {
    if (!list || !list.length) return;
    addLine(parent, 'Топ кланів:');
    var ul = document.createElement('ul');
    ul.className = 'l2-siege-top';
    list.forEach(function (row) {
      var li = document.createElement('li');
      li.textContent =
        String(row.place) +
        '. ' +
        String(row.clanName) +
        ' — ' +
        formatNum(row.totalDamage);
      ul.appendChild(li);
    });
    parent.appendChild(ul);
  }

  function renderState(data) {
    stateData = data;
    var castleLine = $('siege-castle-line');
    var ownerLine = $('siege-owner-line');
    var body = $('siege-body');
    var nearbyLine = $('siege-nearby-line');

    if (castleLine) {
      castleLine.textContent = 'Замок: ' + cityLabel(data);
    }
    if (ownerLine) {
      ownerLine.textContent = 'Контролює клан: ' + clanLine(data.ownerClan);
    }
    if (nearbyLine) {
      nearbyLine.hidden = data.state !== 'active';
      nearbyLine.textContent = 'Поруч нікого немає';
    }
    if (!body) return;

    body.innerHTML = '';

    if (data.state === 'scheduled') {
      if (data.startsAt) {
        addLine(
          body,
          'Захоплення міста розпочнеться о ' +
            formatKyivTime(data.startsAt) +
            ' за київським часом.'
        );
        addLine(
          body,
          'До початку: ' + formatCountdownHms(new Date(data.startsAt).getTime()),
          'siege-countdown-line'
        );
      }
      var schedMsg = blockedMessage(data.attackBlockedReason);
      if (schedMsg && data.attackBlockedReason === 'siege_no_clan') {
        var msgEl = document.createElement('p');
        msgEl.className = 'l2-siege-msg';
        msgEl.textContent = schedMsg;
        body.appendChild(msgEl);
      }
    } else if (data.state === 'active') {
      if (lastOwnDamage != null && lastOwnDamage > 0) {
        addLine(body, 'Ви завдали шкоди стіні: ' + formatNum(lastOwnDamage));
      }

      if (data.canAttack) {
        addActionLink(
          body,
          'Ударити стіну [' + formatNum(data.wallHp) + '/' + formatNum(data.wallMaxHp) + ']',
          'siege-attack-link',
          attackInFlight
        );
      } else {
        var blocked = blockedMessage(data.attackBlockedReason);
        if (blocked) {
          var blockedEl = document.createElement('p');
          blockedEl.className = 'l2-siege-msg';
          blockedEl.textContent = blocked;
          body.appendChild(blockedEl);
        }
      }

      addActionLink(body, 'Оновити', 'siege-refresh-link', false);
      addLine(body, 'Мій урон: ' + formatNum(data.viewerCharacterDamage || 0));
      addLine(body, 'Урон мого клану: ' + formatNum(data.viewerClanDamage || 0));
      renderTopClans(body, data.topClans);
    } else if (data.state === 'finished') {
      if (data.finishReason === 'wall_destroyed' && data.winnerClan) {
        addLine(body, 'Місто захопив клан: ' + data.winnerClan.name);
        addLine(body, 'Загальний урон клану: ' + formatNum(winnerClanDamage(data)));
        addLine(
          body,
          'Клан отримав ' + formatNum(data.rewardPoints || 8000) + ' очок.'
        );
      } else if (data.finishReason === 'time_expired') {
        addLine(body, 'Облога завершилася.');
        addLine(body, 'Стіна не була зруйнована.');
        addLine(
          body,
          'Місто залишилося під контролем клану: ' + clanLine(data.ownerClan) + '.'
        );
      } else {
        addLine(body, 'Облога завершена.');
      }
    }

    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
    if (data.state === 'scheduled' && data.startsAt) {
      countdownTimer = setInterval(function () {
        if (!stateData) return;
        var countdownLine = $('siege-countdown-line');
        if (countdownLine && stateData.startsAt) {
          countdownLine.textContent =
            'До початку: ' +
            formatCountdownHms(new Date(stateData.startsAt).getTime());
        }
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
    if (resp.damage > 0) {
      lastOwnDamage = resp.damage;
    }
    if (resp.finished) {
      stateData.state = 'finished';
      stateData.finishReason = resp.rewardPoints
        ? 'wall_destroyed'
        : stateData.finishReason;
      stateData.winnerClan = resp.winnerClan;
      stateData.canAttack = false;
      stopSiegePolling();
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
    if (stateData) renderState(stateData);
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
        var body = $('siege-body');
        if (body) {
          var msgEl = document.createElement('p');
          msgEl.className = 'l2-siege-msg';
          msgEl.textContent = (j && j.messageUk) || 'Не вдалося завдати удар.';
          body.insertBefore(msgEl, body.firstChild);
        }
        return;
      }
      lastAttackAtMs = Date.now();
      applyAttackResponse(j);
    } catch (_eNet) {
      var errBody = $('siege-body');
      if (errBody) {
        var errEl = document.createElement('p');
        errEl.className = 'l2-siege-msg';
        errEl.textContent = 'Збій мережі. Спробуйте ще раз.';
        errBody.insertBefore(errEl, errBody.firstChild);
      }
    } finally {
      attackInFlight = false;
      if (stateData) renderState(stateData);
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

  function onSiegeBodyClick(e) {
    var t = e.target;
    if (!t || !t.id) return;
    if (t.id === 'siege-attack-link') {
      e.preventDefault();
      void attackWall();
      return;
    }
    if (t.id === 'siege-refresh-link') {
      e.preventDefault();
      refreshSiegeNow();
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

    var body = $('siege-body');
    if (body) {
      body.addEventListener('click', onSiegeBodyClick);
    }

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('pagehide', stopSiegePolling);

    pollActive = true;
    void fetchState(false);
  }

  init();
})();
