/**
 * Глобальний party HUD під HP/MP/CP — invite + «Ви в паті».
 * Фіксована висота slot (без CLS), poll 5s, safe textContent.
 */
(function (global) {
  'use strict';

  var POLL_MS = 5000;
  var ASSET_VER = '20260718partyHud3';

  var hudState = null;
  var fetchSeq = 0;
  var fetchInFlight = false;
  var respondInFlight = false;
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

  function renderMemberRow(inner) {
    inner.className = 'l2-party-hud-inner l2-party-hud-inner--member';
    clearInner(inner);

    var row = document.createElement('div');
    row.className = 'l2-party-hud__row';

    var label = document.createElement('span');
    label.className = 'l2-party-hud__member-label';
    label.textContent = 'Ви перебуваєте в паті';

    var viewBtn = document.createElement('a');
    viewBtn.className = 'l2-party-hud__view';
    viewBtn.href = '/party.html';
    viewBtn.textContent = '[Переглянути]';

    row.appendChild(label);
    row.appendChild(viewBtn);
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

    var row = document.createElement('div');
    row.className = 'l2-party-hud__row l2-party-hud__row--invite';

    var text = document.createElement('span');
    text.className = 'l2-party-hud__text';
    var msg = invName + ' запрошує вас у паті';
    if (data.extraInviteCount > 0) {
      msg += ' (ще ' + String(data.extraInviteCount) + ')';
    }
    text.textContent = msg;
    text.title = msg;

    var actions = document.createElement('span');
    actions.className = 'l2-party-hud__actions';

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

    actions.appendChild(acceptBtn);
    actions.appendChild(declineBtn);
    row.appendChild(text);
    row.appendChild(actions);
    inner.appendChild(row);
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

    if (data.party && data.party.partyId) {
      renderMemberRow(inner);
      captureLayoutDebug('member');
      return;
    }

    if (data.invite && data.invite.inviteId) {
      renderInviteRow(inner, data);
      captureLayoutDebug('invite');
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
    ASSET_VER: ASSET_VER,
  };

  if (global.L2) {
    global.L2.refreshPartyHud = refreshPartyHud;
  }
})(typeof window !== 'undefined' ? window : globalThis);
