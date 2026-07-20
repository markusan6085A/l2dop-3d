/**
 * Рамка екіпу (слоти + портрет) — єдине джерело для char.html і player.html.
 */
(function (global) {
  var SLOT_ICON_DEFAULT = {
    head: '/icons/slot_head.png',
    armor: '/icons/slot_armor.png',
    legs: '/icons/slot_legs.png',
    gloves: '/icons/slot_gloves.png',
    boots: '/icons/slot_boots.png',
    belt: '/icons/slot_belt.png',
    weapon: '/icons/slot_weapon.png',
    shield: '/icons/slot_shield.png',
    jewelry: '/icons/slot_jewelry.png',
    necklace: '/icons/slot_necklace.png',
    earring_left: '/icons/slot_earring_left.png',
    earring_right: '/icons/slot_earring_right.png',
    ring_left: '/icons/slot_ring_left.png',
    ring_right: '/icons/slot_ring_right.png',
    tattoo: '/icons/slot_tattoo.png',
    cloak: '/icons/slot_cloak.png',
  };

  /** server inventory.eq keys → UI data-l2-slot */
  var EQ_SLOT_TO_UI = [
    { key: 'l1', ui: 'weapon' },
    { key: 'l2', ui: 'shield' },
    { key: 'lh', ui: 'head' },
    { key: 'l3', ui: 'armor' },
    { key: 'l4', ui: 'legs' },
    { key: 'lg', ui: 'gloves' },
    { key: 'lf', ui: 'boots' },
    { key: 'neck', ui: 'necklace' },
    { key: 'lr1', ui: 'ring_left' },
    { key: 'lr2', ui: 'ring_right' },
    { key: 'le1', ui: 'earring_left' },
    { key: 'le2', ui: 'earring_right' },
  ];

  function eqItemId(slotVal) {
    if (slotVal == null) return null;
    if (typeof slotVal === 'number' && slotVal > 0) return slotVal;
    if (typeof slotVal === 'object' && slotVal.itemId != null) {
      var n = Number(slotVal.itemId);
      return Number.isFinite(n) && n > 0 ? n : null;
    }
    return null;
  }

  function eqItemEnchant(slotVal) {
    if (slotVal && typeof slotVal === 'object' && slotVal.enchant != null) {
      return Math.max(0, Math.min(25, Math.floor(Number(slotVal.enchant))));
    }
    return 0;
  }

  function weaponBlocksShieldForUi(wId) {
    if (wId == null || wId <= 0) return false;
    var m =
      global.L2 && global.L2.itemBlocksShieldById && global.L2.itemBlocksShieldById[wId];
    return m === true;
  }

  function itemIconUrlForId(id) {
    if (global.L2 && typeof global.L2.resolveItemIconUrl === 'function') {
      return global.L2.resolveItemIconUrl(id, '/icons/drops/other.svg');
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

  function resolveScope(root) {
    if (!root) return document;
    if (typeof root === 'string') return document.querySelector(root) || document;
    return root;
  }

  function renderEquipSlots(inv, root) {
    inv = inv || { eq: {} };
    var eq = inv.eq || {};
    var scope = resolveScope(root);
    var wId = eqItemId(eq.l1);
    var shId = eqItemId(eq.l2);
    var mirrorTwoHand = wId && !shId && weaponBlocksShieldForUi(wId);

    EQ_SLOT_TO_UI.forEach(function (m) {
      var el = scope.querySelector('[data-l2-slot="' + m.ui + '"]');
      if (!el) return;
      var def = SLOT_ICON_DEFAULT[m.ui] || '/icons/slot_weapon.png';
      var slotVal = eq[m.key];
      var id = eqItemId(slotVal);
      var mirrorHand = false;
      if (m.key === 'l2' && mirrorTwoHand) {
        slotVal = eq.l1;
        id = wId;
        mirrorHand = true;
      }
      if (id) {
        el.classList.add('l2-char-slot-icon--filled');
        if (mirrorHand) {
          el.setAttribute('data-l2-mirror-twohand', '1');
        } else {
          el.removeAttribute('data-l2-mirror-twohand');
        }
        el.setAttribute('tabindex', '0');
        el.setAttribute('role', 'button');
        el.onerror = function () {
          el.onerror = null;
          el.src = def;
        };
        setItemIconSrc(el, id);
      } else {
        el.classList.remove('l2-char-slot-icon--filled');
        el.removeAttribute('data-l2-mirror-twohand');
        el.removeAttribute('tabindex');
        el.setAttribute('role', 'presentation');
        el.onerror = null;
        el.src = def;
      }
    });
  }

  function resolveSlotFromImg(img, getEq) {
    if (!img) return null;
    var mirror = img.getAttribute('data-l2-mirror-twohand') === '1';
    var key = img.getAttribute('data-l2-eq-key');
    if (!key) return null;
    var eq = typeof getEq === 'function' ? getEq() || {} : {};
    if (mirror) {
      if (!eqItemId(eq.l1)) return null;
      return { key: 'l1', slotVal: eq.l1, mirror: true };
    }
    if (!eqItemId(eq[key])) return null;
    return { key: key, slotVal: eq[key], mirror: false };
  }

  function wireEquipSlotView(root, getEq, onOpen) {
    var scope = resolveScope(root);
    if (!scope || scope.dataset.l2EquipViewWired === '1') return;
    scope.dataset.l2EquipViewWired = '1';

    function openFromImg(img) {
      var slot = resolveSlotFromImg(img, getEq);
      if (!slot) return;
      var itemId = eqItemId(slot.slotVal);
      if (!itemId) return;
      var enchant = eqItemEnchant(slot.slotVal);
      if (typeof onOpen === 'function') {
        onOpen({
          key: slot.key,
          slotVal: slot.slotVal,
          itemId: itemId,
          enchant: enchant,
          mirror: slot.mirror,
        });
        return;
      }
      if (global.L2ItemStatsModal && typeof global.L2ItemStatsModal.open === 'function') {
        global.L2ItemStatsModal.open(itemId, { enchant: enchant });
      }
    }

    scope.addEventListener('click', function (e) {
      var img = e.target.closest('img[data-l2-eq-key].l2-char-slot-icon--filled');
      if (!img) return;
      openFromImg(img);
    });
    scope.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var img = e.target.closest('img[data-l2-eq-key].l2-char-slot-icon--filled');
      if (!img) return;
      e.preventDefault();
      openFromImg(img);
    });
  }

  function wireEquipSlotUnequip(root, getEq, onUnequip) {
    var scope = resolveScope(root);
    if (!scope || scope.dataset.l2EquipUnequipWired === '1') return;
    scope.dataset.l2EquipUnequipWired = '1';

    function act(img) {
      var slot = resolveSlotFromImg(img, getEq);
      if (!slot || typeof onUnequip !== 'function') return;
      onUnequip(slot.key, slot.mirror);
    }

    scope.addEventListener('click', function (e) {
      var img = e.target.closest('img[data-l2-eq-key].l2-char-slot-icon--filled');
      if (!img) return;
      act(img);
    });
    scope.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var img = e.target.closest('img[data-l2-eq-key].l2-char-slot-icon--filled');
      if (!img) return;
      e.preventDefault();
      act(img);
    });
  }

  global.L2CharEquipFrame = {
    EQ_SLOT_TO_UI: EQ_SLOT_TO_UI,
    SLOT_ICON_DEFAULT: SLOT_ICON_DEFAULT,
    eqItemId: eqItemId,
    eqItemEnchant: eqItemEnchant,
    weaponBlocksShieldForUi: weaponBlocksShieldForUi,
    renderEquipSlots: renderEquipSlots,
    wireEquipSlotView: wireEquipSlotView,
    wireEquipSlotUnequip: wireEquipSlotUnequip,
  };
})(window);
