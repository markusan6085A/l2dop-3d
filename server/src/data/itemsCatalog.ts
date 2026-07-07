/**
 * Предмети з l2dop lineage (items3): GM-шоп (зброя + броня + біжутерія D–S) для екіпу та бою.
 */
import {
  L2DOP_GM_SHOP_ARMOR,
  L2DOP_GM_SHOP_JEWELRY,
  L2DOP_GM_SHOP_WEAPONS,
  type GmShopGrade,
  type GmShopJewelryKind,
  type GmShopWeaponKind,
} from './l2dopGmShopCatalog.generated.js';
import type { WeaponKindForEnchant } from './l2dopEnchant.js';
import { mergeNgDropsWeapons } from './itemsCatalogNgWeapons.js';
import { L2DOP_NG_DROPS_ARMOR_BY_SHOP_KEY_LOWER } from './l2dopNgArmorDropsPatches.js';
import { JEWELRY_AUTHOR_ITEM_PATCH } from './l2dopJewelryAuthorStats.js';

/** Базовий крит типу зброї ($WpnCrt) — як у calc_stats для відображення в GM-шопі та каталозі. */
export function wpnCritForWeaponKind(wt: WeaponKindForEnchant): number {
  return wt === 'sword' ||
    wt === 'bigsword' ||
    wt === 'dual' ||
    wt === 'pole' ||
    wt === 'fist'
    ? 80
    : 120;
}
import {
  L2DOP_ITEM_DISPLAY_NAME_UK,
  L2DOP_ITEM_GRADE_UK,
  L2DOP_ITEM_SLOT_HINT,
  L2DOP_ITEM_STATS_HINT,
} from './l2dopItemDisplayNameUk.js';
import {
  L2DOP_ITEM_INVENTORY_TAB,
  type L2ItemInventoryTabHint,
} from './l2dopItemInventoryTab.generated.js';
import { RESOURCE_CRAFT_ITEM_NAMES_UK } from './resourceCraftItemNamesUk.js';
import { dropsShopConsumableGearCatalogExtras } from './dropsShopConsumableGearExtras.js';
import { starterGearCatalogExtras } from './starterGearCatalogExtras.js';

export type ItemSlotKind =
  | 'rhand'
  /** Щит (лівої руки) — eq.l2 у JSON персонажа. */
  | 'lhand'
  | 'chest'
  | 'legs'
  | 'head'
  | 'gloves'
  | 'feet'
  /** Повний доспех (верх+низ) одним предметом — як у lineage.sql `fullarmor` */
  | 'fullarmor'
  | 'ring'
  | 'neck'
  | 'earring'
  /** Розхідники (зілля, заряди тощо) — лише сумка, без екіпу. */
  | 'consumable';

/** Як `armorType` у GM-каталозі / items3; robe у даті = `magic`. */
export type ArmorTypeKind = 'heavy' | 'light' | 'magic';

function armorTypeFromGm(t: string): ArmorTypeKind | undefined {
  if (t === 'heavy' || t === 'light' || t === 'magic') return t;
  return undefined;
}

export interface ItemMeta {
  nameUk: string;
  slot: ItemSlotKind;
  /** P.Def для броні; для зброї можна з gm-рядка */
  pDef?: number;
  /** Для нагрудника / низу / fullarmor — під пасивки майстерності броні. */
  armorType?: ArmorTypeKind;
  pAtk?: number;
  mAtk?: number;
  /**
   * Авторський M.Def біжутерії (фінальний доданок до розрахунку, без LVLMOD/MENMOD).
   * Якщо задано — у бою не використовується класичний `mAtk` цієї прикраси.
   */
  jewelMdefFlat?: number;
  jewelMaxHp?: number;
  jewelMaxMp?: number;
  jewelAcc?: number;
  jewelEva?: number;
  jewelMpRegenMul?: number;
  jewelHoldResistMul?: number;
  /** Для розрахунку заточки P.Atk — як $WpnType у calc_stats.php (D-grade). */
  weaponType?: WeaponKindForEnchant;
  /** Як $WpnSpd у calc_stats.php (поле Spd items3 / gmShop). */
  atkSpd?: number;
  /** Базовий крит зброї $WpnCrt (sword 80, blunt/dagger 120 — calc_stats.php). */
  wpnCrit?: number;
  /** Бонус до крит-стату з предмета $WpnCRIT (rCrit у items3 / екіп). */
  rCrit?: number;
}

