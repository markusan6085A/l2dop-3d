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

  function setSortActive(sort) {
    currentSort = sort === 'name' ? 'name' : 'level';
    var levelBtn = $('online-sort-level');
    var nameBtn = $('online-sort-name');
    if (levelBtn) {
      levelBtn.classList.toggle('l2-online-sort__btn--active', currentSort === 'level');
    }
    if (nameBtn) {
      nameBtn.classList.toggle('l2-online-sort__btn--active', currentSort === 'name');
    }
  }

  function sortPlayersClient(players, sort) {
    var out = (players || []).slice();
    if (sort === 'name') {
      out.sort(function (a, b) {
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

      var row = document.createElement('div');
      row.className = 'l2-online-player__row';

      var img = document.createElement('img');
      img.className = 'l2-online-player__ico';
      img.src = ONLINE_ICON;
      img.alt = '';
      img.width = 14;
      img.height = 14;
      img.decoding = 'async';

      var nick = document.createElement('span');
      nick.className = 'l2-online-player__nick';
      nick.textContent = String(p.name || '—');

      row.appendChild(img);
      row.appendChild(nick);
      item.appendChild(row);

      var city = document.createElement('p');
      city.className = 'l2-online-player__city';
      var cityLabel = p.cityLabelEn || p.cityLabelUk || p.cityId || '—';
      city.textContent = 'у ' + cityLabel;
      item.appendChild(city);

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

    var levelBtn = $('online-sort-level');
    var nameBtn = $('online-sort-name');
    if (levelBtn) {
      levelBtn.addEventListener('click', function () {
        setSortActive('level');
        if (lastPayload && lastPayload.players) {
          renderPlayers(lastPayload.players);
        } else {
          loadOnline('level');
        }
      });
    }
    if (nameBtn) {
      nameBtn.addEventListener('click', function () {
        setSortActive('name');
        if (lastPayload && lastPayload.players) {
          renderPlayers(lastPayload.players);
        } else {
          loadOnline('name');
        }
      });
    }

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
