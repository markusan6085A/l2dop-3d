/**
 * Сторінка паті — соціальні операції (фаза 1, без battle/reward).
 */
(function () {
  var state = {
    party: null,
    invites: [],
    inFlight: false,
  };

  function $(id) {
    return document.getElementById(id);
  }

  function token() {
    return localStorage.getItem('token');
  }

  function showErr(msg) {
    var el = $('party-page-err');
    if (!el) return;
    el.hidden = false;
    el.textContent = msg;
  }

  function clearErr() {
    var el = $('party-page-err');
    if (!el) return;
    el.hidden = true;
    el.textContent = '';
  }

  async function api(path, opts) {
    var t = token();
    if (!t) return { _err: 401 };
    var r = await fetch(path, opts || {
      headers: { Authorization: 'Bearer ' + t },
    });
    if (r.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
      return { _err: 401 };
    }
    var data = {};
    try {
      data = await r.json();
    } catch (_e) {
      data = {};
    }
    return { status: r.status, data: data };
  }

  async function loadParty() {
    var res = await api('/game/party');
    if (res._err) return;
    if (res.status === 404) {
      showErr('Персонаж не знайдено.');
      return;
    }
    if (!res.status || res.status >= 500) {
      showErr('Не вдалося завантажити паті.');
      return;
    }
    state.party = res.data.party || null;
  }

  async function loadInvites() {
    var res = await api('/game/party/invites');
    if (res._err || !res.status || res.status >= 400) {
      state.invites = [];
      return;
    }
    state.invites = Array.isArray(res.data.invites) ? res.data.invites : [];
  }

  function applyPartyConflict(data) {
    if (data && data.party) {
      state.party = data.party;
    }
    if (typeof data.serverPartyVersion === 'number' && state.party) {
      state.party.version = data.serverPartyVersion;
    }
    render();
  }

  async function postJson(path, body) {
    return api(path, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + token(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  }

  function renderMembers() {
    var list = $('party-members-list');
    if (!list || !state.party) return;
    list.innerHTML = '';
    var members = state.party.members || [];
    for (var i = 0; i < members.length; i++) {
      var m = members[i];
      var li = document.createElement('li');
      li.className = 'l2-party-member';
      var name = document.createElement('span');
      name.className = 'l2-party-member__name';
      name.textContent =
        m.name + ' (ур. ' + m.level + ') — ' + (m.professionLabelUk || '—');
      li.appendChild(name);
      if (m.isLeader) {
        var badge = document.createElement('span');
        badge.className = 'l2-party-member__badge';
        badge.textContent = '★ лідер';
        li.appendChild(badge);
      } else if (state.party.viewerIsLeader) {
        var kick = document.createElement('button');
        kick.type = 'button';
        kick.className = 'l2-party-member__kick l2-party-btn';
        kick.textContent = 'Kick';
        kick.dataset.characterId = m.characterId;
        kick.addEventListener('click', onKickClick);
        li.appendChild(kick);
      }
      list.appendChild(li);
    }
  }

  function renderInvites() {
    var block = $('party-invites-block');
    var list = $('party-invites-list');
    if (!block || !list) return;
    if (!state.invites.length) {
      block.hidden = true;
      list.innerHTML = '';
      return;
    }
    block.hidden = false;
    list.innerHTML = '';
    for (var i = 0; i < state.invites.length; i++) {
      var inv = state.invites[i];
      var li = document.createElement('li');
      li.className = 'l2-party-invite';
      li.textContent =
        'Запрошення від ' +
        inv.inviterName +
        ' (лідер: ' +
        inv.leaderName +
        ', ' +
        inv.memberCount +
        '/' +
        inv.maxMembers +
        ')';
      var actions = document.createElement('div');
      actions.className = 'l2-party-invite__actions';
      var accept = document.createElement('button');
      accept.type = 'button';
      accept.className = 'l2-party-btn';
      accept.textContent = 'Прийняти';
      accept.dataset.inviteId = inv.inviteId;
      accept.dataset.partyVersion = String(inv.partyVersion);
      accept.addEventListener('click', onAcceptInvite);
      var decline = document.createElement('button');
      decline.type = 'button';
      decline.className = 'l2-party-btn';
      decline.textContent = 'Відхилити';
      decline.dataset.inviteId = inv.inviteId;
      decline.addEventListener('click', onDeclineInvite);
      actions.appendChild(accept);
      actions.appendChild(decline);
      li.appendChild(actions);
      list.appendChild(li);
    }
  }

  function render() {
    clearErr();
    var empty = $('party-empty');
    var active = $('party-active');
    var meta = $('party-meta');
    var leaderActions = $('party-leader-actions');
    if (!empty || !active) return;

    if (!state.party) {
      empty.hidden = false;
      active.hidden = true;
      if (meta) meta.hidden = true;
      renderInvites();
      return;
    }

    empty.hidden = true;
    active.hidden = false;
    if (meta) {
      meta.hidden = false;
      meta.textContent =
        'Учасників: ' +
        state.party.memberCount +
        '/' +
        state.party.maxMembers +
        ' · v' +
        state.party.version;
    }
    if (leaderActions) {
      leaderActions.hidden = !state.party.viewerIsLeader;
    }
    renderMembers();
    renderInvites();
  }

  async function withLock(fn) {
    if (state.inFlight) return;
    state.inFlight = true;
    clearErr();
    try {
      await fn();
    } finally {
      state.inFlight = false;
    }
  }

  async function onCreateClick() {
    await withLock(async function () {
      var res = await postJson('/game/party/create', {});
      if (res.status === 409 && res.data.code === 'party_version_conflict') {
        applyPartyConflict(res.data);
        showErr('Стан паті змінився — оновлено.');
        return;
      }
      if (!res.status || res.status >= 400) {
        showErr(res.data.messageUk || 'Не вдалося створити паті.');
        return;
      }
      state.party = res.data.party;
      await loadInvites();
      render();
    });
  }

  async function onInviteClick() {
    if (!state.party) return;
    var input = $('party-invite-target');
    var targetId = input ? String(input.value || '').trim() : '';
    if (!targetId) {
      showErr('Вкажи characterId.');
      return;
    }
    await withLock(async function () {
      var res = await postJson('/game/party/invite', {
        targetCharacterId: targetId,
        expectedPartyVersion: state.party.version,
      });
      if (res.status === 409 && res.data.code === 'party_version_conflict') {
        applyPartyConflict(res.data);
        showErr('Стан паті застарів — оновлено.');
        return;
      }
      if (!res.status || res.status >= 400) {
        showErr(res.data.messageUk || 'Не вдалося надіслати запрошення.');
        return;
      }
      if (typeof res.data.partyVersion === 'number') {
        state.party.version = res.data.partyVersion;
      }
      if (input) input.value = '';
      render();
    });
  }

  async function onLeaveClick() {
    if (!state.party) return;
    if (!window.confirm('Вийти з паті?')) return;
    await withLock(async function () {
      var res = await postJson('/game/party/leave', {
        expectedPartyVersion: state.party.version,
      });
      if (res.status === 409 && res.data.code === 'party_version_conflict') {
        applyPartyConflict(res.data);
        showErr('Стан паті застарів — оновлено.');
        return;
      }
      if (!res.status || res.status >= 400) {
        showErr(res.data.messageUk || 'Не вдалося вийти.');
        return;
      }
      state.party = null;
      await loadParty();
      await loadInvites();
      render();
    });
  }

  async function onDisbandClick() {
    if (!state.party || !state.party.viewerIsLeader) return;
    if (!window.confirm('Розпустити паті?')) return;
    await withLock(async function () {
      var res = await postJson('/game/party/disband', {
        expectedPartyVersion: state.party.version,
      });
      if (res.status === 409 && res.data.code === 'party_version_conflict') {
        applyPartyConflict(res.data);
        showErr('Стан паті застарів — оновлено.');
        return;
      }
      if (!res.status || res.status >= 400) {
        showErr(res.data.messageUk || 'Не вдалося розпустити паті.');
        return;
      }
      state.party = null;
      render();
    });
  }

  async function onKickClick(ev) {
    var btn = ev.currentTarget;
    var targetId = btn && btn.dataset ? btn.dataset.characterId : '';
    if (!targetId || !state.party) return;
    await withLock(async function () {
      var res = await postJson('/game/party/kick', {
        targetCharacterId: targetId,
        expectedPartyVersion: state.party.version,
      });
      if (res.status === 409 && res.data.code === 'party_version_conflict') {
        applyPartyConflict(res.data);
        showErr('Стан паті застарів — оновлено.');
        return;
      }
      if (!res.status || res.status >= 400) {
        showErr(res.data.messageUk || 'Не вдалося виключити.');
        return;
      }
      state.party = res.data.party;
      render();
    });
  }

  async function onAcceptInvite(ev) {
    var btn = ev.currentTarget;
    var inviteId = btn && btn.dataset ? btn.dataset.inviteId : '';
    var pv = btn && btn.dataset ? Number(btn.dataset.partyVersion) : NaN;
    if (!inviteId || !Number.isFinite(pv)) return;
    await withLock(async function () {
      var res = await postJson('/game/party/invite/accept', {
        inviteId: inviteId,
        expectedPartyVersion: pv,
      });
      if (res.status === 409 && res.data.code === 'party_version_conflict') {
        applyPartyConflict(res.data);
        await loadInvites();
        render();
        showErr('Стан паті застарів — оновлено.');
        return;
      }
      if (!res.status || res.status >= 400) {
        showErr(res.data.messageUk || 'Не вдалося прийняти.');
        await loadInvites();
        render();
        return;
      }
      state.party = res.data.party;
      await loadInvites();
      render();
    });
  }

  async function onDeclineInvite(ev) {
    var btn = ev.currentTarget;
    var inviteId = btn && btn.dataset ? btn.dataset.inviteId : '';
    if (!inviteId) return;
    await withLock(async function () {
      var res = await postJson('/game/party/invite/decline', { inviteId: inviteId });
      if (!res.status || res.status >= 400) {
        showErr(res.data.messageUk || 'Не вдалося відхилити.');
        return;
      }
      await loadInvites();
      render();
    });
  }

  async function init() {
    if (window.L2 && typeof L2.mountL2Nav === 'function') {
      L2.mountL2Nav({});
    }
    if (window.L2 && typeof L2.mountFootLinkBar === 'function') {
      L2.mountFootLinkBar('l2-nav-bottom', { inset: true });
    }
    if (!token() || !window.L2) {
      showErr('Потрібен вхід.');
      return;
    }
    if (window.L2 && typeof L2.ensureHudFromCharacter === 'function') {
      await L2.ensureHudFromCharacter();
    }
    var createBtn = $('party-create-btn');
    if (createBtn) createBtn.addEventListener('click', onCreateClick);
    var inviteBtn = $('party-invite-btn');
    if (inviteBtn) inviteBtn.addEventListener('click', onInviteClick);
    var leaveBtn = $('party-leave-btn');
    if (leaveBtn) leaveBtn.addEventListener('click', onLeaveClick);
    var disbandBtn = $('party-disband-btn');
    if (disbandBtn) disbandBtn.addEventListener('click', onDisbandClick);

    await loadParty();
    await loadInvites();
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