/** Ключ = item_id у БД l2dop */
export const ITEM_CATALOG: Record<number, ItemMeta> = (() => {
  const o: Record<number, ItemMeta> = {};
  for (const row of L2DOP_GM_SHOP_WEAPONS) {
    const wpnCrit = wpnCritForWeaponKind(row.weaponType);
    o[row.itemId] = {
      nameUk: row.nameUk,
      slot: 'rhand',
      pAtk: row.pAtk,
      mAtk: row.mAtk,
      weaponType: row.weaponType,
      atkSpd: row.atkSpd,
      wpnCrit,
      ...(row.rCrit > 0 ? { rCrit: row.rCrit } : {}),
    };
  }
  for (const row of L2DOP_GM_SHOP_ARMOR) {
    const at = armorTypeFromGm(row.armorType);
    o[row.itemId] = {
      nameUk: row.nameUk,
      slot: row.armorSlot,
      pDef: row.pDef,
      ...(at ? { armorType: at } : {}),
    };
  }
  /**
   * Major Arcana robe у GM-джерелі приходить як `chest`, але по L2 це full robe
   * (один предмет займає верх + низ).
   */
  if (o[6383]) {
    o[6383] = { ...o[6383], slot: 'fullarmor' };
  }
  for (const row of L2DOP_GM_SHOP_JEWELRY) {
    o[row.itemId] = {
      nameUk: row.nameUk,
      slot: row.jewelryKind === 'earring' ? 'earring' : row.jewelryKind,
      mAtk: row.mAtk,
      pDef: row.pDef,
    };
  }
  /** Лук душі (`weapon_a/soul_bow.jpg`): id з lineage Interlude — у генерованому GM-каталозі рядку немає. */
  o[7575] = {
    nameUk: 'Лук душі A-grade.',
    slot: 'rhand',
    pAtk: 304,
    mAtk: 114,
    weaponType: 'bow',
    atkSpd: 293,
    wpnCrit: wpnCritForWeaponKind('bow'),
    rCrit: 12,
  };

  /** B-grade зброя з іконки `weapon_b/…`, немає в GM-CSV. Id з дампу lineage. */
  o[79] = {
    nameUk: 'Меч Дамаску B-grade.',
    slot: 'rhand',
    pAtk: 306,
    mAtk: 99,
    weaponType: 'bigsword',
    atkSpd: 379,
    wpnCrit: wpnCritForWeaponKind('bigsword'),
    rCrit: 8,
  };
  o[8336] = {
    nameUk: 'Сльоза чарівника B-grade.',
    slot: 'rhand',
    pAtk: 88,
    mAtk: 236,
    weaponType: 'sword',
    atkSpd: 379,
    wpnCrit: wpnCritForWeaponKind('sword'),
    rCrit: 8,
  };
  o[8340] = {
    nameUk: 'Кістки Каїма Ванула B-grade.',
    slot: 'rhand',
    pAtk: 88,
    mAtk: 176,
    weaponType: 'bigblunt',
    atkSpd: 379,
    wpnCrit: wpnCritForWeaponKind('bigblunt'),
    rCrit: 4,
  };
  /** C-grade дуали (`weapon_c/baguette_s_dualsword.jpg`) — немає в генерованому GM-CSV; синтезований id. */
  o[900224] = {
    nameUk: 'Дворучний меч Багет C-grade.',
    slot: 'rhand',
    pAtk: 222,
    mAtk: 38,
    weaponType: 'dual',
    atkSpd: 325,
    wpnCrit: wpnCritForWeaponKind('dual'),
    rCrit: 4,
  };
  /** «Tome of Blood» (`weapon_d/tome_of_blood.jpg`), id 317 — у GM-генерації рядка немає. */
  o[317] = {
    nameUk: 'Том крові D-grade.',
    slot: 'rhand',
    pAtk: 9,
    mAtk: 80,
    weaponType: 'sword',
    atkSpd: 379,
    wpnCrit: wpnCritForWeaponKind('sword'),
    rCrit: 8,
  };

  mergeNgDropsWeapons(o);
  for (const patch of Object.values(L2DOP_NG_DROPS_ARMOR_BY_SHOP_KEY_LOWER)) {
    o[patch.itemId] = {
      nameUk: patch.nameUk,
      slot: patch.slot,
      pDef: patch.pDef,
      armorType: patch.armorType,
    };
  }

  /**
   * Біжутерія для дроп-магазину без рядка в GM-CSV: NG з l2dop items, запечатана A (іконки i02).
   * `mAtk` тут = бонус M.Def у бою (як у рядках L2DOP_GM_SHOP_JEWELRY).
   */
  const extraJewelry: Record<
    number,
    { nameUk: string; slot: 'earring' | 'neck' | 'ring'; mAtk: number }
  > = {
    112: { nameUk: 'Сережка учня.', slot: 'earring', mAtk: 11 },
    113: { nameUk: 'Сережка містика.', slot: 'earring', mAtk: 13 },
    114: { nameUk: 'Сережка сили.', slot: 'earring', mAtk: 16 },
    115: { nameUk: 'Сережка мудрості.', slot: 'earring', mAtk: 16 },
    117: { nameUk: 'Кільце мани B-grade.', slot: 'ring', mAtk: 34 },
    118: { nameUk: 'Намисто магії.', slot: 'neck', mAtk: 15 },
    875: { nameUk: 'Кільце знань.', slot: 'ring', mAtk: 9 },
    876: { nameUk: 'Кільце муки.', slot: 'ring', mAtk: 11 },
    877: { nameUk: 'Кільце мудрості.', slot: 'ring', mAtk: 12 },
    878: { nameUk: 'Кільце з блакитного коралу.', slot: 'ring', mAtk: 14 },
    906: { nameUk: 'Намисто знань.', slot: 'neck', mAtk: 18 },
    907: { nameUk: 'Намисто муки.', slot: 'neck', mAtk: 21 },
    908: { nameUk: 'Намисто мудрості.', slot: 'neck', mAtk: 25 },
    909: { nameUk: 'Намисто з блакитного діаманту.', slot: 'neck', mAtk: 28 },
    1506: { nameUk: 'Намисто мужності.', slot: 'neck', mAtk: 15 },
    1507: { nameUk: 'Намисто доблесті.', slot: 'neck', mAtk: 21 },
    1508: { nameUk: 'Кільце єнота.', slot: 'ring', mAtk: 11 },
    1509: { nameUk: 'Кільце світлячка.', slot: 'ring', mAtk: 11 },
    6323: { nameUk: 'Запечатане намисто фенікса A-grade.', slot: 'neck', mAtk: 76 },
    6324: { nameUk: 'Запечатана сережка фенікса A-grade.', slot: 'earring', mAtk: 57 },
    6325: { nameUk: 'Запечатане кільце фенікса A-grade.', slot: 'ring', mAtk: 38 },
    6326: { nameUk: 'Запечатане намисто величі A-grade.', slot: 'neck', mAtk: 80 },
    6327: { nameUk: 'Запечатана сережка величі A-grade.', slot: 'earring', mAtk: 60 },
    6328: { nameUk: 'Запечатане кільце величі A-grade.', slot: 'ring', mAtk: 40 },
  };
  for (const [idStr, meta] of Object.entries(extraJewelry)) {
    const id = Number(idStr);
    if (!Number.isFinite(id) || o[id]) continue;
    o[id] = { nameUk: meta.nameUk, slot: meta.slot, mAtk: meta.mAtk, pDef: 0 };
  }

  /** Дроп / items3: слот з L2DOP_ITEM_SLOT_HINT, якщо id ще не в GM-шопі. */
  function slotHintToKind(h: string): ItemSlotKind | null {
    if (h === 'ring') return 'ring';
    if (h === 'neck' || h === 'necklace') return 'neck';
    if (h === 'earring') return 'earring';
    if (h === 'shield' || h === 'lhand') return 'lhand';
    return null;
  }
  for (const [idStr, hint] of Object.entries(L2DOP_ITEM_SLOT_HINT)) {
    const id = Number(idStr);
    if (!Number.isFinite(id) || id <= 0 || o[id]) continue;
    const slot = slotHintToKind(hint);
    if (!slot) continue;
    o[id] = {
      nameUk: L2DOP_ITEM_DISPLAY_NAME_UK[id] ?? `Предмет ${id}`,
      slot,
      pDef: 0,
      mAtk: 0,
    };
    const hSt = L2DOP_ITEM_STATS_HINT[id];
    if (hSt) {
      if (hSt.pDef != null) o[id].pDef = hSt.pDef;
      if (hSt.mAtk != null) o[id].mAtk = hSt.mAtk;
    }
  }
  for (const [idStr, row] of Object.entries(JEWELRY_AUTHOR_ITEM_PATCH)) {
    const id = Number(idStr);
    if (!Number.isFinite(id) || id <= 0) continue;
    const prev = o[id];
    o[id] = {
      ...(prev ?? {
        nameUk: L2DOP_ITEM_DISPLAY_NAME_UK[id] ?? `Предмет ${id}`,
        slot: 'earring',
        pDef: 0,
      }),
      ...row,
    } as ItemMeta;
  }

  /**
   * GM-генерація інколи ставить sword/blunt замість pole/bow/bigsword;
   * дворучність l1+l2 (щит) і $WpnType для бою — як у l2dopTwoHandedWeapon.
   * Tomahawk (автор): дворучна бита → bigblunt.
   */
  const WEAPON_HANDEDNESS_TYPE_PATCH: Partial<
    Record<number, WeaponKindForEnchant>
  > = {
    86: 'bigblunt',
    7784: 'pole',
    7889: 'bigblunt',
    7890: 'bow',
    7891: 'bow',
    7892: 'bigblunt',
    7893: 'fist',
    7894: 'bigblunt',
    7895: 'bigsword',
  };
  for (const [idStr, wt] of Object.entries(WEAPON_HANDEDNESS_TYPE_PATCH)) {
    if (wt == null) continue;
    const id = Number(idStr);
    const m = o[id];
    if (!m || m.slot !== 'rhand' || !m.weaponType) continue;
    m.weaponType = wt;
    m.wpnCrit = wpnCritForWeaponKind(wt);
  }

  /** Розхідники для крамниці (id з Interlude); не перезаписує наявний рядок. Зілля великого зцілення (1539) навмисно виключено. */
  const CONSUMABLE_CATALOG_STUBS: Record<number, { nameUk: string }> = {
    1060: { nameUk: 'Зілля слабкого зцілення' },
    1061: { nameUk: 'Зілля зцілення' },
    726: { nameUk: 'Зілля мани (мала банка)' },
    728: { nameUk: 'Зілля мани (велика банка)' },
    17: { nameUk: 'Дерев’яна стріла' },
    1341: { nameUk: 'Кістяна стріла' },
    1342: { nameUk: 'Стріла з якісної сталі' },
    1343: { nameUk: 'Срібна стріла' },
    1344: { nameUk: 'Мітрилова стріла' },
    1345: { nameUk: 'Сяюча стріла' },
    1835: { nameUk: 'Заряд душі воїна' },
    1463: { nameUk: 'Заряд душі воїна' },
    1464: { nameUk: 'Заряд душі воїна' },
    1465: { nameUk: 'Заряд душі воїна' },
    1466: { nameUk: 'Заряд душі воїна' },
    1467: { nameUk: 'Заряд душі воїна' },
    3947: { nameUk: 'Благословенний заряд духу' },
    3948: { nameUk: 'Благословенний заряд духу' },
    3949: { nameUk: 'Благословенний заряд духу' },
    3950: { nameUk: 'Благословенний заряд духу' },
    3951: { nameUk: 'Благословенний заряд духу' },
    3952: { nameUk: 'Благословенний заряд духу' },
  };
  for (const [idStr, row] of Object.entries(CONSUMABLE_CATALOG_STUBS)) {
    const id = Number(idStr);
    if (!Number.isFinite(id) || id <= 0 || o[id]) continue;
    o[id] = { nameUk: row.nameUk, slot: 'consumable' };
  }

  return o;
})();

