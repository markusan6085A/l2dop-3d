/**
 * Сторінка «Онлайн»: GET /game/online, snapshot HUD з GET /character.
 */
(function () {
  var ONLINE_ICON = '/assets/assets/photo_2026-07-05_12-52-39.jpg';
  var onlineInFlight = false;
  var currentSort = 'level';
  var lastPayload = null;

  function $(id) {
    return document.getElementById(id);
  }

  function wireIcons(root) {
    if (!root) return;
    root.querySelectorAll('.l2-online-player__ico').forEach(function (icon) {
      if (icon.dataset.fallbackWired === '1') return;
      icon.dataset.fallbackWired = '1';
      icon.addEventListener('error', function onIconError() {
        icon.removeEventListener('error', onIconError);
        icon.src = '/icons/drops/other.svg';
      });
    });
  }

  function normalizeSort(sort) {
    if (sort === 'name' || sort === 'power') return sort;
    return 'level';
  }

  function setSortActive(sort) {
    currentSort = normalizeSort(sort);
    var levelBtn = $('online-sort-level');
    var nameBtn = $('online-sort-name');
    var powerBtn = $('online-sort-power');
    if (levelBtn) {
      levelBtn.classList.toggle('l2-online-sort__btn--active', currentSort === 'level');
    }
    if (nameBtn) {
      nameBtn.classList.toggle('l2-online-sort__btn--active', currentSort === 'name');
    }
    if (powerBtn) {
      powerBtn.classList.toggle('l2-online-sort__btn--active', currentSort === 'power');
    }
  }

  function sortPlayersClient(players, sort) {
    var mode = normalizeSort(sort);
    var out = (players || []).slice();
    if (mode === 'name') {
      out.sort(function (a, b) {
        return String(a.name || '').localeCompare(String(b.name || ''), 'uk');
      });
      return out;
    }
    if (mode === 'power') {
      out.sort(function (a, b) {
        var dp = Number(b.heroPower || 0) - Number(a.heroPower || 0);
        if (dp !== 0) return dp;
        return String(a.name || '').localeCompare(String(b.name || ''), 'uk');
      });
      return out;
    }
    out.sort(function (a, b) {
      var dl = Number(b.level || 0) - Number(a.level || 0);
      if (dl !== 0) return dl;
      return String(a.name || '').localeCompare(String(b.name || ''), 'uk');
    });
    return out;
  }

  function formatHeroPower(p) {
    var n = p && p.heroPower != null ? Number(p.heroPower) : NaN;
    if (!Number.isFinite(n) || n < 0) return '0';
    return String(Math.floor(n));
  }

  function renderPlayers(players) {
    var listEl = $('online-players-list');
    var countEl = $('online-count');
    if (!listEl) return;

    var rows = sortPlayersClient(players, currentSort);
    if (countEl) countEl.textContent = String(rows.length);

    listEl.innerHTML = '';
    if (!rows.length) {
      var empty = document.createElement('p');
      empty.className = 'l2-online-empty';
      empty.textContent = 'Нікого в онлайні.';
      listEl.appendChild(empty);
      return;
    }

    for (var i = 0; i < rows.length; i++) {
      var p = rows[i];
      var item = document.createElement('article');
      item.className = 'l2-online-player';

      var main = document.createElement('div');
      main.className = 'l2-online-player__main';

      var left = document.createElement('div');
      left.className = 'l2-online-player__left';

      var row = document.createElement('div');
      row.className = 'l2-online-player__row';

      var img = document.createElement('img');
      img.className = 'l2-online-player__ico';
      img.src = ONLINE_ICON;
      img.alt = '';
      img.width = 14;
      img.height = 14;
      img.decoding = 'async';

      var nick =
        window.L2 && typeof L2.createPlayerProfileNickEl === 'function'
          ? L2.createPlayerProfileNickEl({
              characterId: p.characterId,
              name: p.name,
              className: 'l2-online-player__nick',
            })
          : (function () {
              var span = document.createElement('span');
              span.className = 'l2-online-player__nick';
              span.textContent = String(p.name || '—');
              return span;
            })();

      row.appendChild(img);
      row.appendChild(nick);
      left.appendChild(row);

      var city = document.createElement('p');
      city.className = 'l2-online-player__city';
      var cityLabel = p.cityLabelEn || p.cityLabelUk || p.cityId || '—';
      city.textContent = 'у ' + cityLabel;
      left.appendChild(city);

      var power = document.createElement('span');
      power.className = 'l2-online-player__power';
      power.textContent = formatHeroPower(p);

      main.appendChild(left);
      main.appendChild(power);
      item.appendChild(main);
      listEl.appendChild(item);
    }

    wireIcons(listEl);
  }

  async function loadOnline(sort) {
    if (onlineInFlight) return;
    var token = localStorage.getItem('token');
    var errEl = $('online-load-err');
    if (!token) {
      window.location.href = '/';
      return;
    }

    onlineInFlight = true;
    if (errEl) {
      errEl.hidden = true;
      errEl.textContent = '';
    }

    try {
      var r = await fetch('/game/online?sort=' + encodeURIComponent(sort || currentSort), {
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
          errEl.textContent = 'Не вдалося завантажити онлайн.';
        }
        return;
      }
      lastPayload = await r.json();
      renderPlayers(lastPayload && lastPayload.players ? lastPayload.players : []);
    } catch (_e) {
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent = 'Не вдалося завантажити онлайн.';
      }
    } finally {
      onlineInFlight = false;
    }
  }

  function bindSortButton(btn, sort) {
    if (!btn) return;
    btn.addEventListener('click', function () {
      setSortActive(sort);
      if (lastPayload && lastPayload.players) {
        renderPlayers(lastPayload.players);
      } else {
        loadOnline(sort);
      }
    });
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

    setSortActive('level');

    bindSortButton($('online-sort-level'), 'level');
    bindSortButton($('online-sort-name'), 'name');
    bindSortButton($('online-sort-power'), 'power');

    var r = await fetch('/character', {
      headers: { Authorization: 'Bearer ' + token },
    });
    if (r.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
      return;
    }
    if (r.ok) {
      var j = await r.json();
      if (j.character && typeof L2.setLastSnapshot === 'function') {
        L2.setLastSnapshot(j.character);
      }
      if (j.character && typeof L2.applyHudFromSnapshot === 'function') {
        L2.applyHudFromSnapshot(j.character);
      }
    }

    var content = $('online-content');
    if (content) content.hidden = false;
    await loadOnline('level');
  }

  init();
})();
