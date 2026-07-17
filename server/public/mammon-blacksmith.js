/**
 * Коваль Маммона — NPC (карта) або сторінка телепорту (-loc).
 */
(function () {
  var BLACKSMITH_ICON = '/nps/76.png';

  function isLocPage() {
    return /mammon-blacksmith-loc\.html$/i.test(String(window.location.pathname || ''));
  }

  function initIcon() {
    var iconEl = document.getElementById('mammon-blacksmith-icon');
    if (!iconEl) return;
    iconEl.src = BLACKSMITH_ICON;
    iconEl.onerror = function () {
      iconEl.src = '/icons/drops/other.svg';
    };
  }

  async function loadCharacterHud() {
    var t = localStorage.getItem('token');
    if (!t || !window.L2) return;
    if (typeof L2.ensureCharacterSnapshot === 'function') {
      L2.ensureCharacterSnapshot().catch(function () {});
    }
  }

  async function init() {
    if (window.L2 && typeof L2.mountL2Nav === 'function') {
      L2.mountL2Nav({});
    }

    initIcon();

    var t = localStorage.getItem('token');
    if (!t || !window.L2) {
      if (window.L2 && typeof L2.clearHudPanel === 'function') L2.clearHudPanel();
      return;
    }

    if (isLocPage() && window.MammonLocationPage && typeof MammonLocationPage.init === 'function') {
      await MammonLocationPage.init({
        kind: 'blacksmith',
        stateUrl: '/game/mammon/blacksmith',
        stateKey: 'mammonBlacksmith',
        teleportLabelUk: 'Телепорт до Коваля Маммона',
      });
      return;
    }

    await loadCharacterHud();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
