/**
 * «+N» непрочитані відповіді в чаті — під HUD-барами зліва (усі l2-app-l2-chrome).
 */
(function (global) {
  var mounted = false;
  var pollTimer = null;
  var POLL_MS = 45000;

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

  function findMountAfterHud() {
    return document.getElementById('l2-hud-panel-mount');
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

  function refreshCount(linkEl) {
    var link = linkEl || document.getElementById('l2-chat-reply-notify');
    if (!link) return;

    if (document.body && document.body.classList.contains('l2-page-chat')) {
      setCount(link, 0);
      return;
    }

    var token = authToken();
    if (!token) {
      setCount(link, 0);
      return;
    }

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
      });
  }

  function mount() {
    if (typeof document === 'undefined' || mounted) return;
    if (!document.body || !document.body.classList.contains('l2-app-l2-chrome')) return;

    var hudMount = findMountAfterHud();
    if (!hudMount) return;

    var link = document.getElementById('l2-chat-reply-notify');
    if (!link) {
      link = document.createElement('a');
      link.className = 'l2-chat-reply-notify';
      link.id = 'l2-chat-reply-notify';
      link.href = '/chat.html';
      link.hidden = true;
      hudMount.insertAdjacentElement('afterend', link);
    }

    mounted = true;
    refreshCount(link);

    if (pollTimer) clearInterval(pollTimer);
    pollTimer = setInterval(function () {
      refreshCount();
    }, POLL_MS);
  }

  global.L2ChatReplyNotify = {
    mount: mount,
    refreshCount: refreshCount,
  };
})(window);
