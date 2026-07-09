/**
 * Сторінка «Персонаж» — GET /character, HUD, шапка профілю, портрет героя.
 */
(function () {
  function $(id) {
    return document.getElementById(id);
  }

  function stubTail() {
    return window.L2 && L2.tr ? L2.tr('stub_later') : 'заглушка, з’явиться пізніше.';
  }

  function showStub(label) {
    var msg = $('character-stub-msg');
    if (!msg) return;
    msg.hidden = false;
    msg.textContent = '«' + label + '» — ' + stubTail();
  }

  function applyProfile(c) {
    var nickEl = $('character-nick');
    var statusEl = $('character-status');
    if (nickEl) {
      nickEl.textContent = c && c.name != null ? String(c.name) : '—';
    }
    if (statusEl) {
      var status =
        c && c.profileStatus != null && String(c.profileStatus).trim()
          ? String(c.profileStatus).trim()
          : 'Немає статусу';
      statusEl.textContent = status;
    }
  }

  function wireStubs() {
    var editBtn = $('character-status-edit');
    if (editBtn) {
      editBtn.addEventListener('click', function () {
        var label = editBtn.getAttribute('data-stub') || 'Редагування статусу';
        showStub(label);
      });
    }
  }

  async function init() {
    if (window.L2 && typeof L2.mountL2Nav === 'function') {
      L2.mountL2Nav({});
    }

    wireStubs();

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
      applyProfile(c);
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
