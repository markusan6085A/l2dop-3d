/**
 * Коваль Маммона — сторінка NPC.
 */
(function () {
  var BLACKSMITH_ICON = '/nps/76.png';

  function initIcon() {
    var iconEl = document.getElementById('mammon-blacksmith-icon');
    if (!iconEl) return;
    iconEl.src = BLACKSMITH_ICON;
    iconEl.onerror = function () {
      iconEl.src = '/icons/drops/other.svg';
    };
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
