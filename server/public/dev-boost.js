/**
 * Тимчасова сторінка: POST /character/dev-self-boost (L2DOP_DEV_SELF_BOOST=1).
 */
(function () {
  function $(id) {
    return document.getElementById(id);
  }

  function showMsg(text, isErr) {
    var el = $('l2-dev-boost-msg');
    if (!el) return;
    el.hidden = !text;
    el.textContent = text || '';
    el.style.color = isErr ? '#f87171' : 'var(--gold, #e8c038)';
  }

  function fmtCurrent(ch) {
    if (!ch) return '';
    return (
      'Зараз: ' +
      ch.name +
      ' · Lv ' +
      ch.level +
      ' · адена ' +
      ch.adena +
      ' · SP ' +
      ch.sp +
      ' · rev ' +
      ch.revision
    );
  }

  function loadCharacter() {
    var t = localStorage.getItem('token');
    var cur = $('l2-dev-boost-current');
    if (!t || !window.fetch) {
      if (cur) cur.textContent = 'Увійди в гру.';
      return Promise.resolve(null);
    }
    return fetch('/character', { headers: { Authorization: 'Bearer ' + t } })
      .then(function (r) {
        if (r.status === 401) {
          if (cur) cur.textContent = 'Потрібен вхід.';
          return null;
        }
        return r.json();
      })
      .then(function (j) {
        if (!j || !j.character) {
          if (cur) cur.textContent = 'Немає персонажа.';
          return null;
        }
        var ch = j.character;
        if (window.L2 && L2.setLastSnapshot) L2.setLastSnapshot(ch);
        if (typeof L2.applyHudFromSnapshot === 'function') L2.applyHudFromSnapshot(ch);
        if (cur) cur.textContent = fmtCurrent(ch);
        return ch;
      })
      .catch(function () {
        if (cur) cur.textContent = 'Не вдалося завантажити дані.';
        return null;
      });
  }

  function parseBody(ch) {
    var lvlEl = $('l2-dev-boost-lvl');
    var adEl = $('l2-dev-boost-adena');
    var spEl = $('l2-dev-boost-sp');
    var body = { expectedRevision: ch.revision };
    if (lvlEl && lvlEl.value !== '' && lvlEl.value != null) {
      body.level = parseInt(lvlEl.value, 10);
    }
    if (adEl && adEl.value.trim() !== '') {
      body.adena = adEl.value.trim().replace(/\s/g, '');
    }
    if (spEl && spEl.value !== '' && spEl.value != null) {
      body.sp = parseInt(spEl.value, 10);
    }
    return body;
  }

  function init() {
    if (window.L2 && typeof L2.mountL2Nav === 'function') {
      L2.mountL2Nav({
        onStub: function () {},
      });
    }

    loadCharacter();

    var form = $('l2-dev-boost-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      showMsg('', false);
      var t = localStorage.getItem('token');
      if (!t) {
        showMsg('Потрібен вхід.', true);
        return;
      }

      var snap = window.L2 && typeof L2.lastSnapshot === 'function' ? L2.lastSnapshot() : null;
      if (!snap || typeof snap.revision !== 'number') {
        showMsg('Спочатку онови дані персонажа (перезавантаж сторінку).', true);
        loadCharacter();
        return;
      }

      var body = parseBody(snap);
      var hasExtra =
        body.level !== undefined || body.adena !== undefined || body.sp !== undefined;
      if (!hasExtra) {
        showMsg('Заповни хоча б одне поле.', true);
        return;
      }

      var btn = $('l2-dev-boost-submit');
      if (btn) btn.disabled = true;

      fetch('/character/dev-self-boost', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + t,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
        .then(function (r) {
          return r.json().then(function (j) {
            return { ok: r.ok, status: r.status, j: j };
          });
        })
        .then(function (x) {
          if (x.ok && x.j && x.j.character) {
            if (L2.setLastSnapshot) L2.setLastSnapshot(x.j.character);
            if (typeof L2.applyHudFromSnapshot === 'function') {
              L2.applyHudFromSnapshot(x.j.character);
            }
            var cur = $('l2-dev-boost-current');
            if (cur) cur.textContent = fmtCurrent(x.j.character);
            showMsg('Застосовано.', false);
            form.reset();
            return;
          }
          var uk =
            x.j && x.j.messageUk ? x.j.messageUk : 'Помилка ' + (x.status || '') + '.';
          showMsg(uk, true);
          if (x.status === 409) loadCharacter();
        })
        .catch(function () {
          showMsg('Мережа або сервер недоступні.', true);
        })
        .finally(function () {
          if (btn) btn.disabled = false;
        });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
