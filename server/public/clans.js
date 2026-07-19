/**
 * Клани (місто): список кланів, перемикач «Створити» / «Мій клан».
 */
(function () {
  function $(id) {
    return document.getElementById(id);
  }

  function showErr(msg) {
    var el = $('clans-load-err');
    if (!el) return;
    el.hidden = false;
    el.textContent = msg;
  }

  function applyClanButtonsFromSnapshot(c) {
    var createWrap = $('clans-create-wrap');
    var myWrap = $('clans-my-wrap');
    var inClan = !!(c && c.clanId);
    if (createWrap) createWrap.hidden = inClan;
    if (myWrap) myWrap.hidden = !inClan;
  }

  function renderClansList(clans) {
    var list = $('clans-list');
    if (!list) return;
    list.innerHTML = '';
    var rows = Array.isArray(clans) ? clans : [];
    if (!rows.length) return;
    rows.forEach(function (row) {
      var li = document.createElement('li');
      li.className = 'l2-clans-list__item';
      if (window.L2 && typeof L2.renderClanIdentity === 'function') {
        li.appendChild(
          L2.renderClanIdentity({
            name: row.name,
            emblemId: row.emblemId,
            emblemSize: 16,
          })
        );
        li.appendChild(document.createTextNode(': ' + String(row.leaderName || '—')));
      } else {
        li.textContent = String(row.leaderName || '—') + ': ' + String(row.name || '—');
      }
      list.appendChild(li);
    });
  }

  async function loadClansList(token) {
    var r = await fetch('/game/clans/list', {
      headers: { Authorization: 'Bearer ' + token },
    });
    if (!r.ok) {
      throw new Error('list_fail');
    }
    var data = await r.json().catch(function () {
      return {};
    });
    renderClansList(data.clans);
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
      return;
    }

    if (typeof L2.renderCharacterFromCache === 'function') {
      L2.renderCharacterFromCache();
    }
    var c =
      window.L2 && typeof L2.resyncCharacterWhenRequired === 'function'
        ? await L2.resyncCharacterWhenRequired()
        : null;
    if (window.L2 && typeof L2.applyMutationSnapshot === 'function') {
      L2.applyMutationSnapshot(c);
    }
    applyClanButtonsFromSnapshot(c);

    try {
      await loadClansList(t);
    } catch (_e) {
      showErr('Не вдалося завантажити список кланів.');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
