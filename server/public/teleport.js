/**
 * Окрема сторінка телепорту: список пунктів англійською, POST /game/teleport.
 */
(function () {
  function $(id) {
    return document.getElementById(id);
  }

  function renderList(listEl, rows) {
    if (!listEl) return;
    listEl.innerHTML = '';
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      var li = document.createElement('li');
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'l2-city-tp-item';
      b.setAttribute('data-teleport-id', row.teleportId || '');
      b.textContent = row.labelEn || row.labelUk || row.teleportId || '—';
      li.appendChild(b);
      listEl.appendChild(li);
    }
  }

  async function doTeleport(teleportId, errEl, okEl) {
    var t = localStorage.getItem('token');
    if (!t || !window.L2 || typeof L2.lastSnapshot !== 'function') return;
    var snap = L2.lastSnapshot();
    if (!snap || snap.revision == null) {
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent = 'Немає даних персонажа — онови сторінку.';
      }
      return;
    }
    if (errEl) {
      errEl.hidden = true;
      errEl.textContent = '';
    }
    if (okEl) {
      okEl.hidden = true;
      okEl.textContent = '';
    }
    var r = await fetch('/game/teleport', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + t,
      },
      body: JSON.stringify({
        teleportId: teleportId,
        expectedRevision: snap.revision,
      }),
    });
    if (r.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
      return;
    }
    if (r.status === 409) {
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent = 'Конфлікт ревізії — онови сторінку й спробуй ще раз.';
      }
      return;
    }
    if (!r.ok) {
      var msg = 'Не вдалося телепортуватися.';
      try {
        var ej = await r.json();
        if (ej && ej.messageUk) msg = ej.messageUk;
      } catch (e) {
        /* ignore */
      }
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent = msg;
      }
      return;
    }
    var out = await r.json();
    if (out.character && typeof L2.setLastSnapshot === 'function') {
      L2.setLastSnapshot(out.character);
    }
    if (okEl) {
      okEl.hidden = false;
      okEl.textContent =
        'Телепорт виконано — ти на карті в новій точці. Відкрий «Карту», щоб перевірити.';
    }
  }

  async function init() {
    if (window.L2 && typeof L2.mountL2Nav === 'function') {
      L2.mountL2Nav({
        onStub: function (label) {
          var stub = $('tp-ok');
          if (stub) {
            stub.hidden = false;
            stub.textContent = '«' + label + '» — заглушка, з’явиться пізніше.';
          }
        },
      });
    }

    var errEl = $('tp-load-err');
    var content = $('tp-content');
    var listEl = $('tp-list');
    var tpErr = $('tp-err');
    var tpOk = $('tp-ok');

    var t = localStorage.getItem('token');
    if (!t) {
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent = 'Потрібен вхід. Перейди на головну.';
      }
      if (window.L2 && typeof L2.clearHudPanel === 'function') L2.clearHudPanel();
      return;
    }

    var r = await fetch('/character', {
      headers: { Authorization: 'Bearer ' + t },
    });
    if (r.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
      return;
    }
    if (!r.ok) {
      var errMsg = 'Не вдалося завантажити героя.';
      try {
        var errJson = await r.json();
        if (errJson && errJson.messageUk) errMsg = errJson.messageUk;
      } catch (e) {
        /* ignore */
      }
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent = errMsg;
      }
      return;
    }

    var j = await r.json();
    var c = j.character;
    window.L2.setLastSnapshot(c);
    if (window.L2 && typeof L2.applyHudFromSnapshot === 'function') {
      L2.applyHudFromSnapshot(c);
    }
    if (j.gearCatalog && window.L2 && typeof L2.mergeGearCatalog === 'function') {
      L2.mergeGearCatalog(j.gearCatalog);
    }

    var locR = await fetch('/game/teleport/locations', {
      headers: { Authorization: 'Bearer ' + t },
    });
    if (locR.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
      return;
    }
    if (!locR.ok) {
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent = 'Не вдалося завантажити список телепортів.';
      }
      return;
    }
    var locJ = await locR.json();
    var locs = locJ.locations || [];
    renderList(listEl, locs);

    if (content) content.removeAttribute('hidden');

    if (listEl) {
      listEl.addEventListener('click', function (e) {
        var btn = e.target && e.target.closest ? e.target.closest('.l2-city-tp-item') : null;
        if (!btn) return;
        var id = btn.getAttribute('data-teleport-id');
        if (id) doTeleport(id, tpErr, tpOk);
      });
    }
  }

  init();
})();
