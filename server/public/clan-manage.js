/**
 * Керування кланом — лише для лідера.
 */
(function () {
  var layoutDebug = false;

  function $(id) {
    return document.getElementById(id);
  }

  function tr(key, fallback) {
    return window.L2 && typeof L2.tr === 'function' ? L2.tr(key) : fallback;
  }

  function stubTail() {
    return tr('stub_later', 'заглушка, з’явиться пізніше.');
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
    var panel = $('clan-manage-panel');
    var hudMount = $('l2-hud-panel-mount');
    console.log('[page-layout-phase]', {
      page: 'clan-manage',
      phase: phase,
      scrollY: window.scrollY,
      panelHeight: panel ? panel.getBoundingClientRect().height : null,
      hudHeight: hudMount ? hudMount.getBoundingClientRect().height : null,
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
              page: 'clan-manage',
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

  function showErr(msg) {
    var el = $('clan-manage-err');
    if (!el) return;
    el.hidden = false;
    el.textContent = msg;
  }

  function showStub(label) {
    var el = $('clan-manage-stub-msg');
    if (!el) return;
    el.hidden = false;
    el.textContent = '«' + label + '» — ' + stubTail();
  }

  function revealClanManagePanel() {
    var panel = $('clan-manage-panel');
    if (panel) panel.classList.remove('l2-clan-manage-panel--loading');
  }

  async function loadClanMy(token) {
    var r = await fetch('/game/clans/my', {
      headers: { Authorization: 'Bearer ' + token },
    });
    if (!r.ok) throw new Error('clan_my_fail');
    var data = await r.json().catch(function () {
      return {};
    });
    return data.clan || null;
  }

  function bindStubLinks() {
    var panel = $('clan-manage-panel');
    if (!panel) return;
    panel.querySelectorAll('[data-stub]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.getAttribute('data-stub') || '';
        var labelEl = btn.querySelector('[data-i18n]') || btn;
        var label = labelEl.textContent ? labelEl.textContent.trim() : key;
        if (key && window.L2 && typeof L2.tr === 'function') {
          var translated = L2.tr(key);
          if (translated && translated !== key) label = translated;
        }
        showStub(label);
      });
    });
  }

  async function init() {
    layoutDebug = isLayoutDebugEnabled();
    installLayoutShiftObserver();
    logLayoutPhase('html-ready');

    if (window.L2 && typeof L2.mountL2Nav === 'function') {
      L2.mountL2Nav({});
    }
    if (window.L2 && typeof L2.mountFootLinkBar === 'function') {
      L2.mountFootLinkBar('l2-foot-links', { inset: true });
    }
    if (window.L2 && typeof L2.applyPageI18n === 'function') {
      L2.applyPageI18n(document);
    }
    logLayoutPhase('chrome-mounted');

    bindStubLinks();

    var t = localStorage.getItem('token');
    if (!t || !window.L2) {
      if (window.L2 && typeof L2.clearHudPanel === 'function') L2.clearHudPanel();
      showErr('Потрібен вхід.');
      return;
    }

    if (typeof L2.renderCharacterFromCache === 'function') {
      L2.renderCharacterFromCache();
    }
    logLayoutPhase('cache-rendered');

    if (typeof L2.resyncCharacterWhenRequired === 'function') {
      void L2.resyncCharacterWhenRequired()
        .then(function (snap) {
          if (snap && typeof L2.applyMutationSnapshot === 'function') {
            L2.applyMutationSnapshot(snap);
          }
        })
        .catch(function () {
          /* resync optional for clan-manage reveal */
        });
    }

    logLayoutPhase('fetch-start');
    try {
      var clan = await loadClanMy(t);
      if (!clan || !clan.canEditAnnouncement) {
        window.location.replace('/clan-my.html');
        return;
      }
      var nameEl = $('clan-manage-name');
      if (nameEl) nameEl.textContent = clan.name || '—';
      revealClanManagePanel();
      logLayoutPhase('fetch-finished');
    } catch (_e) {
      showErr('Не вдалося завантажити клан.');
    }
    logLayoutPhase('content-ready');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
