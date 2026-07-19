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
  var pvpInFlight = false;
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

  function formatKyivDate(iso) {
    if (!iso) return '—';
    try {
      return new Intl.DateTimeFormat('uk-UA', {
        timeZone: 'Europe/Kyiv',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(new Date(iso));
    } catch (_eFmt) {
      return '—';
    }
  }

  function formatKyivTime(iso) {
    if (!iso) return '—';
    try {
      var parts = new Intl.DateTimeFormat('uk-UA', {
        timeZone: 'Europe/Kyiv',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).formatToParts(new Date(iso));
      var hour = '';
      var minute = '';
      parts.forEach(function (part) {
        if (part.type === 'hour') hour = part.value;
        if (part.type === 'minute') minute = part.value;
      });
      if (!hour || !minute) return '—';
      return hour + ':' + minute;
    } catch (_eFmt) {
      return '—';
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

  function renderClanInto(parent, clan, prefixText) {
    if (!parent) return;
    parent.textContent = '';
    if (prefixText) parent.appendChild(document.createTextNode(prefixText));
    if (window.L2 && typeof L2.renderClanIdentity === 'function') {
      parent.appendChild(
        L2.renderClanIdentity({
          name: clan && clan.name ? clan.name : '—',
          emblemId: clan && clan.emblemId != null ? clan.emblemId : null,
          emblemSize: 16,
        })
      );
      return;
    }
    parent.appendChild(
      document.createTextNode(clan && clan.name ? clan.name : '—')
    );
  }

  function appendAllyParticipantLine(li, row) {
    var wrap = document.createElement('span');
    wrap.className = 'l2-siege-participant-row';
    if (window.L2 && typeof L2.renderPlayerIdentity === 'function') {
      wrap.appendChild(
        L2.renderPlayerIdentity({
          name: row.nickname,
          characterId: row.characterId,
          clanEmblemId: row.clanEmblemId,
          emblemSize: 16,
        })
      );
    } else {
      wrap.appendChild(document.createTextNode(String(row.nickname || '—')));
    }
    wrap.appendChild(document.createTextNode(' — '));
    if (window.L2 && typeof L2.renderClanIdentity === 'function') {
      wrap.appendChild(
        L2.renderClanIdentity({
          name: row.clanName,
          emblemId: row.clanEmblemId,
          emblemSize: 16,
        })
      );
    } else {
      wrap.appendChild(document.createTextNode(String(row.clanName || '—')));
    }
    if (row.hp != null && row.maxHp != null) {
      wrap.appendChild(
        document.createTextNode(
          ' — HP: ' + formatNum(row.hp) + '/' + formatNum(row.maxHp)
        )
      );
    }
    li.appendChild(wrap);
    if (row.eliminated) {
      li.appendChild(document.createTextNode(' — '));
      var tag = document.createElement('span');
      tag.className = 'l2-siege-eliminated';
      tag.textContent = 'Вибув';
      li.appendChild(tag);
    }
  }

  function appendEnemyParticipantLine(li, row) {
    var wrap = document.createElement('div');
    wrap.className = 'l2-siege-participant-row l2-siege-participant-row--enemy';

    if (window.L2 && typeof L2.renderPlayerIdentity === 'function') {
      wrap.appendChild(
        L2.renderPlayerIdentity({
          name: row.nickname,
          characterId: row.characterId,
          clanEmblemId: row.clanEmblemId,
          emblemSize: 16,
          linkProfile: false,
        })
      );
    } else {
      var nameEl = document.createElement('span');
      nameEl.className = 'l2-siege-participant-name';
      nameEl.textContent = String(row.nickname || '—');
      wrap.appendChild(nameEl);
    }

    var clanLine = document.createElement('p');
    clanLine.className = 'l2-siege-participant-meta l2-siege-enemy-clan';
    clanLine.appendChild(document.createTextNode('Клан: '));
    if (window.L2 && typeof L2.renderClanIdentity === 'function') {
      clanLine.appendChild(
        L2.renderClanIdentity({
          name: row.clanName,
          emblemId: row.clanEmblemId,
          emblemSize: 16,
        })
      );
    } else {
      var clanName = document.createElement('span');
      clanName.className = 'l2-siege-enemy-clan-name';
      clanName.textContent = String(row.clanName || '—');
      clanLine.appendChild(clanName);
    }
    wrap.appendChild(clanLine);

    if (row.hp != null && row.maxHp != null) {
      var hpLine = document.createElement('p');
      hpLine.className = 'l2-siege-participant-meta';
      hpLine.appendChild(document.createTextNode('HP: '));
      var hpVal = document.createElement('span');
      hpVal.className = 'l2-siege-enemy-hp-value';
      hpVal.textContent = formatNum(row.hp) + '/' + formatNum(row.maxHp);
      hpLine.appendChild(hpVal);
      wrap.appendChild(hpLine);
    }

    li.appendChild(wrap);

    if (row.eliminated) {
      var elimLine = document.createElement('p');
      elimLine.className = 'l2-siege-participant-meta l2-siege-eliminated';
      elimLine.textContent = 'Вибув';
      li.appendChild(elimLine);
      return;
    }

    var actions = document.createElement('p');
    actions.className = 'l2-siege-participant-actions';
    var attackBtn = document.createElement('button');
    attackBtn.type = 'button';
    attackBtn.className = 'l2-siege-pvp-attack-btn';
    attackBtn.textContent = pvpInFlight ? 'Зачекайте…' : 'Атакувати';
    attackBtn.dataset.siegePvpAttack = row.characterId;
    if (pvpInFlight || !stateData || !stateData.canStartSiegePvp) {
      attackBtn.disabled = true;
      attackBtn.classList.add('l2-siege-link--disabled');
    }
    actions.appendChild(attackBtn);
    li.appendChild(actions);
  }

  function cityLabel(data) {
    if (data && data.cityName) return data.cityName;
    if (window.L2 && typeof L2.cityDisplayName === 'function') {
      return L2.cityDisplayName(data && data.cityId ? data.cityId : cityId);
    }
    return (data && data.cityId) || cityId || '—';
  }

  function blockedWallMessage(reason) {
    if (reason === 'siege_no_clan') {
      return 'Для участі в облозі потрібно перебувати в клані';
    }
    if (reason === 'siege_defender') {
      return 'Ваш клан захищає це місто!';
    }
    if (reason === 'siege_eliminated') {
      return 'Ви вибули з цієї облоги.';
    }
    if (reason === 'siege_not_started') {
      return 'Захоплення міста ще не розпочалось';
    }
    if (reason === 'siege_finished') {
      return 'Облога завершилась';
    }
    return '';
  }

  function addClanLine(parent, prefix, clan, suffix) {
    var p = document.createElement('p');
    p.className = 'l2-siege-line';
    renderClanInto(p, clan, prefix || '');
    if (suffix) p.appendChild(document.createTextNode(suffix));
    parent.appendChild(p);
    return p;
  }

  function addStatLine(parent, label, value, valueClass) {
    var p = document.createElement('p');
    p.className = 'l2-siege-line';
    p.appendChild(document.createTextNode(label));
    var val = document.createElement('span');
    val.className = valueClass;
    val.textContent = value;
    p.appendChild(val);
    parent.appendChild(p);
    return p;
  }

  function addLine(parent, text, id) {
    var p = document.createElement('p');
    p.className = 'l2-siege-line';
    if (id) p.id = id;
    p.textContent = text;
    parent.appendChild(p);
    return p;
  }

  function addEnemiesTitle(parent) {
    var p = document.createElement('p');
    p.className = 'l2-siege-line l2-siege-enemies-title';
    p.textContent = 'Вороги:';
    parent.appendChild(p);
    return p;
  }

  function renderIncomingDamageNotice(parent, data) {
    var notice = data && data.incomingDamageNotice;
    if (!notice || !notice.attackerName || !(Number(notice.damage) > 0)) {
      return;
    }
    var p = document.createElement('p');
    p.className = 'l2-siege-line';
    p.id = 'siege-incoming-damage-line';
    p.textContent =
      String(notice.attackerName) +
      ' наніс вам ' +
      String(Math.floor(Number(notice.damage))) +
      ' урону.';
    parent.appendChild(p);
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
      li.textContent = String(row.place) + '. ';
      if (window.L2 && typeof L2.renderClanIdentity === 'function') {
        li.appendChild(
          L2.renderClanIdentity({
            name: row.clanName,
            emblemId: row.clanEmblemId,
            emblemSize: 16,
          })
        );
      } else {
        li.appendChild(document.createTextNode(String(row.clanName)));
      }
      li.appendChild(document.createTextNode(' — ' + formatNum(row.totalDamage)));
      ul.appendChild(li);
    });
    parent.appendChild(ul);
  }

  function renderScheduleHeader(data) {
    var castleName = $('siege-castle-name');
    var dateWrap = $('siege-date-wrap');
    var dateEl = $('siege-date');
    var startWrap = $('siege-start-wrap');
    var endWrap = $('siege-end-wrap');
    var startTime = $('siege-start-time');
    var endTime = $('siege-end-time');

    if (castleName) {
      castleName.textContent = 'Замок: ' + cityLabel(data);
    }
    if (dateWrap && dateEl) {
      if (data.startsAt) {
        dateWrap.hidden = false;
        dateEl.textContent = formatKyivDate(data.startsAt);
      } else {
        dateWrap.hidden = true;
        dateEl.textContent = '—';
      }
    }
    if (startWrap && startTime) {
      if (data.startsAt) {
        startWrap.hidden = false;
        startTime.textContent = formatKyivTime(data.startsAt);
      } else {
        startWrap.hidden = true;
        startTime.textContent = '—';
      }
    }
    if (endWrap && endTime) {
      if (data.endsAt) {
        endWrap.hidden = false;
        endTime.textContent = formatKyivTime(data.endsAt);
      } else {
        endWrap.hidden = true;
        endTime.textContent = '—';
      }
    }
  }

  function renderParticipants(parent, data) {
    var parts = data && data.participants;
    var nearbyLine = $('siege-nearby-line');
    if (!parts || data.state !== 'active') {
      if (nearbyLine) nearbyLine.hidden = true;
      return;
    }
    var hasAny =
      (parts.allies && parts.allies.length) ||
      (parts.enemies && parts.enemies.length);
    if (nearbyLine) {
      nearbyLine.hidden = hasAny;
      if (!hasAny) nearbyLine.textContent = 'Поруч нікого немає';
    }
    if (parts.allies && parts.allies.length) {
      addLine(parent, 'Союзники:');
      var alliesUl = document.createElement('ul');
      alliesUl.className = 'l2-siege-participants';
      parts.allies.forEach(function (row) {
        var li = document.createElement('li');
        appendAllyParticipantLine(li, row);
        alliesUl.appendChild(li);
      });
      parent.appendChild(alliesUl);
    }
    if (parts.enemies && parts.enemies.length) {
      addEnemiesTitle(parent);
      var enemiesUl = document.createElement('ul');
      enemiesUl.className = 'l2-siege-participants';
      parts.enemies.forEach(function (row) {
        var li = document.createElement('li');
        appendEnemyParticipantLine(li, row);
        enemiesUl.appendChild(li);
      });
      parent.appendChild(enemiesUl);
    }
  }

  function renderState(data) {
    stateData = data;
    var ownerLine = $('siege-owner-line');
    var body = $('siege-body');
    var nearbyLine = $('siege-nearby-line');

    renderScheduleHeader(data);
    if (ownerLine) {
      renderClanInto(ownerLine, data.ownerClan, 'Контролює клан: ');
    }
    if (nearbyLine) {
      nearbyLine.hidden = true;
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
      var schedMsg = blockedWallMessage(data.wallAttackBlockReason);
      if (schedMsg && data.wallAttackBlockReason === 'siege_no_clan') {
        var msgEl = document.createElement('p');
        msgEl.className = 'l2-siege-msg';
        msgEl.textContent = schedMsg;
        body.appendChild(msgEl);
      }
    } else if (data.state === 'active') {
      if (data.viewerEliminated) {
        var elimEl = document.createElement('p');
        elimEl.className = 'l2-siege-msg';
        elimEl.textContent = 'Ви вибули з цієї облоги.';
        body.appendChild(elimEl);
      }

      if (lastOwnDamage != null && lastOwnDamage > 0) {
        addLine(body, 'Ви завдали шкоди стіні: ' + formatNum(lastOwnDamage));
      }

      renderIncomingDamageNotice(body, data);

      addActionLink(body, 'Оновити', 'siege-refresh-link', false);
      addStatLine(
        body,
        'Мій урон: ',
        formatNum(data.viewerCharacterDamage || 0),
        'l2-siege-damage-self'
      );
      addStatLine(
        body,
        'Урон мого клану: ',
        formatNum(data.viewerClanDamage || 0),
        'l2-siege-damage-clan'
      );
      renderTopClans(body, data.topClans);
      renderParticipants(body, data);
    } else if (data.state === 'finished') {
      if (data.finishReason === 'wall_destroyed' && data.winnerClan) {
        addClanLine(body, 'Місто захопив клан: ', data.winnerClan, '');
        addLine(body, 'Загальний урон клану: ' + formatNum(winnerClanDamage(data)));
        addLine(
          body,
          'Клан отримав ' + formatNum(data.rewardPoints || 8000) + ' очок.'
        );
      } else if (data.finishReason === 'time_expired') {
        addLine(body, 'Облога завершилася.');
        addLine(body, 'Стіна не була зруйнована.');
        addClanLine(body, 'Місто залишилося під контролем клану: ', data.ownerClan, '.');
      } else if (data.finishReason === 'wall_destroyed_no_eligible_attacker') {
        addLine(body, 'Стіна зруйнована.');
        addLine(body, 'Жоден атакуючий клан не має живих учасників.');
        addClanLine(body, 'Місто залишилося під контролем клану: ', data.ownerClan, '.');
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
      stateData.canAttackWall = false;
      stateData.canStartSiegePvp = false;
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

  async function startSiegePvp(targetCharacterId) {
    if (!targetCharacterId || pvpInFlight) return;
    if (stateData && stateData.canStartSiegePvp === false) return;
    pvpInFlight = true;
    try {
      var snap =
        window.L2 && typeof L2.lastSnapshot === 'function'
          ? L2.lastSnapshot()
          : null;
      if (!token() || !snap) {
        window.location.href = '/';
        return;
      }
      async function postStart(revision) {
        return fetch(
          '/game/siege/' + encodeURIComponent(cityId) + '/pvp/start',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: 'Bearer ' + token(),
            },
            body: JSON.stringify({
              targetCharacterId: targetCharacterId,
              expectedRevision: revision,
            }),
          }
        );
      }
      var r = await postStart(snap.revision);
      if (r.status === 401) {
        window.location.href = '/';
        return;
      }
      if (r.status === 409) {
        if (
          window.L2 &&
          typeof L2.resyncCharacterAfterConflict === 'function'
        ) {
          var ej409 = null;
          try {
            ej409 = await r.json();
          } catch (_e409) {
            ej409 = null;
          }
          await L2.resyncCharacterAfterConflict(function (freshSnap) {
            snap = freshSnap;
          }, ej409);
          if (snap && snap.revision != null) {
            r = await postStart(snap.revision);
          }
        }
      }
      if (!r.ok) {
        var errMsg = 'Не вдалося розпочати PvP на облозі.';
        try {
          var ej = await r.json();
          if (ej && ej.messageUk) errMsg = ej.messageUk;
        } catch (_eErr) {
          /* ignore */
        }
        if (window.L2 && typeof L2.showToast === 'function') {
          L2.showToast(errMsg);
        } else {
          alert(errMsg);
        }
        refreshSiegeNow();
        return;
      }
      var j = await r.json();
      if (j.character && window.L2 && typeof L2.applyCharacterSnapshot === 'function') {
        L2.applyCharacterSnapshot(j.character);
      } else if (j.character && window.L2 && typeof L2.setLastSnapshot === 'function') {
        L2.setLastSnapshot(j.character);
      }
      window.location.href =
        '/battle.html?pvpTargetId=' + encodeURIComponent(targetCharacterId);
    } finally {
      pvpInFlight = false;
      if (stateData) renderState(stateData);
    }
  }

  function onSiegeBodyClick(e) {
    var t = e.target;
    if (!t) return;

    var attackBtn =
      t.closest && typeof t.closest === 'function'
        ? t.closest('[data-siege-pvp-attack]')
        : null;
    if (attackBtn && attackBtn.dataset && attackBtn.dataset.siegePvpAttack) {
      e.preventDefault();
      if (attackBtn.disabled) return;
      void startSiegePvp(String(attackBtn.dataset.siegePvpAttack));
      return;
    }

    if (!t.id) return;
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
