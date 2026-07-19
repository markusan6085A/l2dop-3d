/**
 * Глобальний party HUD під HP/MP/CP — invite + «Ви в паті».
 * Фіксована висота slot (без CLS), poll 5s, safe textContent.
 */
(function (global) {
  'use strict';

  var POLL_MS = 5000;
  var ASSET_VER = '20260719partyHudFix1';

  var hudState = null;
  var fetchSeq = 0;
  var fetchInFlight = false;
  var rewardAckInFlight = false;
  var respondInFlight = false;
  var joinBattleInFlight = false;
  var pollTimer = null;
  var flashTimer = null;
  var isMounted = false;
  var eventsWired = false;

  if (!global.partyHudDebug) {
    global.partyHudDebug = {
      fetchCount: 0,
      lastFetchAt: 0,
      pollActive: false,
      layoutSnapshots: [],
    };
  }

  function token() {
    try {
      return localStorage.getItem('token');
    } catch (_e) {
      return null;
    }
  }

  function $(id) {
    return document.getElementById(id);
  }

  function shouldRun() {
    if (typeof document === 'undefined' || !document.body) return false;
    if (!document.body.classList.contains('l2-app-l2-chrome')) return false;
    if (!token()) return false;
    return true;
  }

  function ensureSlot() {
    var slot = $('l2-party-hud-slot');
    if (slot) return slot;

    var hudPanel = document.querySelector('.l2-hud-panel');
    var mount = $('l2-hud-panel-mount');
    var anchor = hudPanel || mount;
    if (!anchor || !anchor.parentNode) return null;

    slot = document.createElement('div');
    slot.id = 'l2-party-hud-slot';
    slot.className = 'l2-party-hud-slot';
    slot.setAttribute('aria-live', 'polite');

    var inner = document.createElement('div');
    inner.id = 'l2-party-hud-inner';
    inner.className = 'l2-party-hud-inner l2-party-hud-inner--empty';
    slot.appendChild(inner);

    if (hudPanel && hudPanel.parentNode) {
      hudPanel.parentNode.insertBefore(slot, hudPanel.nextSibling);
    } else {
      anchor.parentNode.insertBefore(slot, anchor.nextSibling);
    }
    return slot;
  }

  function captureLayoutDebug(label) {
    if (!global.layoutDebug && !global.partyHudDebug) return;
    var slot = $('l2-party-hud-slot');
    var navTop = $('l2-nav-top');
    var snap = {
      label: label,
      at: Date.now(),
      slotHeight: slot ? slot.offsetHeight : null,
      scrollY: typeof window.scrollY === 'number' ? window.scrollY : null,
      navTopTop: navTop ? navTop.getBoundingClientRect().top : null,
    };
    if (global.partyHudDebug) {
      global.partyHudDebug.layoutSnapshots.push(snap);
      if (global.partyHudDebug.layoutSnapshots.length > 20) {
        global.partyHudDebug.layoutSnapshots.shift();
      }
    }
    if (global.layoutDebug && typeof global.layoutDebug.log === 'function') {
      global.layoutDebug.log('partyHud', snap);
    }
  }

  function clearInner(inner) {
    while (inner.firstChild) {
      inner.removeChild(inner.firstChild);
    }
  }

  function renderEmpty(inner) {
    inner.className = 'l2-party-hud-inner l2-party-hud-inner--empty';
    clearInner(inner);
  }

  function setFlash(text) {
    var slot = ensureSlot();
    var inner = $('l2-party-hud-inner');
    if (!slot || !inner) return;
    inner.className = 'l2-party-hud-inner l2-party-hud-inner--flash';
    clearInner(inner);
    inner.appendChild(document.createTextNode(String(text || '')));
    if (flashTimer) clearTimeout(flashTimer);
    flashTimer = setTimeout(function () {
      flashTimer = null;
      render(hudState);
    }, 3200);
    captureLayoutDebug('flash');
  }

  function playerProfileHref(characterId, name) {
    if (characterId) {
      return '/player.html?id=' + encodeURIComponent(String(characterId));
    }
    if (name) {
      return '/player.html?name=' + encodeURIComponent(String(name));
    }
    return '/party.html';
  }

  function appendViewLink(parent, href) {
    var viewBtn = document.createElement('a');
    viewBtn.className = 'l2-party-hud__view';
    viewBtn.href = href;
    viewBtn.textContent = '[Переглянути]';
    parent.appendChild(viewBtn);
  }

  function renderMemberRow(inner) {
    inner.className = 'l2-party-hud-inner l2-party-hud-inner--member';
    clearInner(inner);

    var row = document.createElement('div');
    row.className = 'l2-party-hud__row l2-party-hud__row--inline';

    var label = document.createElement('span');
    label.className = 'l2-party-hud__member-label';
    label.textContent = 'Ви перебуваєте в паті';

    row.appendChild(label);
    appendViewLink(row, '/party.html');
    inner.appendChild(row);
  }

  function renderInviteRow(inner, data) {
    inner.className = 'l2-party-hud-inner l2-party-hud-inner--invite';
    clearInner(inner);

    var invName =
      data.invite.inviterName != null
        ? String(data.invite.inviterName).trim()
        : 'Гравець';
    if (!invName) invName = 'Гравець';

    var inviterId =
      data.invite.inviterCharacterId != null
        ? String(data.invite.inviterCharacterId).trim()
        : '';

    var row = document.createElement('div');
    row.className = 'l2-party-hud__row l2-party-hud__row--invite l2-party-hud__row--inline';

    var nick = document.createElement('span');
    nick.className = 'l2-party-hud__nick';
    nick.textContent = invName;

    var lead = document.createElement('span');
    lead.className = 'l2-party-hud__lead';
    var leadText = ' запрошує вас у паті';
    if (data.extraInviteCount > 0) {
      leadText += ' (ще ' + String(data.extraInviteCount) + ')';
    }
    lead.textContent = leadText;

    row.title = invName + leadText;
    row.appendChild(nick);
    row.appendChild(lead);
    appendViewLink(row, playerProfileHref(inviterId, invName));

    var acceptBtn = document.createElement('button');
    acceptBtn.type = 'button';
    acceptBtn.className = 'l2-party-hud__btn l2-party-hud__btn--accept';
    acceptBtn.textContent = 'Прийняти';
    acceptBtn.disabled = respondInFlight;
    acceptBtn.addEventListener('click', function () {
      respondInvite('accept');
    });

    var declineBtn = document.createElement('button');
    declineBtn.type = 'button';
    declineBtn.className = 'l2-party-hud__btn l2-party-hud__btn--decline';
    declineBtn.textContent = 'Відхилити';
    declineBtn.disabled = respondInFlight;
    declineBtn.addEventListener('click', function () {
      respondInvite('decline');
    });

    row.appendChild(acceptBtn);
    row.appendChild(declineBtn);
    inner.appendChild(row);
  }

  function renderRewardNoticeRow(inner, data) {
    inner.className = 'l2-party-hud-inner l2-party-hud-inner--reward';
    clearInner(inner);
    var notice = data.rewardNotice;
    var row = document.createElement('div');
    row.className = 'l2-party-hud__row l2-party-hud__row--stack';
    var title = document.createElement('span');
    title.className = 'l2-party-hud__member-label';
    title.textContent = 'Паті перемогло монстра';
    row.appendChild(title);
    var loot = document.createElement('span');
    loot.className = 'l2-party-hud__reward-loot';
    loot.textContent =
      '+' +
      String(notice.expGain) +
      ' EXP, +' +
      String(notice.spGain) +
      ' SP, +' +
      String(notice.adenaGain) +
      ' Adena';
    row.appendChild(loot);
    var okBtn = document.createElement('button');
    okBtn.type = 'button';
    okBtn.className = 'l2-party-hud__btn l2-party-hud__btn--accept';
    okBtn.textContent = 'OK';
    okBtn.disabled = rewardAckInFlight;
    okBtn.addEventListener('click', function () {
      ackRewardNotice(notice.partyBattleId);
    });
    row.appendChild(okBtn);
    inner.appendChild(row);
  }

  function renderActiveBattleRow(inner, data) {
    inner.className = 'l2-party-hud-inner l2-party-hud-inner--battle';
    clearInner(inner);
    var ab = data.activeBattle;
    var row = document.createElement('div');
    row.className = 'l2-party-hud__row l2-party-hud__row--stack';
    var label = document.createElement('span');
    label.className = 'l2-party-hud__member-label';
    label.textContent = 'Паті б\'ється з ' + String(ab.mobName || 'монстром');
    row.appendChild(label);
    if (ab.canJoin) {
      var joinBtn = document.createElement('button');
      joinBtn.type = 'button';
      joinBtn.className = 'l2-party-hud__btn l2-party-hud__btn--accept';
      joinBtn.textContent = 'Приєднатися';
      joinBtn.disabled = joinBattleInFlight;
      joinBtn.addEventListener('click', function () {
        joinPartyBattle(ab.spawnId);
      });
      row.appendChild(joinBtn);
    } else if (ab.playfield === 'dungeon' && !ab.mobInBattleRange) {
      var hintDungeon = document.createElement('span');
      hintDungeon.className = 'l2-party-hud__hint';
      hintDungeon.textContent = 'Підійдіть ближче до монстра';
      row.appendChild(hintDungeon);
    } else if (ab.memberNearby && !ab.mobInBattleRange) {
      var hintNear = document.createElement('span');
      hintNear.className = 'l2-party-hud__hint';
      hintNear.textContent = 'Підійдіть ближче до монстра';
      row.appendChild(hintNear);
    } else if (!ab.memberNearby && ab.playfield !== 'dungeon') {
      var hintFar = document.createElement('span');
      hintFar.className = 'l2-party-hud__hint';
      hintFar.textContent = 'Паті веде бій в іншій частині локації';
      row.appendChild(hintFar);
    }
    appendViewLink(row, '/party.html');
    inner.appendChild(row);
  }

  async function ackRewardNotice(partyBattleId) {
    if (rewardAckInFlight || !partyBattleId) return;
    rewardAckInFlight = true;
    render(hudState);
    try {
      var r = await fetch('/game/party/reward-notice/ack', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token(),
        },
        body: JSON.stringify({ partyBattleId: String(partyBattleId) }),
      });
      if (!r.ok) {
        setFlash('Не вдалося підтвердити нагороду.');
      }
      await fetchHud();
    } catch (_e) {
      setFlash('Збій мережі. Спробуйте ще раз.');
    } finally {
      rewardAckInFlight = false;
    }
  }

  async function joinPartyBattle(spawnId) {
    if (joinBattleInFlight || !spawnId) return;
    joinBattleInFlight = true;
    render(hudState);
    try {
      var rev =
        window.L2 && typeof L2.lastSnapshot === 'function'
          ? (L2.lastSnapshot() || {}).revision
          : null;
      var r = await fetch('/game/battle/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token(),
        },
        body: JSON.stringify({
          spawnId: String(spawnId),
          expectedRevision: rev,
        }),
      });
      var j = null;
      try {
        j = await r.json();
      } catch (_ej) {
        j = null;
      }
      if (r.status === 409 && j && j.code === 'revision_conflict') {
        if (window.L2 && typeof L2.resyncCharacterAfterConflict === 'function') {
          await L2.resyncCharacterAfterConflict(j);
        }
        setFlash('Стан змінився — оновлено.');
        await fetchHud();
        return;
      }
      if (!r.ok) {
        var msg =
          j && j.messageUk
            ? String(j.messageUk)
            : 'Не вдалося приєднатися до бою.';
        setFlash(msg);
        await fetchHud();
        return;
      }
      window.location.href =
        '/battle.html?spawnId=' + encodeURIComponent(String(spawnId));
    } catch (_eNet) {
      setFlash('Збій мережі. Спробуйте ще раз.');
    } finally {
      joinBattleInFlight = false;
    }
  }

  function render(data) {
    ensureSlot();
    var inner = $('l2-party-hud-inner');
    if (!inner) return;
    if (flashTimer) return;

    if (!data || (!data.party && !(data.invite && data.invite.inviteId))) {
      renderEmpty(inner);
      captureLayoutDebug('empty');
      return;
    }

    if (data.invite && data.invite.inviteId) {
      renderInviteRow(inner, data);
      captureLayoutDebug('invite');
      return;
    }

    if (data.rewardNotice && data.rewardNotice.partyBattleId) {
      renderRewardNoticeRow(inner, data);
      captureLayoutDebug('reward');
      return;
    }

    if (data.activeBattle && data.activeBattle.partyBattleId) {
      renderActiveBattleRow(inner, data);
      captureLayoutDebug('battle');
      return;
    }

    if (data.party && data.party.partyId) {
      renderMemberRow(inner);
      captureLayoutDebug('member');
    }
  }

  async function fetchHud() {
    if (!shouldRun()) return;
    if (document.visibilityState !== 'visible') return;
    if (fetchInFlight) return;

    fetchInFlight = true;
    var mySeq = ++fetchSeq;
    if (global.partyHudDebug) {
      global.partyHudDebug.fetchCount += 1;
      global.partyHudDebug.lastFetchAt = Date.now();
    }

    try {
      var r = await fetch('/game/party/hud', {
        headers: { Authorization: 'Bearer ' + token() },
      });
      if (r.status === 401) {
        try {
          localStorage.removeItem('token');
        } catch (_e401) {
          /* ignore */
        }
        window.location.href = '/';
        return;
      }
      if (!r.ok) return;
      var data = null;
      try {
        data = await r.json();
      } catch (_eJson) {
        return;
      }
      if (mySeq !== fetchSeq) return;
      hudState = data;
      render(hudState);
    } catch (_eNet) {
      /* keep current HUD on network error */
    } finally {
      fetchInFlight = false;
    }
  }

  function stopPartyHudPolling() {
    if (!pollTimer) return;
    clearInterval(pollTimer);
    pollTimer = null;
    if (global.partyHudDebug) {
      global.partyHudDebug.pollActive = false;
    }
  }

  function startPartyHudPolling() {
    if (!shouldRun()) return;
    if (document.visibilityState !== 'visible') return;
    if (pollTimer) return;

    pollTimer = setInterval(function () {
      if (document.visibilityState === 'visible') {
        void fetchHud();
      }
    }, POLL_MS);
    if (global.partyHudDebug) {
      global.partyHudDebug.pollActive = true;
    }
  }

  function resumePartyHudPolling() {
    stopPartyHudPolling();
    void fetchHud();
    startPartyHudPolling();
  }

  function onVisibilityChange() {
    if (document.visibilityState === 'visible') {
      resumePartyHudPolling();
    } else {
      stopPartyHudPolling();
    }
  }

  function onPageShow() {
    resumePartyHudPolling();
  }

  function wireLifecycleEvents() {
    if (eventsWired) return;
    eventsWired = true;
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('pagehide', stopPartyHudPolling);
    window.addEventListener('pageshow', onPageShow);
  }

  async function respondInvite(action) {
    if (respondInFlight || !hudState || !hudState.invite) return;
    var inv = hudState.invite;
    respondInFlight = true;
    render(hudState);
    try {
      var url =
        action === 'accept'
          ? '/game/party/invite/accept'
          : '/game/party/invite/decline';
      var body =
        action === 'accept'
          ? {
              inviteId: inv.inviteId,
              expectedPartyVersion: inv.partyVersion,
            }
          : { inviteId: inv.inviteId };

      var r = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token(),
        },
        body: JSON.stringify(body),
      });

      if (r.status === 401) {
        try {
          localStorage.removeItem('token');
        } catch (_e401) {
          /* ignore */
        }
        window.location.href = '/';
        return;
      }

      var j = null;
      try {
        j = await r.json();
      } catch (_eJson) {
        j = null;
      }

      if (r.status === 409 && j && j.code === 'party_version_conflict') {
        if (j.party) {
          hudState = {
            party: {
              partyId: j.party.id,
              partyVersion: j.party.version,
              leaderCharacterId: j.party.leaderCharacterId,
              memberCount: j.party.memberCount,
              maxMembers: j.party.maxMembers,
              isLeader: j.party.viewerIsLeader,
            },
            invite: null,
            extraInviteCount: 0,
          };
        }
        setFlash('Стан паті змінився — оновлено.');
        await fetchHud();
        return;
      }

      if (!r.ok) {
        var msg =
          j && j.messageUk
            ? String(j.messageUk)
            : action === 'accept'
              ? 'Не вдалося прийняти запрошення.'
              : 'Не вдалося відхилити запрошення.';
        if (j && j.error === 'party_invite_expired') {
          msg = 'Запрошення вже неактивне';
        }
        setFlash(msg);
        await fetchHud();
        return;
      }

      await fetchHud();
    } catch (_eNet) {
      setFlash('Збій мережі. Спробуйте ще раз.');
    } finally {
      respondInFlight = false;
    }
  }

  function mount() {
    if (!shouldRun()) return;
    ensureSlot();
    wireLifecycleEvents();
    if (!isMounted) {
      var inner = $('l2-party-hud-inner');
      if (inner) renderEmpty(inner);
      isMounted = true;
    }
    resumePartyHudPolling();
  }

  function refreshPartyHud() {
    if (!isMounted) {
      mount();
      return;
    }
    void fetchHud();
  }

  global.L2PartyHud = {
    mount: mount,
    refresh: refreshPartyHud,
    fetchHud: fetchHud,
    stopPoll: stopPartyHudPolling,
    startPoll: resumePartyHudPolling,
    captureLayoutDebug: captureLayoutDebug,
    showFlash: setFlash,
    ASSET_VER: ASSET_VER,
  };

  if (global.L2) {
    global.L2.refreshPartyHud = refreshPartyHud;
  }
})(typeof window !== 'undefined' ? window : globalThis);
