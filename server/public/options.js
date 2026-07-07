/**
 * Сторінка опцій — меню, вихід (лише українська мова інтерфейсу).
 */
(function () {
  function $(id) {
    return document.getElementById(id);
  }

  function stubTail() {
    return 'заглушка, з’явиться пізніше.';
  }

  function stubMsg(label) {
    return '«' + label + '» — ' + stubTail();
  }

  function init() {
    if (window.L2 && typeof L2.setUiLang === 'function') {
      L2.setUiLang('uk');
    }

    var title = $('opt-page-title');
    if (title) title.textContent = 'Опції';

    if (window.L2 && typeof L2.mountL2Nav === 'function') {
      L2.mountL2Nav({
        onStub: function (label) {
          var el = $('options-stub-msg');
          if (el) {
            el.hidden = false;
            el.textContent = stubMsg(label);
          }
        },
      });
    }
    if (window.L2 && typeof L2.mountFootLinkBar === 'function') {
      L2.mountFootLinkBar('l2-foot-links', { inset: true });
    }
    var wTop = $('wap-top');
    var wBot = $('wap-bottom');
    if (wTop) wTop.hidden = false;
    if (wBot) wBot.hidden = false;

    var foot = $('l2-foot-links');
    if (foot) {
      foot.querySelectorAll('[data-stub]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var label = btn.getAttribute('data-stub');
          if (!label) return;
          var msg = $('options-stub-msg');
          if (msg) {
            msg.hidden = false;
            msg.textContent = stubMsg(label);
          }
        });
      });
    }

    var btn = $('opt-logout');
    if (btn) {
      btn.addEventListener('click', function () {
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

    document.querySelectorAll('.l2-opt-menu [data-stub]').forEach(function (el) {
      el.addEventListener('click', function () {
        var label = el.getAttribute('data-stub');
        if (!label) return;
        var msg = $('options-stub-msg');
        if (msg) {
          msg.hidden = false;
          msg.textContent = stubMsg(label);
        }
      });
    });

    (function hydrateHud() {
      var t = localStorage.getItem('token');
      if (!t || !window.L2) {
        if (window.L2 && typeof L2.clearHudPanel === 'function') L2.clearHudPanel();
        return;
      }
      fetch('/character', { headers: { Authorization: 'Bearer ' + t } })
        .then(function (r) {
          if (r.status === 401) return null;
          return r.json();
        })
        .then(function (j) {
          if (!j || !j.character) return;
          if (L2.setLastSnapshot) L2.setLastSnapshot(j.character);
          if (typeof L2.applyHudFromSnapshot === 'function') {
            L2.applyHudFromSnapshot(j.character);
          }
        })
        .catch(function () {});
    })();
  }

  init();
})();