/**
 * Слот для клієнта (сумка, іконки, рядок статів): усе з `ITEM_CATALOG`, поверх ручних
 * `L2DOP_ITEM_SLOT_HINT` (напр. щит NG як `shield`).
 */
export function itemSlotHintsForClient(): Record<number, string> {
  const out: Record<number, string> = { ...L2DOP_ITEM_SLOT_HINT };
  for (const [idStr, m] of Object.entries(ITEM_CATALOG)) {
    const id = Number(idStr);
    if (!Number.isFinite(id)) continue;
    if (!m.slot) continue;
    if (out[id] != null && String(out[id]).trim() !== '') continue;
    out[id] = m.slot === 'lhand' ? 'lhand' : m.slot;
  }
  /** UI/екіп чекають `lhand`; у `L2DOP_ITEM_SLOT_HINT` лишається legacy `shield`. */
  for (const [idStr, h] of Object.entries(out)) {
    if (h === 'shield') out[Number(idStr)] = 'lhand';
  }
  return out;
}

/** Підказки статів для сумки / модалки (зброя, броня, біжутерія з авторськими полями). */
export type ItemStatsHintForClient = {
  pAtk?: number;
  mAtk?: number;
  pDef?: number;
  atkSpd?: number;
  wpnCrit?: number;
  rCrit?: number;
  jewelMdefFlat?: number;
  jewelMaxHp?: number;
  jewelMaxMp?: number;
  jewelAcc?: number;
  jewelEva?: number;
  jewelMpRegenMul?: number;
  jewelHoldResistMul?: number;
};

