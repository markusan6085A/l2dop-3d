/**
 * Вікно бою (l2mobi / l2dop): смуги гравця, HP моба, квадратики скілів, лог.
 * Стан бою — на сервері (battleJson); дії — POST /game/battle/action.
 */
(function () {
  var battleBuffStripTimer = null;
  var battleActionInFlight = false;
  var battleNavInFlight = false;
  var VICTORY_STORAGE_KEY = 'l2battle_last_victory_v1';
  var DEFEAT_STORAGE_KEY = 'l2battle_pending_defeat_v1';
  var BATTLE_LOG_MAX_VISIBLE = 10;
  var huntLogPrefix = [];
  var sessionLogHuntChain = false;
  var huntLogFreezeKey = '';

  function resetHuntLogChain() {
    huntLogPrefix = [];
    sessionLogHuntChain = false;
    huntLogFreezeKey = '';
    var logEl = document.getElementById('battle-log');
    if (logEl) delete logEl.dataset.battleLogKey;
  }

  function freezeLogForHuntContinue(victory, currentBattle) {
    var lines =
      victory && victory.fullLog && victory.fullLog.length
        ? victory.fullLog.slice()
        : currentBattle && currentBattle.log
          ? currentBattle.log.slice()
          : [];
    if (!lines.length) return;
    var key = lines.join('\u0001');
    if (huntLogFreezeKey === key) return;
    huntLogFreezeKey = key;
    huntLogPrefix = huntLogPrefix.concat(lines);
    sessionLogHuntChain = true;
  }

  function getActiveBattleLogLines(battle) {
    if (!battle) return [];
    var serverLines = battle.log || [];
    var combined = sessionLogHuntChain
      ? huntLogPrefix.concat(serverLines)
      : serverLines;
    if (combined.length <= BATTLE_LOG_MAX_VISIBLE) return combined;
    return combined.slice(-BATTLE_LOG_MAX_VISIBLE);
  }

  function saveVictoryToSession(victory) {
    try {
      if (victory) {
        sessionStorage.setItem(VICTORY_STORAGE_KEY, JSON.stringify(victory));
      } else {
        sessionStorage.removeItem(VICTORY_STORAGE_KEY);
      }
    } catch (e) {
      /* ignore */
    }
  }

  function loadVictoryFromSession() {
    try {
      var raw = sessionStorage.getItem(VICTORY_STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e2) {
      return null;
    }
  }

  function saveDefeatToSession(defeat) {
    try {
      if (defeat) {
        sessionStorage.setItem(DEFEAT_STORAGE_KEY, JSON.stringify(defeat));
      } else {
        sessionStorage.removeItem(DEFEAT_STORAGE_KEY);
      }
    } catch (eDefSave) {
      /* ignore */
    }
  }

  function loadDefeatFromSession() {
    try {
      var raw = sessionStorage.getItem(DEFEAT_STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (eDefLoad) {
      return null;
    }
  }

  function clearDefeatFromSession() {
    saveDefeatToSession(null);
  }

  function clearBattleBuffStripTimer() {
    if (battleBuffStripTimer != null) {
      clearInterval(battleBuffStripTimer);
      battleBuffStripTimer = null;
    }
  }

  function $(id) {
    return document.getElementById(id);
  }

  function tr(k, fb) {
    if (window.L2 && L2.tr) {
      var t = L2.tr(k);
      if (t !== k) return t;
    }
    return fb != null ? fb : k;
  }

  function setBar(innerEl, cur, max) {
    if (!innerEl) return;
    var m = max > 0 ? max : 1;
    var c = Math.max(0, Math.min(Number(cur), Number(max)));
    var pct = Math.round((c / m) * 100);
    innerEl.style.width = pct + '%';
  }

  function mobKindUsesNumericHpBar(kind) {
    var k = kind != null ? String(kind) : '';
    return k === 'raid' || k === 'epic' || k === 'epic_guard';
  }

  function battleUsesNumericMobHp(battle) {
    if (!battle) return false;
    if (battle.spawnId && String(battle.spawnId).indexOf('pvp:') === 0) return true;
    return mobKindUsesNumericHpBar(battle.kind);
  }

  function mobHpBarLabelText(kind, cur, max, spawnId) {
    if (
      (spawnId && String(spawnId).indexOf('pvp:') === 0) ||
      mobKindUsesNumericHpBar(kind)
    ) {
      if (window.L2 && typeof L2.formatBarPair === 'function') {
        return L2.formatBarPair(cur, max);
      }
      var m = max > 0 ? Number(max) : 1;
      var x = Number(cur);
      if (!Number.isFinite(x)) x = 0;
      x = Math.max(0, Math.min(x, m));
      return Math.round(x) + ' / ' + Math.round(m);
    }
    if (window.L2 && typeof L2.formatBarPct === 'function') {
      return L2.formatBarPct(cur, max);
    }
    var m2 = max > 0 ? max : 1;
    var x2 = Math.max(0, Math.min(Number(cur), m2));
    return ((x2 / m2) * 100).toFixed(1) + '%';
  }

  /**
   * Клас стилю рядка логу — кольори в `styles.css` (`.l2-battle-log--colored .log-*`).
   * @returns {{ className: string }}
   */
  function getL2dopBattleLogStyle(line) {
    var t = String(line || '').trim();
    var lower = t.toLowerCase();
    if (/^\[[^\]]+\]\s*—\s*крит!\s*−\d+\s*HP\.?$/i.test(t)) {
      return { className: 'log-crit' };
    }
    if (/^\[[^\]]+\]\s*−\d+\s*HP\.?$/i.test(t)) {
      return { className: 'log-enemy-damage' };
    }
    if (/^відсіч\s*—/i.test(t)) return { className: 'log-player-damage' };
    if (/^на вас напали:/i.test(t)) return { className: 'log-system' };
    if (lower.indexOf('вас вбив гравець') !== -1) return { className: 'log-system' };
    if (/^крит!\s*ти\s*завдав\s+\d+\s*(?:шкоди|урона)/i.test(t)) {
      return { className: 'log-crit' };
    }
    if (/^ти\s*завдав\s+\d+\s*(?:шкоди|урона)/i.test(t)) {
      return { className: 'log-player-damage' };
    }
    if (/^крит!\s*.+\s+завдав\s+\d+\s*урона\.?$/i.test(t)) {
      return { className: 'log-crit' };
    }
    if (/^[^:]+?\s+завдав\s+\d+\s*урона\.?$/i.test(t)) {
      return { className: 'log-enemy-damage' };
    }
    if (/^додаткова ціль повалена:/i.test(t)) return { className: 'log-system' };
    if (/^здобуто:\s*\+\d+\s*аден/i.test(t)) return { className: 'log-adena' };
    if (/^здобуто:.*\bexp\b/i.test(lower)) return { className: 'log-exp' };
    if (/^здобуто:.*\bsp\b/i.test(lower)) return { className: 'log-sp' };
    if (/^здобуто:/i.test(t)) return { className: 'log-loot' };
    if (/^отримано:/i.test(t)) return { className: 'log-item-loot' };
    if (/втратив\s+\d+\s*cp/i.test(lower)) return { className: 'log-cp-damage' };

    if (lower.indexOf('ти знепритомнів') !== -1) return { className: 'log-system' };
    if (lower === 'бій завершено.') return { className: 'log-system' };
    if (lower.indexOf('всі бафи злетіли') !== -1) return { className: 'log-system' };
    if (lower.indexOf('mp вичерпано') !== -1) return { className: 'log-system' };

    if (
      /^\(Вразливість\s/i.test(t) ||
      /^\(Око\s+(мисливця|вбивці)/i.test(t)
    ) {
      return { className: 'log-debuff' };
    }

    if (lower === 'перемога!') return { className: 'log-loot' };
    if (/^рівень\s+\d+!$/.test(lower)) return { className: 'log-loot' };

    if (/^\(спойл\)\s*\+\d+\s*аден/i.test(t)) return { className: 'log-loot' };
    if (/^\+\d+\s*аден\.?$/i.test(t)) return { className: 'log-adena' };
    if (/^\+\d+\s*EXP$/i.test(t)) return { className: 'log-exp' };
    if (/^\+\d+\s*SP$/i.test(t)) return { className: 'log-sp' };

    if (/^\(спойл\)\s*\+\d+/i.test(t) && lower.indexOf('аден') === -1) {
      return { className: 'log-loot' };
    }
    if (/^\+\d+\s*[×x]\s*.+/i.test(t) && !/^\(спойл\)/i.test(t)) {
      return { className: 'log-item-loot' };
    }

    if (lower.indexOf('промахнувся') !== -1) return { className: 'log-miss' };
    if (/^крит!\s*\[/i.test(t) && lower.indexOf('завдав') !== -1) {
      return { className: 'log-crit' };
    }
    if (/^\[[^\]]+\]\s*завдав\s+\d+\s*(?:шкоди|урона)/i.test(t)) {
      return { className: 'log-enemy-damage' };
    }

    if (lower === 'промах.' || lower === 'промах (магія).') {
      return { className: 'log-miss' };
    }

    if (/^ти\s*завдав\s+\d+\s*(?:шкоди|урона)/i.test(lower)) {
      return { className: 'log-normal' };
    }

    if (/^відбиття на моба:/i.test(t)) return { className: 'log-player-damage' };
    if (/^hp:\s*[\-−]/.test(t)) return { className: 'log-enemy-damage' };
    if (/^hp:\s*\+/i.test(t)) return { className: 'log-heal' };
    if (/^.+:\s*\+\d+\s*HP\.?$/i.test(t)) return { className: 'log-heal' };

    if (/^mp:\s*/i.test(t)) return { className: 'log-skill' };

    if (lower.indexOf('бойовий рик') !== -1) return { className: 'log-heal' };
    if (lower.indexOf('відродження:') !== -1) return { className: 'log-heal' };

    if (lower.indexOf('бойовий клич') !== -1) return { className: 'log-skill' };
    if (
      lower.indexOf('око мисливця') !== -1 ||
      lower.indexOf('око вбивці') !== -1
    ) {
      return { className: 'log-debuff' };
    }
    if (lower.indexOf('левине серце') !== -1) return { className: 'log-skill' };
    if (lower.indexOf('зосереджений удар:') !== -1) return { className: 'log-skill' };
    if (lower.indexOf('вразливість') !== -1) return { className: 'log-debuff' };
    if (lower.indexOf('азарт бою') !== -1) return { className: 'log-skill' };

    if (lower.indexOf('провокація масова') !== -1) return { className: 'log-skill' };
    if (lower.indexOf('вихор розсік ворогів поруч') !== -1) return { className: 'log-system' };
    if (lower.indexOf('древко розсікло ворогів поруч') !== -1) return { className: 'log-system' };
    if (lower.indexOf('у бій втягнуто:') !== -1) return { className: 'log-system' };
    if (
      lower.indexOf('увімкнено') !== -1 ||
      lower.indexOf('вимкнено') !== -1
    ) {
      return { className: 'log-toggle' };
    }
    if (lower.indexOf('звіриний рев') !== -1) return { className: 'log-skill' };
    if (lower.indexOf('сон знято') !== -1) return { className: 'log-debuff' };
    if (lower.indexOf('поруч зачеплено') !== -1) return { className: 'log-skill' };

    if (lower === 'зосереджений удар вимкнено.') return { className: 'log-system' };
    if (
      (lower.indexOf('вимкнено') !== -1 || lower.indexOf('вимкнена') !== -1) &&
      (lower.indexOf('стійка') !== -1 || lower.indexOf('жорстка') !== -1)
    ) {
      return { className: 'log-system' };
    }

    if (
      lower.indexOf('бій розпочато') !== -1 ||
      lower.indexOf('бій відновлено') !== -1
    ) {
      return { className: 'log-system' };
    }

    return { className: 'log-normal' };
  }

  /** Парсер рядка дропу предмета: «+3× Шкіра», «(спойл) +1× …», рідко «+1 Стебло». */
  function parseItemDropLine(line) {
    var s = String(line || '').trim();
    var spoil = false;
    if (/^\(спойл\)\s+/i.test(s)) {
      spoil = true;
      s = s.replace(/^\(спойл\)\s+/i, '').trim();
    }
    var m = s.match(/^\+(\d+)\s*[×x]\s*(.+)$/i);
    if (m) {
      return { spoil: spoil, qty: m[1], label: m[2].trim() };
    }
    m = s.match(/^\+(\d+)\s+(.+)$/i);
    if (m && !/аден/i.test(m[2])) {
      return { spoil: spoil, qty: m[1], label: m[2].trim() };
    }
    return null;
  }

  var L2_LOG_ICON_ADENA = '/assets/l2dop/etc_adena_i00.png';
  var L2_LOG_ICON_EXP = '/assets/l2dop/etc_exp_point_i00.png';
  var L2_LOG_ICON_SP = '/assets/l2dop/etc_sp_point_i00.png';

  function parseAdenaDropLine(line) {
    var s = String(line || '').trim();
    var spoil = false;
    if (/^\(спойл\)\s+/i.test(s)) {
      spoil = true;
      s = s.replace(/^\(спойл\)\s+/i, '').trim();
    }
    var m = s.match(/^\+(\d+)\s*аден\.?$/i);
    if (!m) return null;
    return { spoil: spoil, qty: m[1] };
  }

  function parseExpRewardLine(line) {
    return /^\+\d+\s*EXP$/i.test(String(line || '').trim());
  }

  function parseSpRewardLine(line) {
    return /^\+\d+\s*SP$/i.test(String(line || '').trim());
  }

  function findVictoryItemForParsedDrop(parsed, items) {
    if (!parsed || !items || !items.length) return null;
    for (var ii = 0; ii < items.length; ii++) {
      var it = items[ii];
      if (!!it.spoil !== !!parsed.spoil) continue;
      if (String(it.qty) !== String(parsed.qty)) continue;
      if (String(it.label).trim() !== parsed.label) continue;
      return it;
    }
    return null;
  }

  /** Рядок підсумку на екрані перемоги у компактному текстовому форматі. */
  function fillVictoryLootLine(el, victory) {
    if (!el || !victory) return;
    el.className = 'l2-battle-victory-notify__loot';
    el.textContent =
      tr('battle_victory_dropped', 'Випало: ') +
      '+' +
      String(victory.adenaGain) +
      tr('battle_loot_adena', ' аден') +
      ', +' +
      String(victory.expGain) +
      ' ' +
      tr('battle_exp_abbr', 'EXP') +
      ', +' +
      String(victory.spGain) +
      ' ' +
      tr('battle_sp_abbr', 'SP') +
      '.';
  }

  function parseBattleSkillLogLine(lineStr) {
    var s = String(lineStr || '');
    if (!s) return null;
    var skillHit = false;
    if (s.charCodeAt(0) === 0x2060) {
      skillHit = true;
      s = s.slice(1);
    }
    var sep = '\u200B';
    var sepIdx = s.indexOf(sep);
    if (sepIdx > 0) {
      var id = parseInt(s.slice(0, sepIdx), 10);
      if (Number.isFinite(id) && id > 0) {
        return { skillHit: skillHit, skillId: id, text: s.slice(sepIdx + 1) };
      }
    }
    if (skillHit) {
      return { skillHit: true, skillId: 0, text: s };
    }
    return null;
  }

  function appendLogRowWithIcon(container, line, iconSrc, onImgErr, textClass) {
    var row = document.createElement('div');
    row.className = 'l2-battle-log-line l2-battle-log-line--drop';
    var img = document.createElement('img');
    img.className = 'l2-battle-log-line__icon';
    img.alt = '';
    img.src = iconSrc;
    img.addEventListener('error', function () {
      img.src = onImgErr || '/icons/drops/other.svg';
    });
    var span = document.createElement('span');
    var stDrop = getL2dopBattleLogStyle(line);
    span.className =
      'l2-battle-log-line__text ' + (textClass || stDrop.className);
    span.textContent = line;
    row.appendChild(img);
    row.appendChild(span);
    container.appendChild(row);
  }

  function appendPlayerDealtDamageRow(container, lineStr) {
    var s = String(lineStr || '').trim();
    var m = s.match(
      /^(Крит!\s+)(Ти\s*завдав\s+)(\d+\s*(?:шкоди|урона)\.?)$/i
    );
    if (m) {
      var rowC = document.createElement('div');
      rowC.className = 'l2-battle-log-line';
      var crit = document.createElement('span');
      crit.className = 'log-crit';
      crit.textContent = m[1].trim();
      rowC.appendChild(crit);
      rowC.appendChild(document.createTextNode(' '));
      var midC = document.createElement('span');
      midC.className = 'log-normal';
      midC.textContent = m[2];
      rowC.appendChild(midC);
      var dmgC = document.createElement('span');
      dmgC.className = 'log-damage-dealt';
      dmgC.textContent = m[3];
      rowC.appendChild(dmgC);
      container.appendChild(rowC);
      return true;
    }
    m = s.match(/^(Ти\s*завдав\s+)(\d+\s*(?:шкоди|урона)\.?)$/i);
    if (!m) return false;
    var row = document.createElement('div');
    row.className = 'l2-battle-log-line';
    var mid = document.createElement('span');
    mid.className = 'log-normal';
    mid.textContent = m[1];
    row.appendChild(mid);
    var dmg = document.createElement('span');
    dmg.className = 'log-damage-dealt';
    dmg.textContent = m[2];
    row.appendChild(dmg);
    container.appendChild(row);
    return true;
  }

  function parseComboLogLine(line) {
    var s = String(line || '').trim();
    var m = s.match(
      /^Комбо:\s*(\d+)\/(\d+)\s*\|\s*удари\s*(\d+)\/(\d+)\s*\|\s*крит\s*(\d+)\s*\|\s*промахи\s*(\d+)\.?$/i
    );
    if (!m) return null;
    return {
      normalDamage: Number(m[1]),
      critDamage: Number(m[2]),
      landedHits: Number(m[3]),
      maxHits: Number(m[4]),
      critHits: Number(m[5]),
      missHits: Number(m[6]),
    };
  }

  function appendComboLogRow(container, parsed) {
    var row = document.createElement('div');
    row.className = 'l2-battle-log-line';
    function seg(text, cls) {
      var sp = document.createElement('span');
      sp.textContent = text;
      if (cls) sp.className = cls;
      row.appendChild(sp);
    }
    seg('Комбо: ', 'log-combo');
    seg(String(parsed.normalDamage), 'log-damage-dealt');
    seg('/', 'log-combo');
    seg(String(parsed.critDamage), 'log-crit');
    seg(' | удари ', 'log-combo');
    seg(String(parsed.landedHits) + '/' + String(parsed.maxHits), 'log-normal');
    seg(' | крит ', 'log-combo');
    seg(String(parsed.critHits), 'log-crit');
    seg(' | промахи ', 'log-combo');
    seg(String(parsed.missHits), 'log-miss');
    container.appendChild(row);
  }

  function parseRewardSummaryLine(line) {
    var s = String(line || '').trim();
    var m = s.match(
      /^Здобуто:\s*\+(\d+)\s*адени,\s*\+(\d+)\s*SP,\s*\+(\d+)\s*EXP\.?$/i
    );
    if (!m) return null;
    return {
      adena: Number(m[1]),
      sp: Number(m[2]),
      exp: Number(m[3]),
    };
  }

  function appendRewardSummaryRow(container, parsed) {
    var row = document.createElement('div');
    row.className = 'l2-battle-log-line';
    function seg(text, cls) {
      var sp = document.createElement('span');
      sp.textContent = text;
      if (cls) sp.className = cls;
      row.appendChild(sp);
    }
    seg('Здобуто: ', 'log-loot');
    seg('+' + String(parsed.adena) + ' адени', 'log-adena');
    seg(', ', 'log-loot');
    seg('+' + String(parsed.sp) + ' SP', 'log-sp');
    seg(', ', 'log-loot');
    seg('+' + String(parsed.exp) + ' EXP', 'log-exp');
    seg('.', 'log-loot');
    container.appendChild(row);
  }

  /**
   * @param {object} [opts]
   * @param {boolean} [opts.showDropIcons] — маленькі іконки в рядках дропу (тільки для екрану перемоги)
   * @param {boolean} [opts.newestFirst] — новіші рядки зверху (бій); для перемоги зазвичай false
   * @param {Array<{l2ItemId:number,qty:number,spoil:boolean,label:string}>} [opts.items] — зіставлення +qty× назва → l2ItemId
   */
  function renderColoredLog(container, lines, opts) {
    if (!container) return;
    opts = opts || {};
    var showDropIcons = opts.showDropIcons === true;
    var newestFirst = opts.newestFirst === true;
    var dropItems = opts.items || [];
    var arr = lines || [];
    var maxLines = opts.maxLines;
    if (typeof maxLines === 'number' && maxLines > 0 && arr.length > maxLines) {
      arr = arr.slice(-maxLines);
    }
    if (newestFirst) {
      arr = arr.slice().reverse();
    }
    var logKey = arr.join('\u0001');
    if (container.dataset.battleLogKey === logKey) return;
    container.dataset.battleLogKey = logKey;
    container.innerHTML = '';
    for (var i = 0; i < arr.length; i++) {
      var line = arr[i];
      var lineStr = String(line);
      var done = false;
      if (showDropIcons) {
        var pd = parseItemDropLine(lineStr);
        if (pd) {
          var found = findVictoryItemForParsedDrop(pd, dropItems);
          if (found && found.l2ItemId) {
            var dropIconSrc =
              window.L2 && typeof L2.resolveItemIconUrl === 'function'
                ? L2.resolveItemIconUrl(found.l2ItemId, '/icons/drops/other.svg')
                : '/game/item-icon/' + found.l2ItemId;
            appendLogRowWithIcon(
              container,
              lineStr,
              dropIconSrc,
              '/icons/drops/other.svg'
            );
            done = true;
          }
        }
      }
      if (!done && parseExpRewardLine(lineStr)) {
        appendLogRowWithIcon(
          container,
          lineStr,
          L2_LOG_ICON_EXP,
          '/icons/drops/resource.svg'
        );
        done = true;
      }
      if (!done && parseSpRewardLine(lineStr)) {
        appendLogRowWithIcon(
          container,
          lineStr,
          L2_LOG_ICON_SP,
          '/icons/drops/resource.svg'
        );
        done = true;
      }
      if (!done && parseAdenaDropLine(lineStr)) {
        appendLogRowWithIcon(
          container,
          lineStr,
          L2_LOG_ICON_ADENA,
          '/icons/drops/adena.svg'
        );
        done = true;
      }
      if (!done) {
        var skillLog = parseBattleSkillLogLine(lineStr);
        if (skillLog && (skillLog.skillId > 0 || skillLog.skillHit)) {
          var skillText = skillLog.text;
          var stSkill = skillLog.skillHit ? 'log-skill-hit' : 'log-skill';
          if (skillLog.skillId > 0) {
            var skillIcon =
              window.L2 && typeof L2.resolveSkillIconUrl === 'function'
                ? L2.resolveSkillIconUrl(skillLog.skillId, null)
                : '/game/skill-icon/' + skillLog.skillId;
            appendLogRowWithIcon(
              container,
              skillText,
              skillIcon,
              '/icons/drops/other.svg',
              stSkill
            );
          } else {
            var skRow = document.createElement('div');
            skRow.className = 'l2-battle-log-line ' + stSkill;
            skRow.textContent = skillText;
            container.appendChild(skRow);
          }
          done = true;
        }
      }
      if (!done) {
        var reward = parseRewardSummaryLine(lineStr);
        if (reward) {
          appendRewardSummaryRow(container, reward);
          done = true;
        }
      }
      if (!done && appendPlayerDealtDamageRow(container, lineStr)) {
        done = true;
      }
      if (!done) {
        var combo = parseComboLogLine(lineStr);
        if (combo) {
          appendComboLogRow(container, combo);
          done = true;
        }
      }
      if (!done) {
        var row = document.createElement('div');
        var st = getL2dopBattleLogStyle(lineStr);
        row.className = 'l2-battle-log-line ' + st.className;
        row.textContent = lineStr;
        container.appendChild(row);
      }
    }
    /**
     * Позиціонування в'юпорта:
     * - `newestFirst: true` (бій) — новіші рядки зверху DOM, тож прокручуємо до верху,
     *   щоб після кожного ходу гравець бачив найсвіжіший лог без зайвого скрола.
     * - `newestFirst: false` (екрани перемоги / поразки) — хронологічно зверху-вниз.
     */
    container.scrollTop = 0;
  }

  function renderPlayerBars(c) {
    if (!c) return;
    if (window.L2 && typeof L2.applyHudFromSnapshot === 'function') {
      L2.applyHudFromSnapshot(c);
    }
  }

  var battleToastTimer = null;
  function showBattleToast(msg, opts) {
    var el = $('battle-toast');
    if (!el || !msg) return;
    el.textContent = msg;
    el.hidden = false;
    if (battleToastTimer) clearTimeout(battleToastTimer);
    var ms =
      opts && typeof opts.durationMs === 'number' && opts.durationMs > 0
        ? opts.durationMs
        : opts && opts.long
          ? 9000
          : 3200;
    battleToastTimer = setTimeout(function () {
      el.hidden = true;
    }, ms);
  }

  function battleErrorMessageUk(errBody, fallback) {
    if (!errBody || typeof errBody !== 'object') return fallback;
    if (
      errBody.code === 'revision_conflict' ||
      errBody.error === 'revision_conflict' ||
      errBody.error === 'revision conflict'
    ) {
      return tr(
        'battle_toast_revision_conflict',
        'Стан персонажа оновлено з сервера. Повтори дію.'
      );
    }
    if (errBody.messageUk) return errBody.messageUk;
    if (errBody.error) return String(errBody.error);
    return fallback;
  }

  function isNotInBattleErrorBody(errBody) {
    return !!(
      errBody &&
      (errBody.reason === 'not_in_battle' ||
        errBody.error === 'battle_none' ||
        errBody.messageUk === 'Немає активного бою.')
    );
  }

  async function runWithBattleActionLock(fn) {
    if (battleActionInFlight) return;
    battleActionInFlight = true;
    try {
      await fn();
    } finally {
      battleActionInFlight = false;
    }
  }

  async function runWithBattleNavLock(fn) {
    if (battleNavInFlight) return;
    battleNavInFlight = true;
    try {
      await fn();
    } finally {
      battleNavInFlight = false;
    }
  }

  function buffIconsSig(icons) {
    if (!icons || !icons.length) return '';
    var parts = [];
    for (var i = 0; i < icons.length; i++) {
      var b = icons[i];
      if (!b) continue;
      parts.push(
        [
          b.l2SkillId,
          b.chargeCount,
          b.buffExpiresAtMs,
          b.isToggle === true ? 1 : 0,
        ].join(':')
      );
    }
    return parts.join('|');
  }

  function renderBuffStrip(battle) {
    var strip = $('battle-buff-strip');
    var sr = $('battle-active-buffs');
    var bufs = battle && battle.battleBuffsUk;
    if (sr) {
      if (bufs && bufs.length) {
        sr.hidden = false;
        sr.textContent = tr('battle_buffs_prefix', 'Активні ефекти: ') + bufs.join(' · ');
      } else {
        sr.hidden = true;
        sr.textContent = '';
      }
    }
    if (!strip) return;
    var icons = battle && battle.battleBuffIcons;
    var sig = buffIconsSig(icons);
    if (strip.dataset.buffSig === sig) {
      return;
    }
    clearBattleBuffStripTimer();
    strip.dataset.buffSig = sig;
    strip.innerHTML = '';
    if (!icons || !icons.length) {
      strip.hidden = true;
      return;
    }
    var BUFF_SLOTS_MAX = 20;
    if (icons.length > BUFF_SLOTS_MAX) {
      icons = icons.slice(0, BUFF_SLOTS_MAX);
    }
    strip.hidden = false;
    var needsDurTick = false;
    for (var bi = 0; bi < icons.length; bi++) {
      (function (b) {
        var wrap = document.createElement('div');
        wrap.className = 'l2-battle-buff-icon';
        var baseTitle = b.labelUk || '';
        wrap.title = baseTitle;
        wrap.setAttribute('data-title-base', baseTitle);
        var expMs = b.buffExpiresAtMs;
        var durMs = b.buffDurationTotalMs;
        var isToggle = b.isToggle === true;
        var hasExp =
          typeof expMs === 'number' &&
          Number.isFinite(expMs) &&
          expMs > 0;
        var durMsResolved =
          typeof durMs === 'number' &&
          Number.isFinite(durMs) &&
          durMs > 0
            ? durMs
            : hasExp
              ? Math.max(1000, Math.floor(expMs - Date.now()))
              : 0;
        var hasDurationRing =
          !isToggle &&
          hasExp &&
          durMsResolved > 0;
        if (hasDurationRing) {
          wrap.setAttribute('data-buff-expires', String(expMs));
          wrap.setAttribute('data-buff-dur', String(durMsResolved));
          needsDurTick = true;
        }
        if (isToggle) {
          wrap.classList.add('l2-battle-buff-icon--toggle');
        }
        var img = document.createElement('img');
        img.className = 'l2-battle-buff-icon__img';
        img.alt = b.labelUk || '';
        img.src =
          window.L2 && typeof L2.resolveSkillIconUrl === 'function'
            ? L2.resolveSkillIconUrl(b.l2SkillId, null)
            : '/game/skill-icon/' + b.l2SkillId;
        img.addEventListener('error', function () {
          img.src = '/icons/drops/other.svg';
        });
        if (hasDurationRing || isToggle) {
          /**
           * Ring-елемент використовується як для duration-кільця (червоний
           * conic-gradient), так і для тогл-кільця (синій пульсуючий glow
           * через CSS). Для тогл-ов не виставляємо conic-gradient.
           */
          var ring = document.createElement('div');
          ring.className =
            'l2-battle-buff-icon__ring' +
            (isToggle ? ' l2-battle-buff-icon__ring--toggle' : '');
          ring.setAttribute('aria-hidden', 'true');
          wrap.appendChild(ring);
        }
        var inner = document.createElement('div');
        inner.className = 'l2-battle-buff-icon__inner';
        inner.appendChild(img);
        wrap.appendChild(inner);
        /**
         * Скіл-заряди (Sonic Focus: 1..10): маленька цифра по центру іконки —
         * як L2 Interlude показує стеки зарядів. Не додаємо «/Max» щоб лишити
         * цифру читабельною всередині 28–32 px іконки.
         */
        if (typeof b.chargeCount === 'number' && b.chargeCount > 0) {
          var badge = document.createElement('span');
          badge.className = 'l2-battle-buff-icon__charge';
          badge.textContent = String(b.chargeCount);
          wrap.appendChild(badge);
        }
        strip.appendChild(wrap);
      })(icons[bi]);
    }
    if (needsDurTick) {
      function tickBuffDurations() {
        var els = strip.querySelectorAll('[data-buff-expires]');
        var any = false;
        for (var i = 0; i < els.length; i++) {
          var w = els[i];
          var exp = Number(w.getAttribute('data-buff-expires'));
          var tot = Number(w.getAttribute('data-buff-dur'));
          var ringEl = w.querySelector('.l2-battle-buff-icon__ring');
          if (!ringEl || !Number.isFinite(exp) || !Number.isFinite(tot) || tot <= 0) continue;
          var now = Date.now();
          var rem = Math.max(0, exp - now);
          var ratio = Math.min(1, rem / tot);
          if (ratio > 0.02) any = true;
          var deg = Math.round(ratio * 360);
          ringEl.style.background =
            'conic-gradient(#d94f4f ' +
            deg +
            'deg, rgba(217,79,79,0.32) ' +
            deg +
            'deg 360deg)';
          var base = w.getAttribute('data-title-base') || '';
          if (rem > 0 && ratio > 0.02) {
            w.title =
              base +
              ' · ' +
              tr('battle_buff_time_left', 'залишилось') +
              ' ~' +
              Math.ceil(rem / 1000) +
              ' с';
          } else {
            w.title = base;
          }
        }
        if (!any) clearBattleBuffStripTimer();
      }
      tickBuffDurations();
      battleBuffStripTimer = setInterval(tickBuffDurations, 200);
    }
  }

  /**
   * Sonic Focus заряди тепер малюються як окрема іконка-баф з бейджем «N/Max»
   * у `renderBuffStrip` (поряд з рештою бафів). Окремий рядок-dots залишаємо
   * прихованим, щоб не дублювати інформацію і не займати місце.
   */
  function renderSonicCharges(_battle) {
    var root = $('battle-sonic-charges');
    if (!root) return;
    root.hidden = true;
    root.innerHTML = '';
  }

  function renderMobAndLog(battle) {
    var title = $('battle-mob-title');
    var hpInner = $('battle-mob-hp-inner');
    var hpVal = $('battle-mob-hp-val');
    var mainMobLbl = document.querySelector(
      '.l2-battle-mob-hp-wrap .l2-battle-bar-lbl'
    );
    var debuffStripEl = $('battle-mob-debuff-strip');
    var logEl = $('battle-log');
    if (!battle) {
      if (title) title.textContent = '—';
      if (hpInner) hpInner.style.width = '0%';
      if (hpVal) hpVal.textContent = '';
      if (mainMobLbl) {
        mainMobLbl.textContent = 'HP';
        mainMobLbl.title = '';
      }
      if (debuffStripEl) {
        debuffStripEl.hidden = true;
        debuffStripEl.innerHTML = '';
      }
      var whirlEmpty = $('battle-whirlwind-extras');
      if (whirlEmpty) {
        whirlEmpty.hidden = true;
        whirlEmpty.textContent = '';
      }
      if (logEl) renderColoredLog(logEl, []);
      var toastEmpty = $('battle-toast');
      if (toastEmpty) toastEmpty.hidden = true;
      renderBuffStrip(null);
      return;
    }
    if (title) {
      var aggL = tr('battle_aggressive', 'агресивний');
      title.textContent =
        battle.mobName +
        ' · ур. ' +
        battle.mobLevel +
        (battle.aggressive ? ' · ' + aggL : '');
    }
    renderBuffStrip(battle);
    renderSonicCharges(battle);
    setBar(hpInner, battle.mobHp, battle.mobMaxHp);
    if (hpVal) {
      var numericMobHp = battleUsesNumericMobHp(battle);
      hpVal.textContent = mobHpBarLabelText(
        battle.kind,
        battle.mobHp,
        battle.mobMaxHp,
        battle.spawnId
      );
      hpVal.classList.toggle('l2-battle-bar-innertext--pair', numericMobHp);
    }
    if (debuffStripEl) {
      var debs = battle.mobDebuffIcons;
      var debSig = '';
      if (debs && debs.length) {
        debSig = debs
          .map(function (d) {
            return String(d.l2SkillId) + ':' + (d.labelUk || '');
          })
          .join('|');
      }
      if (debuffStripEl.dataset.debuffSig !== debSig) {
        debuffStripEl.dataset.debuffSig = debSig;
        debuffStripEl.innerHTML = '';
        if (debs && debs.length) {
          debuffStripEl.hidden = false;
          for (var di = 0; di < debs.length; di++) {
            var d = debs[di];
            var img = document.createElement('img');
            img.className = 'l2-battle-mob-debuff-icon';
            img.alt = d.labelUk || '';
            img.title = d.labelUk || '';
            img.src =
              window.L2 && typeof L2.resolveSkillIconUrl === 'function'
                ? L2.resolveSkillIconUrl(d.l2SkillId, null)
                : '/game/skill-icon/' + d.l2SkillId;
            img.addEventListener('error', function () {
              this.src = '/icons/drops/other.svg';
            });
            debuffStripEl.appendChild(img);
          }
        } else {
          debuffStripEl.hidden = true;
        }
      }
    }
    var whirlRoot = $('battle-whirlwind-extras');
    if (whirlRoot) {
      while (whirlRoot.firstChild) whirlRoot.removeChild(whirlRoot.firstChild);
      var wx = battle.whirlwindExtras;
      if (wx && wx.length) {
        whirlRoot.hidden = false;
        for (var wi = 0; wi < wx.length; wi++) {
          var ex = wx[wi];
          var wrap = document.createElement('div');
          wrap.className = 'l2-battle-whirlwind-extra';
          var lbl = document.createElement('span');
          lbl.className = 'l2-battle-whirlwind-extra__name';
          lbl.textContent =
            (ex.name && String(ex.name).length > 14
              ? String(ex.name).slice(0, 12) + '…'
              : ex.name) || '—';
          lbl.title = ex.name || '';
          var outer = document.createElement('div');
          outer.className =
            'l2-pers-bar-outer l2-battle-bar-outer l2-battle-mob-hp-outer l2-battle-whirlwind-extra__bar';
          outer.setAttribute('aria-hidden', 'true');
          var inner = document.createElement('div');
          inner.className = 'l2-pers-bar-inner l2-battle-mob-hp-inner';
          var pct = document.createElement('span');
          pct.className = 'l2-battle-bar-innertext';
          setBar(inner, ex.mobHp, ex.mobMaxHp);
          pct.textContent =
            window.L2 && typeof L2.formatBarPct === 'function'
              ? L2.formatBarPct(ex.mobHp, ex.mobMaxHp)
              : (function () {
                  var m = ex.mobMaxHp > 0 ? ex.mobMaxHp : 1;
                  var x = Math.max(0, Math.min(Number(ex.mobHp), m));
                  return ((x / m) * 100).toFixed(1) + '%';
                })();
          outer.appendChild(inner);
          outer.appendChild(pct);
          wrap.appendChild(lbl);
          wrap.appendChild(outer);
          whirlRoot.appendChild(wrap);
        }
      } else {
        whirlRoot.hidden = true;
      }
    }
    if (logEl) {
      var lines = getActiveBattleLogLines(battle);
      renderColoredLog(logEl, lines, {
        newestFirst: true,
        maxLines: BATTLE_LOG_MAX_VISIBLE,
      });
      // Не показуємо battle-toast з останнім рядком логу — дублікат «Лог бою».
    }
  }

  async function fetchJson(path, opts) {
    var t = localStorage.getItem('token');
    if (!t) return null;
    var r = await fetch(path, opts || {});
    if (r.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
      return null;
    }
    if (!r.ok) return { _err: r.status, raw: r };
    return r.json();
  }

  async function loadCharacter() {
    return fetchJson('/character', {
      headers: { Authorization: 'Bearer ' + localStorage.getItem('token') },
    });
  }

  async function getBattleState() {
    return fetchJson('/game/battle', {
      headers: { Authorization: 'Bearer ' + localStorage.getItem('token') },
    });
  }

  async function startPvpBattle(targetCharacterId, expectedRevision) {
    return fetchJson('/game/battle/pvp/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('token'),
      },
      body: JSON.stringify({
        targetCharacterId: targetCharacterId,
        expectedRevision: expectedRevision,
      }),
    });
  }

  async function startBattle(spawnId, expectedRevision) {
    return fetchJson('/game/battle/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('token'),
      },
      body: JSON.stringify({ spawnId: spawnId, expectedRevision: expectedRevision }),
    });
  }

  async function startHuntContinueBattle(
    expectedRevision,
    excludeSpawnId,
    preferredSpawnId,
    targetLevel
  ) {
    var body = {
      expectedRevision: expectedRevision,
    };
    if (excludeSpawnId) body.excludeSpawnId = excludeSpawnId;
    if (preferredSpawnId) body.preferredSpawnId = preferredSpawnId;
    if (typeof targetLevel === 'number' && targetLevel >= 1) {
      body.targetLevel = Math.floor(targetLevel);
    }
    return fetchJson('/game/battle/hunt-continue', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('token'),
      },
      body: JSON.stringify(body),
    });
  }

  async function parseFetchErrorUk(st, fallback) {
    var msg = fallback;
    if (st && st.raw) {
      try {
        var ej = await st.raw.json();
        msg = battleErrorMessageUk(ej, fallback);
      } catch (e) {
        /* ignore */
      }
    }
    return msg;
  }

  async function battleAction(action, expectedRevision, extraBody) {
    var body = { action: action, expectedRevision: expectedRevision };
    if (extraBody && typeof extraBody === 'object') {
      for (var kb in extraBody) {
        if (!Object.prototype.hasOwnProperty.call(extraBody, kb)) continue;
        body[kb] = extraBody[kb];
      }
    }
    return fetchJson('/game/battle/action', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('token'),
      },
      body: JSON.stringify(body),
    });
  }

  async function leaveBattle(expectedRevision) {
    return fetchJson('/game/battle/leave', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('token'),
      },
      body: JSON.stringify({ expectedRevision: expectedRevision }),
    });
  }

  async function returnToNearestTown(expectedRevision) {
    return fetchJson('/game/battle/return-to-town', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('token'),
      },
      body: JSON.stringify({ expectedRevision: expectedRevision }),
    });
  }

  async function init() {
    if (window.L2 && typeof L2.mountL2Nav === 'function') {
      L2.mountL2Nav({
        onStub: function (label) {
          alert('«' + label + '» — ' + tr('battle_stub_alert', 'заглушка.'));
        },
      });
    }

    var params = new URLSearchParams(window.location.search);
    var spawnId = params.get('spawnId');
    var pvpTargetId = params.get('pvpTargetId');
    var pvpDeathMode =
      params.get('pvpDeath') === '1' || params.get('pvpDeath') === 'true';
    var pveDeathMode =
      params.get('pveDeath') === '1' || params.get('pveDeath') === 'true';
    var isPvpMode = !!pvpTargetId;
    var errEl = $('battle-load-err');
    var content = $('battle-content');

    if (!spawnId && !pvpTargetId && !pvpDeathMode && !pveDeathMode) {
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent = tr(
          'battle_err_no_target',
          'Не вказано ціль бою. Перейди через карту.'
        );
      }
      return;
    }

    var t = localStorage.getItem('token');
    if (!t) {
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent = tr('battle_need_login', 'Потрібен вхід.');
      }
      return;
    }

    var state = await getBattleState();
    if (!state || state._err || !state.character) {
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent = tr('battle_err_state', 'Не вдалося отримати стан бою.');
      }
      return;
    }

    if (window.L2 && typeof L2.setLastSnapshot === 'function') {
      L2.setLastSnapshot(state.character);
    }
    if (window.L2 && typeof L2.applyHudFromSnapshot === 'function') {
      L2.applyHudFromSnapshot(state.character);
    }
    if (window.L2 && typeof L2.applyPvpIncoming === 'function') {
      L2.applyPvpIncoming(state.pvpIncoming || null, function (cid) {
        if (!cid) return;
        window.location.href = '/battle.html?pvpTargetId=' + encodeURIComponent(cid);
      });
    }
    if (window.L2 && typeof L2.fetchCatalogHints === 'function') {
      await L2.fetchCatalogHints();
    } else if (
      window.L2BattleHotbar &&
      typeof L2BattleHotbar.mergeCharacterCatalog === 'function'
    ) {
      L2BattleHotbar.mergeCharacterCatalog({ character: state.character });
    }

    var character = state.character;
    var battle = state.battle;
    var battleHotbar = null;
    var battleSyncTimer = null;
    var BATTLE_SYNC_MS = 5000;
    var lastBattleVisualSig = '';

    function battleVisualSig(c, b) {
      if (!c || !b) return '';
      var lines = getActiveBattleLogLines(b);
      var tail0 = lines.length > 0 ? String(lines[lines.length - 1]) : '';
      var tail1 = lines.length > 1 ? String(lines[lines.length - 2]) : '';
      return [
        String(c.revision != null ? c.revision : ''),
        String(c.hp != null ? c.hp : ''),
        String(c.maxHp != null ? c.maxHp : ''),
        String(b.mobHp != null ? b.mobHp : ''),
        String(b.mobMaxHp != null ? b.mobMaxHp : ''),
        String(lines.length),
        tail0,
        tail1,
      ].join('\u001f');
    }

    function refreshBattleUI(force) {
      if (!force) {
        var sig = battleVisualSig(character, battle);
        if (sig === lastBattleVisualSig) {
          renderPlayerBars(character);
          return;
        }
        lastBattleVisualSig = sig;
      } else {
        lastBattleVisualSig = battleVisualSig(character, battle);
      }
      refreshUI();
    }

    function stopBattleSyncPoll() {
      if (battleSyncTimer != null) {
        clearInterval(battleSyncTimer);
        battleSyncTimer = null;
      }
    }

    function latestCharacterRevision() {
      var ls = window.L2 && L2.lastSnapshot ? L2.lastSnapshot() : null;
      if (ls && ls.revision != null) return ls.revision;
      return character && character.revision != null ? character.revision : null;
    }

    function battleSyncIntervalMs() {
      if (battle && battle.spawnId && String(battle.spawnId).indexOf('pvp:') === 0) {
        return 5000;
      }
      if (battle && mobKindUsesNumericHpBar(battle.kind)) return 10000;
      return BATTLE_SYNC_MS;
    }

    async function syncBattleFromServer() {
      var st = await getBattleState();
      if (!st || st._err || !st.character) return false;
      character = st.character;
      battle = st.battle;
      if (window.L2 && L2.setLastSnapshot) L2.setLastSnapshot(character);
      if (window.L2 && L2.applyHudFromSnapshot) L2.applyHudFromSnapshot(character);
      if (checkPvpDefeatFromCharacter(character)) {
        stopBattleSyncPoll();
        return true;
      }
      if (checkPveDefeatFromCharacter(character)) {
        renderPlayerBars(character);
        stopBattleSyncPoll();
        return true;
      }
      if (!battle) {
        var savedDef = loadDefeatFromSession();
        if (savedDef) {
          renderPlayerBars(character);
          showDefeatScreen(savedDef);
          stopBattleSyncPoll();
          return true;
        }
        return false;
      }
      refreshBattleUI(false);
      return false;
    }

    async function resyncBattleAfterConflict(conflictBody) {
      if (window.L2 && typeof L2.resyncCharacterAfterConflict === 'function') {
        try {
          await L2.resyncCharacterAfterConflict(function (snap) {
            character = snap;
          }, conflictBody);
        } catch (eResync) {
          /* fallback нижче */
        }
      } else if (conflictBody && conflictBody.character) {
        character = conflictBody.character;
        if (window.L2 && L2.setLastSnapshot) L2.setLastSnapshot(character);
      } else if (
        conflictBody &&
        typeof conflictBody.serverRevision === 'number' &&
        character
      ) {
        character = Object.assign({}, character, {
          revision: conflictBody.serverRevision,
        });
        if (window.L2 && L2.setLastSnapshot) L2.setLastSnapshot(character);
      }
      var st = await getBattleState();
      if (!st || st._err || !st.character) return 'retry';
      character = st.character;
      battle = st.battle;
      if (window.L2 && L2.setLastSnapshot) L2.setLastSnapshot(character);
      if (window.L2 && L2.applyHudFromSnapshot) L2.applyHudFromSnapshot(character);
      if (checkPvpDefeatFromCharacter(character)) {
        stopBattleSyncPoll();
        return 'abort';
      }
      if (checkPveDefeatFromCharacter(character)) {
        stopBattleSyncPoll();
        return 'abort';
      }
      if (!battle) {
        var savedDef = loadDefeatFromSession();
        if (savedDef) {
          renderPlayerBars(character);
          showDefeatScreen(savedDef);
          stopBattleSyncPoll();
          return 'abort';
        }
        refreshUI();
        return 'abort';
      }
      refreshUI();
      return 'retry';
    }

    async function performBattleActionWithResync(action, extraBody) {
      var MAX = 4;
      var lastRes = null;
      for (var attempt = 0; attempt < MAX; attempt++) {
        var rev = latestCharacterRevision();
        if (!rev) return { _err: 'no_revision' };
        try {
          lastRes = await battleAction(action, rev, extraBody);
        } catch (eNet) {
          return { _err: 'network' };
        }
        if (!lastRes || lastRes._err !== 409) return lastRes;
        var conflictBody = await parseActionErrorBodySafe(lastRes);
        var syncOutcome = await resyncBattleAfterConflict(conflictBody);
        if (syncOutcome === 'abort') return lastRes;
        if (attempt < MAX - 1) {
          await new Promise(function (resolve) {
            setTimeout(resolve, 80);
          });
        }
      }
      return lastRes;
    }

    async function after409ResyncBattleState(conflictRes) {
      var conflictBody = conflictRes
        ? await parseActionErrorBodySafe(conflictRes)
        : null;
      var syncOutcome = await resyncBattleAfterConflict(conflictBody);
      return syncOutcome === 'abort';
    }

    function applyBattleMutationResult(res) {
      character = res.character;
      battle = res.battle;
      if (window.L2 && L2.setLastSnapshot) L2.setLastSnapshot(character);
      if (checkPvpDefeatFromCharacter(character)) {
        stopBattleSyncPoll();
        return 'pvp_defeat';
      }
      if (checkPveDefeatFromCharacter(character)) {
        stopBattleSyncPoll();
        return 'defeat';
      }
      if (res.victory) return 'victory';
      if (res.defeat) return 'defeat';
      return 'continue';
    }

    async function parseActionErrorBodySafe(res) {
      if (!res || !res.raw) return null;
      try {
        return await res.raw.json();
      } catch (eBody) {
        return null;
      }
    }

    async function finalizeBattleActionResponse(res) {
      var outcome = applyBattleMutationResult(res);
      if (outcome === 'pvp_defeat') return;
      if (outcome === 'victory') {
        await handleVictoryOutcome(res.victory);
        return;
      }
      if (outcome === 'defeat') {
        renderPlayerBars(character);
        showDefeatScreen(res.defeat);
        return;
      }
      refreshUI();
      if (!battle) {
        var logElFin = $('battle-log');
        if (logElFin) renderColoredLog(logElFin, [tr('battle_log_done', 'Бій завершено.')]);
        showBattleToast(tr('battle_log_done_toast', 'Бій завершено.'));
        stopBattleSyncPoll();
      }
    }

    function startBattleSyncPoll() {
      stopBattleSyncPoll();
      function pollTick() {
        if (isDefeatScreenActive()) {
          stopBattleSyncPoll();
          return;
        }
        var vicRootPoll = $('battle-victory-root');
        if (vicRootPoll && !vicRootPoll.hidden) {
          stopBattleSyncPoll();
          return;
        }
        if (battleActionInFlight || battleNavInFlight) return;
        syncBattleFromServer().then(function (recovered) {
          if (recovered) return;
          if (!battle) stopBattleSyncPoll();
        });
      }
      pollTick();
      battleSyncTimer = setInterval(pollTick, battleSyncIntervalMs());
    }

    async function handleBattleActionError(res, parsedErrBody) {
      if (isNotInBattleErrorBody(parsedErrBody)) {
        battle = null;
        if (await syncBattleFromServer()) return true;
      }
      if (res && res._err) {
        showBattleToast(
          battleErrorMessageUk(
            parsedErrBody,
            tr('battle_toast_action_fail', 'Дія не виконалася (код ') +
              res._err +
              ').'
          )
        );
      } else {
        showBattleToast(tr('battle_toast_no_response', 'Немає відповіді від сервера.'));
      }
      return false;
    }

    if (battle && battle.spawnId) {
      try {
        var uFix0 = new URL(window.location.href);
        if (battle.spawnId.indexOf('pvp:') === 0) {
          var tid = battle.spawnId.slice('pvp:'.length);
          isPvpMode = true;
          pvpTargetId = tid;
          uFix0.searchParams.delete('spawnId');
          uFix0.searchParams.set('pvpTargetId', tid);
          window.history.replaceState({}, '', uFix0.pathname + uFix0.search);
        } else if (battle.spawnId !== spawnId) {
          spawnId = battle.spawnId;
          isPvpMode = false;
          uFix0.searchParams.delete('pvpTargetId');
          uFix0.searchParams.set('spawnId', spawnId);
          window.history.replaceState({}, '', uFix0.pathname + uFix0.search);
        }
      } catch (eFix0) {
        /* ignore */
      }
    }

    function applyPvpStartResult(st) {
      saveVictoryToSession(null);
      clearDefeatFromSession();
      lastVictorySummary = null;
      character = st.character;
      battle = st.battle;
      if (window.L2 && L2.setLastSnapshot) L2.setLastSnapshot(character);
      if (window.L2 && L2.applyHudFromSnapshot) L2.applyHudFromSnapshot(character);
      if (content) content.hidden = false;
      if (errEl) errEl.hidden = true;
      hideVictoryScreen();
      refreshUI();
    }

    async function ensurePvpBattle() {
      var expectedPvpSpawn =
        pvpTargetId ? 'pvp:' + String(pvpTargetId) : '';
      if (
        battle &&
        expectedPvpSpawn &&
        battle.spawnId === expectedPvpSpawn
      ) {
        return true;
      }
      var er = latestCharacterRevision();
      var st = await startPvpBattle(pvpTargetId, er);
      if (st && st._err === 409) {
        var again = await loadCharacter();
        if (again && again.character) {
          character = again.character;
          L2.setLastSnapshot(character);
          st = await startPvpBattle(pvpTargetId, latestCharacterRevision());
        }
      }
      if (!st || st._err) {
        var pvpMsg = tr('battle_err_pvp_start', 'Не вдалося розпочати PvP-бій.');
        if (st && st.raw) {
          try {
            var pej = await st.raw.json();
            if (pej && pej.messageUk) pvpMsg = pej.messageUk;
          } catch (ePvp) {
            /* ignore */
          }
        }
        if (errEl) {
          errEl.hidden = false;
          errEl.textContent = pvpMsg;
        }
        return false;
      }
      applyPvpStartResult(st);
      return true;
    }

    function applyHuntContinueResult(st) {
      saveVictoryToSession(null);
      clearDefeatFromSession();
      lastVictorySummary = null;
      character = st.character;
      battle = st.battle;
      if (window.L2 && L2.setLastSnapshot) L2.setLastSnapshot(character);
      if (window.L2 && L2.applyHudFromSnapshot) L2.applyHudFromSnapshot(character);
      if (st.battle && st.battle.spawnId) {
        spawnId = st.battle.spawnId;
        try {
          var uFix = new URL(window.location.href);
          uFix.searchParams.set('spawnId', spawnId);
          window.history.replaceState({}, '', uFix.pathname + uFix.search);
        } catch (eFix) {
          /* ignore */
        }
      }
      var content = $('battle-content');
      var errEl = $('battle-load-err');
      if (content) content.hidden = false;
      if (errEl) errEl.hidden = true;
      hideVictoryScreen();
      refreshUI();
    }

    async function tryStartHuntContinue(excludeSpawnId, preferredSpawnId, targetLevel) {
      var st = await startHuntContinueBattle(
        latestCharacterRevision(),
        excludeSpawnId,
        preferredSpawnId,
        targetLevel
      );
      if (st && st._err === 409) {
        var huntConflict = await parseActionErrorBodySafe(st);
        if (window.L2 && typeof L2.resyncCharacterAfterConflict === 'function') {
          try {
            await L2.resyncCharacterAfterConflict(function (snap) {
              character = snap;
            }, huntConflict);
          } catch (eHc) {
            /* ignore */
          }
        } else {
          var again = await loadCharacter();
          if (again && again.character) {
            character = again.character;
            if (window.L2 && L2.setLastSnapshot) L2.setLastSnapshot(character);
          }
        }
        st = await startHuntContinueBattle(
          latestCharacterRevision(),
          excludeSpawnId,
          preferredSpawnId,
          targetLevel
        );
      }
      if (st && !st._err && st.battle && st.battle.spawnId) {
        applyHuntContinueResult(st);
        return true;
      }
      return false;
    }

    async function ensureBattle() {
      if (isPvpMode) {
        return ensurePvpBattle();
      }
      if (character && character.pveDefeat) {
        showDefeatScreen(character.pveDefeat);
        return false;
      }
      if (battle && battle.spawnId === spawnId) {
        return true;
      }
      var er = latestCharacterRevision();
      var st = await startBattle(spawnId, er);
      if (st && st._err === 409) {
        var startConflict = await parseActionErrorBodySafe(st);
        if (window.L2 && typeof L2.resyncCharacterAfterConflict === 'function') {
          try {
            await L2.resyncCharacterAfterConflict(function (snap) {
              character = snap;
            }, startConflict);
          } catch (eStartResync) {
            /* ignore */
          }
        }
        var synced = await getBattleState();
        if (synced && synced.character) {
          character = synced.character;
          battle = synced.battle;
          if (L2.setLastSnapshot) L2.setLastSnapshot(character);
        }
        if (battle && battle.spawnId === spawnId) {
          resetHuntLogChain();
          refreshUI();
          return true;
        }
        st = await startBattle(spawnId, latestCharacterRevision());
      }
      if (!st || st._err) {
        var msg = tr('battle_err_start', 'Не вдалося розпочати бій.');
        var errCode = '';
        if (st && st.raw) {
          try {
            var ej = await st.raw.json();
            if (ej && ej.messageUk) msg = ej.messageUk;
            if (ej && ej.error) errCode = String(ej.error);
          } catch (e) {
            /* ignore */
          }
        }
        if (errCode === 'pve_defeat_pending') {
          var syncedDef = await getBattleState();
          if (syncedDef && syncedDef.character) {
            character = syncedDef.character;
            if (L2.setLastSnapshot) L2.setLastSnapshot(character);
            if (L2.applyHudFromSnapshot) L2.applyHudFromSnapshot(character);
            if (character.pveDefeat) {
              renderPlayerBars(character);
              showDefeatScreen(character.pveDefeat);
              return false;
            }
          }
        }
        if (errCode === 'mob_on_respawn') {
          msg = tr(
            'battle_hunt_respawn_hint',
            'Моб на респавні. Натисни «Полювати далі» — знайдемо іншого поруч.'
          );
        }
        if (errEl) {
          errEl.hidden = false;
          errEl.textContent = msg;
        }
        return false;
      }
      character = st.character;
      battle = st.battle;
      if (window.L2 && L2.setLastSnapshot) L2.setLastSnapshot(character);
      resetHuntLogChain();
      return true;
    }

    async function runSkill(action) {
      await runWithBattleActionLock(async function () {
        var vicRoot = $('battle-victory-root');
        var defRoot = $('battle-defeat-root');
        if (
          !action ||
          (vicRoot && !vicRoot.hidden) ||
          (defRoot && !defRoot.hidden)
        ) {
          return;
        }
        if (!battle) {
          if (await syncBattleFromServer()) return;
          return;
        }
        var act = action;
        if (
          window.L2BattleHotbar &&
          typeof L2BattleHotbar.canonicalBattleActionId === 'function'
        ) {
          act = L2BattleHotbar.canonicalBattleActionId(action);
        }
        if (battleHotbar && typeof battleHotbar.primeSkillCd === 'function') {
          battleHotbar.primeSkillCd(act);
        }
        var res;
        try {
          res = await performBattleActionWithResync(act);
        } catch (e) {
          showBattleToast(tr('battle_toast_network', 'Збій мережі або сервера.'));
          return;
        }
        if (!res || res._err) {
          async function parseErrorBodySafe(resp) {
            if (!resp || !resp.raw) return null;
            try {
              return await resp.raw.json();
            } catch (eBody) {
              return null;
            }
          }
          var parsedErrBody = await parseErrorBodySafe(res);
          var canAutoRetryCd =
            typeof act === 'string' &&
            /^l2_\d+$/.test(act) &&
            res &&
            res._err === 400 &&
            parsedErrBody &&
            parsedErrBody.code === 'battle_skill_not_allowed' &&
            parsedErrBody.reason === 'cooldown' &&
            typeof parsedErrBody.remainingCooldownMs === 'number' &&
            Number.isFinite(parsedErrBody.remainingCooldownMs) &&
            parsedErrBody.remainingCooldownMs >= 0;
          if (canAutoRetryCd) {
            var waitMs = Math.min(
              2200,
              Math.max(0, Math.floor(parsedErrBody.remainingCooldownMs)) + 30
            );
            if (waitMs > 0) {
              await new Promise(function (resolve) {
                setTimeout(resolve, waitMs);
              });
            }
            try {
              res = await performBattleActionWithResync(act);
            } catch (eRetry) {
              showBattleToast(tr('battle_toast_network', 'Збій мережі або сервера.'));
              return;
            }
            parsedErrBody = await parseErrorBodySafe(res);
          }
          if (!res) {
            showBattleToast(tr('battle_toast_no_response', 'Немає відповіді від сервера.'));
            return;
          }
          if (res._err) {
            if (await handleBattleActionError(res, parsedErrBody)) return;
            return;
          }
        }
        var outcome = applyBattleMutationResult(res);
        if (battleHotbar && typeof battleHotbar.notifySkillUsed === 'function') {
          battleHotbar.notifySkillUsed(act, battle);
        }
        if (outcome === 'pvp_defeat') return;
        if (outcome === 'victory') {
          await handleVictoryOutcome(res.victory);
          return;
        }
        if (outcome === 'defeat') {
          renderPlayerBars(character);
          showDefeatScreen(res.defeat);
          return;
        }
        refreshUI();
        if (!battle) {
          var logElDone = $('battle-log');
          if (logElDone) renderColoredLog(logElDone, [tr('battle_log_done', 'Бій завершено.')]);
          showBattleToast(tr('battle_log_done_toast', 'Бій завершено.'));
          stopBattleSyncPoll();
        }
      });
    }

    async function runFighterSoulshotToggle(itemId) {
      await runWithBattleActionLock(async function () {
      if (typeof itemId !== 'number' || itemId <= 0) return;
      if (!battle) {
        if (await syncBattleFromServer()) return;
        return;
      }
      var act = 'fighter_soulshot_toggle';
      var extra = { itemId: Math.floor(itemId) };
      var res;
      try {
        res = await performBattleActionWithResync(act, extra);
      } catch (e) {
        showBattleToast(tr('battle_toast_network', 'Збій мережі або сервера.'));
        return;
      }
      if (!res || res._err) {
        var ej2 = await parseActionErrorBodySafe(res);
        if (await handleBattleActionError(res, ej2)) return;
        return;
      }
      await finalizeBattleActionResponse(res);
      });
    }

    async function runMysticSpiritshotToggle(itemId) {
      await runWithBattleActionLock(async function () {
      if (typeof itemId !== 'number' || itemId <= 0) return;
      if (!battle) {
        if (await syncBattleFromServer()) return;
        return;
      }
      var act = 'mystic_spiritshot_toggle';
      var extra = { itemId: Math.floor(itemId) };
      var res;
      try {
        res = await performBattleActionWithResync(act, extra);
      } catch (e) {
        showBattleToast(tr('battle_toast_network', 'Збій мережі або сервера.'));
        return;
      }
      if (!res || res._err) {
        var ej2m = await parseActionErrorBodySafe(res);
        if (await handleBattleActionError(res, ej2m)) return;
        return;
      }
      await finalizeBattleActionResponse(res);
      });
    }

    async function runBattlePotionUse(itemId) {
      await runWithBattleActionLock(async function () {
      if (typeof itemId !== 'number' || itemId <= 0) return;
      if (!battle) {
        if (await syncBattleFromServer()) return;
        return;
      }
      var act = 'battle_potion_use';
      var extra = { itemId: Math.floor(itemId) };
      var res;
      try {
        res = await performBattleActionWithResync(act, extra);
      } catch (e) {
        showBattleToast(tr('battle_toast_network', 'Збій мережі або сервера.'));
        return;
      }
      if (!res || res._err) {
        var ejP = await parseActionErrorBodySafe(res);
        if (await handleBattleActionError(res, ejP)) return;
        return;
      }
      await finalizeBattleActionResponse(res);
      });
    }

    var DEFEAT_LOG_MAX = 12;
    var pvpDefeatTrapInstalled = false;

    function trapPvpDefeatBack() {
      if (pvpDefeatTrapInstalled) return;
      pvpDefeatTrapInstalled = true;
      try {
        history.pushState({ l2PvpDefeatTrap: 1 }, '', location.href);
      } catch (eTrap) {
        /* ignore */
      }
      window.addEventListener('popstate', function () {
        try {
          history.pushState({ l2PvpDefeatTrap: 1 }, '', location.href);
        } catch (eTrap2) {
          /* ignore */
        }
      });
    }

    function hideBackNavForPvpDefeat() {
      var back = $('battle-back-map');
      var vMap = $('battle-victory-map');
      if (back) back.hidden = true;
      if (vMap) vMap.hidden = true;
    }

    function showPvpDefeatScreen(pvpDefeat) {
      stopBattleSyncPoll();
      var active = $('battle-active-root');
      var vicRoot = $('battle-victory-root');
      var defRoot = $('battle-defeat-root');
      if (active) active.hidden = true;
      if (vicRoot) vicRoot.hidden = true;
      if (defRoot) defRoot.hidden = false;
      var mobHead = $('battle-defeat-mobhead');
      if (mobHead) mobHead.textContent = '';
      var shout = defRoot
        ? defRoot.querySelector('.l2-battle-defeat-notify__shout')
        : null;
      if (shout) {
        shout.textContent =
          'Вас вбив гравець [' + (pvpDefeat.killerName || '—') + ']!';
      }
      var hint = $('battle-defeat-town-hint');
      if (hint) {
        hint.textContent =
          'Натисни «Повернутися в місто» або «Город» — опинишся у найближчому селищі.';
      }
      var dlog = $('battle-defeat-log');
      if (dlog) {
        if (pvpDefeat && pvpDefeat.fullLog && pvpDefeat.fullLog.length) {
          var pvpTail = defeatLogTail(pvpDefeat.fullLog, DEFEAT_LOG_MAX);
          pvpTail = pvpTail.filter(function (line) {
            return String(line).indexOf('Вас вбив гравець') === -1;
          });
          renderColoredLog(dlog, pvpTail, { newestFirst: false });
        } else {
          dlog.innerHTML = '';
        }
      }
      hideBackNavForPvpDefeat();
      trapPvpDefeatBack();
    }

    function checkPvpDefeatFromCharacter(c) {
      if (c && c.pvpDefeat) {
        showPvpDefeatScreen(c.pvpDefeat);
        return true;
      }
      return false;
    }

    function checkPveDefeatFromCharacter(c) {
      if (c && c.pveDefeat) {
        renderPlayerBars(c);
        showDefeatScreen(c.pveDefeat);
        return true;
      }
      return false;
    }

    function fillVictoryMobHead(el, v) {
      if (!el || !v) return;
      el.textContent = '';
      var nameSpan = document.createElement('span');
      nameSpan.className = 'l2-battle-victory-mobhead__name';
      nameSpan.textContent = v.mobName;
      el.appendChild(nameSpan);
      if (v.aggressive) {
        var agr = document.createElement('span');
        agr.className = 'l2-battle-victory-mobhead__agr';
        agr.textContent = tr('battle_mob_aggro', ' (агр)');
        el.appendChild(agr);
      }
      var lvl = document.createElement('span');
      lvl.className = 'l2-battle-victory-mobhead__lvl';
      lvl.textContent = tr('battle_mob_lvl_short', ' · ур. ') + v.mobLevel;
      el.appendChild(lvl);
    }

    function hideVictoryScreen() {
      var active = $('battle-active-root');
      var vicRoot = $('battle-victory-root');
      if (active) active.hidden = false;
      if (vicRoot) vicRoot.hidden = true;
    }

    var lastVictorySummary = null;

    async function huntContinueManual(victory) {
      var vContBtn = $('battle-victory-continue');
      var vHuntBtn = $('battle-victory-hunt');
      if (vContBtn) vContBtn.disabled = true;
      if (vHuntBtn) vHuntBtn.disabled = true;

      try {
        var excludeId =
          victory && victory.spawnId ? victory.spawnId : spawnId;
        var preferredId =
          victory && victory.nextHuntSpawnId
            ? victory.nextHuntSpawnId
            : undefined;
        var huntLevel =
          victory && victory.mobLevel != null
            ? Math.floor(Number(victory.mobLevel))
            : undefined;
        freezeLogForHuntContinue(victory, battle);
        var ok = await tryStartHuntContinue(excludeId, preferredId, huntLevel);
        if (ok) return;

        showBattleToast(
          tr(
            'battle_hunt_abort',
            'Полювання перервано — не вдалося продовжити бій.'
          ),
          { long: true }
        );
        if (victory) showVictoryScreen(victory);
      } finally {
        if (vContBtn) vContBtn.disabled = false;
        if (vHuntBtn) vHuntBtn.disabled = false;
      }
    }

    async function handleVictoryOutcome(victory) {
      clearDefeatFromSession();
      renderPlayerBars(character);
      showVictoryScreen(victory);
    }

    function showVictoryScreen(victory) {
      lastVictorySummary = victory || null;
      saveVictoryToSession(victory);
      var active = $('battle-active-root');
      var vicRoot = $('battle-victory-root');
      var defRoot = $('battle-defeat-root');
      if (active) active.hidden = true;
      if (defRoot) defRoot.hidden = true;
      if (vicRoot) vicRoot.hidden = false;
      var isPvpVic =
        victory &&
        (victory.isPvp ||
          (victory.spawnId && String(victory.spawnId).indexOf('pvp:') === 0));
      var shoutEl = vicRoot
        ? vicRoot.querySelector('.l2-battle-victory-notify__shout')
        : null;
      if (shoutEl && isPvpVic) {
        shoutEl.textContent =
          'Ви перемогли гравця [' + (victory.mobName || '—') + ']!';
      } else if (shoutEl) {
        shoutEl.textContent = tr(
          'battle_victory_shout',
          'ВИ ПЕРЕМОГЛИ МОНСТРА!'
        );
      }
      fillVictoryMobHead($('battle-victory-mobhead'), isPvpVic ? null : victory);
      var lu = $('battle-victory-levelup');
      if (lu) {
        if (victory && victory.levelUp) {
          lu.hidden = false;
          lu.textContent = tr('battle_level_new', 'Новий рівень: ') + victory.levelUp + '!';
        } else {
          lu.hidden = true;
          lu.textContent = '';
        }
      }
      var lootLine = $('battle-victory-lootline');
      if (lootLine && victory) {
        fillVictoryLootLine(lootLine, victory);
      }
      var vlog = $('battle-victory-log');
      if (vlog && victory && victory.fullLog) {
        /* Повний лог як під час бою (той самий порядок: новіші зверху) + нагороди вже в кінці масиву від сервера. */
        renderColoredLog(vlog, victory.fullLog, {
          showDropIcons: true,
          newestFirst: true,
          items: victory.items || [],
        });
      }
      var vHuntBtn = $('battle-victory-hunt');
      var vContBtn = $('battle-victory-continue');
      if (vContBtn) {
        vContBtn.hidden = false;
        vContBtn.disabled = false;
        vContBtn.textContent = isPvpVic
          ? tr('battle_back_map', 'До карти')
          : tr('battle_continue', 'Продовжити');
        vContBtn.classList.add('l2-battle-victory-link--primary');
        vContBtn.classList.remove('l2-battle-victory-link--muted');
      }
      if (vHuntBtn) {
        vHuntBtn.hidden = !!isPvpVic;
        if (!isPvpVic) {
          vHuntBtn.disabled = false;
          vHuntBtn.classList.remove('l2-battle-victory-link--primary');
          vHuntBtn.classList.add('l2-battle-victory-link--muted');
        }
      }
      if (isPvpVic) {
        var luPvp = $('battle-victory-levelup');
        if (luPvp) {
          luPvp.hidden = true;
          luPvp.textContent = '';
        }
        var lootPvp = $('battle-victory-lootline');
        if (lootPvp) lootPvp.textContent = '';
      }
    }

    /** Останні рядки логу навколо фінального повідомлення поразки. */
    function defeatLogTail(fullLog, maxLines) {
      var arr = fullLog || [];
      for (var di = 0; di < arr.length; di++) {
        var line = String(arr[di]);
        if (
          line.indexOf('Ти знепритомнів') !== -1 ||
          line.indexOf('Вас вбив гравець') !== -1
        ) {
          var start = Math.max(0, di - maxLines + 1);
          return arr.slice(start, di + 1);
        }
      }
      return arr.slice(-maxLines);
    }

    function fillDefeatMobHead(el, d) {
      if (!el || !d) return;
      el.textContent = '';
      var nameSpan = document.createElement('span');
      nameSpan.className = 'l2-battle-defeat-mobhead__name';
      nameSpan.textContent = d.mobName;
      el.appendChild(nameSpan);
      if (d.aggressive) {
        var agr = document.createElement('span');
        agr.className = 'l2-battle-defeat-mobhead__agr';
        agr.textContent = tr('battle_mob_aggro', ' (агр)');
        el.appendChild(agr);
      }
      var lvl = document.createElement('span');
      lvl.className = 'l2-battle-defeat-mobhead__lvl';
      lvl.textContent = tr('battle_mob_lvl_short', ' · ур. ') + d.mobLevel;
      el.appendChild(lvl);
    }

    function showDefeatScreen(defeat) {
      saveDefeatToSession(defeat);
      stopBattleSyncPoll();
      battle = null;
      var contentEl = $('battle-content');
      var errLoad = $('battle-load-err');
      if (contentEl) contentEl.hidden = false;
      if (errLoad) errLoad.hidden = true;
      var active = $('battle-active-root');
      var vicRoot = $('battle-victory-root');
      var defRoot = $('battle-defeat-root');
      if (active) active.hidden = true;
      if (vicRoot) vicRoot.hidden = true;
      if (defRoot) defRoot.hidden = false;
      var isPvpDef = defeat && defeat.isPvp && defeat.killerName;
      if (isPvpDef) {
        var mobHead = $('battle-defeat-mobhead');
        if (mobHead) mobHead.textContent = '';
        var shout = defRoot
          ? defRoot.querySelector('.l2-battle-defeat-notify__shout')
          : null;
        if (shout) {
          shout.textContent =
            'Вас вбив гравець [' + defeat.killerName + ']!';
        }
        hideBackNavForPvpDefeat();
        trapPvpDefeatBack();
      } else {
        fillDefeatMobHead($('battle-defeat-mobhead'), defeat);
        var backMap = $('battle-back-map');
        if (backMap) backMap.hidden = true;
        var vMapBtn = $('battle-victory-map');
        if (vMapBtn) vMapBtn.hidden = true;
      }
      var hint = $('battle-defeat-town-hint');
      if (hint && defeat) {
        hint.textContent =
          tr('battle_defeat_hint_prefix', 'Тебе віднесли до ') +
          defeat.nearestTownLabelUk +
          tr('battle_defeat_hint_suffix', '. Натисни «Повернутися в місто».');
      }
      var dlog = $('battle-defeat-log');
      if (dlog && defeat && defeat.fullLog) {
        var tail = defeatLogTail(defeat.fullLog, DEFEAT_LOG_MAX);
        renderColoredLog(dlog, tail, { newestFirst: false });
      }
    }

    function refreshUI() {
      renderPlayerBars(character);
      renderMobAndLog(battle);
      var skillsBox = $('battle-skills');
      if (
        battle &&
        skillsBox &&
        window.L2BattleHotbar &&
        typeof L2BattleHotbar.mount === 'function'
      ) {
        if (!battleHotbar) {
          battleHotbar = L2BattleHotbar.mount({
            container: skillsBox,
            getBattle: function () {
              return battle;
            },
            getCharacter: function () {
              return character;
            },
            setCharacter: function (c) {
              character = c;
            },
            onBattleAction: function (action) {
              runSkill(action);
            },
            onFighterSoulshotToggle: function (itemId) {
              runFighterSoulshotToggle(itemId);
            },
            onMysticSpiritshotToggle: function (itemId) {
              runMysticSpiritshotToggle(itemId);
            },
            onBattlePotionUse: function (itemId) {
              runBattlePotionUse(itemId);
            },
            getToken: function () {
              return localStorage.getItem('token');
            },
            showToast: showBattleToast,
          });
        }
        battleHotbar.render();
      } else {
        if (skillsBox) skillsBox.innerHTML = '';
      }
    }

    async function goToMap() {
      await runWithBattleNavLock(async function () {
        resetHuntLogChain();
        if (battle && latestCharacterRevision()) {
          var resLm = await leaveBattle(latestCharacterRevision());
          if (resLm && resLm._err === 409) {
            var leaveConflict = await parseActionErrorBodySafe(resLm);
            if (window.L2 && typeof L2.resyncCharacterAfterConflict === 'function') {
              await L2.resyncCharacterAfterConflict(function (snap) {
                character = snap;
              }, leaveConflict);
            } else {
              var agLm = await loadCharacter();
              if (agLm && agLm.character) {
                character = agLm.character;
                if (window.L2 && L2.setLastSnapshot) L2.setLastSnapshot(character);
              }
            }
            resLm = await leaveBattle(latestCharacterRevision());
          }
          if (resLm && resLm.character && window.L2 && L2.setLastSnapshot) {
            L2.setLastSnapshot(resLm.character);
          }
        } else if (window.L2 && L2.setLastSnapshot && character) {
          L2.setLastSnapshot(character);
        }
        saveVictoryToSession(null);
        window.location.href = '/map.html';
      });
    }

    async function leaveToCity() {
      await runWithBattleNavLock(async function () {
        var resLm = await leaveBattle(latestCharacterRevision());
        if (resLm && resLm._err === 409) {
          var leaveConflict2 = await parseActionErrorBodySafe(resLm);
          if (window.L2 && typeof L2.resyncCharacterAfterConflict === 'function') {
            await L2.resyncCharacterAfterConflict(function (snap) {
              character = snap;
            }, leaveConflict2);
          } else {
            var agLm = await loadCharacter();
            if (agLm && agLm.character) character = agLm.character;
          }
          resLm = await leaveBattle(latestCharacterRevision());
        }
        if (resLm && resLm.character && L2.setLastSnapshot) {
          L2.setLastSnapshot(resLm.character);
        }
        window.location.href = '/city.html';
      });
    }

    var back = $('battle-back-map');
    if (back) {
      back.addEventListener('click', function (e) {
        e.preventDefault();
        goToMap();
      });
    }

    var vMap = $('battle-victory-map');
    if (vMap) {
      vMap.addEventListener('click', function (e) {
        e.preventDefault();
        goToMap();
      });
    }
    var vCont = $('battle-victory-continue');
    if (vCont) {
      vCont.addEventListener('click', function () {
        goToMap();
      });
    }
    var vHunt = $('battle-victory-hunt');
    if (vHunt) {
      vHunt.addEventListener('click', function () {
        runWithBattleNavLock(async function () {
          var victory =
            lastVictorySummary ||
            loadVictoryFromSession() ||
            (spawnId ? { spawnId: spawnId } : null);
          if (!victory) {
            showBattleToast(
              tr('battle_hunt_no_context', 'Немає даних перемоги — онови сторінку.')
            );
            return;
          }
          await huntContinueManual(victory);
        });
      });
    }

    async function returnToTownAndGoCity() {
      await runWithBattleNavLock(async function () {
        async function tryReturnOnce() {
          return returnToNearestTown(latestCharacterRevision());
        }
        var resT = await tryReturnOnce();
        if (resT && resT._err === 409) {
          var townConflict = await parseActionErrorBodySafe(resT);
          if (window.L2 && typeof L2.resyncCharacterAfterConflict === 'function') {
            await L2.resyncCharacterAfterConflict(function (snap) {
              character = snap;
            }, townConflict);
          } else {
            var agT = await loadCharacter();
            if (agT && agT.character) {
              character = agT.character;
              if (window.L2 && L2.setLastSnapshot) L2.setLastSnapshot(character);
            }
          }
          resT = await tryReturnOnce();
        }
        if (resT && resT._err && resT.raw) {
          try {
            var ejBlock = await resT.raw.json();
            if (
              ejBlock &&
              (ejBlock.error === 'battle_still_active' ||
                (ejBlock.messageUk &&
                  String(ejBlock.messageUk).indexOf('заверши бій') !== -1))
            ) {
              await syncBattleFromServer();
              if (character && character.pveDefeat) {
                checkPveDefeatFromCharacter(character);
              }
              resT = await tryReturnOnce();
            }
          } catch (eBlock) {
            /* ignore */
          }
        }
        if (!resT || resT._err) {
          if (resT && resT.raw) {
            try {
              var ejT = await resT.raw.json();
              if (ejT && ejT.messageUk) {
                showBattleToast(ejT.messageUk);
              } else {
                showBattleToast('Не вдалося перенести в місто.');
              }
            } catch (eT) {
              showBattleToast('Не вдалося перенести в місто.');
            }
          } else {
            showBattleToast('Не вдалося перенести в місто.');
          }
          return;
        }
        character = resT.character;
        if (window.L2 && L2.setLastSnapshot) L2.setLastSnapshot(character);
        clearDefeatFromSession();
        battle = null;
        stopBattleSyncPoll();
        window.location.replace('/city.html');
      });
    }

    function isDefeatScreenActive() {
      var defRoot = $('battle-defeat-root');
      return !!(defRoot && !defRoot.hidden);
    }

    function wireDefeatTownNavLink() {
      var nav =
        document.getElementById('wap-bottom') ||
        document.getElementById('l2-nav-bottom');
      if (!nav) return;
      var cityLink = nav.querySelector('a[href="/city.html"]');
      if (!cityLink || cityLink.dataset.l2DefeatTownWired === '1') return;
      cityLink.dataset.l2DefeatTownWired = '1';
      cityLink.addEventListener('click', function (e) {
        if (!isDefeatScreenActive()) return;
        e.preventDefault();
        returnToTownAndGoCity();
      });
    }

    var defTown = $('battle-defeat-tocity');
    if (defTown) {
      defTown.addEventListener('click', function () {
        returnToTownAndGoCity();
      });
    }

    wireDefeatTownNavLink();

    if (pvpDeathMode || (character && character.pvpDefeat)) {
      if (character && character.pvpDefeat) {
        if (content) content.hidden = false;
        if (errEl) errEl.hidden = true;
        showPvpDefeatScreen(character.pvpDefeat);
        return;
      }
      if (pvpDeathMode) {
        if (errEl) {
          errEl.hidden = false;
          errEl.textContent = 'Немає даних PvP-поразки.';
        }
        return;
      }
    }

    if (character && character.pveDefeat) {
      if (content) content.hidden = false;
      if (errEl) errEl.hidden = true;
      renderPlayerBars(character);
      showDefeatScreen(character.pveDefeat);
      return;
    }

    if (pveDeathMode && character && !character.pveDefeat) {
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent =
          'Немає даних PvE-поразки. Спробуй оновити сторінку (F5).';
      }
      return;
    }

    var battleReady = await ensureBattle();
    if (battleReady) {
      if (content) content.hidden = false;
      if (errEl) errEl.hidden = true;
      refreshUI();
      startBattleSyncPoll();
    } else {
      var pendingDefeat = loadDefeatFromSession();
      if (pendingDefeat && !(character && character.pvpDefeat)) {
        if (content) content.hidden = false;
        if (errEl) errEl.hidden = true;
        renderPlayerBars(character);
        showDefeatScreen(pendingDefeat);
        return;
      }
      var savedVictory =
        loadVictoryFromSession() || (spawnId ? { spawnId: spawnId } : null);
      if (savedVictory) {
        lastVictorySummary = savedVictory;
        showVictoryScreen(savedVictory);
        if (content) content.hidden = true;
        if (errEl) errEl.hidden = true;
      }
    }
  }

  init();
})();
