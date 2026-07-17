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
