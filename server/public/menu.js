/**
 * Меню: HUD, навігація, кнопка «Крафт», «РБ-боси».
 */
(function () {
  function $(id) {
    return document.getElementById(id);
  }

  function wireCraftForCharacter(char) {
    var wrap = $('l2-menu-craft-wrap');
    if (!wrap || !window.L2 || typeof L2.canOpenCraft !== 'function') return;
    var ok = char != null && L2.canOpenCraft(char);
    wrap.hidden = !ok;
  }

  function wireDevBoost(enabled) {
    var wrap = $('l2-menu-dev-boost-wrap');
    if (!wrap) return;
    wrap.hidden = !enabled;
  }

  function loadClientConfig() {
    return fetch('/game/client-config')
      .then(function (r) {
        return r.ok ? r.json() : null;
      })
      .then(function (cfg) {
        wireDevBoost(cfg && cfg.devSelfBoost === true);
      })
      .catch(function () {
        wireDevBoost(false);
      });
  }

  function init() {
    wireDevBoost(false);
    loadClientConfig();

    if (window.L2 && typeof L2.mountL2Nav === 'function') {
      L2.mountL2Nav({
        onStub: function (label) {
          var el = $('l2-menu-stub-msg');
          if (el) {
            el.hidden = false;
            el.textContent = '«' + label + '» — заглушка, з’явиться пізніше.';
          }
        },
      });
    }

    var t = localStorage.getItem('token');
    if (!t || !window.L2) {
      if (window.L2 && typeof L2.clearHudPanel === 'function') L2.clearHudPanel();
      wireCraftForCharacter(null);
      return;
    }

    if (window.L2 && typeof L2.renderCharacterFromCache === 'function') {
      L2.renderCharacterFromCache();
    }
    (window.L2 && typeof L2.resyncCharacterWhenRequired === 'function'
      ? L2.resyncCharacterWhenRequired()
      : Promise.resolve(null))
      .then(function (c) {
        if (!c) {
          wireCraftForCharacter(null);
          return;
        }
        wireCraftForCharacter(c);
      })
      .catch(function () {
        wireCraftForCharacter(null);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
