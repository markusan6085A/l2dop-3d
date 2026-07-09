/**
 * Сторінка «Персонаж» — GET /character, HUD, портрет героя (як char.html).
 */
(function () {
  function $(id) {
    return document.getElementById(id);
  }

  async function init() {
    if (window.L2 && typeof L2.mountL2Nav === 'function') {
      L2.mountL2Nav({});
    }

    var token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/';
      return;
    }

    var errEl = $('character-load-err');
    var contentEl = $('character-content');

    try {
      var r = await fetch('/character', {
        headers: { Authorization: 'Bearer ' + token },
      });
      if (r.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/';
        return;
      }
      if (!r.ok) {
        if (errEl) {
          errEl.hidden = false;
          errEl.textContent = 'Не вдалося завантажити персонажа.';
        }
        return;
      }

      var j = await r.json();
      var c = j.character;
      if (c && typeof L2.setLastSnapshot === 'function') {
        L2.setLastSnapshot(c);
      }
      if (c && typeof L2.applyHudFromSnapshot === 'function') {
        L2.applyHudFromSnapshot(c);
      }
      if (c && window.L2CharHero && typeof L2CharHero.renderPortrait === 'function') {
        L2CharHero.renderPortrait(c);
      }
      if (contentEl) contentEl.hidden = false;
    } catch (_e) {
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent = 'Не вдалося завантажити персонажа.';
      }
    }
  }

  init();
})();
