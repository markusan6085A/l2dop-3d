/**
 * Катакомби / некрополі Seven Signs — список і телепорт до входу на карті.
 */
(function () {
  var teleportInFlight = false;

  function $(id) {
    return document.getElementById(id);
  }

  function authHeaders() {
    var tok = localStorage.getItem('token');
    return tok ? { Authorization: 'Bearer ' + tok } : {};
  }

  function renderList(data) {
    var list = $('catacombs-list');
    if (!list) return;
    list.innerHTML = '';
    var rows = (data && data.dungeons) || [];
    if (!rows.length) {
      var empty = document.createElement('p');
      empty.className = 'l2-catacombs-empty';
      empty.textContent = 'Подземелль поки немає.';
      list.appendChild(empty);
      return;
    }

    for (var i = 0; i < rows.length; i++) {
      var d = rows[i];
      var row = document.createElement('div');
      row.className = 'l2-rb-row';

      var left = document.createElement('div');
      left.className = 'l2-catacombs-row__name';
      var label = document.createElement('span');
      label.className = 'l2-rb-row__label';
      label.textContent = d.labelEn || d.labelUk || d.dungeonId || '—';
      left.appendChild(label);

      var right = document.createElement('div');
      right.className = 'l2-rb-row__actions';

      var price = document.createElement('span');
      price.className = 'l2-rb-row__price';
      var cost = d.adenaCost != null ? d.adenaCost : 1;
      price.appendChild(document.createTextNode('('));
      var gold = document.createElement('span');
      gold.className = 'l2-rb-row__price-gold';
      gold.textContent = 'Аден ' + String(cost);
      price.appendChild(gold);
      price.appendChild(document.createTextNode(')'));

      var tp = document.createElement('button');
      tp.type = 'button';
      tp.className = 'l2-rb-row__tp';
      tp.textContent = 'Телепорт';
      tp.setAttribute('data-dungeon-id', d.dungeonId || '');
      tp.addEventListener('click', function () {
        doTeleport(this.getAttribute('data-dungeon-id'));
      });

      right.appendChild(price);
      right.appendChild(tp);
      row.appendChild(left);
      row.appendChild(right);
      list.appendChild(row);
    }
  }

  async function loadList() {
    var err = $('catacombs-load-err');
    if (err) err.hidden = true;
    var tok = localStorage.getItem('token');
    if (!tok) {
      window.location.href = '/';
      return;
    }
    var r = await fetch('/game/catacombs', {
      headers: authHeaders(),
      cache: 'no-store',
    });
    if (r.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
      return;
    }
    if (!r.ok) {
      if (err) {
        err.hidden = false;
        err.textContent = 'Не вдалося завантажити список подземелль.';
      }
      return;
    }
    var data = await r.json();
    renderList(data);
  }

  async function doTeleport(dungeonId) {
    if (!dungeonId || teleportInFlight) return;
    var snap = window.L2 && L2.lastSnapshot ? L2.lastSnapshot() : null;
    if (!snap || snap.revision == null) {
      alert('Завантаж персонажа (онови сторінку).');
      return;
    }
    teleportInFlight = true;
    try {
      var r = await fetch('/game/catacombs/teleport', {
        method: 'POST',
        headers: Object.assign(
          { 'Content-Type': 'application/json' },
          authHeaders()
        ),
        body: JSON.stringify({
          dungeonId: dungeonId,
          expectedRevision: snap.revision,
        }),
      });
      if (r.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/';
        return;
      }
      if (r.status === 409 && window.L2 && L2.resyncCharacterAfterConflict) {
        await L2.resyncCharacterAfterConflict();
        alert('Стан оновлено — спробуй телепорт ще раз.');
        return;
      }
      var j = null;
      try {
        j = await r.json();
      } catch (eJson) {
        j = null;
      }
      if (!r.ok) {
        alert((j && j.messageUk) || 'Телепорт не вдався.');
        return;
      }
      if (j && j.character && L2.applyCharacterSnapshot) {
        L2.applyCharacterSnapshot(j.character);
      }
      window.location.href = '/map.html';
    } finally {
      teleportInFlight = false;
    }
  }

  async function init() {
    if (window.L2 && typeof L2.mountL2Nav === 'function') {
      L2.mountL2Nav({});
    }
    try {
      var tok = localStorage.getItem('token');
      if (tok) {
        if (window.L2 && typeof L2.renderCharacterFromCache === 'function') {
          L2.renderCharacterFromCache();
        }
        var c =
          window.L2 && typeof L2.resyncCharacterWhenRequired === 'function'
            ? await L2.resyncCharacterWhenRequired()
            : null;
        if (c && typeof L2.applyMutationSnapshot === 'function') {
          L2.applyMutationSnapshot(c);
        }
      }
    } catch (eChar) {
      /* ignore */
    }
    await loadList();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
