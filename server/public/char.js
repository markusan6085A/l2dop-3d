/**
 * Перс — сумка (POST /character/equip). Портрет і слоти як у text-rpg CharacterEquipmentFrame.
 */
(function () {
  var RACE_UK = {
    Human: 'Людина',
    'Dark Elf': 'Темний ельф',
    Elf: 'Ельф',
    Orc: 'Орк',
    Dwarf: 'Гном',
  };

  function pctFromMulUk(mul) {
    var p = Math.round((Number(mul) - 1) * 100);
    return (p >= 0 ? '+' : '') + p + '%';
  }

  function itemDisplayName(id) {
    var n = window.L2 && L2.itemNameById && L2.itemNameById[id];
    return n != null ? n : '#' + id;
  }

  function fallbackIconForId(id) {
    var sl = window.L2 && L2.itemSlotById && L2.itemSlotById[id];
    if (sl === 'chest') return '/assets/items/drops/armor_d/armor_leather_uk_u_i00.png';
    if (sl === 'legs') return '/assets/items/drops/armor_d/armor_leather_uk_l_i00.png';
    if (sl === 'ring' || sl === 'neck' || sl === 'earring') {
      return '/icons/drops/equipment.svg';
    }
    return '/icons/drops/other.svg';
  }

  /** Іконка: спочатку з каталогу GM, інакше `/game/item-icon` (jpg з l2dop або SVG-заглушка). */
  function itemIconUrlForId(id) {
    var u = window.L2 && L2.itemIconById && L2.itemIconById[id];
    if (u != null && u !== '') return u;
    if (id > 0) return '/game/item-icon/' + id;
    return '/icons/drops/other.svg';
  }

  function itemStatsLine(id) {
    var st = window.L2 && L2.itemStatsById && L2.itemStatsById[id];
    if (!st || typeof st !== 'object') return '';
    var sl = window.L2 && L2.itemSlotById && L2.itemSlotById[id];
    var hasJewelAuthor =
      st.jewelMdefFlat != null ||
      st.jewelMaxHp != null ||
      st.jewelMaxMp != null ||
      (st.jewelAcc != null && Number(st.jewelAcc) > 0) ||
      (st.jewelEva != null && Number(st.jewelEva) > 0) ||
      (st.jewelMpRegenMul != null && Number(st.jewelMpRegenMul) > 1) ||
      (st.jewelHoldResistMul != null && Number(st.jewelHoldResistMul) > 1);
    var isJewel =
      sl === 'ring' ||
      sl === 'neck' ||
      sl === 'earring' ||
      hasJewelAuthor;
    var parts = [];
    if (st.pAtk != null) parts.push('P.Atk ' + st.pAtk);
    if (isJewel) {
      var mdef = st.jewelMdefFlat != null ? st.jewelMdefFlat : st.jewelryMAtk != null ? st.jewelryMAtk : st.mAtk;
      if (mdef != null) parts.push('M.Def ' + mdef);
      if (st.jewelMaxHp != null) parts.push('HP +' + st.jewelMaxHp);
      if (st.jewelMaxMp != null) parts.push('MP +' + st.jewelMaxMp);
      if (st.jewelAcc != null) parts.push('Точн. +' + st.jewelAcc);
      if (st.jewelEva != null) parts.push('Ухил. +' + st.jewelEva);
      if (st.jewelMpRegenMul != null && st.jewelMpRegenMul > 1) {
        parts.push('Реген MP ' + pctFromMulUk(st.jewelMpRegenMul));
      }
      if (st.jewelHoldResistMul != null && st.jewelHoldResistMul > 1) {
        parts.push('Стійк. утрим. ' + pctFromMulUk(st.jewelHoldResistMul));
      }
      if (st.pDef != null) parts.push('P.Def ' + st.pDef);
    } else {
      if (st.mAtk != null) parts.push('M.Atk ' + st.mAtk);
      if (st.pDef != null) parts.push('P.Def ' + st.pDef);
    }
    if (st.atkSpd != null) parts.push('Скор. ' + st.atkSpd);
    if (st.wpnCrit != null) parts.push('Крит (база) ' + st.wpnCrit);
    if (st.rCrit != null && Number(st.rCrit) > 0) {
      parts.push('Шанс крит +' + String(st.rCrit));
    }
    return parts.length ? parts.join(' · ') : '';
  }

  /** Дефолтні іконки слотів (як SLOT_ICONS у text-rpg) */
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

  /** server/src/data/inventory.eq: l1, lh, l3, l4, lg, lf; lr/le/neck — біжутерія */
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

  function gradeLabelForItem(id) {
    var g = window.L2 && L2.itemGradeById && L2.itemGradeById[id];
    if (g != null && String(g).trim() !== '') return String(g);
    return '—';
  }

  var revision = 0;

  /** Як у GM-шопі: верхній ряд категорій + грейди D–S (Усі = без фільтра за грейдом). */
  var bagInvCat = 'all';
  /** '' = усі грейди; d|c|b|a|s — для зброї/броні/окремої біжутерії/покращень */
  var bagInvGradeSub = '';

  function $(id) {
    return document.getElementById(id);
  }

  function classLabel(branch) {
    if (branch === 'mystic') return 'Маг';
    if (branch === 'fighter') return 'Воїн';
    return branch ? String(branch) : '—';
  }

  function raceUk(race) {
    if (!race) return '—';
    var s = String(race).trim();
    return RACE_UK[s] != null ? RACE_UK[s] : s;
  }

  function normRace(race) {
    if (!race) return 'Human';
    var s = String(race).trim();
    if (/^dark\s*elf$/i.test(s)) return 'Dark Elf';
    return s;
  }

  /** Повний шлях до портрета в /characters (як profession + race у text-rpg; без gender у БД — чоловічі бази). */
  function portraitUrl(c) {
    if (!c) return '/characters/Human-voin.jpg';
    var nm = c.name != null ? String(c.name).trim().toLowerCase() : '';
    if (nm === 'existence') return '/characters/admin.png';
    var race = normRace(c.race);
    var branch = c.classBranch != null ? String(c.classBranch).toLowerCase() : 'fighter';
    var mystic = branch === 'mystic';
    if (race === 'Human') return mystic ? '/characters/Human-mistsk.jpg' : '/characters/Human-voin.jpg';
    if (race === 'Elf') return mystic ? '/characters/Elf-mag.jpg' : '/characters/Elf-voin.jpg';
    if (race === 'Dark Elf') return mystic ? '/characters/Dark_Elf_mag.jpg' : '/characters/Dark_Elf-voinn.jpg';
    if (race === 'Dwarf') return '/characters/Dwarf_voin.jpg';
    if (race === 'Orc') return mystic ? '/characters/Orc_mag.jpg' : '/characters/Orc_voinn.jpg';
    return '/characters/Human-voin.jpg';
  }

  function renderHeroPortrait(c) {
    var img = $('char-hero-img');
    if (!img) return;
    var url = portraitUrl(c);
    img.onerror = function () {
      img.onerror = null;
      img.src = '/characters/Human-voin.jpg';
    };
    img.src = url;
  }

  /** Див. GET /character itemBlocksShieldById — дворуч займає слот щита візуально. */
  function weaponBlocksShieldForUi(wId) {
    if (wId == null || wId <= 0) return false;
    var m =
      window.L2 && L2.itemBlocksShieldById && L2.itemBlocksShieldById[wId];
    return m === true;
  }

  function renderEquipSlots(inv) {
    inv = inv || { eq: {} };
    var eq = inv.eq || {};
    var wId = eqItemId(eq.l1);
    var shId = eqItemId(eq.l2);
    var mirrorTwoHand =
      wId && !shId && weaponBlocksShieldForUi(wId);
    EQ_SLOT_TO_UI.forEach(function (m) {
      var el = document.querySelector('[data-l2-slot="' + m.ui + '"]');
      if (!el) return;
      var def = SLOT_ICON_DEFAULT[m.ui] || '/icons/slot_weapon.png';
      var id = eqItemId(eq[m.key]);
      var mirrorHand = false;
      if (m.key === 'l2' && mirrorTwoHand) {
        id = wId;
        mirrorHand = true;
      }
      if (id) {
        el.classList.add('l2-char-slot-icon--filled');
        if (mirrorHand) {
          el.setAttribute('title', 'Дворучна зброя (зняти — клацни, зніметься з обох слотів)');
          el.setAttribute('data-l2-mirror-twohand', '1');
        } else {
          el.setAttribute('title', 'Зняти в сумку');
          el.removeAttribute('data-l2-mirror-twohand');
        }
        el.setAttribute('tabindex', '0');
        el.setAttribute('role', 'button');
        el.onerror = function () {
          el.onerror = null;
          el.src = def;
        };
        el.src = itemIconUrlForId(id);
      } else {
        el.classList.remove('l2-char-slot-icon--filled');
        el.removeAttribute('title');
        el.removeAttribute('data-l2-mirror-twohand');
        el.removeAttribute('tabindex');
        el.setAttribute('role', 'presentation');
        el.onerror = null;
        el.src = def;
      }
    });
  }

  function defaultInventory() {
    return { v: 1, stacks: [], eq: {} };
  }

  /** Екіп у сумці: зброя / броня / біж (як «Биж» у text-rpg). */
  function bagGearKind(itemId) {
    var sl = window.L2 && L2.itemSlotById && L2.itemSlotById[itemId];
    if (sl === 'rhand') return 'weapon';
    /** Щит — у вкладці «Броня» разом із доспехом (`shield` — те саме, що lhand у підказках). */
    if (sl === 'lhand' || sl === 'shield') return 'armor';
    if (
      sl === 'chest' ||
      sl === 'legs' ||
      sl === 'head' ||
      sl === 'gloves' ||
      sl === 'feet' ||
      sl === 'fullarmor'
    ) {
      return 'armor';
    }
    if (sl === 'ring' || sl === 'neck' || sl === 'earring') return 'bijou';
    return null;
  }

  /** Не плутати з ремісничим «leather» / матеріалами — щити й дріп екіпу в назві. */
  function nameLooksLikeEquippableGearName(s) {
    if (!s) return false;
    return (
      /\b(shield|armor|breastplate|helmet|boot|boots|gauntlet|gloves|gaiter|gaiters|circlet|robe|tunic|stockings|cloak|jewel)\b/i.test(
        s
      ) ||
      /(щит|броня|шолом|черевик|рукавиц|нагрудник|штани|обладунк|бригантин|діадема|мантія|кольчуг|лат)/i.test(
        s
      )
    );
  }

  function bagInvTabHintFromName(itemId) {
    var name = itemDisplayName(itemId);
    var s = String(name || '');
    if (/^Recipe:/i.test(s) || /^Рецепт/i.test(s)) return 'recipe';
    if (/Scroll:\s*Enchant\s+(Weapon|Armor)/i.test(s)) return 'enchantment';
    if (/Blessed\s+Scroll:\s*Enchant/i.test(s)) return 'enchantment';
    if (/Giant['’]s?\s+Enchant/i.test(s)) return 'enchantment';
    if (/Свиток/i.test(s) && /зачаруван/i.test(s)) return 'enchantment';
    if (/spellbook/i.test(s)) return 'book';
    if (/^quest\s/i.test(s) || /\bquest\s+item\b/i.test(s)) return 'quest';
    if (/soulshot|spiritshot|blessed\s+spiritshot/i.test(s)) return 'consumable';
    if (/potion|elixir|antidote|healing|mana\s+drug|зілл|еліксир|заряд\s+душ/i.test(s))
      return 'consumable';
    if (
      !nameLooksLikeEquippableGearName(s) &&
      /nugget|thread|stem|binder|coal|powder|ore\b|leather|mold\b|cord\b/i.test(s)
    ) {
      return 'resource';
    }
    return null;
  }

  function bagInvTabHint(itemId) {
    var id = Number(itemId);
    var t = window.L2 && L2.itemInventoryTabById && L2.itemInventoryTabById[id];
    if (t != null && String(t).trim() !== '') return String(t);
    return bagInvTabHintFromName(id);
  }

  /** Евристика «стихії» (камені атрибуту тощо), доки немає окремої мітки в каталозі. */
  function bagElementItemGuess(itemId) {
    var name = itemDisplayName(itemId);
    var s = String(name || '');
    var low = s.toLowerCase();
    if (/\b(elemental|attribute)\s+stone\b/i.test(s)) return true;
    if (/камінь\s+стих|стихійн/i.test(s)) return true;
    if (
      /\b(o['’-]?\s*stone|fire\s+stone|water\s+stone|wind\s+stone|earth\s+stone)\b/i.test(low)
    ) {
      return true;
    }
    return false;
  }

  function itemMatchesInvCat(itemId, cat) {
    if (cat === 'all') return true;
    var gk = bagGearKind(itemId);
    var sl = window.L2 && L2.itemSlotById && L2.itemSlotById[itemId];
    var tab = bagInvTabHint(itemId);
    if (cat === 'weapon') return gk === 'weapon';
    if (cat === 'armor') return gk === 'armor';
    if (cat === 'neck') return gk === 'bijou' && sl === 'neck';
    if (cat === 'earring') return gk === 'bijou' && sl === 'earring';
    if (cat === 'ring') return gk === 'bijou' && sl === 'ring';
    if (cat === 'bijou') return gk === 'bijou';
    if (cat === 'elements') return bagElementItemGuess(itemId);
    if (cat === 'upgrades' || cat === 'enchantment') return tab === 'enchantment';
    if (cat === 'consumable') return tab === 'consumable';
    if (cat === 'resource') return tab === 'resource';
    if (cat === 'recipe') return tab === 'recipe';
    if (cat === 'quest') return tab === 'quest';
    if (cat === 'book') return tab === 'book';
    return false;
  }

  /** Є слот екіпу (зброя/броня/біж) і не рецепт/свиток/квест/руна тощо. «Ресурс» лише по назві не блокує — см. nameLooksLikeEquippableGearName. */
  function canEquipFromBag(itemId) {
    if (!bagGearKind(itemId)) return false;
    var tab = bagInvTabHint(itemId);
    if (
      tab === 'recipe' ||
      tab === 'consumable' ||
      tab === 'quest' ||
      tab === 'book' ||
      tab === 'enchantment'
    ) {
      return false;
    }
    return true;
  }

  function normalizedItemGradeKey(itemId) {
    var g = window.L2 && L2.itemGradeById && L2.itemGradeById[itemId];
    if (g == null || String(g).trim() === '') return '';
    return String(g).trim().toLowerCase();
  }

  function stackPassesBagFilters(st) {
    var id = st.itemId;
    if (!itemMatchesInvCat(id, bagInvCat)) return false;
    var gradeCats = ['weapon', 'armor', 'neck', 'earring', 'ring', 'upgrades'];
    if (gradeCats.indexOf(bagInvCat) >= 0 && bagInvGradeSub !== '') {
      var ig = normalizedItemGradeKey(id);
      if (bagInvCat === 'upgrades' && ig === '') return true;
      if (ig !== bagInvGradeSub) return false;
    }
    return true;
  }

  function syncBagInvGradeRow() {
    var row = $('char-bag-inv-grades');
    if (!row) return;
    var show =
      bagInvCat === 'weapon' ||
      bagInvCat === 'armor' ||
      bagInvCat === 'neck' ||
      bagInvCat === 'earring' ||
      bagInvCat === 'ring' ||
      bagInvCat === 'upgrades';
    row.hidden = !show;
  }

  function renderBagFromSnapshot() {
    var snap =
      window.L2 && typeof L2.lastSnapshot === 'function' ? L2.lastSnapshot() : null;
    var inv = snap && snap.inventory ? snap.inventory : defaultInventory();
    renderBag(inv);
  }

  function renderBag(inv) {
    inv = inv || defaultInventory();
    var root = $('char-bag-list');
    var empty = $('char-bag-empty');
    var filtEmpty = $('char-bag-filter-empty');
    if (!root) return;
    root.innerHTML = '';
    var stacks = inv.stacks || [];
    if (stacks.length === 0) {
      if (empty) empty.hidden = false;
      if (filtEmpty) filtEmpty.hidden = true;
      return;
    }
    if (empty) empty.hidden = true;
    var filtered = stacks.filter(stackPassesBagFilters);
    if (filtered.length === 0) {
      if (filtEmpty) filtEmpty.hidden = false;
      return;
    }
    if (filtEmpty) filtEmpty.hidden = true;
    filtered.forEach(function (st) {
      var en = st.enchant != null ? Number(st.enchant) : 0;
      if (!Number.isFinite(en) || en < 0) en = 0;
      var row = document.createElement('div');
      row.className = 'l2-char-bag-row';
      row.setAttribute(
        'data-item-json',
        JSON.stringify({ itemId: st.itemId, qty: st.qty, enchant: en })
      );
      var ic = document.createElement('img');
      ic.className = 'l2-char-bag-icon l2-char-bag-icon--stats';
      ic.alt = '';
      ic.width = 28;
      ic.height = 28;
      ic.draggable = false;
      ic.setAttribute('role', 'button');
      ic.setAttribute('tabindex', '0');
      ic.setAttribute('aria-label', 'Характеристики предмета');
      ic.src = itemIconUrlForId(st.itemId);
      ic.onerror = function () {
        ic.onerror = null;
        ic.src = fallbackIconForId(st.itemId);
      };
      var mid = document.createElement('div');
      mid.className = 'l2-char-bag-row-text';
      var label = document.createElement('span');
      label.className = 'l2-char-bag-name';
      var nameLine = itemDisplayName(st.itemId) + ' ×' + st.qty;
      if (en > 0) nameLine += ' +' + en;
      label.textContent = nameLine;
      mid.appendChild(label);
      var statLine = itemStatsLine(st.itemId);
      if (statLine) {
        var stEl = document.createElement('span');
        stEl.className = 'l2-char-bag-stats';
        stEl.textContent = statLine;
        mid.appendChild(stEl);
      }
      row.appendChild(ic);
      row.appendChild(mid);
      if (canEquipFromBag(st.itemId)) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'l2-char-bag-equip';
        btn.textContent = 'Одіти';
        btn.setAttribute('data-item-id', String(st.itemId));
        btn.setAttribute('data-item-enchant', String(en));
        row.appendChild(btn);
      }
      root.appendChild(row);
    });
  }

  function stubWeight(inv) {
    inv = inv || defaultInventory();
    var n = (inv.stacks || []).length;
    Object.keys(inv.eq || {}).forEach(function () {
      n += 1;
    });
    return Math.max(1, n);
  }

  function renderAll(c) {
    var inv = c.inventory || defaultInventory();
    renderBag(inv);
    renderHeroPortrait(c);
    renderEquipSlots(inv);
    var wcur = $('char-w-cur');
    var wmax = $('char-w-max');
    if (wcur) wcur.textContent = String(stubWeight(inv));
    if (wmax) wmax.textContent = '80';

    if ($('char-adena')) $('char-adena').textContent = c.adena != null ? String(c.adena) : '0';
    if ($('char-exp')) $('char-exp').textContent = c.exp != null ? String(c.exp) : '0';
    if ($('char-sp')) $('char-sp').textContent = c.sp != null ? String(c.sp) : '0';

    revision = c.revision != null ? Number(c.revision) : 0;
  }

  async function apiEquip(itemId, enchant) {
    var t = localStorage.getItem('token');
    var en =
      enchant != null && Number.isFinite(Number(enchant))
        ? Math.max(0, Math.min(20, Math.floor(Number(enchant))))
        : 0;
    var r = await fetch('/character/equip', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + t,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'equip',
        itemId: itemId,
        enchant: en,
        expectedRevision: revision,
      }),
    });
    if (r.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
      return;
    }
    if (r.status === 409) {
      window.location.reload();
      return;
    }
    if (!r.ok) {
      var msg = 'Не вдалося одягнути.';
      try {
        var j = await r.json();
        if (j && j.messageUk) msg = j.messageUk;
      } catch (e) {
        /* ignore */
      }
      var stub = $('char-stub-msg');
      if (stub) {
        stub.hidden = false;
        stub.textContent = msg;
      }
      return;
    }
    var out = await r.json();
    var c = out.character;
    window.L2.setLastSnapshot(c);
    renderAll(c);
  }

  async function apiUnequip(slotKey) {
    var t = localStorage.getItem('token');
    var r = await fetch('/character/equip', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + t,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'unequip',
        slot: slotKey,
        expectedRevision: revision,
      }),
    });
    if (r.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
      return;
    }
    if (r.status === 409) {
      window.location.reload();
      return;
    }
    if (!r.ok) {
      var msg = 'Не вдалося зняти предмет.';
      try {
        var j = await r.json();
        if (j && j.messageUk) msg = j.messageUk;
      } catch (e) {
        /* ignore */
      }
      var stub = $('char-stub-msg');
      if (stub) {
        stub.hidden = false;
        stub.textContent = msg;
      }
      return;
    }
    var out = await r.json();
    var c = out.character;
    window.L2.setLastSnapshot(c);
    renderAll(c);
  }

  function wireEquipSlotClicks() {
    var frame = document.querySelector('.l2-char-equip-frame');
    if (!frame) return;
    frame.addEventListener('click', function (e) {
      var img = e.target.closest('img[data-l2-eq-key].l2-char-slot-icon--filled');
      if (!img) return;
      var mirror = img.getAttribute('data-l2-mirror-twohand') === '1';
      var key = img.getAttribute('data-l2-eq-key');
      if (!key) return;
      var snap = window.L2 && typeof L2.lastSnapshot === 'function' ? L2.lastSnapshot() : null;
      var inv = snap && snap.inventory ? snap.inventory : null;
      var eq = inv && inv.eq ? inv.eq : {};
      if (mirror) {
        if (!eqItemId(eq.l1)) return;
        apiUnequip('l1');
        return;
      }
      if (!eqItemId(eq[key])) return;
      apiUnequip(key);
    });
    frame.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var img = e.target.closest('img[data-l2-eq-key].l2-char-slot-icon--filled');
      if (!img) return;
      e.preventDefault();
      var mirror = img.getAttribute('data-l2-mirror-twohand') === '1';
      var key = img.getAttribute('data-l2-eq-key');
      if (!key) return;
      var snap = window.L2 && typeof L2.lastSnapshot === 'function' ? L2.lastSnapshot() : null;
      var inv = snap && snap.inventory ? snap.inventory : null;
      var eq = inv && inv.eq ? inv.eq : {};
      if (mirror) {
        if (!eqItemId(eq.l1)) return;
        apiUnequip('l1');
        return;
      }
      if (!eqItemId(eq[key])) return;
      apiUnequip(key);
    });
  }

  function wireBagInvFilters() {
    var root = document.querySelector('.l2-char-inv-filters');
    if (!root) return;
    root.addEventListener('click', function (e) {
      var catBtn = e.target.closest('[data-inv-cat]');
      if (catBtn) {
        var c = catBtn.getAttribute('data-inv-cat') || 'all';
        bagInvCat = c;
        bagInvGradeSub = '';
        document.querySelectorAll('.l2-char-inv-filters [data-inv-cat]').forEach(function (x) {
          var on = x.getAttribute('data-inv-cat') === c;
          x.classList.toggle('l2-char-inv-link--active', on);
          x.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        document.querySelectorAll('.l2-char-inv-grade').forEach(function (x) {
          var gv = String(x.getAttribute('data-inv-grade') || '').toLowerCase();
          x.classList.toggle('l2-char-inv-grade--active', gv === 'all');
        });
        syncBagInvGradeRow();
        renderBagFromSnapshot();
        return;
      }
      var gBtn = e.target.closest('[data-inv-grade]');
      if (gBtn) {
        var g = String(gBtn.getAttribute('data-inv-grade') || '').toLowerCase();
        if (g === 'all') {
          bagInvGradeSub = '';
        } else {
          bagInvGradeSub = bagInvGradeSub === g ? '' : g;
        }
        document.querySelectorAll('.l2-char-inv-grade').forEach(function (x) {
          var gv = String(x.getAttribute('data-inv-grade') || '').toLowerCase();
          var on = gv === 'all' ? bagInvGradeSub === '' : gv !== '' && gv === bagInvGradeSub;
          x.classList.toggle('l2-char-inv-grade--active', on);
        });
        renderBagFromSnapshot();
      }
    });
    syncBagInvGradeRow();
  }

  function wireBagClicks() {
    var root = $('char-bag-list');
    if (!root) return;
    function openFromRow(row) {
      if (!row) return;
      var raw = row.getAttribute('data-item-json');
      if (!raw) return;
      try {
        openBagModal(JSON.parse(raw));
      } catch (e0) {
        /* ignore */
      }
    }
    root.addEventListener('click', function (e) {
      var btn = e.target.closest('.l2-char-bag-equip');
      if (btn) {
        e.stopPropagation();
        var id = btn.getAttribute('data-item-id');
        if (!id) return;
        var ben = btn.getAttribute('data-item-enchant');
        apiEquip(Number(id), ben != null ? Number(ben) : 0);
        return;
      }
      var icon = e.target.closest('.l2-char-bag-icon--stats');
      if (icon) {
        e.stopPropagation();
        openFromRow(icon.closest('.l2-char-bag-row'));
        return;
      }
    });
    root.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var icon = e.target.closest('.l2-char-bag-icon--stats');
      if (!icon) return;
      e.preventDefault();
      openFromRow(icon.closest('.l2-char-bag-row'));
    });
  }

  function slotKindUk(itemId) {
    var sl = window.L2 && L2.itemSlotById && L2.itemSlotById[itemId];
    if (sl === 'chest') return 'Обладунки (верх)';
    if (sl === 'legs') return 'Обладунки (низ)';
    if (sl === 'rhand') return 'Зброя (права рука)';
    if (sl === 'lhand' || sl === 'shield') return 'Щит (ліва рука)';
    if (sl === 'ring') return 'Кільце';
    if (sl === 'neck') return 'Намисто';
    if (sl === 'earring') return 'Сережки';
    return 'Предмет';
  }

  function closeBagModal() {
    var ov = $('char-bag-modal-overlay');
    if (ov) {
      ov.hidden = true;
      ov.setAttribute('aria-hidden', 'true');
    }
    document.body.classList.remove('l2-gm-modal-open');
  }

  function openBagModal(payload) {
    if (!payload || payload.itemId == null) return;
    var itemId = Number(payload.itemId);
    var qty = payload.qty != null ? Number(payload.qty) : 1;
    var modalEn =
      payload.enchant != null && Number.isFinite(Number(payload.enchant))
        ? Math.max(0, Math.min(20, Math.floor(Number(payload.enchant))))
        : 0;
    var ov = $('char-bag-modal-overlay');
    var title = $('char-bag-modal-title');
    var kind = $('char-bag-modal-kind');
    var gradeEl = $('char-bag-modal-grade');
    var icon = $('char-bag-modal-icon');
    var statsEl = $('char-bag-modal-stats');
    var qtyEl = $('char-bag-modal-qty');
    var equipBtn = $('char-bag-modal-equip');
    var armorSetsEl = $('char-bag-modal-armor-sets');
    if (!ov || !title || !statsEl || !qtyEl || !equipBtn) return;
    title.textContent = itemDisplayName(itemId);
    if (gradeEl) gradeEl.textContent = gradeLabelForItem(itemId);
    if (kind) kind.textContent = slotKindUk(itemId);
    if (icon) {
      icon.src = itemIconUrlForId(itemId);
      icon.onerror = function () {
        icon.onerror = null;
        icon.src = fallbackIconForId(itemId);
      };
    }
    statsEl.innerHTML = '';
    function addRow(k, v) {
      var dt = document.createElement('dt');
      dt.textContent = k;
      var dd = document.createElement('dd');
      dd.textContent = v;
      statsEl.appendChild(dt);
      statsEl.appendChild(dd);
    }
    if (modalEn > 0) addRow('Заточка', '+' + modalEn);
    var st = window.L2 && L2.itemStatsById && L2.itemStatsById[itemId];
    var slKind = window.L2 && L2.itemSlotById && L2.itemSlotById[itemId];
    var hasJewelAuthorModal =
      st &&
      typeof st === 'object' &&
      (st.jewelMdefFlat != null ||
        st.jewelMaxHp != null ||
        st.jewelMaxMp != null ||
        (st.jewelAcc != null && Number(st.jewelAcc) > 0) ||
        (st.jewelEva != null && Number(st.jewelEva) > 0) ||
        (st.jewelMpRegenMul != null && Number(st.jewelMpRegenMul) > 1) ||
        (st.jewelHoldResistMul != null &&
          Number(st.jewelHoldResistMul) > 1));
    var isJewelModal =
      slKind === 'ring' ||
      slKind === 'neck' ||
      slKind === 'earring' ||
      hasJewelAuthorModal;
    if (st && typeof st === 'object') {
      if (st.pAtk != null) addRow('P. Atk.', String(st.pAtk));
      if (isJewelModal) {
        var mdef =
          st.jewelMdefFlat != null
            ? st.jewelMdefFlat
            : st.jewelryMAtk != null
              ? st.jewelryMAtk
              : st.mAtk;
        if (mdef != null) addRow('Маг. захист (M.Def)', String(mdef));
        if (st.jewelMaxHp != null && st.jewelMaxHp > 0) {
          addRow('HP макс.', '+' + String(st.jewelMaxHp));
        }
        if (st.jewelMaxMp != null && st.jewelMaxMp > 0) {
          addRow('MP макс.', '+' + String(st.jewelMaxMp));
        }
        if (st.jewelAcc != null && st.jewelAcc > 0) {
          addRow('Точність', '+' + String(st.jewelAcc));
        }
        if (st.jewelEva != null && st.jewelEva > 0) {
          addRow('Ухилення', '+' + String(st.jewelEva));
        }
        if (
          st.jewelMpRegenMul != null &&
          st.jewelMpRegenMul > 1 &&
          Number.isFinite(Number(st.jewelMpRegenMul))
        ) {
          addRow('Реген MP', pctFromMulUk(st.jewelMpRegenMul));
        }
        if (
          st.jewelHoldResistMul != null &&
          st.jewelHoldResistMul > 1 &&
          Number.isFinite(Number(st.jewelHoldResistMul))
        ) {
          addRow('Стійкість до утримання', pctFromMulUk(st.jewelHoldResistMul));
        }
        if (st.pDef != null) addRow('P. Def.', String(st.pDef));
      } else {
        if (st.mAtk != null) addRow('M. Atk.', String(st.mAtk));
        if (st.pDef != null) addRow('P. Def.', String(st.pDef));
      }
      if (st.atkSpd != null) addRow('Скор. атаки', String(st.atkSpd));
      if (st.wpnCrit != null) addRow('Крит (база типу)', String(st.wpnCrit));
      if (st.rCrit != null && Number(st.rCrit) > 0) {
        addRow('Шанс крит (зброя)', '+' + String(st.rCrit));
      }
    }
    qtyEl.textContent = 'У сумці: ×' + (Number.isFinite(qty) ? qty : 1);
    if (armorSetsEl && window.L2ArmorSetBonusesUI) {
      if (window.L2ArmorSetBonusesUI.isArmorSlot(slKind)) {
        window.L2ArmorSetBonusesUI.showIn(
          armorSetsEl,
          gradeLabelForItem(itemId),
          itemId
        );
      } else {
        window.L2ArmorSetBonusesUI.hide(armorSetsEl);
      }
    }
    var canEq = canEquipFromBag(itemId);
    equipBtn.hidden = !canEq;
    if (canEq) {
      equipBtn.setAttribute('data-item-id', String(itemId));
      equipBtn.setAttribute('data-item-enchant', String(modalEn));
    } else {
      equipBtn.removeAttribute('data-item-id');
      equipBtn.removeAttribute('data-item-enchant');
    }
    ov.hidden = false;
    ov.setAttribute('aria-hidden', 'false');
    document.body.classList.add('l2-gm-modal-open');
  }

  function ensureCharBagModalOnBody() {
    var ov = $('char-bag-modal-overlay');
    if (ov && ov.parentNode !== document.body) {
      document.body.appendChild(ov);
    }
  }

  function wireBagModal() {
    ensureCharBagModalOnBody();
    var ov = $('char-bag-modal-overlay');
    var closeBtn = $('char-bag-modal-close');
    var equipBtn = $('char-bag-modal-equip');
    if (closeBtn) closeBtn.addEventListener('click', closeBagModal);
    if (ov) {
      ov.addEventListener('click', function (e) {
        if (e.target === ov) closeBagModal();
      });
    }
    if (equipBtn) {
      equipBtn.addEventListener('click', function () {
        var id = equipBtn.getAttribute('data-item-id');
        if (!id) return;
        var ben = equipBtn.getAttribute('data-item-enchant');
        closeBagModal();
        apiEquip(Number(id), ben != null ? Number(ben) : 0);
      });
    }
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      var m = $('char-bag-modal-overlay');
      if (!m || m.hidden) return;
      e.preventDefault();
      closeBagModal();
    });
  }

  async function init() {
    if (window.L2 && typeof L2.mountL2Nav === 'function') {
      L2.mountL2Nav({
        onStub: function (label) {
          var el = $('char-stub-msg');
          if (el) {
            el.hidden = false;
            el.textContent = '«' + label + '» — заглушка, з’явиться пізніше.';
          }
        },
      });
    }
    if (window.L2 && typeof L2.mountFootLinkBar === 'function') {
      L2.mountFootLinkBar('l2-foot-links', { inset: true });
    }

    document.querySelectorAll('.l2-char-mobi [data-stub]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var label = btn.getAttribute('data-stub');
        if (!label) return;
        var msg = $('char-stub-msg');
        if (msg) {
          msg.hidden = false;
          msg.textContent = '«' + label + '» — заглушка, з’явиться пізніше.';
        }
      });
    });

    wireBagClicks();
    wireBagInvFilters();
    wireBagModal();
    wireEquipSlotClicks();

    var errEl = $('char-load-err');
    var content = $('char-content');
    var t = localStorage.getItem('token');

    if (!t) {
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent = 'Потрібен вхід. Перейди на головну.';
      }
      if (content) content.hidden = true;
      if (window.L2 && typeof L2.clearHudPanel === 'function') L2.clearHudPanel();
      return;
    }

    var r = await fetch('/character', {
      headers: { Authorization: 'Bearer ' + t },
    });
    if (r.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
      return;
    }
    if (!r.ok) {
      var perr = 'Не вдалося завантажити персонажа.';
      try {
        var pej = await r.json();
        if (pej && pej.messageUk) perr = pej.messageUk;
      } catch (ePe) {
        /* ignore */
      }
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent = perr;
      }
      return;
    }

    var j = await r.json();
    var c = j.character;
    window.L2.setLastSnapshot(c);
    if (window.L2 && typeof L2.applyHudFromSnapshot === 'function') {
      L2.applyHudFromSnapshot(c);
    }

    if (j.gearCatalog && window.L2 && typeof L2.mergeGearCatalog === 'function') {
      L2.mergeGearCatalog(j.gearCatalog);
    }
    if (j.itemNamesUk && typeof j.itemNamesUk === 'object' && window.L2 && L2.itemNameById) {
      Object.keys(j.itemNamesUk).forEach(function (k) {
        L2.itemNameById[k] = j.itemNamesUk[k];
      });
    }
    if (j.itemSlotHints && typeof j.itemSlotHints === 'object' && window.L2 && L2.itemSlotById) {
      Object.keys(j.itemSlotHints).forEach(function (k) {
        if (L2.itemSlotById[k] == null) L2.itemSlotById[k] = j.itemSlotHints[k];
      });
    }
    if (
      j.itemInventoryTabHints &&
      typeof j.itemInventoryTabHints === 'object' &&
      window.L2 &&
      L2.itemInventoryTabById
    ) {
      Object.keys(j.itemInventoryTabHints).forEach(function (k) {
        L2.itemInventoryTabById[k] = j.itemInventoryTabHints[k];
      });
    }
    if (j.itemGradeHints && typeof j.itemGradeHints === 'object' && window.L2 && L2.itemGradeById) {
      Object.keys(j.itemGradeHints).forEach(function (k) {
        L2.itemGradeById[k] = j.itemGradeHints[k];
      });
    }
    if (j.itemStatsHints && typeof j.itemStatsHints === 'object' && window.L2 && L2.itemStatsById) {
      Object.keys(j.itemStatsHints).forEach(function (k) {
        var st = j.itemStatsHints[k];
        if (!st || typeof st !== 'object') return;
        var prev = L2.itemStatsById[k] || {};
        L2.itemStatsById[k] = Object.assign({}, prev, st);
      });
    }
    if (
      j.itemBlocksShieldById &&
      typeof j.itemBlocksShieldById === 'object' &&
      window.L2 &&
      L2.itemBlocksShieldById
    ) {
      Object.keys(j.itemBlocksShieldById).forEach(function (k) {
        L2.itemBlocksShieldById[k] = j.itemBlocksShieldById[k];
      });
    }

    var nb = $('char-name-bracket');
    if (nb && c.name != null && c.level != null) {
      nb.textContent = String(c.name) + '[' + String(c.level) + ']';
    }

    renderAll(c);

    if (errEl) errEl.hidden = true;
    if (content) content.hidden = false;
  }

  init();
})();
