/**
 * Сторінка складу паті — без технічних форм; invite через профіль + HUD.
 */
(function () {
  var state = {
    party: null,
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

  function refreshGlobalHud() {
    if (window.L2 && typeof L2.refreshPartyHud === 'function') {
      L2.refreshPartyHud();
    }
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

  function userMessage(data, fallback) {
    if (data && data.messageUk) return String(data.messageUk);
    return fallback;
  }

  function applyPartyConflict(data) {
    if (data && data.party) {
      state.party = data.party;
    } else if (typeof data.serverPartyVersion === 'number' && state.party) {
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

      var main = document.createElement('div');
      main.className = 'l2-party-member__main';

      var nick = document.createElement('span');
      nick.className = 'l2-party-member__nick';
      nick.textContent = m.name || '—';

      var sep1 = document.createElement('span');
      sep1.className = 'l2-party-member__sep';
      sep1.textContent = ' · ';

      var level = document.createElement('span');
      level.className = 'l2-party-member__level';
      level.textContent = 'ур. ' + (m.level != null ? m.level : '—');

      var sep2 = document.createElement('span');
      sep2.className = 'l2-party-member__sep';
      sep2.textContent = ' · ';

      var prof = document.createElement('span');
      prof.className = 'l2-party-member__prof';
      prof.textContent = m.professionLabelUk || '—';

      main.appendChild(nick);
      main.appendChild(sep1);
      main.appendChild(level);
      main.appendChild(sep2);
      main.appendChild(prof);

      if (m.isLeader) {
        var badge = document.createElement('span');
        badge.className = 'l2-party-member__badge';
        badge.textContent = 'Лідер';
        main.appendChild(badge);
      }
      li.appendChild(main);

      if (typeof m.online === 'boolean' || typeof m.nearby === 'boolean') {
        var status = document.createElement('span');
        status.className = 'l2-party-member__status';
        if (m.online === false) {
          status.textContent = 'Не в мережі';
        } else if (m.nearby === false) {
          status.textContent = 'Далеко';
        } else if (m.activeInBattle) {
          status.textContent = 'У бою';
        } else if (m.online) {
          status.textContent = 'Поруч';
        }
        li.appendChild(status);
      }

      if (state.party.viewerIsLeader && !m.isLeader) {
        var kick = document.createElement('button');
        kick.type = 'button';
        kick.className = 'l2-party-link l2-party-link--kick';
        kick.textContent = '[Вигнати]';
        kick.dataset.characterId = m.characterId;
        kick.addEventListener('click', onKickClick);
        li.appendChild(kick);
      }

      list.appendChild(li);
    }
  }

  function renderFooter() {
    var footer = $('party-footer-actions');
    if (!footer || !state.party) return;
    footer.innerHTML = '';

    if (
      state.party.activeBattle &&
      state.party.activeBattle.canJoin &&
      state.party.activeBattle.spawnId
    ) {
      var goBattle = document.createElement('button');
      goBattle.type = 'button';
      goBattle.className = 'l2-party-link l2-party-link--primary';
      goBattle.textContent = '[Перейти до бою]';
      goBattle.addEventListener('click', onGoBattleClick);
      footer.appendChild(goBattle);
    } else if (
      state.party.activeBattle &&
      state.party.activeBattle.partyBattleId
    ) {
      var battleHint = document.createElement('span');
      battleHint.className = 'l2-party-member__status';
      battleHint.textContent =
        'Паті б\'ється з ' + String(state.party.activeBattle.mobName || 'монстром');
      footer.appendChild(battleHint);
    }

    if (state.party.viewerIsLeader) {
      var disband = document.createElement('button');
      disband.type = 'button';
      disband.className = 'l2-party-link l2-party-link--danger';
      disband.textContent = '[Розпустити паті]';
      disband.addEventListener('click', onDisbandClick);
      footer.appendChild(disband);
      return;
    }

    var leave = document.createElement('button');
    leave.type = 'button';
    leave.className = 'l2-party-link l2-party-link--danger';
    leave.textContent = '[Покинути паті]';
    leave.addEventListener('click', onLeaveClick);
    footer.appendChild(leave);
  }

  function render() {
    clearErr();
    var empty = $('party-empty');
    var active = $('party-active');
    var meta = $('party-meta');
    if (!empty || !active) return;

    if (!state.party) {
      empty.hidden = false;
      active.hidden = true;
      if (meta) meta.textContent = '';
      return;
    }

    empty.hidden = true;
    active.hidden = false;
    if (meta) {
      meta.textContent =
        'Учасників: ' +
        state.party.memberCount +
        '/' +
        state.party.maxMembers;
    }
    renderMembers();
    renderFooter();
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

  async function onGoBattleClick() {
    if (
      !state.party ||
      !state.party.activeBattle ||
      !state.party.activeBattle.canJoin
    ) {
      return;
    }
    var spawnId = state.party.activeBattle.spawnId;
    await withLock(async function () {
      var rev =
        window.L2 && typeof L2.lastSnapshot === 'function'
          ? (L2.lastSnapshot() || {}).revision
          : null;
      var res = await postJson('/game/battle/start', {
        spawnId: spawnId,
        expectedRevision: rev,
      });
      if (res.status === 409 && res.data.code === 'revision_conflict') {
        if (window.L2 && typeof L2.resyncCharacterAfterConflict === 'function') {
          await L2.resyncCharacterAfterConflict(res.data);
        }
        showErr('Стан змінився — оновлено.');
        return;
      }
      if (!res.status || res.status >= 400) {
        showErr(userMessage(res.data, 'Не вдалося приєднатися до бою.'));
        return;
      }
      window.location.href =
        '/battle.html?spawnId=' + encodeURIComponent(String(spawnId));
    });
  }

  async function onLeaveClick() {
    if (!state.party) return;
    if (!window.confirm('Покинути паті?')) return;
    await withLock(async function () {
      var res = await postJson('/game/party/leave', {
        expectedPartyVersion: state.party.version,
      });
      if (res.status === 409 && res.data.code === 'party_version_conflict') {
        applyPartyConflict(res.data);
        showErr('Стан паті змінився. Оновлено.');
        refreshGlobalHud();
        return;
      }
      if (!res.status || res.status >= 400) {
        showErr(userMessage(res.data, 'Не вдалося покинути паті.'));
        return;
      }
      state.party = null;
      await loadParty();
      render();
      refreshGlobalHud();
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
        showErr('Стан паті змінився. Оновлено.');
        refreshGlobalHud();
        return;
      }
      if (!res.status || res.status >= 400) {
        showErr(userMessage(res.data, 'Не вдалося розпустити паті.'));
        return;
      }
      state.party = null;
      render();
      refreshGlobalHud();
    });
  }

  async function onKickClick(ev) {
    var btn = ev.currentTarget;
    var targetId = btn && btn.dataset ? btn.dataset.characterId : '';
    if (!targetId || !state.party) return;
    if (!window.confirm('Вигнати учасника з паті?')) return;
    await withLock(async function () {
      var res = await postJson('/game/party/kick', {
        targetCharacterId: targetId,
        expectedPartyVersion: state.party.version,
      });
      if (res.status === 409 && res.data.code === 'party_version_conflict') {
        applyPartyConflict(res.data);
        showErr('Стан паті змінився. Оновлено.');
        refreshGlobalHud();
        return;
      }
      if (!res.status || res.status >= 400) {
        showErr(userMessage(res.data, 'Не вдалося вигнати учасника.'));
        return;
      }
      state.party = res.data.party;
      render();
      refreshGlobalHud();
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
    if (typeof L2.renderCharacterFromCache === 'function') {
      L2.renderCharacterFromCache();
    }
    await loadParty();
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
