/**
 * Сторінка опцій — меню, вихід, вибір мови інтерфейсу (uk | ru).
 */
(function () {
  function $(id) {
    return document.getElementById(id);
  }

  function stubTail() {
    if (window.L2 && typeof L2.t === 'function') {
      return L2.t('заглушка, з’явиться пізніше.', 'заглушка, скоро будет.');
    }
    return 'заглушка, з’явиться пізніше.';
  }

  function stubMsg(label) {
    return '«' + label + '» — ' + stubTail();
  }

  function refreshLangSection() {
    if (!window.L2) return;
    var title = $('opt-page-title');
    if (title) title.textContent = L2.t('Опції', 'Опции');
    var head = $('opt-lang-heading');
    if (head) head.textContent = L2.t('Мова інтерфейсу', 'Язык интерфейса');
    var hint = $('opt-lang-hint');
    if (hint) {
      hint.textContent = L2.t(
        'Українська або російська підписи в інтерфейсі. Після зміни оновіть відкриті сторінки (F5), щоб заголовки й підказки підхопились.',
        'Украинский или русский язык подписей. После смены обновите открытые страницы (F5).'
      );
    }
    var lang = L2.getUiLang();
    var uk = $('opt-lang-uk');
    var ru = $('opt-lang-ru');
    if (uk) uk.classList.toggle('l2-opt-lang--active', lang === 'uk');
    if (ru) ru.classList.toggle('l2-opt-lang--active', lang === 'ru');
  }

  function wireLangButtons() {
    var uk = $('opt-lang-uk');
    var ru = $('opt-lang-ru');
    if (uk && window.L2) {
      uk.addEventListener('click', function () {
        L2.setUiLang('uk');
        refreshLangSection();
      });
    }
    if (ru && window.L2) {
      ru.addEventListener('click', function () {
        L2.setUiLang('ru');
        refreshLangSection();
      });
    }
  }

  function logout() {
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
  }

  function init() {
    refreshLangSection();
    wireLangButtons();

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
        logout();
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