/** Для GET /character — стати предметів для модалки/списку (усі записи ITEM_CATALOG з числовими статами). */
export function itemStatsHintsForClient(): Record<number, ItemStatsHintForClient> {
  const out: Record<number, ItemStatsHintForClient> = {};
  for (const [idStr, m] of Object.entries(ITEM_CATALOG)) {
    const id = Number(idStr);
    if (!Number.isFinite(id)) continue;
    const st: ItemStatsHintForClient = {};
    if (typeof m.pAtk === 'number' && m.pAtk !== 0) st.pAtk = m.pAtk;
    if (typeof m.mAtk === 'number' && m.mAtk !== 0) st.mAtk = m.mAtk;
    if (typeof m.pDef === 'number' && m.pDef !== 0) st.pDef = m.pDef;
    if (typeof m.atkSpd === 'number' && m.atkSpd !== 0) st.atkSpd = m.atkSpd;
    if (typeof m.wpnCrit === 'number' && m.wpnCrit !== 0) st.wpnCrit = m.wpnCrit;
    if (typeof m.rCrit === 'number' && m.rCrit !== 0) st.rCrit = m.rCrit;
    if (typeof m.jewelMdefFlat === 'number' && m.jewelMdefFlat !== 0) {
      st.jewelMdefFlat = m.jewelMdefFlat;
    }
    if (typeof m.jewelMaxHp === 'number' && m.jewelMaxHp > 0) {
      st.jewelMaxHp = m.jewelMaxHp;
    }
    if (typeof m.jewelMaxMp === 'number' && m.jewelMaxMp > 0) {
      st.jewelMaxMp = m.jewelMaxMp;
    }
    if (typeof m.jewelAcc === 'number' && m.jewelAcc > 0) {
      st.jewelAcc = m.jewelAcc;
    }
    if (typeof m.jewelEva === 'number' && m.jewelEva > 0) {
      st.jewelEva = m.jewelEva;
    }
    if (
      typeof m.jewelMpRegenMul === 'number' &&
      m.jewelMpRegenMul > 1 &&
      Number.isFinite(m.jewelMpRegenMul)
    ) {
      st.jewelMpRegenMul = m.jewelMpRegenMul;
    }
    if (
      typeof m.jewelHoldResistMul === 'number' &&
      m.jewelHoldResistMul > 1 &&
      Number.isFinite(m.jewelHoldResistMul)
    ) {
      st.jewelHoldResistMul = m.jewelHoldResistMul;
    }
    if (Object.keys(st).length > 0) out[id] = st;
  }
  return out;
}

