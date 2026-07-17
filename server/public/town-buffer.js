(function () {
  var FREE_MAX_LEVEL = 40;
  var FEE_ADENA = 1;
  var applyInFlight = false;
  var restoreInFlight = false;
  var SKILLS = [
    1036, 1040, 1045, 1048, 1059, 1062, 1068, 1077, 1085, 1086, 1240,
  ];

  function $(id) {
    return document.getElementById(id);
  }

  function setMsg(text) {
    var el = $('town-buffer-msg');
    if (!el) return;
    el.textContent = text || '';
  }

  async function loadCharacter() {
    if (window.L2 && typeof L2.renderCharacterFromCache === 'function') {
      L2.renderCharacterFromCache();
    }
    if (window.L2 && typeof L2.resyncCharacterWhenRequired === 'function') {
      return L2.resyncCharacterWhenRequired();
    }
    return null;
  }

  function renderBuffRow() {
    var row = $('town-buffer-row');
    if (!row) return;
    row.innerHTML = '';
    for (var i = 0; i < SKILLS.length; i++) {
      var skillId = SKILLS[i];
      var cell = document.createElement('div');
      cell.className = 'l2-town-buffer-skill';

      var img = document.createElement('img');
      img.alt = 'Buff ' + skillId;
      img.src =
        window.L2 && typeof L2.resolveSkillIconUrl === 'function'
          ? L2.resolveSkillIconUrl(skillId, null)
          : '/game/skill-icon/' + skillId;
      img.addEventListener('error', function () {
        this.src = '/icons/drops/other.svg';
      });
      cell.appendChild(img);
      row.appendChild(cell);
    }
  }

  function renderFee(level) {
    var feeEl = $('town-buffer-fee');
    if (!feeEl) return;
    var fee = level <= FREE_MAX_LEVEL ? 0 : FEE_ADENA;
    if (fee === 0) {
      feeEl.textContent = 'Ціна: безкоштовно (до 40 рівня).';
    } else {
      feeEl.textContent = 'Ціна: ' + String(fee) + ' адени';
    }
  }

  async function applyTownBuffer() {
    if (applyInFlight) return;
    var t = localStorage.getItem('token');
    if (!t || !window.L2 || typeof L2.lastSnapshot !== 'function') return;
    var snap = L2.lastSnapshot();
    if (!snap || !snap.revision) return;
    applyInFlight = true;
    try {
      setMsg('Застосування бафів...');
      var r = await fetch('/character/town/buffer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + t,
        },
        body: JSON.stringify({ expectedRevision: snap.revision }),
      });
      if (r.status === 409) {
        if (window.L2 && typeof L2.resyncCharacterAfterConflict === 'function') {
          try {
            var conflictBody = {};
            try {
              conflictBody = await r.json();
            } catch (e409) {
              conflictBody = {};
            }
            await L2.resyncCharacterAfterConflict(function (fresh) {
              renderFee(Number(fresh.level || 1));
            }, conflictBody);
          } catch (eResync) {
            /* ignore */
          }
        }
        setMsg('Конфлікт ревізії: синхронізовано, натисни ще раз.');
        return;
      }
      var j = {};
      try {
        j = await r.json();
      } catch (eJson) {
        j = {};
      }
      if (!r.ok) {
        setMsg(
          j && j.messageUk
            ? j.messageUk
            : 'Не вдалося застосувати бафи.'
        );
        return;
      }
      if (j.character && window.L2 && typeof L2.applyMutationSnapshot === 'function') {
        L2.applyMutationSnapshot(j.character, function (fresh) {
          if (typeof L2.syncGameHelper === 'function') {
            L2.syncGameHelper(fresh);
          }
          renderFee(Number(fresh.level || 1));
        });
      }
      var fee = j && j.feeAdena != null ? String(j.feeAdena) : '0';
      if (fee === '0') {
        setMsg('Бафи накладено безкоштовно.');
      } else {
        setMsg('Бафи накладено. Списано ' + fee + ' адени.');
      }
    } finally {
      applyInFlight = false;
    }
  }

  async function applyTownRestore() {
    if (restoreInFlight) return;
    var t = localStorage.getItem('token');
    if (!t || !window.L2 || typeof L2.lastSnapshot !== 'function') return;
    var snap = L2.lastSnapshot();
    if (!snap || !snap.revision) return;
    restoreInFlight = true;
    try {
      setMsg('Відновлення HP, MP і CP...');
      var r = await fetch('/character/town/restore-vitals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + t,
        },
        body: JSON.stringify({ expectedRevision: snap.revision }),
      });
      if (r.status === 409) {
        if (window.L2 && typeof L2.resyncCharacterAfterConflict === 'function') {
          try {
            var conflictBody = {};
            try {
              conflictBody = await r.json();
            } catch (e409) {
              conflictBody = {};
            }
            await L2.resyncCharacterAfterConflict(function (fresh) {
              renderFee(Number(fresh.level || 1));
            }, conflictBody);
          } catch (eResync) {
            /* ignore */
          }
        }
        setMsg('Конфлікт ревізії: синхронізовано, натисни ще раз.');
        return;
      }
      var j = {};
      try {
        j = await r.json();
      } catch (eJson) {
        j = {};
      }
      if (!r.ok) {
        setMsg(
          j && j.messageUk
            ? j.messageUk
            : 'Не вдалося відновити HP, MP і CP.'
        );
        return;
      }
      if (j.character && window.L2 && typeof L2.applyMutationSnapshot === 'function') {
        L2.applyMutationSnapshot(j.character, function (fresh) {
          renderFee(Number(fresh.level || 1));
        });
      }
      var fee = j && j.feeAdena != null ? String(j.feeAdena) : '0';
      setMsg('HP, MP і CP відновлено.');
    } finally {
      restoreInFlight = false;
    }
  }

  async function init() {
    if (window.L2 && typeof L2.mountL2Nav === 'function') {
      L2.mountL2Nav({
        onStub: function () {},
      });
    }
    renderBuffRow();
    var errEl = $('town-buffer-load-err');
    var card = $('town-buffer-card');

    var t = localStorage.getItem('token');
    if (!t) {
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent = 'Потрібен вхід. Перейди на головну.';
      }
      return;
    }

    var c = await loadCharacter();
    if (!c) {
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent = 'Не вдалося завантажити персонажа.';
      }
      return;
    }
    if (window.L2 && typeof L2.applyMutationSnapshot === 'function') {
      L2.applyMutationSnapshot(c, function (fresh) {
        if (typeof L2.syncGameHelper === 'function') {
          L2.syncGameHelper(fresh);
        }
        renderFee(Number(fresh.level || 1));
      });
    } else {
      renderFee(Number(c.level || 1));
    }
    if (card) card.hidden = false;
    if (errEl) errEl.hidden = true;

    var btn = $('town-buffer-apply-btn');
    if (btn) {
      btn.addEventListener('click', function () {
        void applyTownBuffer();
      });
    }

    var restoreBtn = $('town-buffer-restore-btn');
    if (restoreBtn) {
      restoreBtn.addEventListener('click', function () {
        void applyTownRestore();
      });
    }
  }

  init();
})();
