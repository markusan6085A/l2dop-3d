/**
 * Керування кланом — лише для лідера.
 */
(function () {
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
    var el = $('clan-manage-err');
    if (!el) return;
    el.hidden = false;
    el.textContent = msg;
  }

  function showStub(label) {
    var el = $('clan-manage-stub-msg');
    if (!el) return;
    el.hidden = false;
    el.textContent = '«' + label + '» — ' + stubTail();
  }

  async function loadClanMy(token) {
    var r = await fetch('/game/clans/my', {
      headers: { Authorization: 'Bearer ' + token },
    });
    if (!r.ok) throw new Error('clan_my_fail');
    var data = await r.json().catch(function () {
      return {};
    });
    return data.clan || null;
  }

  function bindStubLinks() {
    var panel = $('clan-manage-panel');
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

    var t = localStorage.getItem('token');
    if (!t || !window.L2) {
      if (window.L2 && typeof L2.clearHudPanel === 'function') L2.clearHudPanel();
      showErr('Потрібен вхід.');
      return;
    }

    if (typeof L2.renderCharacterFromCache === 'function') {
      L2.renderCharacterFromCache();
    }
    if (typeof L2.resyncCharacterWhenRequired === 'function') {
      await L2.resyncCharacterWhenRequired();
    }

    try {
      var clan = await loadClanMy(t);
      if (!clan || !clan.canEditAnnouncement) {
        window.location.replace('/clan-my.html');
        return;
      }
      var panel = $('clan-manage-panel');
      var nameEl = $('clan-manage-name');
      if (panel) panel.hidden = false;
      if (nameEl) nameEl.textContent = clan.name || '—';
    } catch (_e) {
      showErr('Не вдалося завантажити клан.');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