/** Для GET /character — грейд предмета в UI (GM + ручні підказки для дропу). */
export function itemGradeHintsForClient(): Record<number, string> {
  const out: Record<number, string> = {};
  for (const w of L2DOP_GM_SHOP_WEAPONS) {
    out[w.itemId] = w.grade;
  }
  for (const a of L2DOP_GM_SHOP_ARMOR) {
    out[a.itemId] = a.grade;
  }
  for (const j of L2DOP_GM_SHOP_JEWELRY) {
    out[j.itemId] = j.grade;
  }
  for (const [idStr, g] of Object.entries(L2DOP_ITEM_GRADE_UK)) {
    out[Number(idStr)] = g;
  }
  return out;
}

/**
 * Іконка предмета: ті самі `jpg`, що в l2dop `img/items/{id}.jpg`, через `/game/item-icon/:id`.
 * Якщо файлу немає на диску — сервер редіректить на SVG-заглушку.
 */
export function itemIconUrl(itemId: number): string {
  if (itemId > 0) return `/game/item-icon/${itemId}`;
  return '/icons/drops/other.svg';
}

/** У сумці / екіпі — ті самі іконки, що в магазині (GM `iconUrl` з `/icons/drops/…`). */
function gearCatalogIconUrl(row: { itemId: number; iconUrl?: string }): string {
  const u = row.iconUrl;
  if (typeof u === 'string' && u.trim() !== '') return u;
  return itemIconUrl(row.itemId);
}

