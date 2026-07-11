/**
 * Сторінка «Персонаж» — GET /character, HUD, шапка, стати, меню дій.
 */
(function () {
  function $(id) {
    return document.getElementById(id);
  }

  function stubTail() {
    return window.L2 && L2.tr ? L2.tr('stub_later') : 'заглушка, з’явиться пізніше.';
  }

  function showStub(label) {
    var msg = $('character-stub-msg');
    if (!msg) return;
    msg.hidden = false;
    msg.textContent = '«' + label + '» — ' + stubTail();
  }

  function fmtNum(s) {
    if (s == null || s === '') return '0';
    try {
      return BigInt(String(s)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f');
    } catch (_e) {
      return String(s);
    }
  }

  function fmtInt(n) {
    if (n == null || n === '') return '0';
    var v = Number(n);
    if (!Number.isFinite(v)) return '0';
    return String(Math.trunc(v));
  }

  function professionLabel(c) {
    if (window.L2 && typeof L2.hudL2ProfessionUkFromSnapshot === 'function') {
      return L2.hudL2ProfessionUkFromSnapshot(c);
    }
    if (!c || c.l2Profession == null) return '—';
    return String(c.l2Profession);
  }

  function coinOfLuckCount(c) {
    if (!c) return '0';
    if (c.coinOfLuck != null) return fmtNum(c.coinOfLuck);
    return '0';
  }

  /** «був у мережі 23 хв тому», «1 год 28 хв тому» — за ISO lastUpdate з snapshot. */
  function formatLastSeenUk(iso) {
    if (!iso) return 'Офлайн';
    var then = Date.parse(String(iso));
    if (!Number.isFinite(then)) return 'Офлайн';
    var diffMs = Math.max(0, Date.now() - then);
    var sec = Math.floor(diffMs / 1000);
    if (sec < 45) return 'був у мережі щойно';
    var min = Math.floor(sec / 60);
    if (min < 60) return 'був у мережі ' + min + ' хв тому';
    var hr = Math.floor(min / 60);
    var minRem = min % 60;
    if (hr < 24) {
      if (minRem === 0) return 'був у мережі ' + hr + ' год тому';
      return 'був у мережі ' + hr + ' год ' + minRem + ' хв тому';
    }
    var days = Math.floor(hr / 24);
    return 'був у мережі ' + days + ' дн тому';
  }

  function setOnlineStatusText(isOnline, lastUpdateIso) {
    var textEl = $('character-online-text');
    if (!textEl) return;
    textEl.classList.remove('l2-character-online__text--online', 'l2-character-online__text--offline');
    if (isOnline) {
      textEl.textContent = 'Онлайн';
      textEl.classList.add('l2-character-online__text--online');
      return;
    }
    textEl.textContent = formatLastSeenUk(lastUpdateIso);
    textEl.classList.add('l2-character-online__text--offline');
  }

  async function applyOnlineStatus(c) {
    if (!c) {
      setOnlineStatusText(false, null);
      return;
    }
    var token = localStorage.getItem('token');
    if (!token) {
      setOnlineStatusText(false, c.lastUpdate);
      return;
    }

    var charId = c.id != null ? String(c.id) : '';
    var isOnline = false;
    try {
      var r = await fetch('/game/online?sort=level', {
        headers: { Authorization: 'Bearer ' + token },
      });
      if (r.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/';
        return;
      }
      if (r.ok) {
        var j = await r.json();
        var players = j && j.players ? j.players : [];
        for (var i = 0; i < players.length; i++) {
          if (String(players[i].characterId || '') === charId) {
            isOnline = true;
            break;
          }
        }
      }
    } catch (_e) {
      /* fallback — lastUpdate */
    }
    setOnlineStatusText(isOnline, c.lastUpdate);
  }

  function applyProfile(c) {
    var nickEl = $('character-nick');
    var statusEl = $('character-status');
    if (nickEl) {
      nickEl.textContent = c && c.name != null ? String(c.name) : '—';
    }
    if (statusEl) {
      var status =
        c && c.profileStatus != null && String(c.profileStatus).trim()
          ? String(c.profileStatus).trim()
          : 'Немає статусу';
      statusEl.textContent = status;
    }
  }

  function applyStats(c) {
    var levelEl = $('character-level');
    var adenaEl = $('character-adena');
    var coinEl = $('character-coin-luck');
    var expEl = $('character-exp');
    var spEl = $('character-sp');
    var profEl = $('character-profession');

    if (levelEl) levelEl.textContent = c && c.level != null ? fmtInt(c.level) : '—';
    if (adenaEl) adenaEl.textContent = c && c.adena != null ? fmtNum(c.adena) : '0';
    if (coinEl) coinEl.textContent = coinOfLuckCount(c);
    if (expEl) expEl.textContent = c && c.exp != null ? fmtNum(c.exp) : '0';
    if (spEl) spEl.textContent = c && c.sp != null ? fmtInt(c.sp) : '0';
    if (profEl) profEl.textContent = professionLabel(c);
  }

  function applySocial(c) {
    var karmaEl = $('character-karma');
    var pkEl = $('character-pk');
    var recEl = $('character-rec');
    var recLeftEl = $('character-rec-left');
    var mobsEl = $('character-mobs');
    var pvpEl = $('character-pvp');
    if (karmaEl) karmaEl.textContent = c && c.karma != null ? fmtInt(c.karma) : '0';
    if (pkEl) pkEl.textContent = c && c.pk != null ? fmtInt(c.pk) : '0';
    if (recEl) recEl.textContent = c && c.recommendations != null ? fmtInt(c.recommendations) : '0';
    if (recLeftEl) {
      recLeftEl.textContent =
        c && c.recommendationsLeft != null ? fmtInt(c.recommendationsLeft) : '10';
    }
    if (mobsEl) mobsEl.textContent = c && c.mobsKilled != null ? fmtInt(c.mobsKilled) : '0';
    if (pvpEl) {
      var wins = c && c.pvpWins != null ? fmtInt(c.pvpWins) : '0';
      var losses = c && c.pvpLosses != null ? fmtInt(c.pvpLosses) : '0';
      pvpEl.textContent = wins + '/' + losses;
    }
  }

  function wireIcons(root) {
    if (!root) return;
    root.querySelectorAll('.l2-character-row__ico').forEach(function (icon) {
      if (icon.dataset.fallbackWired === '1') return;
      icon.dataset.fallbackWired = '1';
      icon.addEventListener('error', function onIconError() {
        icon.removeEventListener('error', onIconError);
        icon.src = '/icons/drops/other.svg';
      });
    });
  }

  function wireStubs() {
    var editBtn = $('character-status-edit');
    if (editBtn) {
      editBtn.addEventListener('click', function () {
        var label = editBtn.getAttribute('data-stub') || 'Редагування статусу';
        showStub(label);
      });
    }

    var actions = $('character-actions');
    if (!actions) return;
    actions.querySelectorAll('[data-stub]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var label = btn.getAttribute('data-stub') || 'Дія';
        showStub(label);
      });
    });

    var logoutBtn = $('character-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function () {
        try {
          localStorage.removeItem('token');
          try {
            sessionStorage.removeItem('token');
          } catch (e2) {
            /* ignore */
          }
        } catch (e) {
          /* ignore */
        }
        window.location.href = '/';
      });
    }
  }

  async function init() {
    if (window.L2 && typeof L2.mountL2Nav === 'function') {
      L2.mountL2Nav({});
    }

    wireStubs();
    wireIcons($('character-content'));

    var token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/';
      return;
    }

    var errEl = $('character-load-err');
    var contentEl = $('character-content');

    try {
      var r = await fetch('/character', {
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
          errEl.textContent = 'Не вдалося завантажити персонажа.';
        }
        return;
      }

      var j = await r.json();
      var c = j.character;
      if (c && typeof L2.setLastSnapshot === 'function') {
        L2.setLastSnapshot(c);
      }
      if (c && typeof L2.applyHudFromSnapshot === 'function') {
        L2.applyHudFromSnapshot(c);
      }
      applyProfile(c);
      applyStats(c);
      applySocial(c);
      applyOnlineStatus(c);
      if (c && window.L2CharHero && typeof L2CharHero.renderPortrait === 'function') {
        L2CharHero.renderPortrait(c);
      }
      if (contentEl) contentEl.hidden = false;
    } catch (_e) {
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent = 'Не вдалося завантажити персонажа.';
      }
    }
  }

  init();
})();
