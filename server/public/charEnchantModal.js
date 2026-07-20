/**
 * Модалка заточки предмета — вибір сумісного scroll і POST /game/inventory/enchant.
 */
(function (global) {
  var MAX_ENCHANT_LEVEL = 25;
  var SCROLL_META = {
    910510: { target: 'armor', grade: 'D' },
    910511: { target: 'weapon', grade: 'D' },
    910512: { target: 'armor', grade: 'C' },
    910513: { target: 'weapon', grade: 'C' },
    910514: { target: 'armor', grade: 'B' },
    910515: { target: 'weapon', grade: 'B' },
    910516: { target: 'armor', grade: 'A' },
    910517: { target: 'weapon', grade: 'A' },
    910518: { target: 'armor', grade: 'S' },
    910519: { target: 'weapon', grade: 'S' },
  };

  var ctx = null;
  var selectedScrollId = null;
  var inFlight = false;
  var wired = false;
  var escBound = false;

  function $(id) {
    return document.getElementById(id);
  }

  function itemDisplayName(id) {
    if (global.L2 && typeof L2.resolveCatalogItemName === 'function') {
      return L2.resolveCatalogItemName(id);
    }
    if (global.L2 && typeof L2.itemDisplayNameWithGrade === 'function') {
      return L2.itemDisplayNameWithGrade(id);
    }
    var n = global.L2 && L2.itemNameById && L2.itemNameById[id];
    return n != null ? n : '#' + id;
  }

  function gradeLabelForItem(itemId) {
    if (global.L2 && typeof L2.enchantScrollGradeById === 'function') {
      var scrollGrade = L2.enchantScrollGradeById(itemId);
      if (scrollGrade) return scrollGrade;
    }
    var g = global.L2 && L2.itemGradeById && L2.itemGradeById[itemId];
    if (g != null && String(g).trim() !== '') return String(g);
    return '—';
  }

  function slotKindUk(itemId) {
    var sl = global.L2 && L2.itemSlotById && L2.itemSlotById[itemId];
    if (sl === 'chest') return 'Обладунки (верх)';
    if (sl === 'legs') return 'Обладунки (низ)';
    if (sl === 'head') return 'Шолом';
    if (sl === 'gloves') return 'Рукавиці';
    if (sl === 'feet') return 'Чоботи';
    if (sl === 'rhand') return 'Зброя';
    if (sl === 'lhand' || sl === 'shield') return 'Щит';
    if (sl === 'ring') return 'Кільце';
    if (sl === 'neck') return 'Намисто';
    if (sl === 'earring') return 'Сережки';
    return 'Предмет';
  }

  function formatEnchantedName(name, enchant) {
    if (global.L2 && typeof L2.formatEnchantedItemName === 'function') {
      return L2.formatEnchantedItemName(name, enchant);
    }
    var en = Math.floor(Number(enchant));
    if (!Number.isFinite(en) || en <= 0) return String(name || '');
    return '+' + String(en) + ' ' + String(name || '');
  }

  function normalizedItemGradeKey(itemId) {
    if (global.L2 && typeof L2.enchantScrollGradeById === 'function') {
      var scrollGrade = L2.enchantScrollGradeById(itemId);
      if (scrollGrade) return String(scrollGrade).trim().toUpperCase();
    }
    var g = global.L2 && L2.itemGradeById && L2.itemGradeById[itemId];
    if (g == null || String(g).trim() === '') return '';
    return String(g).trim().toUpperCase();
  }

  function scrollTargetForItem(itemId) {
    var slot = global.L2 && L2.itemSlotById && L2.itemSlotById[itemId];
    if (slot === 'rhand') return 'weapon';
    if (
      slot === 'lhand' ||
      slot === 'chest' ||
      slot === 'legs' ||
      slot === 'fullarmor' ||
      slot === 'head' ||
      slot === 'gloves' ||
      slot === 'feet' ||
      slot === 'neck' ||
      slot === 'earring' ||
      slot === 'ring'
    ) {
      return 'armor';
    }
    return null;
  }

  function isEnchantableEquipment(itemId) {
    if (!itemId) return false;
    var grade = normalizedItemGradeKey(itemId);
    if (!grade || grade === 'NG') return false;
    return scrollTargetForItem(itemId) != null;
  }

  function getEnchantSuccessChance(currentEnchantLevel) {
    var current = Math.max(
      0,
      Math.min(MAX_ENCHANT_LEVEL, Math.floor(Number(currentEnchantLevel) || 0))
    );
    if (current <= 2) return 100;
    if (current === 3) return 70;
    if (current === 4) return 65;
    if (current === 5) return 60;
    if (current === 6) return 55;
    if (current === 7) return 50;
    if (current === 8) return 45;
    if (current === 9) return 40;
    if (current <= 14) return 30;
    if (current <= 19) return 20;
    return 10;
  }

  function getEnchantFailLevel(currentEnchantLevel) {
    var current = Math.max(
      0,
      Math.min(MAX_ENCHANT_LEVEL, Math.floor(Number(currentEnchantLevel) || 0))
    );
    if (current <= 3) return 3;
    if (current <= 10) return current - 1;
    return 10;
  }

  function scrollQtyInBag(snap, scrollItemId) {
    var inv = snap && snap.inventory ? snap.inventory : { stacks: [] };
    var total = 0;
    (inv.stacks || []).forEach(function (st) {
      if (Number(st.itemId) !== Number(scrollItemId)) return;
      var q = Number(st.qty || 0);
      if (Number.isFinite(q) && q > 0) total += Math.floor(q);
    });
    return total;
  }

  function compatibleScrolls(snap, itemId) {
    var target = scrollTargetForItem(itemId);
    var grade = normalizedItemGradeKey(itemId);
    if (!target || !grade || grade === 'NG') return [];
    var out = [];
    Object.keys(SCROLL_META).forEach(function (key) {
      var scrollId = Number(key);
      var meta = SCROLL_META[scrollId];
      if (!meta || meta.target !== target || meta.grade !== grade) return;
      var qty = scrollQtyInBag(snap, scrollId);
      if (qty <= 0) return;
      out.push({ scrollItemId: scrollId, qty: qty, meta: meta });
    });
    return out;
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
      L2.setItemIconWithEnchantBadge(img, itemId, enchantLevel != null ? enchantLevel : 0);
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

  function addStatRow(statsEl, k, v) {
    if (global.L2 && typeof L2.appendItemStatLine === 'function') {
      L2.appendItemStatLine(statsEl, k, v);
      return;
    }
    var p = document.createElement('p');
    p.className = 'l2-item-modal-stat';
    p.textContent = k ? k + ': ' + v : String(v);
    statsEl.appendChild(p);
  }

  function fillCurrentStats(statsEl, itemId, enchant) {
    statsEl.innerHTML = '';
    var st = global.L2 && L2.itemStatsById && L2.itemStatsById[itemId];
    var slot = global.L2 && L2.itemSlotById && L2.itemSlotById[itemId];
    if (!st || typeof st !== 'object' || !slot) return;
    function pushLine(labelUk, baseVal, kind) {
      if (global.L2 && typeof L2.formatEnchantedStatLineUk === 'function') {
        var ln = L2.formatEnchantedStatLineUk(labelUk, baseVal, enchant, kind);
        addStatRow(statsEl, ln.labelUk, ln.valueUk);
        return;
      }
      addStatRow(statsEl, labelUk, String(baseVal));
    }
    if (slot === 'rhand') {
      if (st.pAtk != null) pushLine('Фіз. атака', st.pAtk, 'weaponPatk');
      if (st.mAtk != null && Number(st.mAtk) > 0) {
        pushLine('Маг. атака', st.mAtk, 'weaponMatk');
      }
      if (st.atkSpd != null) addStatRow(statsEl, 'Швидкість бою', String(st.atkSpd));
      return;
    }
    var isJewel =
      slot === 'ring' ||
      slot === 'neck' ||
      slot === 'earring' ||
      (st.jewelMdefFlat != null && Number(st.jewelMdefFlat) > 0);
    if (isJewel) {
      var mdefBase =
        st.jewelMdefFlat != null && Number(st.jewelMdefFlat) > 0
          ? Number(st.jewelMdefFlat)
          : st.pDef;
      if (mdefBase != null) pushLine('Маг. захист', mdefBase, 'jewelMdef');
      return;
    }
    if (st.pDef != null) pushLine('Фіз. захист', st.pDef, 'armorPDef');
  }

  function fillPreviewStats(previewEl, itemId, enchant) {
    previewEl.innerHTML = '';
    if (!global.L2 || typeof L2.buildEnchantSuccessPreviewLines !== 'function') return;
    var lines = L2.buildEnchantSuccessPreviewLines(itemId, enchant);
    if (!lines.length) {
      previewEl.textContent = '—';
      return;
    }
    lines.forEach(function (ln) {
      var p = document.createElement('p');
      p.className = 'l2-item-modal-stat l2-char-enchant-preview-line';
      p.textContent =
        ln.labelUk +
        ': ' +
        String(ln.currentValue) +
        ' → ' +
        String(ln.nextValue) +
        ' (+' +
        String(ln.delta) +
        ')';
      previewEl.appendChild(p);
    });
  }

  function expectedRevisionForMutation() {
    var snap = global.L2 && typeof L2.lastSnapshot === 'function' ? L2.lastSnapshot() : null;
    return snap && snap.revision != null ? snap.revision : null;
  }

  function showResultMessage(text) {
    var el = $('char-enchant-modal-result');
    if (!el) return;
    if (!text) {
      el.hidden = true;
      el.setAttribute('hidden', '');
      el.textContent = '';
      return;
    }
    el.hidden = false;
    el.removeAttribute('hidden');
    el.textContent = String(text);
  }

  function renderScrollList(snap) {
    var listEl = $('char-enchant-modal-scrolls');
    var emptyEl = $('char-enchant-modal-no-scroll');
    var submitBtn = $('char-enchant-modal-submit');
    if (!listEl || !ctx) return;

    listEl.innerHTML = '';
    selectedScrollId = null;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.removeAttribute('aria-busy');
    }

    var scrolls = compatibleScrolls(snap, ctx.itemId);
    var grade = normalizedItemGradeKey(ctx.itemId);

    if (!scrolls.length) {
      if (emptyEl) {
        emptyEl.hidden = false;
        emptyEl.removeAttribute('hidden');
        emptyEl.textContent =
          'У сумці немає відповідного сувою заточення ' + grade + '-grade.';
      }
      return;
    }

    if (emptyEl) {
      emptyEl.hidden = true;
      emptyEl.setAttribute('hidden', '');
      emptyEl.textContent = '';
    }

    scrolls.forEach(function (row, idx) {
      var wrap = document.createElement('label');
      wrap.className = 'l2-char-enchant-scroll-row';
      var radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'char-enchant-scroll-pick';
      radio.value = String(row.scrollItemId);
      radio.className = 'l2-char-enchant-scroll-radio';
      if (idx === 0) {
        radio.checked = true;
        selectedScrollId = row.scrollItemId;
        if (submitBtn) submitBtn.disabled = false;
      }
      radio.addEventListener('change', function () {
        if (!radio.checked) return;
        selectedScrollId = row.scrollItemId;
        if (submitBtn && !inFlight) submitBtn.disabled = false;
        updateChancePreview(ctx.enchant);
      });

      var ico = document.createElement('img');
      ico.className = 'l2-char-enchant-scroll-icon';
      ico.alt = '';
      ico.width = 28;
      ico.height = 28;
      setItemIconSrc(ico, row.scrollItemId);

      var text = document.createElement('span');
      text.className = 'l2-char-enchant-scroll-text';
      text.textContent =
        itemDisplayName(row.scrollItemId) + ' ×' + String(row.qty);

      wrap.appendChild(radio);
      wrap.appendChild(ico);
      wrap.appendChild(text);
      listEl.appendChild(wrap);
    });

    updateChancePreview(ctx.enchant);
  }

  function updateChancePreview(enchant) {
    var chanceEl = $('char-enchant-modal-chance');
    var failEl = $('char-enchant-modal-fail');
    if (!chanceEl || !failEl) return;
    var current = Math.max(
      0,
      Math.min(MAX_ENCHANT_LEVEL, Math.floor(Number(enchant) || 0))
    );
    var chance = getEnchantSuccessChance(current);
    var failTo = getEnchantFailLevel(current);
    chanceEl.textContent = 'Шанс успіху: ' + String(chance) + '%';
    if (current <= 3) {
      failEl.textContent = 'При невдачі: без втрати рівня';
    } else {
      failEl.textContent = 'При невдачі: стане +' + String(failTo);
    }
  }

  function syncCtxFromSnapshot(snap, preferredEnchantLevel) {
    if (!ctx || !global.L2 || typeof L2.syncEnchantTargetFromSnapshot !== 'function') {
      return false;
    }
    var next = L2.syncEnchantTargetFromSnapshot(ctx, snap, preferredEnchantLevel);
    if (!next) return false;
    ctx.targetInstanceId = next.targetInstanceId;
    ctx.itemId = next.itemId;
    ctx.enchant = next.enchant;
    return true;
  }

  function refreshModalContent(snap, options) {
    if (!ctx) return;
    options = options || {};
    snap = snap || (global.L2 && L2.lastSnapshot ? L2.lastSnapshot() : null);
    var preferred =
      options.currentEnchantLevel != null ? options.currentEnchantLevel : null;
    if (!syncCtxFromSnapshot(snap, preferred)) {
      if (options.requireTarget === true) {
        showResultMessage('Предмет для заточки не знайдено.');
        closeModal();
      }
      return;
    }

    var titleEl = $('char-enchant-modal-title');
    var gradeEl = $('char-enchant-modal-grade');
    var kindEl = $('char-enchant-modal-kind');
    var iconEl = $('char-enchant-modal-icon');
    var statsEl = $('char-enchant-modal-stats');
    var previewEl = $('char-enchant-modal-preview');
    var submitBtn = $('char-enchant-modal-submit');

    if (titleEl) {
      titleEl.textContent = formatEnchantedName(itemDisplayName(ctx.itemId), ctx.enchant);
      if (global.L2 && typeof L2.decorateItemNameEl === 'function') {
        L2.decorateItemNameEl(titleEl, ctx.itemId, 'l2-gm-modal-title');
      }
    }
    if (gradeEl) gradeEl.textContent = gradeLabelForItem(ctx.itemId);
    if (kindEl) kindEl.textContent = slotKindUk(ctx.itemId);
    if (iconEl) setItemIconSrc(iconEl, ctx.itemId, ctx.enchant);
    if (statsEl) fillCurrentStats(statsEl, ctx.itemId, ctx.enchant);
    if (previewEl) fillPreviewStats(previewEl, ctx.itemId, ctx.enchant);

    if (ctx.enchant >= MAX_ENCHANT_LEVEL) {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Максимальна заточка';
      }
      renderScrollList(snap);
      return;
    }

    if (submitBtn) {
      submitBtn.textContent = 'Заточити';
      submitBtn.disabled = true;
    }
    renderScrollList(snap);
  }

  function closeModal() {
    var ov = $('char-enchant-modal-overlay');
    if (!ov || ov.hidden) return;
    ov.hidden = true;
    ov.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('l2-gm-modal-open');
    ctx = null;
    selectedScrollId = null;
    showResultMessage('');
    if (escBound) {
      document.removeEventListener('keydown', onEsc);
      escBound = false;
    }
  }

  function onEsc(e) {
    if (e.key !== 'Escape') return;
    var ov = $('char-enchant-modal-overlay');
    if (!ov || ov.hidden) return;
    e.preventDefault();
    closeModal();
  }

  async function resyncCharacterFromServer() {
    var t = localStorage.getItem('token');
    if (!t) return null;
    try {
      var r = await fetch('/character', {
        headers: { Authorization: 'Bearer ' + t },
      });
      if (!r.ok) return null;
      var c = await r.json();
      if (global.L2 && typeof L2.setLastSnapshot === 'function') L2.setLastSnapshot(c);
      if (global.L2 && typeof L2.applyHudFromSnapshot === 'function') L2.applyHudFromSnapshot(c);
      return c;
    } catch (_) {
      return null;
    }
  }

  async function submitEnchant() {
    if (inFlight || !ctx || selectedScrollId == null) return;
    if (ctx.enchant >= MAX_ENCHANT_LEVEL) return;

    var submitBtn = $('char-enchant-modal-submit');
    inFlight = true;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.setAttribute('aria-busy', 'true');
    }

    try {
      var t = localStorage.getItem('token');
      var r = await fetch('/game/inventory/enchant', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + t,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          expectedRevision: expectedRevisionForMutation(),
          scrollItemId: selectedScrollId,
          targetInstanceId: ctx.targetInstanceId,
        }),
      });

      if (r.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/';
        return;
      }

      if (r.status === 409) {
        if (typeof L2.resyncCharacterAfterConflict === 'function') {
          await L2.resyncCharacterAfterConflict();
        } else {
          await resyncCharacterFromServer();
        }
        showResultMessage('Стан оновлено — спробуй ще раз.');
        refreshModalContent(global.L2.lastSnapshot ? L2.lastSnapshot() : null, {
          requireTarget: true,
        });
        if (typeof ctx.onSnapshot === 'function') {
          ctx.onSnapshot(global.L2.lastSnapshot ? L2.lastSnapshot() : null);
        }
        return;
      }

      var out = {};
      try {
        out = await r.json();
      } catch (_) {
        out = {};
      }

      if (!r.ok) {
        var errMsg =
          out && out.messageUk ? out.messageUk : 'Не вдалося виконати заточку.';
        showResultMessage(errMsg);
        if (/не знайдено/i.test(String(errMsg))) {
          closeModal();
        }
        return;
      }

      var c = out.character;
      var newEnchant =
        out.currentEnchantLevel != null
          ? Math.max(
              0,
              Math.min(MAX_ENCHANT_LEVEL, Math.floor(Number(out.currentEnchantLevel) || 0))
            )
          : null;
      if (global.L2 && typeof L2.applyMutationSnapshot === 'function') {
        L2.applyMutationSnapshot(c, function (snap) {
          if (typeof ctx.onSnapshot === 'function') ctx.onSnapshot(snap);
        });
      } else if (global.L2 && typeof L2.applyCharacterSnapshot === 'function') {
        L2.applyCharacterSnapshot(c);
        if (typeof ctx.onSnapshot === 'function') ctx.onSnapshot(c);
      } else {
        global.L2.setLastSnapshot(c);
        if (global.L2 && typeof L2.applyHudFromSnapshot === 'function') {
          L2.applyHudFromSnapshot(c);
        }
        if (typeof ctx.onSnapshot === 'function') ctx.onSnapshot(c);
      }

      showResultMessage(out.messageUk ? String(out.messageUk) : 'Заточка виконана.');
      refreshModalContent(c, {
        currentEnchantLevel: newEnchant,
        requireTarget: true,
      });
    } catch (_) {
      showResultMessage('Збій мережі — спробуй ще раз.');
    } finally {
      inFlight = false;
      if (submitBtn) {
        submitBtn.removeAttribute('aria-busy');
        if (ctx && ctx.enchant < MAX_ENCHANT_LEVEL && selectedScrollId != null) {
          submitBtn.disabled = false;
        }
      }
    }
  }

  function wireOnce() {
    if (wired) return;
    wired = true;
    var ov = $('char-enchant-modal-overlay');
    if (ov && ov.parentNode !== document.body) {
      document.body.appendChild(ov);
    }
    var closeBtn = $('char-enchant-modal-close');
    var cancelBtn = $('char-enchant-modal-cancel');
    var submitBtn = $('char-enchant-modal-submit');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    if (submitBtn) submitBtn.addEventListener('click', submitEnchant);
    if (ov) {
      ov.addEventListener('click', function (e) {
        if (e.target === ov) closeModal();
      });
    }
  }

  function openEnchantModal(options) {
    wireOnce();
    var ov = $('char-enchant-modal-overlay');
    if (!ov || !options) return;

    ctx = {
      targetInstanceId: String(options.targetInstanceId || ''),
      itemId: Number(options.itemId),
      enchant: Math.max(
        0,
        Math.min(MAX_ENCHANT_LEVEL, Math.floor(Number(options.enchant) || 0))
      ),
      onSnapshot: typeof options.onSnapshot === 'function' ? options.onSnapshot : null,
    };

    showResultMessage('');
    refreshModalContent(
      global.L2 && typeof L2.lastSnapshot === 'function' ? L2.lastSnapshot() : null
    );

    ov.hidden = false;
    ov.setAttribute('aria-hidden', 'false');
    document.body.classList.add('l2-gm-modal-open');
    if (!escBound) {
      document.addEventListener('keydown', onEsc);
      escBound = true;
    }
  }

  global.L2CharEnchantModal = {
    open: openEnchantModal,
    close: closeModal,
    isEnchantableEquipment: isEnchantableEquipment,
    maxEnchantLevel: MAX_ENCHANT_LEVEL,
  };
})(window);