export interface GearCatalogRow {
  itemId: number;
  nameUk: string;
  iconUrl: string;
  slot: ItemSlotKind;
  /** Для фільтрів сумки (як GM-шоп). */
  grade?: GmShopGrade;
  weaponType?: GmShopWeaponKind;
  armorType?: string;
  jewelryKind?: GmShopJewelryKind;
  stats: {
    pAtk?: number;
    mAtk?: number;
    pDef?: number;
    /** Поле Spd у items3 — для відображення та узгодження з calc_stats $WpnSpd */
    atkSpd?: number;
    /** Базовий крит зброї $WpnCrt (як у calc_stats для типу) */
    wpnCrit?: number;
    /** items3 crit / $WpnCRIT */
    rCrit?: number;
    /** Бонус для біжутерії (колонка 23 у items3) */
    jewelryMAtk?: number;
  };
}

/** Для GET /character — підписи й іконки в сумці без окремого запиту. */
export function listGearCatalogForClient(): GearCatalogRow[] {
  const rows: GearCatalogRow[] = [];
  for (const row of L2DOP_GM_SHOP_WEAPONS) {
    rows.push({
      itemId: row.itemId,
      nameUk: row.nameUk,
      iconUrl: gearCatalogIconUrl(row),
      slot: 'rhand',
      grade: row.grade,
      weaponType: row.weaponType,
      stats: {
        pAtk: row.pAtk,
        mAtk: row.mAtk,
        atkSpd: row.atkSpd,
        wpnCrit: wpnCritForWeaponKind(row.weaponType),
        ...(row.rCrit > 0 ? { rCrit: row.rCrit } : {}),
      },
    });
  }
  for (const row of L2DOP_GM_SHOP_ARMOR) {
    rows.push({
      itemId: row.itemId,
      nameUk: row.nameUk,
      iconUrl: gearCatalogIconUrl(row),
      slot: row.armorSlot,
      grade: row.grade,
      armorType: row.armorType,
      stats: { pDef: row.pDef },
    });
  }
  for (const row of L2DOP_GM_SHOP_JEWELRY) {
    const slot = row.jewelryKind === 'earring' ? 'earring' : row.jewelryKind;
    rows.push({
      itemId: row.itemId,
      nameUk: row.nameUk,
      iconUrl: gearCatalogIconUrl(row),
      slot,
      grade: row.grade,
      jewelryKind: row.jewelryKind,
      stats: {
        pDef: row.pDef,
        jewelryMAtk: row.mAtk,
      },
    });
  }
  rows.push(...dropsShopConsumableGearCatalogExtras());
  const seen = new Set(rows.map((r) => r.itemId));
  for (const extra of starterGearCatalogExtras()) {
    if (seen.has(extra.itemId)) continue;
    seen.add(extra.itemId);
    rows.push(extra);
  }
  return rows;
}

