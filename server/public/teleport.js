/**
 * Сторінка телепорту: miru-список «Города», POST /game/teleport.
 */
(function () {
  var teleportInFlight = false;
  var TELEPORT_SNAPSHOT_CACHE_KEY = 'l2-teleport-snapshot-cache-v1';
  var TP_ICON = '/assets/assets/photo_2026-07-05_12-52-33.jpg';

  /** Фіксований порядок міст (окрестности — окремо пізніше). */
  var TELEPORT_CITIES = [
    { label: 'Talking Island Village', teleportId: 'talking_island' },
    { label: 'Elven Village', teleportId: 'elf_village' },
    { label: 'Dark Elven Village', teleportId: 'dark_elf_village' },
    { label: 'Orc Village', teleportId: 'orc_village' },
    { label: 'Dwarven Village', teleportId: 'dwarf_village' },
    { label: 'Gludin Village', teleportId: null },
    { label: 'Town of Gludio', teleportId: 'gludio' },
    { label: 'Town of Dion', teleportId: 'dion' },
    { label: 'Giran Castle Town', teleportId: 'giran' },
    { label: 'Town of Oren', teleportId: 'oren' },
    { label: 'Town of Aden', teleportId: 'aden' },
    { label: 'Town of Goddard', teleportId: 'goddard' },
    { label: 'Rune Township', teleportId: 'rune' },
    { label: 'Town of Schuttgart', teleportId: 'schuttgart' },
    { label: 'Heine', teleportId: 'heine' },
    { label: 'Hunters Village', teleportId: 'hunters' },
    { label: "Hardin's Academy", teleportId: null },
    { label: 'Seven Signs', teleportId: null },
  ];

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

  function cityNameFromSnapshot(c) {
    if (!c) return '—';
    return window.L2 && typeof L2.cityDisplayName === 'function'
      ? L2.cityDisplayName(c.cityId)
      : String(c.cityId || '—');
  }

  function applyCurrentLocation(c) {
    var name = cityNameFromSnapshot(c);
    var current = $('tp-current-city');
    if (current) current.textContent = name;
  }

  function wireMiruIcons(root) {
    if (!root) return;
    root.querySelectorAll('.l2-town-miru-ico').forEach(function (icon) {
      if (icon.dataset.fallbackWired === '1') return;
      icon.dataset.fallbackWired = '1';
      icon.addEventListener('error', function onIconError() {
        icon.removeEventListener('error', onIconError);
        icon.src = '/icons/drops/other.svg';
      });
    });
  }

  function createMiruItem(row, disabled) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'l2-town-miru-item';
    if (row.teleportId) {
      btn.setAttribute('data-teleport-id', row.teleportId);
    } else {
      btn.setAttribute('data-teleport-stub', row.label || '');
    }
    if (disabled) btn.disabled = true;

    var img = document.createElement('img');
    img.className = 'l2-town-miru-ico';
    img.src = TP_ICON;
    img.alt = '';
    img.width = 14;
    img.height = 14;
    img.decoding = 'async';

    var span = document.createElement('span');
    span.textContent = row.label || '—';

    btn.appendChild(img);
    btn.appendChild(span);
    return btn;
  }

  function renderSkeletonList(listEl) {
    if (!listEl) return;
    listEl.innerHTML = '';
    for (var i = 0; i < 6; i++) {
      listEl.appendChild(createMiruItem({ label: 'Завантаження…' }, true));
    }
    wireMiruIcons(listEl);
  }

  function renderCityList(listEl) {
    if (!listEl) return;
    listEl.innerHTML = '';
    for (var i = 0; i < TELEPORT_CITIES.length; i++) {
      var row = TELEPORT_CITIES[i];
      var item = createMiruItem(row, false);
      if (i === TELEPORT_CITIES.length - 1) {
        item.classList.add('l2-town-miru-item--last');
      }
      listEl.appendChild(item);
    }
    wireMiruIcons(listEl);
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
      applyCurrentLocation(jj.character);
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

  function showStub(label, okEl) {
    if (!okEl) return;
    okEl.hidden = false;
    okEl.textContent = '«' + label + '» — скоро з’явиться.';
  }

  async function init() {
    if (window.L2 && typeof L2.mountL2Nav === 'function') {
      L2.mountL2Nav({
        onStub: function (label) {
          showStub(label, $('tp-ok'));
        },
      });
    }

    var errEl = $('tp-load-err');
    var content = $('tp-content');
    var listEl = $('tp-cities-list');
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
      applyCurrentLocation(cached);
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
    applyCurrentLocation(c);
    if (j.gearCatalog && window.L2 && typeof L2.mergeGearCatalog === 'function') {
      L2.mergeGearCatalog(j.gearCatalog);
    }
    if (window.L2 && typeof L2.mergeCraftResourceIconHints === 'function') {
      L2.mergeCraftResourceIconHints(j);
    }

    renderCityList(listEl);
    if (errEl) errEl.hidden = true;

    if (listEl) {
      listEl.addEventListener('click', function (e) {
        var btn = e.target && e.target.closest ? e.target.closest('.l2-town-miru-item') : null;
        if (!btn || btn.disabled) return;
        var id = btn.getAttribute('data-teleport-id');
        if (id) {
          doTeleport(id, tpErr, tpOk);
          return;
        }
        var stub = btn.getAttribute('data-teleport-stub');
        if (stub) showStub(stub, tpOk);
      });
    }
  }

  init();
})();
