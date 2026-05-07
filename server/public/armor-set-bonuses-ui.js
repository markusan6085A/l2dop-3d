/**
 * Бонус повного комплекту броні за предметом (узгоджено з
 * server/src/data/l2dopDGradeArmorSetBonuses.ts).
 * У модалці — лише рядок бонусу для сету цього itemId.
 * Текст лише українською для UI.
 */
(function (g) {
  var CLS = 'l2-armor-set-bonuses';

  /**
   * pieceIds — усі частини комплекту з l2dopGmShopCatalog / логіки сету.
   * @type {{ grade: string, nameUk: string, pieceIds: number[], bonusText: string }[]}
   */
  var ARMOR_SET_DEFS = [
    {
      grade: 'D',
      nameUk: 'Мітріл',
      pieceIds: [58, 59, 499, 61, 62],
      bonusText:
        'Max HP +8%, P. Def +5%, стійкість до стану +10%',
    },
    {
      grade: 'D',
      nameUk: 'Посилена шкіра',
      pieceIds: [394, 416, 44, 720, 2422],
      bonusText:
        'швидкість атаки +5%, точність +3, ухилення +2',
    },
    {
      grade: 'D',
      nameUk: 'Туніка знань',
      pieceIds: [436, 469, 41, 2447, 2423],
      bonusText:
        'Max MP +10%, швидкість каста +5%, маг. крит +2%',
    },
    {
      grade: 'C',
      nameUk: 'Туніка демона',
      pieceIds: [441, 472, 20001, 2459, 2435],
      bonusText:
        'швидкість каста +5%, маг. крит +2%, витрати MP на бойові скіли −5%',
    },
    {
      grade: 'C',
      nameUk: 'Карміан',
      pieceIds: [439, 471, 20002, 2454, 2430],
      bonusText:
        'швидкість каста +7%, Max MP +8%, шанс накласти дебаф +5% (після резисту цілі)',
    },
    {
      grade: 'C',
      nameUk: 'Пластинчата шкіра',
      pieceIds: [398, 418, 20003, 2455, 2431],
      bonusText:
        'швидкість атаки +4%, точність +3, фіз. крит +2%',
    },
    {
      grade: 'B',
      nameUk: 'Мантія Авадона',
      pieceIds: [30002, 30001, 30003, 30004],
      bonusText:
        'швидкість каста +6%, Max MP +12%, маг. крит +3%, стійкість до дебафів +8%',
    },
    {
      grade: 'B',
      nameUk: 'Синій вовк',
      pieceIds: [358, 2380, 2416, 2487, 2439],
      bonusText:
        'Max HP +10%, P. Def +5%, швидкість атаки +3%, точність +3',
    },
    {
      grade: 'B',
      nameUk: 'Броня загибелі удачі',
      pieceIds: [30009, 30008, 30010, 30011],
      bonusText:
        'швидкість атаки +6%, фіз. крит +3%, точність +4, ухилення +2',
    },
    {
      grade: 'A',
      nameUk: 'Бригантина Апелли',
      pieceIds: [7864, 7860, 7865, 7866],
      bonusText:
        'Max HP +12%, P. Def +6%, стійкість до стану +15%, стійкість до дебафів +10%',
    },
    {
      grade: 'A',
      nameUk: 'Темний кристал',
      pieceIds: [365, 388, 512, 2472, 563],
      bonusText:
        'швидкість атаки +7%, точність +4, фіз. крит +3%, Max HP +5%',
    },
    {
      grade: 'A',
      nameUk: 'Мантія величі',
      pieceIds: [2409, 2419, 2482, 583],
      bonusText:
        'швидкість каста +8%, маг. крит +4%, Max MP +12%, шанс накласти дебаф +8% (після резисту)',
    },
    {
      grade: 'S',
      nameUk: 'Драконічна шкіра',
      pieceIds: [6379, 6382, 6380, 6381],
      bonusText:
        'швидкість атаки +8%, фіз. крит +4%, точність +5, ухилення +3',
    },
    {
      grade: 'S',
      nameUk: 'Імперський хрестоносець',
      pieceIds: [6373, 6374, 6378, 6375, 6376],
      bonusText:
        'Max HP +15%, P. Def +8%, стійкість до стану +20%, стійкість до дебафів +15%',
    },
    {
      grade: 'S',
      nameUk: 'Мантія великої аркани',
      pieceIds: [6383, 6386, 6384, 6385],
      bonusText:
        'швидкість каста +9%, маг. крит +5%, Max MP +15%, шанс накласти дебаф +10% (після резисту)',
    },
  ];

  /** @type {Record<number, typeof ARMOR_SET_DEFS[0]>} */
  var ITEM_ID_TO_SET = {};
  for (var si = 0; si < ARMOR_SET_DEFS.length; si++) {
    var def = ARMOR_SET_DEFS[si];
    for (var pi = 0; pi < def.pieceIds.length; pi++) {
      ITEM_ID_TO_SET[def.pieceIds[pi]] = def;
    }
  }

  var GRADE_LABEL_UK = {
    D: 'D',
    C: 'C',
    B: 'B',
    A: 'A',
    S: 'S',
  };

  function isArmorSlot(kind) {
    return (
      kind === 'chest' ||
      kind === 'legs' ||
      kind === 'head' ||
      kind === 'gloves' ||
      kind === 'feet' ||
      kind === 'fullarmor'
    );
  }

  function normalizeArmorGrade(raw) {
    if (raw == null) return null;
    var s = String(raw).trim();
    if (!s || s === '—' || s === '-') return null;
    var u = s.toUpperCase();
    if (u.indexOf('NG') === 0) return null;
    var c = u.charAt(0);
    if ('DCBAS'.indexOf(c) >= 0) return c;
    return null;
  }

  function resolveSetForItemId(itemId) {
    if (itemId == null || itemId === '') return null;
    var n = Number(itemId);
    if (!Number.isFinite(n) || n <= 0) return null;
    return ITEM_ID_TO_SET[n] || null;
  }

  /**
   * @param {HTMLElement} host
   * @param {string|null|undefined} _gradeRaw — зарезервовано (грейд береться з опису сету за itemId)
   * @param {number|null|undefined} itemId
   */
  function showIn(host, _gradeRaw, itemId) {
    if (!host) return;
    var setInfo = resolveSetForItemId(itemId);
    if (!setInfo) {
      host.hidden = true;
      host.innerHTML = '';
      return;
    }
    var grFromItem = setInfo.grade;
    var gUk = GRADE_LABEL_UK[grFromItem] || grFromItem;
    var li =
      '<li><strong>' +
      setInfo.nameUk +
      '</strong> — ' +
      setInfo.bonusText +
      '</li>';
    host.hidden = false;
    host.innerHTML =
      '<div class="' +
      CLS +
      '">' +
      '<div class="' +
      CLS +
      '__title">Бонус повного комплекту · грейд ' +
      gUk +
      '</div>' +
      '<ul class="' +
      CLS +
      '__list">' +
      li +
      '</ul></div>';
  }

  function hide(host) {
    if (host) {
      host.hidden = true;
      host.innerHTML = '';
    }
  }

  g.L2ArmorSetBonusesUI = {
    isArmorSlot: isArmorSlot,
    normalizeArmorGrade: normalizeArmorGrade,
    resolveSetForItemId: resolveSetForItemId,
    showIn: showIn,
    hide: hide,
  };
})(typeof window !== 'undefined' ? window : this);
