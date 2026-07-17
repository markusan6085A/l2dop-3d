/**
 * Профіль персонажа — верстка як l2mobi player.php?parameters (смуги, таблиці, кнопки).
 * Стати / HP / MP / CP: сервер — l2dopCombatFormulas (calc_stats.php), l2dopVitals (BaseHP/MP/CP),
 * рівень з накопиченого EXP — l2dopExpgain (expgain.php). Дані лише з GET /character.
 */
(function () {
  /** Соц. колонки — поки заглушки; дод. стати з snapshot (calc_stats.php) */
  var DEMO_SOCIAL = {
    karma: 0,
    rec: 0,
    pvpPk: '0 / 0',
  };

  function $(id) {
    return document.getElementById(id);
  }

  function stubTail() {
    return window.L2 && L2.tr ? L2.tr('stub_later') : 'заглушка, з’явиться пізніше.';
  }

  function setBrLines(el, parts) {
    if (!el) return;
    el.innerHTML = parts
      .map(function (x) {
        return String(x);
      })
      .join('<br />');
  }

  /** Поточний snapshot — для таймерів і повторних локальних перерахунків. */
  var LAST_SNAPSHOT = null;
  var BUFFS_TICK_TIMER = null;

  function activeRemainingSecNow(entry, nowMs) {
    if (!entry || entry.expiresAt == null) return null;
    return Math.max(0, Math.ceil((Number(entry.expiresAt) - nowMs) / 1000));
  }

  function clearList(el) {
    if (!el) return;
    while (el.firstChild) el.removeChild(el.firstChild);
  }

  /** Рендер активних бафів. */
  function renderBuffs(c) {
    if (!c || typeof c !== 'object') return;
    var activeEl = $('pers-buffs-active');
    var activeEmpty = $('pers-buffs-active-empty');
    if (!activeEl) return;

    clearList(activeEl);

    var nowMs = Date.now();

    var active = Array.isArray(c.activeBuffs) ? c.activeBuffs : [];
    var castable = Array.isArray(c.castableSelfBuffs) ? c.castableSelfBuffs : [];
    var nameByL2 = Object.create(null);
    var iconByL2 = Object.create(null);
    var durationSecByL2 = Object.create(null);
    for (var ic = 0; ic < castable.length; ic++) {
      var en = castable[ic];
      nameByL2[en.l2SkillId] = en.nameUk;
      iconByL2[en.l2SkillId] = en.iconUrl;
      if (Number.isFinite(en.durationSec) && en.durationSec > 0) {
        durationSecByL2[en.l2SkillId] = Number(en.durationSec);
      }
    }

    if (active.length === 0) {
      if (activeEmpty) activeEmpty.hidden = false;
    } else {
      if (activeEmpty) activeEmpty.hidden = true;
      for (var i = 0; i < active.length; i++) {
        var b = active[i];
        var li = document.createElement('li');
        li.className = 'l2-pers-buff-row l2-pers-buff-row--active';
        li.setAttribute('data-l2-skill-id', String(b.skillId));
        var label = nameByL2[b.skillId] || 'skillId ' + b.skillId;
        li.title = label + ' · lvl ' + (b.level || 1);

        var ring = document.createElement('span');
        ring.className = 'l2-pers-buff-ring';
        ring.setAttribute('aria-hidden', 'true');
        li.appendChild(ring);

        var inner = document.createElement('span');
        inner.className = 'l2-pers-buff-inner';

        var ico = document.createElement('img');
        ico.className = 'l2-pers-buff-ico';
        ico.alt = '';
        ico.src =
          window.L2 && typeof L2.resolveSkillIconUrl === 'function'
            ? L2.resolveSkillIconUrl(b.skillId, iconByL2[b.skillId] || null)
            : iconByL2[b.skillId] || '/game/skill-icon/' + b.skillId;
        inner.appendChild(ico);
        li.appendChild(inner);

        var durSec = Number(durationSecByL2[b.skillId] || 0);
        if (b.expiresAt != null && Number.isFinite(durSec) && durSec > 0) {
          var durMs = Math.max(1000, Math.floor(durSec * 1000));
          li.setAttribute('data-active-expires', String(Number(b.expiresAt)));
          li.setAttribute('data-active-dur', String(durMs));
          var remMsInit = Math.max(0, Number(b.expiresAt) - nowMs);
          var ratioInit = Math.min(1, Math.max(0, remMsInit / durMs));
          var degInit = Math.round(360 * ratioInit);
          ring.style.background =
            'conic-gradient(rgba(214, 88, 78, 0.95) ' +
            String(degInit) +
            'deg, rgba(60, 46, 36, 0.8) 0)';
        } else {
          ring.style.background = 'linear-gradient(180deg, rgba(212,168,74,0.92), rgba(120,86,40,0.9))';
        }

        activeEl.appendChild(li);
      }
    }

    LAST_SNAPSHOT = c;
  }

  /** Тік: кожну секунду перераховуємо ремейнинги локально без запиту. */
  function tickBuffs() {
    if (!LAST_SNAPSHOT) return;
    var nowMs = Date.now();
    var active = Array.isArray(LAST_SNAPSHOT.activeBuffs) ? LAST_SNAPSHOT.activeBuffs : [];
    var needReRender = false;

    var activeEl = $('pers-buffs-active');
    if (activeEl) {
      var rows = activeEl.querySelectorAll('.l2-pers-buff-row');
      for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        var sid = Number(row.getAttribute('data-l2-skill-id'));
        var entry = active.find(function (b) { return b && b.skillId === sid; });
        if (!entry) { needReRender = true; continue; }
        var rem = activeRemainingSecNow(entry, nowMs);
        var expMs = Number(row.getAttribute('data-active-expires'));
        var durMs = Number(row.getAttribute('data-active-dur'));
        var ring = row.querySelector('.l2-pers-buff-ring');
        if (
          ring &&
          Number.isFinite(expMs) &&
          Number.isFinite(durMs) &&
          durMs > 0
        ) {
          var remMs = Math.max(0, expMs - nowMs);
          var ratio = Math.min(1, Math.max(0, remMs / durMs));
          var deg = Math.round(360 * ratio);
          ring.style.background =
            'conic-gradient(rgba(214, 88, 78, 0.95) ' +
            String(deg) +
            'deg, rgba(60, 46, 36, 0.8) 0)';
        }
        if (rem === 0) needReRender = true;
      }
    }

    if (needReRender && LAST_SNAPSHOT) {
      renderBuffs(LAST_SNAPSHOT);
    }
  }

  function startBuffsTick() {
    if (BUFFS_TICK_TIMER) clearInterval(BUFFS_TICK_TIMER);
    BUFFS_TICK_TIMER = setInterval(tickBuffs, 250);
  }

  async function init() {
    if (window.L2 && typeof L2.mountL2Nav === 'function') {
      L2.mountL2Nav({
        onStub: function (label) {
          var el = $('pers-stub-msg');
          if (el) {
            el.hidden = false;
            el.textContent = '«' + label + '» — ' + stubTail();
          }
        },
      });
    }

    if (window.L2 && typeof L2.mountFootLinkBar === 'function') {
      L2.mountFootLinkBar('l2-foot-links', {});
    }

    var mobiRoot = document.querySelector('.l2-pers-mobi');
    if (mobiRoot) {
      mobiRoot.addEventListener('click', function (e) {
        var t = e.target.closest('[data-stub]');
        if (!t || !mobiRoot.contains(t)) return;
        var label = t.getAttribute('data-stub');
        if (!label) return;
        var msg = $('pers-stub-msg');
        if (msg) {
          msg.hidden = false;
          msg.textContent = '«' + label + '» — ' + stubTail();
        }
      });
    }

    var errEl = $('pers-load-err');
    var content = $('pers-content');
    var t = localStorage.getItem('token');

    if (!t) {
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent =
          window.L2 && L2.tr ? L2.tr('pers_need_login') : 'Потрібен вхід. Перейди на головну.';
      }
      if (content) content.hidden = true;
      if (window.L2 && typeof L2.clearHudPanel === 'function') L2.clearHudPanel();
      return;
    }

    if (window.L2 && typeof L2.renderCharacterFromCache === 'function') {
      L2.renderCharacterFromCache();
    }
    var c =
      window.L2 && typeof L2.resyncCharacterWhenRequired === 'function'
        ? await L2.resyncCharacterWhenRequired()
        : null;
    if (!c || typeof c !== 'object') {
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent =
          window.L2 && L2.tr
            ? L2.tr('pers_load_fail')
            : 'Не вдалося завантажити персонажа.';
      }
      return;
    }

    try {
    if (window.L2 && typeof L2.applyMutationSnapshot === 'function') {
      L2.applyMutationSnapshot(c);
    }

    var num = function (v, d) {
      if (v == null || !Number.isFinite(Number(v))) return d != null ? d : 0;
      return Number(v);
    };
    var critShown = String(num(c.critRate, 0));
    var battleA = [
      num(c.pAtk, 0),
      num(c.pDef, 0),
      num(c.accuracy, 0),
      critShown,
      num(c.pAtkSpd, 0),
    ];
    var battleB = [
      num(c.mAtk, 0),
      num(c.mDef, 0),
      num(c.evasion, 0),
      num(c.runSpeed, 0),
      num(c.castSpd, 0),
    ];
    setBrLines($('pers-col-battle-a'), battleA);
    setBrLines($('pers-col-battle-b'), battleB);

    (function renderClanBonus() {
      var block = $('pers-clan-bonus-block');
      var text = $('pers-clan-bonus-text');
      if (!block || !text) return;
      var b = c && c.clanHallBonus;
      if (!b || !b.active) {
        block.hidden = true;
        return;
      }
      block.hidden = false;
      text.innerHTML =
        'Рівень клану ' +
        String(b.clanLevel) +
        ' (Клан-хол):<br>' +
        'P.Atk +' +
        String(b.pAtk) +
        ', M.Atk +' +
        String(b.mAtk) +
        '<br>' +
        'P.Def +' +
        String(b.pDef) +
        ', M.Def +' +
        String(b.mDef) +
        '<br>' +
        'Макс. HP +' +
        String(b.maxHp);
    })();

    function setOne(id, v) {
      var el = $(id);
      if (el) el.textContent = String(v);
    }
    setOne('pers-str', num(c.str, 0));
    setOne('pers-dex', num(c.dex, 0));
    setOne('pers-con', num(c.con, 0));
    setOne('pers-int', num(c.int, 0));
    setOne('pers-wit', num(c.wit, 0));
    setOne('pers-men', num(c.men, 0));
    setBrLines($('pers-soc-a'), [DEMO_SOCIAL.karma, DEMO_SOCIAL.rec]);
    setBrLines($('pers-soc-b'), [DEMO_SOCIAL.pvpPk]);

    var mCritStr =
      c.mCritPct != null && Number.isFinite(Number(c.mCritPct))
        ? Number(c.mCritPct).toFixed(2) + '%'
        : '0%';
    var gradeArmorLine =
      c.weaponGradeMatchesArmor === false
        ? 'Ні (штраф ×0.75)'
        : c.weaponGradeMatchesArmor === true
          ? 'Так (×1.1)'
          : '—';
    var mpCostStr =
      c.skillMpCostMul != null && Number.isFinite(Number(c.skillMpCostMul))
        ? Math.round(Number(c.skillMpCostMul) * 100) + '%'
        : '100%';
    var debuffLandStr =
      c.addDebuffLandChancePct != null &&
      Number.isFinite(Number(c.addDebuffLandChancePct)) &&
      Number(c.addDebuffLandChancePct) !== 0
        ? '+' + num(c.addDebuffLandChancePct, 0) + '%'
        : '—';
    var extraCombat = [
      String(num(c.shieldPDef, 0)),
      mCritStr,
      c.addCritDisplay != null ? String(c.addCritDisplay) : '0%+0',
      gradeArmorLine,
      String(num(c.vampiricPct, 0)) + '%',
      String(num(c.reflectPct, 0)) + '%',
      String(num(c.stunResistPct, 0)) + '%',
      String(num(c.debuffResistPct, 0)) + '%',
      mpCostStr,
      debuffLandStr,
      '',
      String(num(c.regenCp, 0)),
      String(num(c.regenHp, 0)),
      String(num(c.regenMp, 0)),
    ];
    setBrLines($('pers-extra-vals'), extraCombat);

    var armorBlock = $('pers-armor-set-block');
    var armorName = $('pers-armor-set-name');
    var armorList = $('pers-armor-set-list');
    if (armorBlock && armorName && armorList) {
      var asb = c.armorSetBonus;
      if (asb && asb.linesUk && asb.linesUk.length) {
        armorBlock.hidden = false;
        armorName.textContent = asb.nameUk || '';
        armorList.innerHTML = '';
        for (var ai = 0; ai < asb.linesUk.length; ai++) {
          var li = document.createElement('li');
          li.textContent = String(asb.linesUk[ai]);
          armorList.appendChild(li);
        }
      } else {
        armorBlock.hidden = true;
        armorName.textContent = '';
        armorList.innerHTML = '';
      }
    }

    if (window.L2 && typeof L2.fetchCatalogHints === 'function') {
      await L2.fetchCatalogHints();
    }

    var cityEl = $('pers-city');
    if (cityEl) {
      cityEl.textContent =
        window.L2 && typeof window.L2.cityDisplayName === 'function'
          ? window.L2.cityDisplayName(c.cityId)
          : c.cityId != null
            ? String(c.cityId)
            : '—';
    }
    if ($('pers-adena')) {
      $('pers-adena').textContent = c.adena != null ? String(c.adena) : '—';
    }

    renderBuffs(c);
    startBuffsTick();

    if (errEl) errEl.hidden = true;
    if (content) content.hidden = false;
    } catch (eRender) {
      try {
        console.error('pers render', eRender);
      } catch (eLog) {
        /* ignore */
      }
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent =
          window.L2 && L2.tr
            ? L2.tr('pers_render_err')
            : 'Не вдалося показати профіль. Онови сторінку (F5) або перевір консоль.';
      }
      if (content) content.hidden = true;
    }
  }

  init();
})();
