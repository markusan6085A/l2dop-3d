/**
 * Модалка статів предмета — той самий вигляд, що в інвентарі (l2-gm-modal).
 */
(function (global) {
  var OVERLAY_ID = 'l2-item-stats-modal-overlay';
  var wired = false;
  var escBound = false;

  function $(id) {
    return document.getElementById(id);
  }

  function pctFromMulUk(mul) {
    var p = Math.round((Number(mul) - 1) * 100);
    return (p >= 0 ? '+' : '') + p + '%';
  }

  function itemDisplayName(id) {
    var n = global.L2 && L2.itemNameById && L2.itemNameById[id];
    return n != null ? n : '#' + id;
  }

  function gradeLabelForItem(id) {
    var g = global.L2 && L2.itemGradeById && L2.itemGradeById[id];
    if (g != null && String(g).trim() !== '') return String(g);
    return '—';
  }

  function slotKindUk(itemId) {
    var sl = global.L2 && L2.itemSlotById && L2.itemSlotById[itemId];
    if (sl === 'chest') return 'Обладунки (верх)';
    if (sl === 'legs') return 'Обладунки (низ)';
    if (sl === 'rhand') return 'Зброя (права рука)';
    if (sl === 'lhand' || sl === 'shield') return 'Щит (ліва рука)';
    if (sl === 'ring') return 'Кільце';
    if (sl === 'neck') return 'Намисто';
    if (sl === 'earring') return 'Сережки';
    return 'Предмет';
  }

  function weaponTypeLabelUk(itemId) {
    var wt = global.L2 && L2.itemWeaponTypeById && L2.itemWeaponTypeById[itemId];
    if (!wt) return '';
    var map = {
      sword: 'Меч',
      blunt: 'Булава',
      dagger: 'Кинджал',
      bow: 'Лук',
      bigsword: 'Дворучний меч',
      bigblunt: 'Дворучний тупий',
      dual: 'Подвійні мечі',
      pole: 'Спис',
      fist: 'Кастети',
    };
    return map[wt] || String(wt);
  }

  function itemIconUrlForId(id) {
    if (global.L2 && typeof L2.resolveItemIconUrl === 'function') {
      return L2.resolveItemIconUrl(id, '/icons/drops/other.svg');
    }
    if (id > 0) return '/game/item-icon/' + id;
    return '/icons/drops/other.svg';
  }

  function setItemIconSrc(img, itemId) {
    if (!img) return;
    img.decoding = 'async';
    img.src = itemIconUrlForId(itemId);
    img.onerror = function () {
      img.onerror = null;
      img.src = '/icons/drops/other.svg';
    };
  }

  function closeModal() {
    var ov = $(OVERLAY_ID);
    if (!ov || ov.hidden) return;
    ov.hidden = true;
    ov.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('l2-gm-modal-open');
    if (escBound) {
      document.removeEventListener('keydown', onEsc);
      escBound = false;
    }
  }

  function onEsc(e) {
    if (e.key !== 'Escape') return;
    var ov = $(OVERLAY_ID);
    if (!ov || ov.hidden) return;
    e.preventDefault();
    closeModal();
  }

  function ensureModalOnBody() {
    var ov = $(OVERLAY_ID);
    if (ov && ov.parentNode !== document.body) {
      document.body.appendChild(ov);
    }
  }

  function ensureModalDom() {
    var ov = $(OVERLAY_ID);
    if (ov) return ov;

    ov = document.createElement('div');
    ov.id = OVERLAY_ID;
    ov.className = 'l2-gm-modal-overlay';
    ov.hidden = true;
    ov.setAttribute('aria-hidden', 'true');
    ov.innerHTML =
      '<div class="l2-gm-modal" role="dialog" aria-modal="true" aria-labelledby="l2-item-stats-modal-section-title">' +
      '<button type="button" class="l2-gm-modal-close" id="l2-item-stats-modal-close" aria-label="Закрити">×</button>' +
      '<h2 id="l2-item-stats-modal-section-title" class="l2-item-modal-heading">Інформація про предмет</h2>' +
      '<div class="l2-gm-modal-head">' +
      '<img id="l2-item-stats-modal-icon" class="l2-gm-modal-icon" width="48" height="48" alt="" />' +
      '<div>' +
      '<p id="l2-item-stats-modal-title" class="l2-gm-modal-title"></p>' +
      '<p class="l2-gm-modal-sub">' +
      '<span id="l2-item-stats-modal-grade">—</span> · <span id="l2-item-stats-modal-kind"></span>' +
      '</p>' +
      '</div>' +
      '</div>' +
      '<div class="l2-item-modal-stats" id="l2-item-stats-modal-stats"></div>' +
      '<p class="l2-gm-modal-price" id="l2-item-stats-modal-qty" hidden></p>' +
      '<div id="l2-item-stats-modal-armor-sets" class="l2-drops-stats-modal__armor-sets" hidden></div>' +
      '</div>';

    document.body.appendChild(ov);
    wireModalOnce();
    return ov;
  }

  function wireModalOnce() {
    if (wired) return;
    wired = true;
    ensureModalOnBody();
    var ov = $(OVERLAY_ID);
    var closeBtn = $('l2-item-stats-modal-close');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (ov) {
      ov.addEventListener('click', function (e) {
        if (e.target === ov) closeModal();
      });
    }
  }

  function addStatRow(statsEl, k, v) {
    if (global.L2 && typeof L2.appendItemStatLine === 'function') {
      L2.appendItemStatLine(statsEl, k, v);
      return;
    }
    var p = document.createElement('p');
    p.className = 'l2-item-modal-stat l2-item-modal-stat--default';
    p.textContent = k ? k + ': ' + v : String(v);
    statsEl.appendChild(p);
  }

  function fillItemStats(statsEl, itemId, modalEn) {
    statsEl.innerHTML = '';
    if (modalEn > 0) addStatRow(statsEl, 'Заточка', '+' + modalEn);

    var st = global.L2 && L2.itemStatsById && L2.itemStatsById[itemId];
    var slKind = global.L2 && L2.itemSlotById && L2.itemSlotById[itemId];
    var hasJewelAuthorModal =
      st &&
      typeof st === 'object' &&
      (st.jewelMdefFlat != null ||
        st.jewelMaxHp != null ||
        st.jewelMaxMp != null ||
        (st.jewelAcc != null && Number(st.jewelAcc) > 0) ||
        (st.jewelEva != null && Number(st.jewelEva) > 0) ||
        (st.jewelMpRegenMul != null && Number(st.jewelMpRegenMul) > 1) ||
        (st.jewelHoldResistMul != null && Number(st.jewelHoldResistMul) > 1));
    var isJewelModal =
      slKind === 'ring' ||
      slKind === 'neck' ||
      slKind === 'earring' ||
      hasJewelAuthorModal;
    var isShieldModal = slKind === 'lhand' || slKind === 'shield';
    var isArmorModal =
      slKind === 'head' ||
      slKind === 'chest' ||
      slKind === 'legs' ||
      slKind === 'gloves' ||
      slKind === 'feet' ||
      slKind === 'fullarmor';

    if (st && typeof st === 'object') {
      if (st.pAtk != null) addStatRow(statsEl, 'Фіз. атака', String(st.pAtk));
      if (isShieldModal) {
        if (st.pDef != null) addStatRow(statsEl, 'P.Def', String(st.pDef));
        if (st.shieldRatePercent != null) {
          addStatRow(statsEl, 'Блок щитом', String(st.shieldRatePercent) + '%');
        }
        if (st.shieldDef != null) addStatRow(statsEl, 'Захист щита', String(st.shieldDef));
      } else if (isJewelModal) {
        var mdef =
          st.jewelMdefFlat != null
            ? st.jewelMdefFlat
            : st.jewelryMAtk != null
              ? st.jewelryMAtk
              : st.mAtk;
        if (mdef != null) addStatRow(statsEl, 'Маг. захист (M.Def)', String(mdef));
        if (st.jewelMaxHp != null && st.jewelMaxHp > 0) {
          addStatRow(statsEl, 'HP макс.', '+' + String(st.jewelMaxHp));
        }
        if (st.jewelMaxMp != null && st.jewelMaxMp > 0) {
          addStatRow(statsEl, 'MP макс.', '+' + String(st.jewelMaxMp));
        }
        if (st.jewelAcc != null && st.jewelAcc > 0) {
          addStatRow(statsEl, 'Точність', '+' + String(st.jewelAcc));
        }
        if (st.jewelEva != null && st.jewelEva > 0) {
          addStatRow(statsEl, 'Ухилення', '+' + String(st.jewelEva));
        }
        if (
          st.jewelMpRegenMul != null &&
          st.jewelMpRegenMul > 1 &&
          Number.isFinite(Number(st.jewelMpRegenMul))
        ) {
          addStatRow(statsEl, 'Реген MP', pctFromMulUk(st.jewelMpRegenMul));
        }
        if (
          st.jewelHoldResistMul != null &&
          st.jewelHoldResistMul > 1 &&
          Number.isFinite(Number(st.jewelHoldResistMul))
        ) {
          addStatRow(statsEl, 'Стійкість до утримання', pctFromMulUk(st.jewelHoldResistMul));
        }
        if (st.pDef != null) addStatRow(statsEl, 'Фіз. захист (P.Def)', String(st.pDef));
      } else {
        if (st.mAtk != null) addStatRow(statsEl, 'Маг. атака', String(st.mAtk));
        if (isArmorModal && st.pDef != null) {
          addStatRow(statsEl, 'Фіз. захист (P.Def)', String(st.pDef));
        } else if (st.pDef != null) {
          addStatRow(statsEl, 'P.Def', String(st.pDef));
        }
      }
      if (st.atkSpd != null) addStatRow(statsEl, 'Швидкість бою', String(st.atkSpd));
      if (st.wpnCrit != null) addStatRow(statsEl, 'Крит.', String(st.wpnCrit));
      if (st.rCrit != null && Number(st.rCrit) > 0) {
        addStatRow(statsEl, 'Крит.', '+' + String(st.rCrit));
      }
      var wpnLbl = weaponTypeLabelUk(itemId);
      if (wpnLbl) addStatRow(statsEl, 'Тип зброї', wpnLbl);
      if (st.castSpd != null) addStatRow(statsEl, 'Швидкість касту', String(st.castSpd));
      if (st.mCritPct != null) addStatRow(statsEl, 'Маг. крит', String(st.mCritPct) + '%');
    }
  }

  function openItemStatsModal(itemId, opts) {
    opts = opts || {};
    var id = Math.floor(Number(itemId));
    if (!Number.isFinite(id) || id <= 0) return;

    var modalEn =
      opts.enchant != null && Number.isFinite(Number(opts.enchant))
        ? Math.max(0, Math.min(25, Math.floor(Number(opts.enchant))))
        : 0;
    var qty = opts.qty != null ? Number(opts.qty) : 1;
    if (!Number.isFinite(qty) || qty < 1) qty = 1;

    ensureModalDom();
    ensureModalOnBody();

    var title = $('l2-item-stats-modal-title');
    var kind = $('l2-item-stats-modal-kind');
    var gradeEl = $('l2-item-stats-modal-grade');
    var icon = $('l2-item-stats-modal-icon');
    var statsEl = $('l2-item-stats-modal-stats');
    var qtyEl = $('l2-item-stats-modal-qty');
    var armorSetsEl = $('l2-item-stats-modal-armor-sets');
    var ov = $(OVERLAY_ID);
    if (!ov || !title || !statsEl) return;

    title.textContent = itemDisplayName(id);
    if (global.L2 && typeof L2.decorateItemNameEl === 'function') {
      L2.decorateItemNameEl(title, id, 'l2-gm-modal-title');
    }
    if (gradeEl) gradeEl.textContent = gradeLabelForItem(id);
    if (kind) kind.textContent = slotKindUk(id);
    if (icon) setItemIconSrc(icon, id);

    fillItemStats(statsEl, id, modalEn);

    if (qtyEl) {
      var qtyLine = opts.qtyLabel != null ? String(opts.qtyLabel) : '';
      if (!qtyLine && qty > 1) qtyLine = 'Кількість: ' + String(qty);
      if (qtyLine) {
        qtyEl.textContent = qtyLine;
        qtyEl.hidden = false;
        qtyEl.removeAttribute('hidden');
      } else {
        qtyEl.textContent = '';
        qtyEl.hidden = true;
        qtyEl.setAttribute('hidden', '');
      }
    }

    var slKind = global.L2 && L2.itemSlotById && L2.itemSlotById[id];
    if (armorSetsEl && global.L2ArmorSetBonusesUI) {
      if (global.L2ArmorSetBonusesUI.isArmorSlot(slKind)) {
        global.L2ArmorSetBonusesUI.showIn(armorSetsEl, gradeLabelForItem(id), id);
      } else {
        global.L2ArmorSetBonusesUI.hide(armorSetsEl);
      }
    } else if (armorSetsEl) {
      armorSetsEl.hidden = true;
      armorSetsEl.setAttribute('hidden', '');
    }

    ov.hidden = false;
    ov.setAttribute('aria-hidden', 'false');
    document.body.classList.add('l2-gm-modal-open');
    if (!escBound) {
      document.addEventListener('keydown', onEsc);
      escBound = true;
    }
  }

  global.L2ItemStatsModal = {
    open: openItemStatsModal,
    close: closeModal,
  };
})(window);
