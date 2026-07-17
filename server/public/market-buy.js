/**
 * Ринок — купити речі.
 */
(function () {
  function $(id) {
    return document.getElementById(id);
  }

  async function init() {
    if (window.L2 && typeof L2.mountL2Nav === 'function') {
      L2.mountL2Nav();
    }
    if (window.L2 && typeof L2.mountFootLinkBar === 'function') {
      L2.mountFootLinkBar('l2-foot-links', { inset: true });
    }

    var t = localStorage.getItem('token');
    var errEl = $('market-buy-load-err');
    var content = $('market-buy-content');

    if (!t) {
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent = 'Потрібен вхід. Перейди на головну.';
      }
      if (window.L2 && typeof L2.clearHudPanel === 'function') L2.clearHudPanel();
      return;
    }

    if (window.L2 && typeof L2.renderCharacterFromCache === 'function') {
      L2.renderCharacterFromCache();
    }
    var c =
      window.L2 && typeof L2.resyncCharacterWhenRequired === 'function'
        ? await L2.resyncCharacterWhenRequired()
        : null;
    if (!c) {
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent = 'Не вдалося завантажити героя.';
      }
      return;
    }
    if (window.L2 && typeof L2.fetchCatalogHints === 'function') {
      await L2.fetchCatalogHints();
    }
    if (window.L2 && typeof L2.applyMutationSnapshot === 'function') {
      L2.applyMutationSnapshot(c);
    }

    if (content) content.removeAttribute('hidden');
  }

  init();
})();
