/**
 * Головна: вхід. Після успіху — місто.
 */
(function () {
  function $(id) {
    return document.getElementById(id);
  }

  function showErr(t) {
    var el = $('login-msg');
    if (!el) return;
    if (!t) {
      el.hidden = true;
      el.textContent = '';
      return;
    }
    el.hidden = false;
    el.textContent = t;
  }

  $('btn-login').addEventListener('click', async function () {
    showErr('');
    var loginVal = $('in-login').value.trim();
    var password = $('in-pass').value;
    if (!loginVal || !password) {
      showErr(
        window.L2 && L2.tr ? L2.tr('login_fill') : 'Введіть логін і пароль.'
      );
      return;
    }
    var r = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login: loginVal, password: password }),
    });
    var j = await r.json().catch(function () {
      return {};
    });
    if (!r.ok) {
      showErr(
        window.L2 && window.L2.apiErrorUk
          ? window.L2.apiErrorUk(j.error) +
              (r.status >= 500 ? ' (' + r.status + ')' : '')
          : (window.L2 && L2.tr ? L2.tr('login_err_prefix') : 'Помилка: ') +
              (j.error || r.status)
      );
      return;
    }
    localStorage.setItem('token', j.token);
    window.location.href = '/city.html';
  });
})();
