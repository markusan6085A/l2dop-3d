/**
 * Мій клан — сторінка з нижньої сітки «Клан».
 */
(function () {
  function $(id) {
    return document.getElementById(id);
  }

  function showErr(msg) {
    var el = $('clan-my-err');
    if (!el) return;
    el.hidden = false;
    el.textContent = msg;
  }

  function applyClanView(c) {
    var title = $('clan-my-title');
    var role = $('clan-my-role');
    if (!c || !c.clanId) {
      if (title) {
        title.textContent = 'Ти ще не в клані.';
      }
      if (role) role.hidden = true;
      return;
    }
    if (title) {
      title.textContent = c.clanName ? String(c.clanName) : '—';
    }
    if (role) {
      if (c.clanRole === 'leader') {
        role.hidden = false;
        role.textContent = 'Лідер клану';
      } else {
        role.hidden = true;
        role.textContent = '';
      }
    }
  }

  async function init() {
    if (window.L2 && typeof L2.mountL2Nav === 'function') {
      L2.mountL2Nav({});
    }
    if (window.L2 && typeof L2.mountFootLinkBar === 'function') {
      L2.mountFootLinkBar('l2-foot-links', { inset: true });
    }

    var t = localStorage.getItem('token');
    if (!t || !window.L2) {
      if (window.L2 && typeof L2.clearHudPanel === 'function') L2.clearHudPanel();
      showErr('Потрібен вхід.');
      return;
    }

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
    applyClanView(c);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
