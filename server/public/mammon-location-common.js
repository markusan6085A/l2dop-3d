/**
 * Спільна карта + телепорт для сторінок Торговця / Коваля Маммона.
 */
(function (global) {
  function worldToMapPixel(x, y) {
    var dx = (x + 130000) / 3600;
    var dy = (y + 0) / 5250;
    var mx = Math.floor(18.12 * dx);
    var my = Math.floor(26.2 * dy + 1300);
    return { mx: mx, my: my };
  }

  function placeDot(img, dot, worldX, worldY) {
    if (!img || !dot || !img.naturalWidth) return;
    var p = worldToMapPixel(worldX, worldY);
    var lx = (p.mx / img.naturalWidth) * 100;
    var ly = (p.my / img.naturalHeight) * 100;
    dot.style.left = lx + '%';
    dot.style.top = ly + '%';
    dot.hidden = false;
  }

  function centerMapOn(viewport, img, worldX, worldY) {
    if (!viewport || !img || !img.naturalWidth) return;
    var p = worldToMapPixel(worldX, worldY);
    var px = (p.mx / img.naturalWidth) * img.offsetWidth;
    var py = (p.my / img.naturalHeight) * img.offsetHeight;
    var sl = px - viewport.clientWidth / 2;
    var st = py - viewport.clientHeight / 2;
    viewport.scrollLeft = Math.max(0, Math.min(sl, viewport.scrollWidth - viewport.clientWidth));
    viewport.scrollTop = Math.max(0, Math.min(st, viewport.scrollHeight - viewport.clientHeight));
  }

  function setErr(msg) {
    var err = document.getElementById('mammon-loc-err');
    if (!err) return;
    if (!msg) {
      err.textContent = '';
      err.hidden = true;
      return;
    }
    err.textContent = msg;
    err.hidden = false;
  }

  function paintMap(state, playerX, playerY) {
    var img = document.getElementById('mammon-loc-img');
    var viewport = document.getElementById('mammon-loc-viewport');
    var npcDot = document.getElementById('mammon-loc-npc-dot');
    var playerDot = document.getElementById('mammon-loc-player-dot');
    var label = document.getElementById('mammon-loc-label');
    if (!img || !state || !state.current) return;

    var cur = state.current;
    var wx = Number(cur.worldX);
    var wy = Number(cur.worldY);
    if (!Number.isFinite(wx) || !Number.isFinite(wy)) return;

    if (label) {
      label.textContent = 'Зараз у ' + (cur.labelUk || cur.labelEn || '—');
    }

    function repaint() {
      placeDot(img, npcDot, wx, wy);
      if (
        playerDot &&
        Number.isFinite(Number(playerX)) &&
        Number.isFinite(Number(playerY))
      ) {
        placeDot(img, playerDot, Number(playerX), Number(playerY));
      } else if (playerDot) {
        playerDot.hidden = true;
      }
      centerMapOn(viewport, img, wx, wy);
    }

    if (img.complete && img.naturalWidth) {
      repaint();
    } else {
      img.addEventListener('load', repaint, { once: true });
    }
  }

  async function initMammonLocationPage(opts) {
    if (!opts || !opts.kind || !opts.stateUrl || !opts.stateKey) return;

    var teleportInFlight = false;
    var btn = document.getElementById('mammon-loc-teleport-btn');
    if (btn && opts.teleportLabelUk) {
      btn.textContent = opts.teleportLabelUk;
    }

    var t = localStorage.getItem('token');
    if (!t || !global.L2) return;

    var playerX = null;
    var playerY = null;
    var mammonState = null;

    try {
      var snap = null;
      if (global.L2 && typeof global.L2.renderCharacterFromCache === 'function') {
        global.L2.renderCharacterFromCache();
      }
      if (global.L2 && typeof global.L2.resyncCharacterWhenRequired === 'function') {
        snap = await global.L2.resyncCharacterWhenRequired();
      }
      if (snap) {
        playerX = snap.worldX;
        playerY = snap.worldY;
      }
    } catch (eChar) {
      /* ignore */
    }

    try {
      var rState = await fetch(opts.stateUrl, {
        headers: { Authorization: 'Bearer ' + t },
        cache: 'no-store',
      });
      if (!rState.ok) {
        setErr('Не вдалося завантажити позицію Маммона.');
        return;
      }
      var jState = await rState.json();
      mammonState = jState ? jState[opts.stateKey] : null;
      if (!mammonState) {
        setErr('Позиція Маммона недоступна.');
        return;
      }
      paintMap(mammonState, playerX, playerY);
    } catch (eState) {
      setErr('Помилка мережі.');
      return;
    }

    if (!btn) return;

    btn.addEventListener('click', async function () {
      if (teleportInFlight) return;
      if (!global.L2 || typeof global.L2.lastSnapshot !== 'function') return;
      var snap = global.L2.lastSnapshot();
      if (!snap || snap.revision == null) {
        setErr('Завантаж персонажа.');
        return;
      }
      teleportInFlight = true;
      setErr('');
      btn.disabled = true;
      try {
        var r = await fetch('/game/mammon/teleport', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + t,
          },
          body: JSON.stringify({
            kind: opts.kind,
            expectedRevision: snap.revision,
          }),
        });
        if (r.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/';
          return;
        }
        if (r.status === 409) {
          if (typeof global.L2.resyncCharacterAfterConflict === 'function') {
            await global.L2.resyncCharacterAfterConflict();
          }
          setErr('Стан оновлено — спробуй ще раз.');
          return;
        }
        var j = {};
        try {
          j = await r.json();
        } catch (eJson) {
          j = {};
        }
        if (!r.ok) {
          setErr(
            (j && j.messageUk) || 'Телепорт не вдався.'
          );
          return;
        }
        if (j && j.character) {
          if (typeof global.L2.applyCharacterSnapshot === 'function') {
            global.L2.applyCharacterSnapshot(j.character);
          } else if (global.L2.setLastSnapshot) {
            global.L2.setLastSnapshot(j.character);
            if (typeof global.L2.applyHudFromSnapshot === 'function') {
              global.L2.applyHudFromSnapshot(j.character);
            }
          }
        }
        window.location.href = '/map.html';
      } catch (eTp) {
        setErr('Помилка мережі.');
      } finally {
        teleportInFlight = false;
        btn.disabled = false;
      }
    });
  }

  global.MammonLocationPage = {
    init: initMammonLocationPage,
  };
})(window);
