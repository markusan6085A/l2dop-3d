/**
 * Сторінка «Профіль гравця»: GET /game/player/:id/profile або by-name.
 */
(function () {
  function $(id) {
    return document.getElementById(id);
  }

  function formatRegisteredUk(iso) {
    if (!iso) return '—';
    var d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    var dd = String(d.getDate()).padStart(2, '0');
    var mm = String(d.getMonth() + 1).padStart(2, '0');
    var yyyy = d.getFullYear();
    return dd + '.' + mm + '.' + yyyy;
  }

  function profileApiUrl() {
    var params = new URLSearchParams(window.location.search);
    var id = params.get('id');
    var name = params.get('name');
    if (id && String(id).trim()) {
      return '/game/player/' + encodeURIComponent(String(id).trim()) + '/profile';
    }
    if (name && String(name).trim()) {
      return (
        '/game/player/by-name/' + encodeURIComponent(String(name).trim()) + '/profile'
      );
    }
    return null;
  }

  function applyProfile(p) {
    var headline = $('player-headline');
    if (headline) {
      headline.textContent =
        String(p.name || '—') + ' — ' + String(p.level != null ? p.level : '—') + ' ур.';
    }

    var statusEl = $('player-status');
    if (statusEl) {
      statusEl.textContent =
        p.profileStatus != null && String(p.profileStatus).trim()
          ? String(p.profileStatus).trim()
          : 'Немає статусу';
    }

    if (window.L2CharHero && typeof L2CharHero.renderPortrait === 'function') {
      L2CharHero.renderPortrait(p, {
        imgId: 'player-hero-img',
        stageId: 'player-hero-stage',
      });
    }

    var clanBtn = $('player-clan-action');
    if (clanBtn) {
      if (p.clanName) {
        clanBtn.textContent = 'Клан: ' + String(p.clanName);
        clanBtn.setAttribute('data-stub', 'Клан');
      } else {
        clanBtn.textContent = 'Запросити в клан';
        clanBtn.setAttribute('data-stub', 'Запросити в клан');
      }
    }

    var set = function (id, txt) {
      var el = $(id);
      if (el) el.textContent = txt != null ? String(txt) : '—';
    };

    set('player-karma', p.karma != null ? p.karma : 0);
    set('player-pk', p.pk != null ? p.pk : 0);
    set('player-rec', p.recommendations != null ? p.recommendations : 0);
    set('player-rec-left', p.recommendationsLeft != null ? p.recommendationsLeft : 10);
    set('player-mobs', p.mobsKilled != null ? p.mobsKilled : 0);
    set(
      'player-pvp',
      String(p.pvpWins != null ? p.pvpWins : 0) +
        '/' +
        String(p.pvpLosses != null ? p.pvpLosses : 0)
    );

    var locEl = $('player-location');
    if (locEl) {
      var city = p.cityLabelUk || p.cityId || '—';
      locEl.textContent = 'У ' + city;
    }

    var regEl = $('player-registered');
    if (regEl) {
      regEl.textContent = 'Рег-я: ' + formatRegisteredUk(p.registeredAt);
    }

    document.title = String(p.name || 'Гравець') + ' — L2WAP';
  }

  function wireStubs() {
    document.querySelectorAll('[data-stub]').forEach(function (btn) {
      if (btn.dataset.stubWired === '1') return;
      btn.dataset.stubWired = '1';
      btn.addEventListener('click', function () {
        var stub = $('player-stub-msg');
        if (stub) {
          stub.hidden = false;
          stub.textContent = btn.getAttribute('data-stub') + ' — заглушка, з’явиться пізніше.';
        }
      });
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

    var errEl = $('player-load-err');
    var apiUrl = profileApiUrl();
    if (!apiUrl) {
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent = 'Не вказано гравця.';
      }
      return;
    }

    try {
      var selfRes = await fetch('/character', {
        headers: { Authorization: 'Bearer ' + token },
      });
      if (selfRes.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/';
        return;
      }
      if (selfRes.ok) {
        var selfJson = await selfRes.json();
        if (selfJson.character && typeof L2.setLastSnapshot === 'function') {
          L2.setLastSnapshot(selfJson.character);
        }
        if (selfJson.character && typeof L2.applyHudFromSnapshot === 'function') {
          L2.applyHudFromSnapshot(selfJson.character);
        }
      }

      var r = await fetch(apiUrl, {
        headers: { Authorization: 'Bearer ' + token },
      });
      if (r.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/';
        return;
      }
      if (r.status === 404) {
        if (errEl) {
          errEl.hidden = false;
          errEl.textContent = 'Гравця не знайдено.';
        }
        return;
      }
      if (!r.ok) {
        if (errEl) {
          errEl.hidden = false;
          errEl.textContent = 'Не вдалося завантажити профіль.';
        }
        return;
      }

      var j = await r.json();
      if (!j || !j.profile) {
        if (errEl) {
          errEl.hidden = false;
          errEl.textContent = 'Не вдалося завантажити профіль.';
        }
        return;
      }

      applyProfile(j.profile);
      var content = $('player-content');
      if (content) content.hidden = false;
      wireStubs();
    } catch (_e) {
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent = 'Не вдалося завантажити профіль.';
      }
    }
  }

  init();
})();
