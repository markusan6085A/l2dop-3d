/**
 * Сторінка «Мої квести» — активні квести з snapshot.
 */
(function () {
  function $(id) {
    return document.getElementById(id);
  }

  async function fetchSnapshot() {
    if (window.L2 && typeof L2.renderCharacterFromCache === 'function') {
      L2.renderCharacterFromCache();
    }
    if (window.L2 && typeof L2.resyncCharacterWhenRequired === 'function') {
      return L2.resyncCharacterWhenRequired();
    }
    return null;
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

    var errEl = $('character-quests-load-err');
    var content = $('character-quests-content');
    var listEl = $('character-quests-list');

    try {
      var c = await fetchSnapshot();
      if (!c) {
        localStorage.removeItem('token');
        window.location.href = '/';
        return;
      }
      if (window.L2 && typeof L2.setLastSnapshot === 'function') {
        L2.setLastSnapshot(c);
      }
      if (window.L2 && typeof L2.applyHudFromSnapshot === 'function') {
        L2.applyHudFromSnapshot(c);
      }
      if (window.L2CharacterActiveQuests && typeof L2CharacterActiveQuests.render === 'function') {
        L2CharacterActiveQuests.render(listEl, c);
      } else if (listEl) {
        listEl.textContent = 'Модуль квестів недоступний.';
      }
      if (errEl) errEl.hidden = true;
      if (content) content.hidden = false;
    } catch (_e) {
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent = 'Не вдалося завантажити квести.';
      }
      if (content) content.hidden = true;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
