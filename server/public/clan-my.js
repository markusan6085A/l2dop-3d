/**
 * Мій клан — сторінка з нижньої сітки «Клан».
 */
(function () {
  var UK_MONTHS = [
    'Січ',
    'Лют',
    'Бер',
    'Кві',
    'Тра',
    'Чер',
    'Лип',
    'Сер',
    'Вер',
    'Жов',
    'Лис',
    'Гру',
  ];

  var state = {
    clan: null,
    token: '',
    announceOpen: false,
    saveInFlight: false,
    chatPage: 1,
    chatInFlight: false,
    chatSendInFlight: false,
    leaveInFlight: false,
  };

  function $(id) {
    return document.getElementById(id);
  }

  function tr(key, fallback) {
    return window.L2 && typeof L2.tr === 'function' ? L2.tr(key) : fallback;
  }

  function stubTail() {
    return tr('stub_later', 'заглушка, з’явиться пізніше.');
  }

  function showErr(msg) {
    var el = $('clan-my-err');
    if (!el) return;
    el.hidden = false;
    el.textContent = msg;
  }

  function showStub(label) {
    var el = $('clan-my-stub-msg');
    if (!el) return;
    el.hidden = false;
    el.textContent = '«' + label + '» — ' + stubTail();
  }

  function formatFoundedUk(iso) {
    if (!iso) return '—';
    var d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    var day = d.getDate();
    var mon = UK_MONTHS[d.getMonth()] || '—';
    var year = d.getFullYear();
    var hh = String(d.getHours()).padStart(2, '0');
    var mm = String(d.getMinutes()).padStart(2, '0');
    return day + ' ' + mon + ' ' + year + ' в ' + hh + ':' + mm;
  }

  function formatIntSpaced(n) {
    var num = Number(n);
    if (!Number.isFinite(num)) return '0';
    return Math.trunc(num)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  function formatSkillPoints(n) {
    var num = Number(n);
    if (!Number.isFinite(num) || num === 0) return '0';
    if (num >= 1000) {
      var k = num / 1000;
      var text = k >= 100 ? k.toFixed(0) : k.toFixed(1).replace(/\.0$/, '');
      return text + ' тис';
    }
    return String(Math.trunc(num));
  }

  function formatAnnounceDisplay(text) {
    var trimmed = text ? String(text).trim() : '';
    return trimmed || '—';
  }

  function formatAgoUk(iso) {
    var ts = Date.parse(iso);
    if (!Number.isFinite(ts)) return '[—]';
    var diff = Math.max(0, Date.now() - ts);
    var sec = Math.floor(diff / 1000);
    if (sec < 45) return '[щойно]';
    var min = Math.floor(sec / 60);
    if (min < 60) {
      if (min === 1) return '[1 хв]';
      return '[' + min + ' хв]';
    }
    var hr = Math.floor(min / 60);
    if (hr < 24) {
      if (hr === 1) return '[1 год]';
      return '[' + hr + ' год]';
    }
    var day = Math.floor(hr / 24);
    if (day === 1) return '[1 дн]';
    return '[' + day + ' дн]';
  }

  function setText(id, text) {
    var el = $(id);
    if (el) el.textContent = text;
  }

  function applyEmptyView() {
    var panel = $('clan-my-panel');
    var empty = $('clan-my-empty');
    if (panel) panel.hidden = true;
    if (empty) empty.hidden = false;
  }

  function openAnnounceEditor() {
    var wrap = $('clan-my-announce-edit-wrap');
    var input = $('clan-my-announce-input');
    if (!wrap || !input) return;
    wrap.hidden = false;
    state.announceOpen = true;
    input.value =
      state.clan && state.clan.announcement ? String(state.clan.announcement) : '';
    input.focus();
  }

  function applyAnnounceControls(clan) {
    var toggle = $('clan-my-announce-toggle');
    var readLabel = $('clan-my-announce-label-read');
    var manageWrap = $('clan-my-manage-wrap');
    var canEdit = !!(clan && clan.canEditAnnouncement);
    if (toggle) toggle.hidden = !canEdit;
    if (readLabel) readLabel.hidden = canEdit;
    if (manageWrap) manageWrap.hidden = !canEdit;
  }

  function applyClanView(clan) {
    var panel = $('clan-my-panel');
    var empty = $('clan-my-empty');
    state.clan = clan;
    if (!clan) {
      applyEmptyView();
      return;
    }
    if (empty) empty.hidden = true;
    if (panel) panel.hidden = false;

    setText('clan-my-name', clan.name || '—');
    setText('clan-my-founded', formatFoundedUk(clan.foundedAt));
    setText('clan-my-level', clan.level != null ? String(clan.level) : '1');
    setText('clan-my-leader', clan.leaderName || '—');
    setText('clan-my-announce', formatAnnounceDisplay(clan.announcement));
    setText('clan-my-reputation', formatIntSpaced(clan.reputation));
    setText(
      'clan-my-rating',
      clan.ratingRank != null
        ? clan.ratingRank + ' ' + tr('clan_my_rating_place', 'місце')
        : '—'
    );
    setText('clan-my-skill-pts', formatSkillPoints(clan.skillPoints));
    setText('clan-my-adena', formatIntSpaced(clan.adena));
    setText('clan-my-luck', formatIntSpaced(clan.luckCoins));
    setText(
      'clan-my-members',
      String(clan.memberCount != null ? clan.memberCount : 0) +
        ' ' +
        tr('clan_my_members_of', 'із') +
        ' ' +
        String(clan.maxMembers != null ? clan.maxMembers : 40)
    );

    applyAnnounceControls(clan);

    var leaveBtn = $('clan-my-leave-btn');
    if (leaveBtn) {
      leaveBtn.hidden = !clan.canLeaveClan;
    }

    state.chatPage = 1;
    loadClanChat();

    var input = $('clan-my-announce-input');
    if (input && state.announceOpen) {
      input.value = clan.announcement ? String(clan.announcement) : '';
    }
  }

  async function loadClanMy(token) {
    var r = await fetch('/game/clans/my', {
      headers: { Authorization: 'Bearer ' + token },
    });
    if (!r.ok) {
      throw new Error('clan_my_fail');
    }
    var data = await r.json().catch(function () {
      return {};
    });
    return data.clan || null;
  }

  async function saveAnnouncement(text) {
    if (!state.token || state.saveInFlight) return;
    var rev =
      window.L2 && typeof L2.lastSnapshot === 'function'
        ? (L2.lastSnapshot() || {}).revision
        : null;
    if (rev == null) return;

    state.saveInFlight = true;
    try {
      var r = await fetch('/game/clans/announcement', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + state.token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ announcement: text, expectedRevision: rev }),
      });
      if (r.status === 409) {
        if (window.L2 && typeof L2.resyncCharacterAfterConflict === 'function') {
          await L2.resyncCharacterAfterConflict(function (snapshot) {
            applyClanView(state.clan);
            if (snapshot) applyClanView(state.clan);
          });
        }
        return;
      }
      if (!r.ok) {
        var errBody = await r.json().catch(function () {
          return {};
        });
        showErr(errBody.messageUk || 'Не вдалося зберегти оголошення.');
        return;
      }
      var data = await r.json().catch(function () {
        return {};
      });
      if (data.clan) {
        applyClanView(data.clan);
      }
    } finally {
      state.saveInFlight = false;
    }
  }

  function bindAnnounceEditor() {
    var toggle = $('clan-my-announce-toggle');
    var input = $('clan-my-announce-input');
    var submit = $('clan-my-announce-submit');
    if (toggle) {
      toggle.addEventListener('click', function () {
        openAnnounceEditor();
      });
    }
    if (submit) {
      submit.addEventListener('click', async function () {
        if (state.saveInFlight || !input) return;
        submit.disabled = true;
        try {
          await saveAnnouncement(input.value);
          setText('clan-my-announce', formatAnnounceDisplay(input.value));
        } finally {
          submit.disabled = false;
        }
      });
    }
  }

  function bindStubLinks() {
    var panel = $('clan-my-panel');
    if (!panel) return;
    panel.querySelectorAll('[data-stub]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.getAttribute('data-stub') || '';
        var labelEl = btn.querySelector('[data-i18n]') || btn;
        var label = labelEl.textContent ? labelEl.textContent.trim() : key;
        if (key && window.L2 && typeof L2.tr === 'function') {
          var translated = L2.tr(key);
          if (translated && translated !== key) label = translated;
        }
        showStub(label);
      });
    });
  }

  function renderClanChatMessages(messages) {
    var listEl = $('clan-my-chat-list');
    if (!listEl) return;
    listEl.innerHTML = '';

    if (!messages || !messages.length) {
      var empty = document.createElement('p');
      empty.className = 'l2-clan-my-chat-empty';
      empty.textContent = tr('clan_my_chat_empty', 'Немає повідомлень. Напиши першим.');
      listEl.appendChild(empty);
      return;
    }

    for (var i = 0; i < messages.length; i++) {
      var m = messages[i];
      var row = document.createElement('p');
      row.className = 'l2-clan-my-chat-msg';

      var ago = document.createElement('span');
      ago.className = 'l2-clan-my-chat-msg__ago';
      ago.textContent = formatAgoUk(m.createdAt) + ' ';

      var nick = document.createElement('span');
      nick.className = 'l2-clan-my-chat-msg__nick';
      nick.textContent = (m.characterName || '—') + ': ';

      var text = document.createElement('span');
      text.className = 'l2-clan-my-chat-msg__text';
      text.textContent = m.text || '';

      row.appendChild(ago);
      row.appendChild(nick);
      row.appendChild(text);
      listEl.appendChild(row);
    }
  }

  function renderClanChatPages(page, totalPages) {
    var nav = $('clan-my-chat-pages');
    if (!nav) return;
    nav.innerHTML = '';
    if (!totalPages || totalPages <= 1) {
      nav.hidden = true;
      return;
    }
    nav.hidden = false;

    function addBtn(label, targetPage, active) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className =
        'l2-clan-my-chat-pages__btn' +
        (active ? ' l2-clan-my-chat-pages__btn--active' : '');
      b.textContent = label;
      b.addEventListener('click', function () {
        state.chatPage = targetPage;
        loadClanChat();
      });
      nav.appendChild(b);
    }

    if (page > 1) {
      addBtn(tr('clan_my_chat_prev', '<<'), 1, false);
    }
    for (var p = 1; p <= totalPages; p++) {
      if (totalPages > 5 && p > 2 && p < totalPages - 1 && Math.abs(p - page) > 1) {
        continue;
      }
      addBtn(String(p), p, p === page);
    }
    if (page < totalPages) {
      addBtn(tr('clan_my_chat_next', '>>'), totalPages, false);
    }
  }

  async function loadClanChat() {
    if (state.chatInFlight || !state.token || !state.clan) return;
    state.chatInFlight = true;
    try {
      var url =
        '/game/clans/chat?page=' + encodeURIComponent(String(state.chatPage));
      var r = await fetch(url, {
        headers: { Authorization: 'Bearer ' + state.token },
      });
      if (r.status === 401) {
        window.location.href = '/';
        return;
      }
      if (!r.ok) return;
      var j = await r.json().catch(function () {
        return {};
      });
      renderClanChatMessages(j.messages || []);
      renderClanChatPages(Number(j.page) || 1, Number(j.totalPages) || 1);
    } finally {
      state.chatInFlight = false;
    }
  }

  async function sendClanChatMessage() {
    if (state.chatSendInFlight || !state.token || !state.clan) return;
    var input = $('clan-my-chat-input');
    var sendBtn = $('clan-my-chat-send');
    if (!input) return;
    var text = String(input.value || '').trim();
    if (!text) return;

    state.chatSendInFlight = true;
    if (sendBtn) sendBtn.disabled = true;
    try {
      var r = await fetch('/game/clans/chat', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + state.token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: text }),
      });
      if (r.status === 401) {
        window.location.href = '/';
        return;
      }
      if (!r.ok) {
        var errBody = await r.json().catch(function () {
          return {};
        });
        showErr(errBody.messageUk || 'Не вдалося надіслати повідомлення.');
        return;
      }
      input.value = '';
      state.chatPage = 1;
      await loadClanChat();
    } finally {
      state.chatSendInFlight = false;
      if (sendBtn) sendBtn.disabled = false;
    }
  }

  async function leaveClan() {
    if (state.leaveInFlight || !state.token) return;
    if (!window.confirm(tr('clan_my_leave_confirm', 'Вийти з клану?'))) return;

    var rev =
      window.L2 && typeof L2.lastSnapshot === 'function'
        ? (L2.lastSnapshot() || {}).revision
        : null;
    if (rev == null) {
      showErr('Оновіть сторінку та спробуйте знову.');
      return;
    }

    var leaveBtn = $('clan-my-leave-btn');
    state.leaveInFlight = true;
    if (leaveBtn) leaveBtn.disabled = true;
    try {
      var r = await fetch('/game/clans/leave', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + state.token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ expectedRevision: rev }),
      });
      if (r.status === 409) {
        if (window.L2 && typeof L2.resyncCharacterAfterConflict === 'function') {
          await L2.resyncCharacterAfterConflict();
        }
        return;
      }
      if (!r.ok) {
        var errBody = await r.json().catch(function () {
          return {};
        });
        showErr(errBody.messageUk || 'Не вдалося вийти з клану.');
        return;
      }
      var data = await r.json().catch(function () {
        return {};
      });
      if (data.character && window.L2 && typeof L2.applyMutationSnapshot === 'function') {
        L2.applyMutationSnapshot(data.character);
      }
      state.clan = null;
      applyEmptyView();
    } finally {
      state.leaveInFlight = false;
      if (leaveBtn) leaveBtn.disabled = false;
    }
  }

  function bindClanChat() {
    var input = $('clan-my-chat-input');
    var sendBtn = $('clan-my-chat-send');
    if (sendBtn) {
      sendBtn.addEventListener('click', function () {
        sendClanChatMessage();
      });
    }
    if (input) {
      input.addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter') {
          ev.preventDefault();
          sendClanChatMessage();
        }
      });
    }
  }

  function bindLeaveClan() {
    var leaveBtn = $('clan-my-leave-btn');
    if (!leaveBtn) return;
    leaveBtn.addEventListener('click', function () {
      leaveClan();
    });
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

    bindStubLinks();
    bindAnnounceEditor();
    bindClanChat();
    bindLeaveClan();

    var t = localStorage.getItem('token');
    if (!t || !window.L2) {
      if (window.L2 && typeof L2.clearHudPanel === 'function') L2.clearHudPanel();
      showErr('Потрібен вхід.');
      applyEmptyView();
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

    try {
      var clan = await loadClanMy(t);
      applyClanView(clan);
    } catch (_e) {
      if (c && c.clanId) {
        applyClanView({
          name: c.clanName,
          foundedAt: null,
          level: 1,
          leaderName: c.clanRole === 'leader' ? c.name : '—',
          announcement: '',
          reputation: 0,
          ratingRank: null,
          skillPoints: 0,
          adena: '0',
          luckCoins: 0,
          memberCount: 1,
          maxMembers: 40,
          canEditAnnouncement: c.clanRole === 'leader',
          canLeaveClan: c.clanRole === 'member',
        });
      } else {
        applyEmptyView();
        showErr('Не вдалося завантажити клан.');
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
