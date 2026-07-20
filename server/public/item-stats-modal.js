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

  function itemIconUrlForId(id) {
    if (global.L2 && typeof L2.resolveItemIconUrl === 'function') {
      return L2.resolveItemIconUrl(id, '/icons/drops/other.svg');
    }
    if (id > 0) return '/game/item-icon/' + id;
    return '/icons/drops/other.svg';
  }

  function setItemIconSrc(img, itemId, enchantLevel) {
    if (global.L2 && typeof L2.setItemIconWithEnchantBadge === 'function') {
      L2.setItemIconWithEnchantBadge(
        img,
        itemId,
        enchantLevel != null ? enchantLevel : 0,
        itemIconUrlForId(itemId)
      );
      return;
    }
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

  function fillItemStats(statsEl, itemId, modalEn) {
    if (global.L2 && typeof L2.fillItemEnchantAwareStats === 'function') {
      L2.fillItemEnchantAwareStats(statsEl, itemId, modalEn);
      return;
    }
    statsEl.innerHTML = '';
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

    var titleName = itemDisplayName(id);
    if (global.L2 && typeof L2.formatEnchantedItemName === 'function') {
      title.textContent = L2.formatEnchantedItemName(titleName, modalEn);
    } else if (modalEn > 0) {
      title.textContent = '+' + String(modalEn) + ' ' + titleName;
    } else {
      title.textContent = titleName;
    }
    if (global.L2 && typeof L2.decorateItemNameEl === 'function') {
      L2.decorateItemNameEl(title, id, 'l2-gm-modal-title');
    }
    if (gradeEl) gradeEl.textContent = gradeLabelForItem(id);
    if (kind) kind.textContent = slotKindUk(id);
    if (icon) setItemIconSrc(icon, id, modalEn);

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
