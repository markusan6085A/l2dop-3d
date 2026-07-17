/**
 * «+N» непрочитані відповіді в чаті — під HUD-барами зліва (усі l2-app-l2-chrome).
 */
(function (global) {
  var pollTimer = null;
  var pollStarted = false;
  var mountRetryTimer = null;
  var refreshInFlight = false;
  var refreshQueued = false;
  var refreshDebounceTimer = null;
  var lastRefreshAt = 0;
  var POLL_MS = 15000;
  var MIN_REFRESH_GAP_MS = 2500;

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

  function findHudAnchor() {
    return (
      document.querySelector(
        '.l2-chrome-nav-column > .l2-hud-panel, .l2-townlive-column > .l2-hud-panel, .l2-screen-inner > .l2-hud-panel'
      ) || document.getElementById('l2-hud-panel-mount')
    );
  }

  function setCount(linkEl, count) {
    var link = linkEl || document.getElementById('l2-chat-reply-notify');
    if (!link) return;
    var n = Number(count);
    if (!Number.isFinite(n) || n <= 0) {
      link.hidden = true;
      link.textContent = '';
      return;
    }
    link.hidden = false;
    link.textContent = '+' + String(Math.min(99, Math.floor(n)));
  }

  function fetchUnreadCount(linkEl, opts) {
    opts = opts || {};
    var link = linkEl || document.getElementById('l2-chat-reply-notify');
    if (!link) return;

    if (document.body && document.body.classList.contains('l2-page-chat')) {
      setCount(link, 0);
      return;
    }

    if (document.hidden && !opts.force) {
      return;
    }

    var token = authToken();
    if (!token) {
      setCount(link, 0);
      return;
    }

    if (refreshInFlight) {
      refreshQueued = true;
      return;
    }

    var now = Date.now();
    if (
      !opts.force &&
      !opts.afterSnapshot &&
      now - lastRefreshAt < MIN_REFRESH_GAP_MS
    ) {
      if (!refreshDebounceTimer) {
        refreshDebounceTimer = setTimeout(function () {
          refreshDebounceTimer = null;
          fetchUnreadCount(link);
        }, MIN_REFRESH_GAP_MS - (now - lastRefreshAt));
      }
      return;
    }

    refreshInFlight = true;
    lastRefreshAt = now;

    fetch('/game/chat/replies/unread-count', {
      headers: { Authorization: 'Bearer ' + token },
    })
      .then(function (r) {
        if (r.status === 401) {
          setCount(link, 0);
          return null;
        }
        if (!r.ok) return null;
        return r.json();
      })
      .then(function (j) {
        if (!j) return;
        setCount(link, j.count);
      })
      .catch(function () {
        /* ignore */
      })
      .finally(function () {
        refreshInFlight = false;
        if (refreshQueued) {
          refreshQueued = false;
          fetchUnreadCount(link);
        }
      });
  }

  function applyFromSnapshot(snapshot) {
    if (document.body && document.body.classList.contains('l2-page-chat')) {
      setCount(null, 0);
      return;
    }
    if (
      snapshot &&
      snapshot.chatUnreadReplyCount != null &&
      Number.isFinite(Number(snapshot.chatUnreadReplyCount))
    ) {
      setCount(null, Number(snapshot.chatUnreadReplyCount));
      return;
    }
    fetchUnreadCount(null, { force: true, afterSnapshot: true });
  }

  function refreshCount(linkEl) {
    fetchUnreadCount(linkEl, { force: true });
  }

  function ensurePoll(linkEl) {
    if (pollStarted) return;
    pollStarted = true;
    pollTimer = setInterval(function () {
      if (document.hidden) return;
      fetchUnreadCount();
    }, POLL_MS);

    if (!global.__l2ChatReplyNotifyFocusBound) {
      global.__l2ChatReplyNotifyFocusBound = true;
      global.addEventListener('focus', function () {
        fetchUnreadCount(undefined, { force: true });
      });
      document.addEventListener('visibilitychange', function () {
        if (!document.hidden) fetchUnreadCount(undefined, { force: true });
      });
    }
  }

  function mount() {
    if (typeof document === 'undefined') return;
    if (!document.body || !document.body.classList.contains('l2-app-l2-chrome')) return;

    var hudAnchor = findHudAnchor();
    if (!hudAnchor) {
      if (!mountRetryTimer) {
        mountRetryTimer = setTimeout(function () {
          mountRetryTimer = null;
          mount();
        }, 120);
      }
      return;
    }

    var link = document.getElementById('l2-chat-reply-notify');
    if (!link) {
      link = document.createElement('a');
      link.className = 'l2-chat-reply-notify';
      link.id = 'l2-chat-reply-notify';
      link.href = '/chat.html';
      link.hidden = true;
      hudAnchor.insertAdjacentElement('afterend', link);
      fetchUnreadCount(link);
      ensurePoll(link);
    } else if (link.previousElementSibling !== hudAnchor) {
      hudAnchor.insertAdjacentElement('afterend', link);
    }
  }

  global.L2ChatReplyNotify = {
    mount: mount,
    refreshCount: refreshCount,
    applyFromSnapshot: applyFromSnapshot,
  };
})(window);
