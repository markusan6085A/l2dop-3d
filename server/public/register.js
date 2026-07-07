/**
 * Реєстрація: пароль ×2, раса, клас — на сервер.
 */
(function () {
  function $(id) {
    return document.getElementById(id);
  }

  var raceEl = $('reg-race');
  var optMystic = $('opt-mystic');
  var dwarfNote = $('reg-dwarf-class-note');

  function syncDwarfMystic() {
    var r = raceEl.value;
    var mysticInput = optMystic.querySelector('input[value="mystic"]');
    if (r === 'Dwarf') {
      optMystic.hidden = true;
      optMystic.setAttribute('aria-hidden', 'true');
      mysticInput.disabled = true;
      mysticInput.checked = false;
      optMystic.parentElement.querySelector('input[value="fighter"]').checked = true;
      if (dwarfNote) dwarfNote.hidden = false;
    } else {
      optMystic.hidden = false;
      optMystic.removeAttribute('aria-hidden');
      mysticInput.disabled = false;
      if (dwarfNote) dwarfNote.hidden = true;
    }
  }

  raceEl.addEventListener('change', syncDwarfMystic);
  syncDwarfMystic();

  function showErr(t) {
    var el = $('reg-msg');
    if (!t) {
      el.hidden = true;
      el.textContent = '';
      return;
    }
    el.hidden = false;
    el.textContent = t;
  }

  $('btn-register').addEventListener('click', async function () {
    showErr('');
    var login = $('reg-login').value.trim();
    var password = $('reg-pass').value;
    var password2 = $('reg-pass2').value;
    var characterName = $('reg-hero').value.trim();
    var race = raceEl.value;
    var branch = document.querySelector('input[name="classBranch"]:checked');
    var classBranch = branch ? branch.value : 'fighter';
    var genderEl = document.querySelector('input[name="gender"]:checked');
    var gender = genderEl ? genderEl.value : 'male';

    if (password !== password2) {
      showErr('Паролі не збігаються.');
      return;
    }

    var r = await fetch('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        login: login,
        password: password,
        password2: password2,
        characterName: characterName,
        race: race,
        classBranch: classBranch,
        gender: gender,
      }),
    });
    var j = await r.json().catch(function () {
      return {};
    });
    if (!r.ok) {
      if (r.status === 409 && j.error === 'forbidden') {
        showErr('Логін або ім’я персонажа вже зайняті.');
        return;
      }
      showErr(
        j.messageUk ||
          (window.L2 && window.L2.apiErrorUk
            ? window.L2.apiErrorUk(j.error) + (r.status >= 500 ? ' (' + r.status + ')' : '')
            : 'Помилка: ' + (j.error || r.status))
      );
      return;
    }
    localStorage.setItem('token', j.token);
    window.location.href = '/char.html';
  });
})();
