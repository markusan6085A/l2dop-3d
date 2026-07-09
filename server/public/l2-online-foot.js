/**
 * Кнопка «Онлайн: N» під головною рамкою — одна точка для всіх l2-app-l2-chrome сторінок.
 * Підключається автоматично з common.js (bootstrapOnlineFoot).
 */
(function (global) {
  var mounted = false;
  var refreshInFlight = false;
  var lastRefreshAt = 0;
  var MIN_REFRESH_GAP_MS = 10000;

  function authToken() {
    if (global.L2 && typeof global.L2.token === 'function') {
      return global.L2.token();
    }
    try {
      return localStorage.getItem('token');
    } catch (_e) {
      return null;
    }
  }

  function findShellAndScreen() {
    var shell = document.querySelector('.l2-shell');
    if (!shell) return null;
    var screen = shell.querySelector('.l2-screen.l2-outer-sframe-host');
    if (!screen) return null;
    return { shell: shell, screen: screen };
  }

  function refreshCount(linkEl) {
    var link = linkEl || document.getElementById('l2-online-link');
    if (!link) return;

    var token = authToken();
    if (!token) {
      link.textContent = 'Онлайн: —';
      return;
    }

    if (refreshInFlight) return;
    var now = Date.now();
    if (now - lastRefreshAt < MIN_REFRESH_GAP_MS) return;

    refreshInFlight = true;
    lastRefreshAt = now;

    fetch('/game/online', {
      headers: { Authorization: 'Bearer ' + token },
    })
      .then(function (r) {
        if (r.status === 401) {
          link.textContent = 'Онлайн: —';
          return null;
        }
        if (!r.ok) return null;
        return r.json();
      })
      .then(function (j) {
        if (!j) return;
        var n = j.count != null ? Number(j.count) : 0;
        link.textContent =
          'Онлайн: ' + (Number.isFinite(n) ? String(Math.max(0, Math.floor(n))) : '—');
      })
      .catch(function () {
        /* ignore */
      })
      .finally(function () {
        refreshInFlight = false;
      });
  }

  function mount() {
    if (typeof document === 'undefined' || mounted) return;
    if (!document.body || !document.body.classList.contains('l2-app-l2-chrome')) return;
    if (document.body.classList.contains('l2-page-online')) return;

    var nodes = findShellAndScreen();
    if (!nodes) return;
    if (document.getElementById('l2-online-foot')) {
      mounted = true;
      refreshCount();
      return;
    }

    var foot = document.createElement('div');
    foot.className = 'l2-online-foot';
    foot.id = 'l2-online-foot';

    var link = document.createElement('a');
    link.className = 'l2-online-foot__link';
    link.id = 'l2-online-link';
    link.href = '/online.html';
    link.textContent = 'Онлайн: —';

    foot.appendChild(link);
    if (nodes.screen.nextSibling) {
      nodes.shell.insertBefore(foot, nodes.screen.nextSibling);
    } else {
      nodes.shell.appendChild(foot);
    }

    mounted = true;
    refreshCount(link);
  }

  global.L2OnlineFoot = {
    mount: mount,
    refreshCount: refreshCount,
  };
})(window);
