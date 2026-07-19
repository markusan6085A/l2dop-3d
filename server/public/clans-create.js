/**
 * Створити клан: форма + POST /game/clans/create.
 */
(function () {
  var createInFlight = false;
  var selectedEmblemId = null;

  function $(id) {
    return document.getElementById(id);
  }

  function showErr(msg) {
    var el = $('clans-create-err');
    if (!el) return;
    el.hidden = false;
    el.textContent = msg;
  }

  function clearErr() {
    var el = $('clans-create-err');
    if (!el) return;
    el.hidden = true;
    el.textContent = '';
  }

  async function submitCreate() {
    if (createInFlight) return;
    clearErr();
    var input = $('clan-name-input');
    var btn = $('clan-create-submit');
    var clanName = input ? String(input.value || '').trim() : '';
    if (!clanName) {
      showErr('Вкажи назву клану.');
      return;
    }

    var t = localStorage.getItem('token');
    if (!t || !window.L2) {
      showErr('Потрібен вхід.');
      return;
    }

    var rev =
      window.L2 && typeof L2.lastSnapshot === 'function' && L2.lastSnapshot()
        ? L2.lastSnapshot().revision
        : null;
    if (rev == null) {
      showErr('Немає revision — онови сторінку.');
      return;
    }

    createInFlight = true;
    if (btn) btn.disabled = true;
    try {
      var r = await fetch('/game/clans/create', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + t,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clanName: clanName,
          emblemId: selectedEmblemId,
          expectedRevision: rev,
        }),
      });
      if (r.status === 409) {
        if (window.L2 && typeof L2.resyncCharacterAfterConflict === 'function') {
          await L2.resyncCharacterAfterConflict();
        }
        showErr('Стан змінився — спробуй ще раз.');
        return;
      }
      var data = await r.json().catch(function () {
        return {};
      });
      if (!r.ok) {
        showErr(data.messageUk || 'Не вдалося створити клан.');
        return;
      }
      if (window.L2 && typeof L2.applyCharacterSnapshot === 'function' && data.character) {
        L2.applyCharacterSnapshot(data.character);
      }
      window.location.href = '/clan-my.html';
    } catch (_e) {
      showErr('Помилка мережі.');
    } finally {
      createInFlight = false;
      if (btn) btn.disabled = false;
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
    if (c && c.clanId) {
      window.location.href = '/clan-my.html';
      return;
    }

    var picker = $('clan-emblem-picker');
    if (picker && typeof L2.mountClanEmblemPicker === 'function') {
      L2.mountClanEmblemPicker(picker, {
        size: 40,
        onSelect: function (id) {
          selectedEmblemId = id;
        },
      });
    }

    var btn = $('clan-create-submit');
    if (btn) {
      btn.addEventListener('click', submitCreate);
    }
    var input = $('clan-name-input');
    if (input) {
      input.addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter') {
          ev.preventDefault();
          submitCreate();
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
