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

    fetch('/character', { headers: { Authorization: 'Bearer ' + t }, cache: 'no-store' })
      .then(function (r) {
        if (r.status === 401) return null;
        return r.json();
      })
      .then(function (j) {
        if (!j || !j.character) return;
        if (L2.setLastSnapshot) L2.setLastSnapshot(j.character);
        if (typeof L2.applyHudFromSnapshot === 'function') {
          L2.applyHudFromSnapshot(j.character);
        }
      })
      .catch(function () {});
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
