/**
 * Сторінка «Бонуси» — GET /character/bonuses.
 */
(function () {
  function $(id) {
    return document.getElementById(id);
  }

  function renderRows(container, rows) {
    if (!container) return;
    container.innerHTML = '';
    if (!rows || !rows.length) return;
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      var p = document.createElement('p');
      p.className = 'l2-bonuses-row';
      var label = document.createElement('span');
      label.className = 'l2-bonuses-row__label';
      label.textContent = String(row.labelUk || '—') + ':';
      var val = document.createElement('span');
      val.className = 'l2-bonuses-row__val';
      val.textContent = String(row.valueUk || '—');
      p.appendChild(label);
      p.appendChild(document.createTextNode(' '));
      p.appendChild(val);
      container.appendChild(p);
    }
  }

  function renderLines(container, lines) {
    if (!container) return;
    container.innerHTML = '';
    if (!lines || !lines.length) {
      container.hidden = true;
      return;
    }
    container.hidden = false;
    for (var i = 0; i < lines.length; i++) {
      var p = document.createElement('p');
      p.className = 'l2-bonuses-clan__line';
      p.textContent = String(lines[i] || '');
      container.appendChild(p);
    }
  }

  function applyBonuses(b) {
    if (!b) return;

    var raceVal = $('bonuses-race-val');
    if (raceVal) raceVal.textContent = String(b.raceBranchLabelUk || '—');

    var profVal = $('bonuses-profession-val');
    if (profVal) profVal.textContent = String(b.professionLabelUk || '—');

    var soulEl = $('bonuses-soulshot');
    if (soulEl) {
      soulEl.textContent = String(b.soulshotSpiritshotLineUk || '—');
    }

    renderLines($('bonuses-clan'), b.clanBonusLinesUk || []);

    var skillsTitle = $('bonuses-skills-title');
    if (skillsTitle && b.passiveSkillsTitleUk) {
      skillsTitle.textContent = String(b.passiveSkillsTitleUk);
    }

    var introEl = $('bonuses-skills-intro');
    if (introEl) {
      introEl.textContent = String(b.passiveSkillsIntroUk || '');
    }

    renderRows($('bonuses-passive-skills'), b.passiveWeaponRows || []);

    var armorTitle = $('bonuses-armor-title');
    if (armorTitle && b.armorBonusesTitleUk) {
      armorTitle.textContent = String(b.armorBonusesTitleUk);
    }

    renderRows($('bonuses-armor'), b.armorBonusRows || []);

    var setEl = $('bonuses-armor-set');
    if (setEl) {
      var setLines = b.armorSetLinesUk || [];
      if (!setLines.length) {
        setEl.hidden = true;
        setEl.innerHTML = '';
      } else {
        setEl.hidden = false;
        setEl.innerHTML = setLines
          .map(function (line) {
            return '<p class="l2-bonuses-set__line">' + String(line) + '</p>';
          })
          .join('');
      }
    }
  }

  async function init() {
    if (window.L2 && typeof L2.mountL2Nav === 'function') {
      L2.mountL2Nav({});
    }

    var token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/';
      return;
    }

    var errEl = $('bonuses-load-err');
    var loadingEl = $('bonuses-loading');
    var contentEl = $('bonuses-content');

    try {
      if (window.L2 && typeof L2.renderCharacterFromCache === 'function') {
        L2.renderCharacterFromCache();
      }
      if (window.L2 && typeof L2.resyncCharacterWhenRequired === 'function') {
        var snap = await L2.resyncCharacterWhenRequired();
        if (snap && typeof L2.applyMutationSnapshot === 'function') {
          L2.applyMutationSnapshot(snap);
        }
      }

      var r = await fetch('/character/bonuses', {
        headers: { Authorization: 'Bearer ' + token },
        cache: 'no-store',
      });
      if (r.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/';
        return;
      }
      if (!r.ok) {
        if (errEl) {
          errEl.hidden = false;
          errEl.textContent = 'Не вдалося завантажити бонуси.';
        }
        if (loadingEl) loadingEl.hidden = true;
        return;
      }

      var j = await r.json();
      if (!j || !j.bonuses) {
        if (errEl) {
          errEl.hidden = false;
          errEl.textContent = 'Не вдалося завантажити бонуси.';
        }
        if (loadingEl) loadingEl.hidden = true;
        return;
      }

      applyBonuses(j.bonuses);
      if (loadingEl) loadingEl.hidden = true;
      if (contentEl) contentEl.hidden = false;
    } catch (_e) {
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent = 'Не вдалося завантажити бонуси.';
      }
      if (loadingEl) loadingEl.hidden = true;
    }
  }

  init();
})();
