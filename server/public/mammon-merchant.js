/**
 * Торговець Маммона — сторінка NPC з серверною ротацією по некрополях.
 */
(function () {
  var timerId = null;

  function $(id) {
    return document.getElementById(id);
  }

  function formatCountdown(msLeft) {
    if (!Number.isFinite(msLeft) || msLeft < 0) msLeft = 0;
    var totalSec = Math.floor(msLeft / 1000);
    var h = Math.floor(totalSec / 3600);
    var m = Math.floor((totalSec % 3600) / 60);
    var s = totalSec % 60;
    function pad(n) {
      return n < 10 ? '0' + n : String(n);
    }
    return pad(h) + ':' + pad(m) + ':' + pad(s);
  }

  function applyMerchantState(st) {
    if (!st) return;
    var iconEl = $('mammon-merchant-icon');
    var titleEl = $('mammon-merchant-title');
    var subEl = $('mammon-merchant-sub');
    var locEl = $('mammon-merchant-location');
    var nextEl = $('mammon-merchant-next');
    var timerEl = $('mammon-merchant-timer');

    if (iconEl) {
      iconEl.src = st.iconUrl || '/icons/drops/other.svg';
      iconEl.onerror = function () {
        iconEl.src = '/icons/drops/other.svg';
      };
    }
    if (titleEl) titleEl.textContent = st.nameEn || 'Merchant of Mammon';
    if (subEl) subEl.textContent = st.nameUk || 'Торговець Маммона';
    if (locEl) {
      var cur = st.current || {};
      locEl.textContent =
        (cur.labelUk || cur.labelEn || '—') +
        (cur.labelEn && cur.labelUk ? ' (' + cur.labelEn + ')' : '');
    }
    if (nextEl && st.next) {
      nextEl.textContent =
        (st.next.labelUk || st.next.labelEn || '—') +
        (st.next.labelEn && st.next.labelUk ? ' (' + st.next.labelEn + ')' : '');
    }

    function tick() {
      if (!timerEl) return;
      var left = st.rotatesAtMs != null ? st.rotatesAtMs - Date.now() : 0;
      if (left <= 0) {
        timerEl.textContent = 'Переїзд… оновлюємо.';
        return;
      }
      timerEl.textContent = 'Переїде через ' + formatCountdown(left);
    }

    if (timerId) clearInterval(timerId);
    tick();
    timerId = setInterval(tick, 1000);
  }

  async function loadMerchantState() {
    var t = localStorage.getItem('token');
    if (!t) return null;
    var r = await fetch('/game/mammon/merchant', {
      headers: { Authorization: 'Bearer ' + t },
      cache: 'no-store',
    });
    if (r.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
      return null;
    }
    if (!r.ok) return null;
    var j = await r.json();
    return j && j.mammonMerchant ? j.mammonMerchant : null;
  }

  async function init() {
    if (window.L2 && typeof L2.mountL2Nav === 'function') {
      L2.mountL2Nav({});
    }

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

    var st = await loadMerchantState();
    if (st) {
      applyMerchantState(st);
    } else {
      var locEl = $('mammon-merchant-location');
      if (locEl) locEl.textContent = 'Не вдалося завантажити локацію.';
    }

    setInterval(async function () {
      var fresh = await loadMerchantState();
      if (fresh) applyMerchantState(fresh);
    }, 60000);
  }

  window.addEventListener('beforeunload', function () {
    if (timerId) clearInterval(timerId);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
