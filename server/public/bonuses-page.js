/**
 * Сторінка «Бонуси» — GET /character/bonuses.
 */
(function () {
  var SKELETON_PASSIVE_ROWS = 3;
  var SKELETON_ARMOR_ROWS = 2;
  var bonusesLoaded = false;
  var bonusesInFlight = false;
  var layoutDebug = false;

  function $(id) {
    return document.getElementById(id);
  }

  function isLayoutDebugEnabled() {
    try {
      return (
        /(?:^|[?&])layoutDebug=1(?:&|$)/.test(String(location.search || '')) ||
        localStorage.getItem('l2-layout-debug') === '1'
      );
    } catch (_e) {
      return false;
    }
  }

  function logLayoutPhase(phase) {
    if (!layoutDebug) return;
    var panel = $('bonuses-content');
    var hudMount = $('l2-hud-panel-mount');
    var navMount = $('l2-nav-bottom');
    console.log('[page-layout-phase]', {
      page: 'bonuses',
      phase: phase,
      scrollY: window.scrollY,
      panelHeight: panel ? panel.getBoundingClientRect().height : null,
      hudHeight: hudMount ? hudMount.getBoundingClientRect().height : null,
      navHeight: navMount ? navMount.getBoundingClientRect().height : null,
    });
  }

  function installLayoutShiftObserver() {
    if (!layoutDebug || typeof PerformanceObserver === 'undefined') return;
    try {
      new PerformanceObserver(function (list) {
        for (var i = 0; i < list.getEntries().length; i++) {
          var entry = list.getEntries()[i];
          if (!entry.hadRecentInput && entry.value > 0) {
            console.log('[layout-shift]', {
              page: 'bonuses',
              value: entry.value,
              sources: entry.sources
                ? entry.sources.map(function (s) {
                    return {
                      node: s.node,
                      previousRect: s.previousRect,
                      currentRect: s.currentRect,
                    };
                  })
                : [],
            });
          }
        }
      }).observe({ type: 'layout-shift', buffered: true });
    } catch (_e) {
      /* ignore */
    }
  }

  function replaceContainer(container, frag) {
    if (!container) return;
    container.innerHTML = '';
    container.appendChild(frag);
  }

  function createSkeletonRow() {
    var p = document.createElement('p');
    p.className = 'l2-bonuses-row l2-bonuses-row--skeleton';
    p.setAttribute('aria-hidden', 'true');

    var label = document.createElement('span');
    label.className = 'l2-bonuses-row__label';
    label.textContent = '…:';

    var val = document.createElement('span');
    val.className = 'l2-bonuses-row__val';
    val.textContent = '…';

    p.appendChild(label);
    p.appendChild(document.createTextNode(' '));
    p.appendChild(val);
    return p;
  }

  function renderRowsSkeleton(container, count) {
    if (!container) return;
    var frag = document.createDocumentFragment();
    for (var i = 0; i < count; i++) {
      frag.appendChild(createSkeletonRow());
    }
    replaceContainer(container, frag);
  }

  function renderContainerError(container, message) {
    if (!container) return;
    var err = document.createElement('p');
    err.className = 'l2-bonuses-rows__error';
    err.textContent = message || 'Не вдалося завантажити.';
    var frag = document.createDocumentFragment();
    frag.appendChild(err);
    replaceContainer(container, frag);
  }

  function buildRowsFragment(rows) {
    var frag = document.createDocumentFragment();
    if (!rows || !rows.length) return frag;
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      var p = document.createElement('p');
      p.className = 'l2-bonuses-row';
      var label = document.createElement('span');
      label.className = 'l2-bonuses-row__label';
      label.textContent = String(row.labelUk || '—') + ':';
      var val = document.createElement('span');
      val.className = 'l2-bonuses-row__val';
      val.textContent = String(row.valueUk || '—');
      p.appendChild(label);
      p.appendChild(document.createTextNode(' '));
      p.appendChild(val);
      frag.appendChild(p);
    }
    return frag;
  }

  function buildLinesFragment(lines, lineClass) {
    var frag = document.createDocumentFragment();
    if (!lines || !lines.length) return frag;
    for (var i = 0; i < lines.length; i++) {
      var p = document.createElement('p');
      p.className = lineClass;
      p.textContent = String(lines[i] || '');
      frag.appendChild(p);
    }
    return frag;
  }

  function renderRows(container, rows) {
    if (!container) return;
    replaceContainer(container, buildRowsFragment(rows));
  }

  function renderLines(container, lines) {
    if (!container) return;
    if (!lines || !lines.length) {
      container.hidden = true;
      container.innerHTML = '';
      return;
    }
    container.hidden = false;
    replaceContainer(container, buildLinesFragment(lines, 'l2-bonuses-clan__line'));
  }

  function renderArmorSet(container, setLines) {
    if (!container) return;
    if (!setLines || !setLines.length) {
      container.hidden = true;
      container.innerHTML = '';
      return;
    }
    container.hidden = false;
    replaceContainer(container, buildLinesFragment(setLines, 'l2-bonuses-set__line'));
  }

  function showMetaSkeleton() {
    var raceVal = $('bonuses-race-val');
    var profVal = $('bonuses-profession-val');
    var soulEl = $('bonuses-soulshot');
    var introEl = $('bonuses-skills-intro');
    if (raceVal) {
      raceVal.textContent = '…';
      raceVal.classList.add('l2-bonuses-meta__val--skeleton');
    }
    if (profVal) {
      profVal.textContent = '…';
      profVal.classList.add('l2-bonuses-meta__val--skeleton');
    }
    if (soulEl) {
      soulEl.textContent = '…';
      soulEl.classList.add('l2-bonuses-line__val--skeleton');
    }
    if (introEl) {
      introEl.textContent = '…';
      introEl.classList.add('l2-bonuses-intro--skeleton');
    }
  }

  function clearMetaSkeleton() {
    var raceVal = $('bonuses-race-val');
    var profVal = $('bonuses-profession-val');
    var soulEl = $('bonuses-soulshot');
    var introEl = $('bonuses-skills-intro');
    if (raceVal) raceVal.classList.remove('l2-bonuses-meta__val--skeleton');
    if (profVal) profVal.classList.remove('l2-bonuses-meta__val--skeleton');
    if (soulEl) soulEl.classList.remove('l2-bonuses-line__val--skeleton');
    if (introEl) introEl.classList.remove('l2-bonuses-intro--skeleton');
  }

  function showInitialSkeletons() {
    showMetaSkeleton();
    renderRowsSkeleton($('bonuses-passive-skills'), SKELETON_PASSIVE_ROWS);
    renderRowsSkeleton($('bonuses-armor'), SKELETON_ARMOR_ROWS);
  }

  function applyBonusesMeta(b) {
    clearMetaSkeleton();

    var raceVal = $('bonuses-race-val');
    if (raceVal) raceVal.textContent = String(b.raceBranchLabelUk || '—');

    var profVal = $('bonuses-profession-val');
    if (profVal) profVal.textContent = String(b.professionLabelUk || '—');

    var soulEl = $('bonuses-soulshot');
    if (soulEl) soulEl.textContent = String(b.soulshotSpiritshotLineUk || '—');

    renderLines($('bonuses-clan'), b.clanBonusLinesUk || []);

    var skillsTitle = $('bonuses-skills-title');
    if (skillsTitle && b.passiveSkillsTitleUk) {
      skillsTitle.textContent = String(b.passiveSkillsTitleUk);
    }

    var introEl = $('bonuses-skills-intro');
    if (introEl) introEl.textContent = String(b.passiveSkillsIntroUk || '');
  }

  function applyBonusesLists(b) {
    renderRows($('bonuses-passive-skills'), b.passiveWeaponRows || []);

    var armorTitle = $('bonuses-armor-title');
    if (armorTitle && b.armorBonusesTitleUk) {
      armorTitle.textContent = String(b.armorBonusesTitleUk);
    }

    renderRows($('bonuses-armor'), b.armorBonusRows || []);
    renderArmorSet($('bonuses-armor-set'), b.armorSetLinesUk || []);
  }

  function applyBonuses(b) {
    if (!b) return;
    applyBonusesMeta(b);
    applyBonusesLists(b);
    bonusesLoaded = true;
  }

  async function loadBonuses(opts) {
    opts = opts || {};
    if (bonusesInFlight) return false;
    bonusesInFlight = true;

    var token = localStorage.getItem('token');
    var errEl = $('bonuses-load-err');
    if (!token) {
      window.location.href = '/';
      bonusesInFlight = false;
      return false;
    }

    if (errEl) {
      errEl.hidden = true;
      errEl.textContent = '';
    }

    if (!bonusesLoaded && opts.showSkeleton !== false) {
      showInitialSkeletons();
      logLayoutPhase('skeleton-rendered');
    }

    logLayoutPhase('fetch-start');

    try {
      var r = await fetch('/character/bonuses', {
        headers: { Authorization: 'Bearer ' + token },
        cache: 'no-store',
      });
      if (r.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/';
        return false;
      }
      if (!r.ok) {
        if (errEl) {
          errEl.hidden = false;
          errEl.textContent = 'Не вдалося завантажити бонуси.';
        }
        if (!bonusesLoaded) {
          renderContainerError(
            $('bonuses-passive-skills'),
            'Не вдалося завантажити пасивні умения.'
          );
          renderContainerError($('bonuses-armor'), 'Не вдалося завантажити бонуси від броні.');
        }
        return false;
      }

      var j = await r.json();
      if (!j || !j.bonuses) {
        if (errEl) {
          errEl.hidden = false;
          errEl.textContent = 'Не вдалося завантажити бонуси.';
        }
        if (!bonusesLoaded) {
          renderContainerError(
            $('bonuses-passive-skills'),
            'Не вдалося завантажити пасивні умения.'
          );
          renderContainerError($('bonuses-armor'), 'Не вдалося завантажити бонуси від броні.');
        }
        return false;
      }

      applyBonuses(j.bonuses);
      logLayoutPhase('fetch-finished');
      return true;
    } catch (_e) {
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent = 'Не вдалося завантажити бонуси.';
      }
      if (!bonusesLoaded) {
        renderContainerError(
          $('bonuses-passive-skills'),
          'Не вдалося завантажити пасивні умения.'
        );
        renderContainerError($('bonuses-armor'), 'Не вдалося завантажити бонуси від броні.');
      }
      return false;
    } finally {
      bonusesInFlight = false;
      logLayoutPhase('content-ready');
    }
  }

  async function init() {
    layoutDebug = isLayoutDebugEnabled();
    installLayoutShiftObserver();
    logLayoutPhase('html-ready');

    if (window.L2 && typeof L2.mountL2Nav === 'function') {
      L2.mountL2Nav({});
    }
    logLayoutPhase('chrome-mounted');

    var token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/';
      return;
    }

    if (window.L2 && typeof L2.renderCharacterFromCache === 'function') {
      L2.renderCharacterFromCache();
    }
    logLayoutPhase('cache-rendered');

    if (window.L2 && typeof L2.resyncCharacterWhenRequired === 'function') {
      void L2.resyncCharacterWhenRequired()
        .then(function (snap) {
          if (snap && typeof L2.applyMutationSnapshot === 'function') {
            L2.applyMutationSnapshot(snap);
          }
        })
        .catch(function () {
          /* resync optional for bonuses reveal */
        });
    }

    await loadBonuses({ showSkeleton: true });
  }

  init();
})();
