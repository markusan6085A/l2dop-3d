/**
 * Окрема сторінка телепорту: список пунктів англійською, POST /game/teleport.
 */
(function () {
  var teleportInFlight = false;
  var TELEPORT_SNAPSHOT_CACHE_KEY = 'l2-teleport-snapshot-cache-v1';

  function $(id) {
    return document.getElementById(id);
  }

  function readCachedTeleportSnapshot() {
    try {
      var raw = sessionStorage.getItem(TELEPORT_SNAPSHOT_CACHE_KEY);
      if (!raw) return null;
      var j = JSON.parse(raw);
      return j && typeof j === 'object' ? j : null;
    } catch (_e) {
      return null;
    }
  }

  function writeCachedTeleportSnapshot(snapshot) {
    if (!snapshot || typeof snapshot !== 'object') return;
    try {
      sessionStorage.setItem(TELEPORT_SNAPSHOT_CACHE_KEY, JSON.stringify(snapshot));
    } catch (_e) {
      /* ignore */
    }
  }

  function renderSkeletonList(listEl) {
    if (!listEl) return;
    listEl.innerHTML = '';
    for (var i = 0; i < 6; i++) {
      var li = document.createElement('li');
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'l2-city-tp-item';
      b.disabled = true;
      b.textContent = 'Завантаження...';
      li.appendChild(b);
      listEl.appendChild(li);
    }
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

  async function resyncCharacter(errEl) {
    var t = localStorage.getItem('token');
    if (!t || !window.L2) return null;
    try {
      var rr = await fetch('/character', {
        headers: { Authorization: 'Bearer ' + t },
      });
      if (rr.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/';
        return null;
      }
      if (!rr.ok) return null;
      var jj = await rr.json();
      if (!jj || !jj.character) return null;
      if (typeof L2.setLastSnapshot === 'function') {
        L2.setLastSnapshot(jj.character);
      }
      if (typeof L2.applyHudFromSnapshot === 'function') {
        L2.applyHudFromSnapshot(jj.character);
      }
      writeCachedTeleportSnapshot(jj.character);
      return jj.character;
    } catch (_e) {
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent = 'Не вдалося синхронізувати персонажа.';
      }
      return null;
    }
  }

  async function doTeleport(teleportId, errEl, okEl) {
    if (teleportInFlight) return;
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
    teleportInFlight = true;
    try {
      async function callTeleportWithRevision(revision) {
        return fetch('/game/teleport', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + t,
          },
          body: JSON.stringify({
            teleportId: teleportId,
            expectedRevision: revision,
          }),
        });
      }

      var r = await callTeleportWithRevision(snap.revision);
      if (r.status === 409) {
        var synced = await resyncCharacter(errEl);
        if (!synced || synced.revision == null) {
          if (errEl) {
            errEl.hidden = false;
            errEl.textContent = 'Дані оновлено. Спробуй телепорт ще раз.';
          }
          return;
        }
        r = await callTeleportWithRevision(synced.revision);
      }

      if (r.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/';
        return;
      }
      if (r.status === 409) {
        if (errEl) {
          errEl.hidden = false;
          errEl.textContent = 'Не вдалося виконати телепорт через конфлікт стану. Спробуй ще раз.';
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
      if (out.character && typeof L2.applyHudFromSnapshot === 'function') {
        L2.applyHudFromSnapshot(out.character);
      }
      await resyncCharacter(errEl);
      window.location.href = '/map.html';
    } finally {
      teleportInFlight = false;
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

    if (content) content.hidden = false;
    renderSkeletonList(listEl);

    var cached =
      window.L2 && typeof L2.lastSnapshot === 'function' ? L2.lastSnapshot() : null;
    if (!cached) cached = readCachedTeleportSnapshot();
    if (cached) {
      if (window.L2 && typeof L2.setLastSnapshot === 'function') {
        L2.setLastSnapshot(cached);
      }
      if (window.L2 && typeof L2.applyHudFromSnapshot === 'function') {
        L2.applyHudFromSnapshot(cached);
      }
    }

    var charPromise = fetch('/character', {
      headers: { Authorization: 'Bearer ' + t },
    });
    var locPromise = fetch('/game/teleport/locations', {
      headers: { Authorization: 'Bearer ' + t },
    });

    var r = await charPromise;
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
      } catch (_e2) {
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
    writeCachedTeleportSnapshot(c);
    if (window.L2 && typeof L2.applyHudFromSnapshot === 'function') {
      L2.applyHudFromSnapshot(c);
    }
    if (j.gearCatalog && window.L2 && typeof L2.mergeGearCatalog === 'function') {
      L2.mergeGearCatalog(j.gearCatalog);
    }
    if (window.L2 && typeof L2.mergeCraftResourceIconHints === 'function') {
      L2.mergeCraftResourceIconHints(j);
    }

    var locR = await locPromise;
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
    if (errEl) errEl.hidden = true;

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
