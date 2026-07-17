/**
 * Ancient Trader — NPC міста (обмін Seal Stones → Ancient Adena).
 */
(function () {
  var TRADER_ICON = '/nps/38.png';
  var exchangeInFlight = false;

  var STONE_NAMES = {
    green: 'Green Seal Stone',
    blue: 'Blue Seal Stone',
    red: 'Red Seal Stone',
  };

  function notify(msg) {
    if (window.L2 && typeof L2.showToast === 'function') {
      L2.showToast(msg);
    } else {
      alert(msg);
    }
  }

  function clearRowError(block) {
    var err = block && block.querySelector('.l2-ancient-trader-exchange__err');
    if (!err) return;
    err.textContent = '';
    err.hidden = true;
  }

  function showRowError(block, msg) {
    var err = block && block.querySelector('.l2-ancient-trader-exchange__err');
    if (!err) return;
    err.textContent = msg;
    err.hidden = false;
  }

  function clearAllErrors() {
    document.querySelectorAll('.l2-ancient-trader-exchange').forEach(clearRowError);
  }

  function showExchangeSuccess(block, stone, qty) {
    var el = document.getElementById('ancient-trader-result');
    if (!el) return;
    var stoneName = STONE_NAMES[stone] || stone;
    var rate = Math.floor(Number(block.getAttribute('data-aa-rate')));
    if (!Number.isFinite(rate) || rate < 1) rate = 1;
    var aaQty = qty * rate;
    el.textContent =
      'Вітаю! Ви обміняли ' +
      stoneName +
      ' на Ancient Adena у кількості ' +
      aaQty +
      ' предметів.';
    el.hidden = false;
  }

  function initIcon() {
    var iconEl = document.getElementById('ancient-trader-icon');
    if (!iconEl) return;
    iconEl.src = TRADER_ICON;
    iconEl.onerror = function () {
      iconEl.src = '/icons/drops/other.svg';
    };
  }

  async function performExchange(block, stone, qty) {
    if (exchangeInFlight) return;
    var t = localStorage.getItem('token');
    if (!t || !window.L2 || typeof L2.lastSnapshot !== 'function') {
      notify('Увійди в гру.');
      return;
    }
    var snap = L2.lastSnapshot();
    if (!snap || snap.revision == null) {
      notify('Завантаж персонажа.');
      return;
    }

    exchangeInFlight = true;
    clearAllErrors();
    var btn = block.querySelector('.l2-ancient-trader-exchange__btn');
    if (btn) btn.disabled = true;

    try {
      var r = await fetch('/game/ancient-trader/exchange', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + t,
        },
        body: JSON.stringify({
          stone: stone,
          qty: qty,
          expectedRevision: snap.revision,
        }),
      });

      if (r.status === 409) {
        if (typeof L2.resyncCharacterAfterConflict === 'function') {
          await L2.resyncCharacterAfterConflict();
        }
        showRowError(block, 'Стан оновлено — спробуй ще раз.');
        return;
      }

      var j = {};
      try {
        j = await r.json();
      } catch (eJson) {
        j = {};
      }

      if (!r.ok) {
        var errMsg =
          j && j.messageUk
            ? j.messageUk
            : 'Не вдалося виконати обмін.';
        showRowError(block, errMsg);
        return;
      }

      if (j && j.character) {
        if (typeof L2.applyCharacterSnapshot === 'function') {
          L2.applyCharacterSnapshot(j.character);
        } else if (L2.setLastSnapshot) {
          L2.setLastSnapshot(j.character);
          if (typeof L2.applyHudFromSnapshot === 'function') {
            L2.applyHudFromSnapshot(j.character);
          }
        }
      }

      showExchangeSuccess(block, stone, qty);
    } catch (e) {
      showRowError(block, 'Помилка мережі.');
    } finally {
      exchangeInFlight = false;
      if (btn) btn.disabled = false;
    }
  }

  function wireExchangeButtons() {
    document.querySelectorAll('.l2-ancient-trader-exchange').forEach(function (block) {
      var btn = block.querySelector('.l2-ancient-trader-exchange__btn');
      var input = block.querySelector('.l2-ancient-trader-exchange__input');
      if (!btn || !input) return;

      var stone = block.getAttribute('data-stone');
      if (!stone) return;

      btn.addEventListener('click', function () {
        var qty = Math.floor(Number(input.value));
        if (!Number.isFinite(qty) || qty < 1) {
          notify('Введи кількість від 1.');
          input.value = '1';
          input.focus();
          return;
        }
        input.value = String(qty);
        performExchange(block, stone, qty);
      });

      input.addEventListener('input', function () {
        clearRowError(block);
      });
    });
  }

  async function init() {
    if (window.L2 && typeof L2.mountL2Nav === 'function') {
      L2.mountL2Nav({});
    }

    initIcon();
    wireExchangeButtons();

    var t = localStorage.getItem('token');
    if (!t || !window.L2) {
      if (window.L2 && typeof L2.clearHudPanel === 'function') L2.clearHudPanel();
      return;
    }

    fetch('/character', { headers: { Authorization: 'Bearer ' + t }, cache: 'no-store' })
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
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
