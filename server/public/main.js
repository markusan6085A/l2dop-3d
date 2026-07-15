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

  function loadRememberedLogin() {
    var inp = $('in-login');
    if (!inp) return;
    var saved = localStorage.getItem('auth_saved_login');
    if (!saved) return;
    inp.value = saved;
    var rem = $('auth-remember');
    if (rem) rem.checked = true;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadRememberedLogin);
  } else {
    loadRememberedLogin();
  }

  var passToggle = $('btn-pass-toggle');
  var inpPass = $('in-pass');
  if (passToggle && inpPass) {
    passToggle.addEventListener('click', function () {
      inpPass.type = inpPass.type === 'password' ? 'text' : 'password';
    });
  }

  var forgot = $('auth-forgot-pass');
  if (forgot) {
    forgot.addEventListener('click', function (e) {
      e.preventDefault();
      showErr(
        window.L2 && L2.tr
          ? L2.tr('auth_forgot_stub')
          : 'Відновлення пароля ще не підключено — зверніться до адміністрації сервера.'
      );
    });
  }

  var btnLogin = $('btn-login');
  if (!btnLogin) return;

  ;['in-login', 'in-pass'].forEach(function (id) {
    var el = $(id);
    if (!el) return;
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        btnLogin.click();
      }
    });
  });

  btnLogin.addEventListener('click', async function () {
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
    var rem = $('auth-remember');
    if (rem && rem.checked) {
      localStorage.setItem('auth_saved_login', loginVal);
    } else {
      localStorage.removeItem('auth_saved_login');
    }
    if (window.L2 && typeof L2.clearSessionCharacterCache === 'function') {
      L2.clearSessionCharacterCache();
    }
    if (window.L2 && typeof L2.setToken === 'function') {
      L2.setToken(j.token);
    } else {
      localStorage.setItem('token', j.token);
    }
    window.location.href = '/city.html';
  });
})();
