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

    fetch('/character', { headers: { Authorization: 'Bearer ' + t } })
      .then(function (r) {
        if (r.status === 401) return null;
        return r.json();
      })
      .then(function (j) {
        if (!j || !j.character) {
          wireCraftForCharacter(null);
          return;
        }
        if (L2.setLastSnapshot) L2.setLastSnapshot(j.character);
        if (typeof L2.applyHudFromSnapshot === 'function') {
          L2.applyHudFromSnapshot(j.character);
        }
        wireCraftForCharacter(j.character);
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
