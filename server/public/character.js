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
    setOnlineStatusText(true, c.lastUpdate);
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

  function applyRegistered(c) {
    var regEl = $('character-registered');
    if (!regEl) return;
    var iso = c && (c.registeredAt || c.lastUpdate);
    regEl.textContent = 'Рег-я: ' + formatRegisteredUk(iso);
  }

  function applyProfile(c) {
    var nickEl = $('character-nick');
    var statusEl = $('character-status');
    var inputEl = $('character-status-input');
    if (nickEl) {
      nickEl.textContent = c && c.name != null ? String(c.name) : '—';
    }
    var statusText =
      c && c.profileStatus != null && String(c.profileStatus).trim()
        ? String(c.profileStatus).trim()
        : 'Немає статусу';
    if (statusEl) {
      statusEl.textContent = statusText;
    }
    if (inputEl && document.activeElement !== inputEl) {
      inputEl.value = statusText === 'Немає статусу' ? '' : statusText;
    }
  }

  function setStatusEditOpen(open) {
    var statusEl = $('character-status');
    var editBtn = $('character-status-edit');
    var inputEl = $('character-status-input');
    var saveBtn = $('character-status-save');
    if (statusEl) statusEl.hidden = !!open;
    if (editBtn) editBtn.hidden = !!open;
    if (inputEl) inputEl.hidden = !open;
    if (saveBtn) saveBtn.hidden = !open;
    if (open && inputEl) {
      inputEl.focus();
      inputEl.select();
    }
  }

  function wireProfileStatusEdit() {
    var editBtn = $('character-status-edit');
    var saveBtn = $('character-status-save');
    var inputEl = $('character-status-input');
    var errEl = $('character-load-err');
    var statusSaveInFlight = false;

    if (editBtn) {
      editBtn.addEventListener('click', function () {
        setStatusEditOpen(true);
      });
    }

    if (inputEl) {
      inputEl.addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter') {
          ev.preventDefault();
          if (saveBtn) saveBtn.click();
        }
        if (ev.key === 'Escape') {
          setStatusEditOpen(false);
        }
      });
    }

    if (!saveBtn || !inputEl) return;

    saveBtn.addEventListener('click', async function () {
      if (statusSaveInFlight) return;

      var token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/';
        return;
      }

      var snap =
        window.L2 && typeof L2.lastSnapshot === 'function'
          ? L2.lastSnapshot()
          : null;
      var rev = snap && snap.revision != null ? Number(snap.revision) : NaN;
      if (!Number.isFinite(rev)) {
        if (errEl) {
          errEl.hidden = false;
          errEl.textContent = 'Немає revision — оновіть сторінку.';
        }
        return;
      }

      statusSaveInFlight = true;
      saveBtn.disabled = true;
      try {
        var r = await fetch('/character/profile-status', {
          method: 'POST',
          headers: {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: inputEl.value,
            expectedRevision: rev,
          }),
        });

        if (r.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/';
          return;
        }

        if (r.status === 409) {
          if (window.L2 && typeof L2.resyncCharacterAfterConflict === 'function') {
            await L2.resyncCharacterAfterConflict(function (c) {
              applyProfile(c);
            });
          }
          if (errEl) {
            errEl.hidden = false;
            errEl.textContent = 'Стан оновлено — спробуйте ще раз.';
          }
          return;
        }

        if (!r.ok) {
          var ej = null;
          try {
            ej = await r.json();
          } catch (_e2) {
            /* ignore */
          }
          if (errEl) {
            errEl.hidden = false;
            errEl.textContent =
              (ej && ej.messageUk) || 'Не вдалося зберегти статус.';
          }
          return;
        }

        var j = await r.json();
        var c = j.character;
        if (c && window.L2 && typeof L2.applyCharacterSnapshot === 'function') {
          L2.applyCharacterSnapshot(c, function (snap) {
            applyProfile(snap);
          });
        } else {
          applyProfile(c);
        }
        setStatusEditOpen(false);
        if (errEl) errEl.hidden = true;
      } catch (_e) {
        if (errEl) {
          errEl.hidden = false;
          errEl.textContent = 'Не вдалося зберегти статус.';
        }
      } finally {
        statusSaveInFlight = false;
        saveBtn.disabled = false;
      }
    });
  }

  function applyStats(c) {
    var levelEl = $('character-level');
    var adenaEl = $('character-adena');
    var coinEl = $('character-coin-luck');
    var expEl = $('character-exp');
    var spEl = $('character-sp');
    var profEl = $('character-profession');
    var powerEl = $('character-hero-power');

    if (levelEl) levelEl.textContent = c && c.level != null ? fmtInt(c.level) : '—';
    if (adenaEl) adenaEl.textContent = c && c.adena != null ? fmtNum(c.adena) : '0';
    if (coinEl) coinEl.textContent = coinOfLuckCount(c);
    if (expEl) expEl.textContent = c && c.exp != null ? fmtNum(c.exp) : '0';
    if (spEl) spEl.textContent = c && c.sp != null ? fmtInt(c.sp) : '0';
    if (profEl) profEl.textContent = professionLabel(c);
    if (powerEl) {
      var pw = c && c.heroPower != null ? Number(c.heroPower) : 1000;
      powerEl.textContent = Number.isFinite(pw)
        ? String(Math.trunc(pw)).replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f')
        : '1\u202f000';
    }
  }

  function applySocial(c) {
    var karmaEl = $('character-karma');
    var pkEl = $('character-pk');
    var recEl = $('character-rec');
    var mobsEl = $('character-mobs');
    var pvpEl = $('character-pvp');
    if (karmaEl) karmaEl.textContent = c && c.karma != null ? fmtInt(c.karma) : '0';
    if (pkEl) pkEl.textContent = c && c.pk != null ? fmtInt(c.pk) : '0';
    if (recEl) recEl.textContent = c && c.recommendations != null ? fmtInt(c.recommendations) : '0';
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
    wireProfileStatusEdit();

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
        if (window.L2 && typeof L2.setToken === 'function') {
          L2.setToken(null);
        } else {
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
      if (window.L2 && typeof L2.renderCharacterFromCache === 'function') {
        L2.renderCharacterFromCache();
      }
      var c =
        window.L2 && typeof L2.resyncCharacterWhenRequired === 'function'
          ? await L2.resyncCharacterWhenRequired()
          : null;
      if (!c) {
        if (errEl) {
          errEl.hidden = false;
          errEl.textContent = 'Не вдалося завантажити персонажа.';
        }
        return;
      }
      if (typeof L2.applyMutationSnapshot === 'function') {
        L2.applyMutationSnapshot(c);
      }
      applyProfile(c);
      applyStats(c);
      applySocial(c);
      applyOnlineStatus(c);
      applyRegistered(c);
      if (c && window.L2CharHero && typeof L2CharHero.renderPortrait === 'function') {
        L2CharHero.renderPortrait(c);
      }
      if (contentEl) contentEl.classList.remove('l2-character-panel--loading');
    } catch (_e) {
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent = 'Не вдалося завантажити персонажа.';
      }
    }
  }

  init();
})();