let _itemNamesUkFullCache: Record<number, string> | null = null;

/** Категорії сумки як у text-rpg InventoryFilters (з items3 при наявності lineage.sql + ген). */
const ITEM_INVENTORY_TAB_EXTRA: Partial<
  Record<number, L2ItemInventoryTabHint>
> = {
  1060: 'consumable',
  1061: 'consumable',
  726: 'consumable',
  728: 'consumable',
  17: 'consumable',
  1341: 'consumable',
  1342: 'consumable',
  1343: 'consumable',
  1344: 'consumable',
  1345: 'consumable',
  1835: 'consumable',
  1463: 'consumable',
  1464: 'consumable',
  1465: 'consumable',
  1466: 'consumable',
  1467: 'consumable',
  3947: 'consumable',
  3948: 'consumable',
  3949: 'consumable',
  3950: 'consumable',
  3951: 'consumable',
  3952: 'consumable',
};

export function itemInventoryTabHintsForClient(): Record<
  number,
  L2ItemInventoryTabHint
> {
  return {
    ...L2DOP_ITEM_INVENTORY_TAB,
    ...ITEM_INVENTORY_TAB_EXTRA,
  } as Record<number, L2ItemInventoryTabHint>;
}

/**
 * Підписи для сумки / вкладки «Ресурси»: каталог і ручні UA з l2dopItemDisplayNameUk.
 */
export function itemNamesUkForClient(): Record<number, string> {
  if (_itemNamesUkFullCache) return _itemNamesUkFullCache;
  const out: Record<number, string> = {};

  for (const [idStr, m] of Object.entries(ITEM_CATALOG)) {
    const id = Number(idStr);
    if (m.nameUk) out[id] = m.nameUk;
  }

  for (const [idStr, uk] of Object.entries(L2DOP_ITEM_DISPLAY_NAME_UK)) {
    const id = Number(idStr);
    if (uk && String(uk).trim() !== '') out[id] = uk;
  }

  for (const [idStr, uk] of Object.entries(RESOURCE_CRAFT_ITEM_NAMES_UK)) {
    const id = Number(idStr);
    if (uk && String(uk).trim() !== '') out[id] = uk;
  }

  _itemNamesUkFullCache = out;
  return out;
}
