/**
 * Сторінка story.html: демо-сюжет + підстановка з GET /character, якщо є токен.
 */
(function () {
  function $(id) {
    return document.getElementById(id);
  }

  /** Як на референс-UI: розділювач тисяч — кома (12,450). */
  function fmtNumUs(n) {
    try {
      return Number(n).toLocaleString('en-US');
    } catch (e) {
      return String(n);
    }
  }

  function classBranchUk(b) {
    if (b === 'mystic') return 'Маг';
    if (b === 'fighter') return 'Воїн';
    return b ? String(b) : '—';
  }

  function setBarW(innerEl, pct) {
    if (!innerEl) return;
    var p = Math.max(0, Math.min(100, Number(pct) || 0));
    innerEl.style.width = p.toFixed(1) + '%';
  }

  /** Усередині смужки — ціле без ком, компактно (5866). */
  function barNum(v) {
    var n = Math.round(Number(v));
    if (!isFinite(n) || n < 0) return '0';
    return String(n);
  }

  function applyCharacter(c) {
    if (!c) return;
    if (window.L2 && typeof window.L2.applyHudFromSnapshot === 'function') {
      window.L2.applyHudFromSnapshot(c);
    }
    if ($('story-name') && c.name) $('story-name').textContent = String(c.name);
    if ($('story-lvl') && c.level != null) $('story-lvl').textContent = String(c.level);
    if ($('story-class-val')) $('story-class-val').textContent = classBranchUk(c.classBranch);

    if (c.adena != null && $('story-adena')) {
      $('story-adena').textContent = fmtNumUs(c.adena);
    }
    if ($('story-hp-txt') && c.hp != null) {
      $('story-hp-txt').textContent = barNum(c.hp);
    }
    if (c.maxHp > 0) {
      setBarW(
        $('story-hp-inner'),
        (Number(c.hp) / Number(c.maxHp)) * 100
      );
    } else {
      setBarW($('story-hp-inner'), 0);
    }
    if ($('story-mp-txt') && c.mp != null) {
      $('story-mp-txt').textContent = barNum(c.mp);
    }
    if (c.maxMp > 0) {
      setBarW(
        $('story-mp-inner'),
        (Number(c.mp) / Number(c.maxMp)) * 100
      );
    } else {
      setBarW($('story-mp-inner'), 0);
    }
    /** SP: лише значення; заливка повна, якщо sp > 0. */
    if ($('story-sp-txt') && c.sp != null) {
      var spv = Math.round(Number(c.sp));
      if (spv < 0) spv = 0;
      $('story-sp-txt').textContent = String(spv);
      setBarW($('story-sp-inner'), spv > 0 ? 100 : 0);
    } else {
      setBarW($('story-sp-inner'), 100);
    }

    var pct = c.expBarPct;
    if (pct != null && isFinite(pct) && $('story-exp-fill')) {
      var p = Math.max(0, Math.min(100, Number(pct)));
      $('story-exp-fill').style.width = p.toFixed(1) + '%';
      if ($('story-exp-pct')) {
        var pf = p.toFixed(1).replace('.', ',') + '%';
        $('story-exp-pct').textContent = pf;
      }
      var bar = $('story-exp-bar');
      if (bar) {
        bar.setAttribute('aria-valuenow', String(Math.round(p)));
      }
    }
  }

  function applyCityLine(c) {
    if (!window.L2 || !window.L2.tr) return;
    var cid = c && c.cityId ? String(c.cityId) : '';
    if (!cid) return;
    var k = 'cityid_' + cid;
    if (window.L2.UI && window.L2.UI[k]) {
      if ($('story-loc-title')) $('story-loc-title').textContent = window.L2.tr(k);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    var hint = $('story-demo-hint');
    var choiceStubs = document.querySelectorAll('.l2-story-choice[data-stub]');
    choiceStubs.forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (hint) {
          hint.hidden = false;
          hint.textContent = 'Ще немає гілок сюжету в API — тільки дизайн-сторінка.';
        }
      });
    });

    if (!window.L2 || typeof window.L2.fetchSnapshot !== 'function') return;
    window.L2.fetchSnapshot().then(function (c) {
      if (!c) {
        if (hint) {
          hint.hidden = false;
          hint.textContent = 'Поки що без входу: зверху — демо-цифри. Увійдіть, щоб підставлялись HP/рівень/адена з сервера.';
        }
        return;
      }
      applyCharacter(c);
      applyCityLine(c);
      if (hint) {
        hint.hidden = false;
        hint.textContent = 'Дані з сервера підставлено. «Кристали» — заглушка (нема в економіці).';
      }
    });
  });
})();
