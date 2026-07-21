import type { ArmorTypeKind, ItemSlotKind } from './itemsCatalog.js';
import { ITEM_CATALOG } from './itemsCatalog.js';
import type { WeaponKindForEnchant } from './l2dopEnchant.js';
import { itemBlocksShieldSlot } from './l2dopTwoHandedWeapon.js';
import { MAX_ENCHANT_LEVEL } from './enchantConfig.js';

/**
 * Версія стартового набору в сумці; піднімаємо при зміні складу старту.
 * v8 — воїн: auto-equip Club + Devotion helmet/gloves; заряд душі (без spiritshot).
 * v7 — маг: Devotion tunic/stockings + auto-equip мантії; blessed spiritshot (без soulshot).
 * v6 — Club + Rod + Devotion helmet/gloves, зілля, обидва заряди; лише при register.
 */
export const STARTER_KIT_VERSION = 8;

/** Стартова адена нового героя. */
export const STARTER_ADENA = 50_000;

/** NG Club — фіз. зброя для всіх. */
const STARTER_WEAPON_PHYS_ID = 4;
const STARTER_WEAPON_MAGIC_ID = 7;
/** Devotion Helmet / gloves — NG-броня з GM-шопу (синтетичні id). */
const STARTER_DEVOTION_HELMET_ID = 9002261;
const STARTER_DEVOTION_TUNIC_ID = 9002263;
const STARTER_DEVOTION_STOCKINGS_ID = 9002265;
const STARTER_DEVOTION_GLOVES_ID = 9002267;
const STARTER_LESSER_HEALING_ID = 1060;
const STARTER_MANA_SMALL_ID = 726;
const STARTER_FIGHTER_SOULSHOT_ID = 1835;
const STARTER_MYSTIC_SPIRITSHOT_ID = 3947;
const STARTER_POTION_QTY = 50;
const STARTER_SHOT_QTY = 1000;

export {
  ELYSIAN_ITEM_ID,
  LEGACY_ELYSIAN_BOW_ITEM_ID,
  LEGACY_BLOCKED_ACQUISITION_ITEM_IDS,
  isLegacyBlockedAcquisitionItemId,
  remapLegacyElysianItemId,
  resolveAcquisitionIssueItemId,
} from './legacyElysianConstants.js';
import { remapLegacyElysianItemId } from './legacyElysianConstants.js';

export type StarterClassBranch = 'fighter' | 'mystic';

/** Стартова сумка (лише register); заряд — за гілкою (воїн soulshot, маг spiritshot). */
function buildStarterBagStacks(classBranch: StarterClassBranch): BagStack[] {
  const stacks: BagStack[] = [
    { itemId: STARTER_WEAPON_PHYS_ID, qty: 1 },
    { itemId: STARTER_WEAPON_MAGIC_ID, qty: 1 },
    { itemId: STARTER_DEVOTION_HELMET_ID, qty: 1 },
    { itemId: STARTER_DEVOTION_GLOVES_ID, qty: 1 },
    { itemId: STARTER_LESSER_HEALING_ID, qty: STARTER_POTION_QTY },
    { itemId: STARTER_MANA_SMALL_ID, qty: STARTER_POTION_QTY },
  ];
  if (classBranch === 'mystic') {
    stacks.push({ itemId: STARTER_MYSTIC_SPIRITSHOT_ID, qty: STARTER_SHOT_QTY });
  } else {
    stacks.push({ itemId: STARTER_FIGHTER_SOULSHOT_ID, qty: STARTER_SHOT_QTY });
  }
  return stacks;
}

function starterEqForBranch(
  classBranch: StarterClassBranch
): Partial<Record<string, EqSlotValue>> {
  if (classBranch === 'mystic') {
    return {
      l1: STARTER_WEAPON_MAGIC_ID,
      l3: STARTER_DEVOTION_TUNIC_ID,
      l4: STARTER_DEVOTION_STOCKINGS_ID,
      lh: STARTER_DEVOTION_HELMET_ID,
      lg: STARTER_DEVOTION_GLOVES_ID,
    };
  }
  return {
    l1: STARTER_WEAPON_PHYS_ID,
    lh: STARTER_DEVOTION_HELMET_ID,
    lg: STARTER_DEVOTION_GLOVES_ID,
  };
}

function equippedItemIds(eq: Partial<Record<string, EqSlotValue>>): Set<number> {
  return new Set(
    Object.values(eq).map((v) =>
      typeof v === 'number' ? v : Number((v as { itemId: number }).itemId)
    )
  );
}

/** Зведення стартового набору для аудиту / smoke. */
export function describeStarterKit(classBranch: StarterClassBranch): {
  classBranch: StarterClassBranch;
  sk: number;
  equipped: Array<{ slot: string; itemId: number }>;
  bagStacks: BagStack[];
  bagSnapshotStacks: BagStack[];
} {
  const raw = starterInventory(classBranch);
  const snap = parseInventory(raw);
  const equipped = Object.entries(raw.eq || {}).flatMap(([slot, v]) => {
    const n = normalizeEqSlot(v as EqSlotValue);
    return n ? [{ slot, itemId: n.itemId }] : [];
  });
  return {
    classBranch,
    sk: STARTER_KIT_VERSION,
    equipped,
    bagStacks: raw.stacks.map((s) => ({ ...s })),
    bagSnapshotStacks: snap.stacks.map((s) => ({ ...s })),
  };
}

/** Стартова сумка нового героя (лише register). */
export function starterInventory(classBranch?: StarterClassBranch): InventoryState {
  const branch: StarterClassBranch = classBranch === 'mystic' ? 'mystic' : 'fighter';
  const eq = starterEqForBranch(branch);
  const equippedIds = equippedItemIds(eq);
  const stacks = buildStarterBagStacks(branch)
    .filter((row) => !equippedIds.has(row.itemId))
    .map((row) => ({ ...row }));
  return {
    v: 1,
    _sk: STARTER_KIT_VERSION,
    ...(branch === 'mystic' ? { _mysticRobePatch: 1 } : {}),
    stacks,
    eq,
  };
}

function normEnchant(e: unknown): number {
  if (e == null) return 0;
  const n = Math.floor(Number(e));
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(MAX_ENCHANT_LEVEL, n));
}

/** Рядок сумки: qty предметів з однаковою заточкою (як окремий рядок у l2dop users_items). */
export interface BagStack {
  itemId: number;
  qty: number;
  /** Заточка (l2dop eqbonus); якщо немає — 0 */
  enchant?: number;
}

/**
 * Слот екіпу: тільки id (старий формат) або { itemId, enchant }.
 */
export type EqSlotValue = number | { itemId: number; enchant?: number };

export interface InventoryState {
  v: number;
  /** Схема стартового набору (міграція з «сміттєвих» item_id). */
  _sk?: number;
  /** 1 — одноразова видача tunic/stockings старим магам уже зроблена; не повторювати після продажу. */
  _mysticRobePatch?: number;
  stacks: BagStack[];
  /**
   * Екіп: l1 зброя; l2 щит (ліворуч); l3 верх / fullarmor; l4 низ; lh шолом, lg рукавиці, lf чоботи;
   * lr1/lr2 кільця, le1/le2 сережки, neck — намисто.
   */
  eq: Partial<Record<string, EqSlotValue>>;
}

/** Слоти, що входять у суму P.Def броні (як фрагмент $apdef у calc_stats). */
export const ARMOR_PDEF_EQ_KEYS = [
  'l3',
  'l4',
  'lh',
  'lg',
  'lf',
  /** Узгоджено з ІТЕМ-слотом щита (.l2). */
  'l2',
] as const;

export function normalizeEqSlot(
  v: EqSlotValue | undefined
): { itemId: number; enchant: number } | null {
  if (v == null) return null;
  if (typeof v === 'number' && v > 0) return { itemId: v, enchant: 0 };
  if (typeof v === 'object' && v !== null && 'itemId' in v) {
    const itemId = Number((v as { itemId: unknown }).itemId);
    const enchant = normEnchant((v as { enchant?: unknown }).enchant);
    if (Number.isFinite(itemId) && itemId > 0) return { itemId, enchant };
  }
  return null;
}

function armorKindFromItemId(itemId: number): ArmorTypeKind | null {
  const t = ITEM_CATALOG[itemId]?.armorType;
  return t ?? null;
}

/**
 * Тип броні для пасивок майстерності (light / heavy / magic — robe в даті = magic).
 * Без повного екіпу майстерність не дає бонусу: fullarmor у l3 достатньо; окремий нагрудник — лише разом з l4 того ж типу.
 */
export function equippedArmorKindForPassives(
  inv: InventoryState
): ArmorTypeKind | null {
  const top = normalizeEqSlot(inv.eq?.l3);
  if (!top) return null;
  const metaTop = ITEM_CATALOG[top.itemId];
  if (!metaTop || (metaTop.slot !== 'chest' && metaTop.slot !== 'fullarmor')) {
    return null;
  }
  const kindTop = armorKindFromItemId(top.itemId);
  if (!kindTop) return null;

  if (metaTop.slot === 'fullarmor') {
    return kindTop;
  }

  const legs = normalizeEqSlot(inv.eq?.l4);
  if (!legs) return null;
  const kindLegs = armorKindFromItemId(legs.itemId);
  if (!kindLegs || kindLegs !== kindTop) return null;
  return kindTop;
}

export function emptyInventory(): InventoryState {
  return { v: 1, stacks: [], eq: {} };
}

/**
 * Старі маги без мантії: один раз додати tunic/stockings у сумку й одягнути, якщо слоти порожні.
 * Після `_mysticRobePatch === 1` не повторюється (інакше продаж давав би нескінченну адену).
 */
export function ensureMysticRobeStarterPieces(
  inv: InventoryState,
  classBranch: string
): { inv: InventoryState; changed: boolean } {
  if (String(classBranch).toLowerCase().trim() !== 'mystic') {
    return { inv, changed: false };
  }
  if (inv._mysticRobePatch === 1) {
    return { inv, changed: false };
  }

  const hasTunic =
    normalizeEqSlot(inv.eq?.l3)?.itemId === STARTER_DEVOTION_TUNIC_ID ||
    countBagQty(inv, STARTER_DEVOTION_TUNIC_ID) > 0;
  const hasStockings =
    normalizeEqSlot(inv.eq?.l4)?.itemId === STARTER_DEVOTION_STOCKINGS_ID ||
    countBagQty(inv, STARTER_DEVOTION_STOCKINGS_ID) > 0;
  const legacyMystic = inv._sk == null || inv._sk < STARTER_KIT_VERSION;

  /** Поточна схема v7 або мантія вже є — лише зафіксувати прапорець, не перевидавати продане. */
  if (!legacyMystic || (hasTunic && hasStockings)) {
    return { inv: { ...inv, _mysticRobePatch: 1 }, changed: true };
  }

  let next = inv;
  let changed = false;
  const eq: Partial<Record<string, EqSlotValue>> = { ...next.eq };

  const ensureInBag = (itemId: number) => {
    if (
      normalizeEqSlot(eq.l3)?.itemId === itemId ||
      normalizeEqSlot(eq.l4)?.itemId === itemId
    ) {
      return;
    }
    if (countBagQty(next, itemId) > 0) return;
    const stacks = [...next.stacks];
    stacks.push({ itemId, qty: 1 });
    next = { ...next, stacks };
    changed = true;
  };

  ensureInBag(STARTER_DEVOTION_TUNIC_ID);
  ensureInBag(STARTER_DEVOTION_STOCKINGS_ID);

  if (
    !normalizeEqSlot(eq.l3) &&
    countBagQty(next, STARTER_DEVOTION_TUNIC_ID) > 0
  ) {
    eq.l3 = STARTER_DEVOTION_TUNIC_ID;
    next = removeBagQty(next, STARTER_DEVOTION_TUNIC_ID, 1);
    changed = true;
  }
  if (
    !normalizeEqSlot(eq.l4) &&
    countBagQty(next, STARTER_DEVOTION_STOCKINGS_ID) > 0
  ) {
    eq.l4 = STARTER_DEVOTION_STOCKINGS_ID;
    next = removeBagQty(next, STARTER_DEVOTION_STOCKINGS_ID, 1);
    changed = true;
  }

  const withFlag: InventoryState = {
    ...(changed ? { ...next, eq } : inv),
    _mysticRobePatch: 1,
  };
  return { inv: withFlag, changed: true };
}

export function needsStarterKitMigration(inv: InventoryState): boolean {
  return inv._sk !== STARTER_KIT_VERSION;
}

/** Міграція `_sk` для старих персонажів: лише sanitize, без видачі стартового набору. */
export function migrateInventoryToSk2(inv: InventoryState): InventoryState {
  const known = (id: number) => !!ITEM_CATALOG[id];
  const stacks: BagStack[] = [];
  for (const s of inv.stacks) {
    if (!known(s.itemId)) continue;
    const row: BagStack = { itemId: s.itemId, qty: s.qty };
    if (s.enchant != null && s.enchant > 0) row.enchant = normEnchant(s.enchant);
    stacks.push(row);
  }
  const eq: Partial<Record<string, EqSlotValue>> = {};
  for (const [k, v] of Object.entries(inv.eq || {})) {
    const slot = normalizeEqSlot(v as EqSlotValue);
    if (slot && known(slot.itemId)) {
      if (slot.enchant > 0) {
        eq[k] = { itemId: slot.itemId, enchant: slot.enchant };
      } else {
        eq[k] = slot.itemId;
      }
    }
  }
  return {
    v: 1,
    _sk: STARTER_KIT_VERSION,
    _mysticRobePatch: inv._mysticRobePatch,
    stacks,
    eq,
  };
}

function cloneMeta(
  inv: InventoryState
): Pick<InventoryState, 'v' | '_sk' | '_mysticRobePatch'> {
  const meta: Pick<InventoryState, 'v' | '_sk' | '_mysticRobePatch'> = {
    v: inv.v,
    _sk: inv._sk,
  };
  if (inv._mysticRobePatch === 1) meta._mysticRobePatch = 1;
  return meta;
}

/** Сума qty у сумці для `itemId` (лише заточка 0 — крафт ресурсів). */
export function countBagQty(inv: InventoryState, itemId: number): number {
  let n = 0;
  for (const s of inv.stacks) {
    if (s.itemId !== itemId || normEnchant(s.enchant) !== 0) continue;
    n += s.qty;
  }
  return n;
}

/** Зняти з сумки `qty` одиниць (стеки з enchant 0; помилка — недостатньо). */
export function removeBagQty(
  inv: InventoryState,
  itemId: number,
  qty: number
): InventoryState {
  if (qty <= 0) {
    return {
      ...cloneMeta(inv),
      stacks: inv.stacks.map((s) => ({ ...s })),
      eq: { ...inv.eq },
    };
  }
  const next: InventoryState = {
    ...cloneMeta(inv),
    stacks: inv.stacks.map((s) => ({ ...s })),
    eq: { ...inv.eq },
  };
  let left = qty;
  for (const s of next.stacks) {
    if (s.itemId !== itemId || normEnchant(s.enchant) !== 0) continue;
    if (left <= 0) break;
    const take = Math.min(s.qty, left);
    s.qty -= take;
    left -= take;
  }
  if (left > 0) {
    throw new Error('insufficient_materials');
  }
  next.stacks = next.stacks.filter((s) => s.qty > 0);
  return next;
}

export function parseInventoryRaw(raw: unknown): InventoryState {
  if (raw == null || typeof raw !== 'object') return emptyInventory();
  const o = raw as Record<string, unknown>;
  const stacksRaw = o.stacks;
  const eqRaw = o.eq;
  if (!Array.isArray(stacksRaw) || typeof eqRaw !== 'object' || eqRaw === null) {
    return emptyInventory();
  }
  const skRaw = o._sk;
  const _sk =
    typeof skRaw === 'number' && Number.isFinite(skRaw) ? skRaw : undefined;
  const robePatchRaw = o._mysticRobePatch;
  const _mysticRobePatch =
    typeof robePatchRaw === 'number' &&
    Number.isFinite(robePatchRaw) &&
    Math.floor(robePatchRaw) === 1
      ? 1
      : undefined;
  const stacks: BagStack[] = [];
  for (const row of stacksRaw) {
    if (!row || typeof row !== 'object') continue;
    const r = row as Record<string, unknown>;
    const rawItemId = Number(r.itemId);
    const qty = Number(r.qty);
    if (Number.isFinite(rawItemId) && rawItemId > 0 && Number.isFinite(qty) && qty > 0) {
      const itemId = remapLegacyElysianItemId(rawItemId);
      const b: BagStack = { itemId, qty };
      const en = normEnchant(r.enchant);
      if (en > 0) b.enchant = en;
      stacks.push(b);
    }
  }
  const eq: Partial<Record<string, EqSlotValue>> = {};
  for (const [k, v] of Object.entries(eqRaw)) {
    if (typeof v === 'number' && Number.isFinite(v) && v > 0) {
      eq[k] = remapLegacyElysianItemId(v);
      continue;
    }
    if (v && typeof v === 'object' && 'itemId' in v) {
      const slot = normalizeEqSlot(v as EqSlotValue);
      if (slot) {
        const itemId = remapLegacyElysianItemId(slot.itemId);
        eq[k] =
          slot.enchant > 0
            ? { itemId, enchant: slot.enchant }
            : itemId;
      }
    }
  }

  const inv: InventoryState = { v: 1, _sk, stacks, eq };
  if (_mysticRobePatch === 1) inv._mysticRobePatch = 1;
  /** Якщо у БД лишився щит разом із дворучкою — щит повертаємо в сумку. */
  const rhRepair = normalizeEqSlot(inv.eq.l1);
  if (rhRepair) {
    const wtp = ITEM_CATALOG[rhRepair.itemId]?.weaponType;
    if (itemBlocksShieldSlot(rhRepair.itemId, wtp)) {
      const shRepair = normalizeEqSlot(inv.eq.l2);
      if (shRepair) {
        addStack(inv.stacks, shRepair.itemId, 1, shRepair.enchant);
        delete inv.eq.l2;
      }
    }
  }
  /**
   * Legacy mirror у БД: та сама rhand-зброя в l1 і l2 (коли предмет був 2H/fist).
   * Видаляємо лише дубль у l2; справжній щит (інший itemId) не чіпаємо.
   */
  repairDuplicateRhandWeaponInShieldSlot(inv);
  repairFullarmorEquipmentState(inv);
  return inv;
}

/** Дубль fullarmor у l3+l4 — лишаємо l3, дубль повертаємо в сумку. */
function repairDuplicateFullarmorChestLegs(inv: InventoryState): void {
  const top = normalizeEqSlot(inv.eq.l3);
  const legs = normalizeEqSlot(inv.eq.l4);
  if (!top || !legs || top.itemId !== legs.itemId) return;
  const meta = ITEM_CATALOG[top.itemId];
  if (meta?.slot !== 'fullarmor') return;
  addStack(inv.stacks, legs.itemId, 1, legs.enchant);
  delete inv.eq.l4;
}

/** Fullarmor у l3 + окремий l4 — безпечно повертаємо nиз у сумку. */
function repairFullarmorWithSeparateLegs(inv: InventoryState): void {
  const top = normalizeEqSlot(inv.eq.l3);
  if (!top) return;
  const meta = ITEM_CATALOG[top.itemId];
  if (meta?.slot !== 'fullarmor') return;
  const legs = normalizeEqSlot(inv.eq.l4);
  if (!legs) return;
  addStack(inv.stacks, legs.itemId, 1, legs.enchant);
  delete inv.eq.l4;
}

function repairFullarmorEquipmentState(inv: InventoryState): void {
  repairDuplicateFullarmorChestLegs(inv);
  repairFullarmorWithSeparateLegs(inv);
}

/** Зіпсований стан eq.l1 === eq.l2 для однієї rhand-зброї — l2 має бути щит або порожній. */
function repairDuplicateRhandWeaponInShieldSlot(inv: InventoryState): void {
  const rh = normalizeEqSlot(inv.eq.l1);
  const lh = normalizeEqSlot(inv.eq.l2);
  if (!rh || !lh || rh.itemId !== lh.itemId) return;
  if (ITEM_CATALOG[rh.itemId]?.slot !== 'rhand') return;
  delete inv.eq.l2;
}

/**
 * Sanitize інвентаря для snapshot / мутацій: без дубля одягненого в stacks,
 * міграція `_sk`, стартова мантія магів (tunic/stockings).
 */
export function applyInventoryReadPatches(
  invRaw: InventoryState,
  classBranch: string
): { inv: InventoryState; changed: boolean } {
  let inv = stripEquippedFromStacks(invRaw);
  let changed =
    JSON.stringify(invRaw.stacks) !== JSON.stringify(inv.stacks) ||
    JSON.stringify(invRaw.eq) !== JSON.stringify(inv.eq);

  if (needsStarterKitMigration(inv)) {
    const migrated = migrateInventoryToSk2(inv);
    if (JSON.stringify(migrated) !== JSON.stringify(inv)) {
      inv = migrated;
      changed = true;
    }
  }

  const robePatch = ensureMysticRobeStarterPieces(inv, classBranch);
  if (robePatch.changed) {
    inv = robePatch.inv;
    changed = true;
  }

  return { inv, changed };
}

/** Одягнене не лишається в stacks (антидубль у snapshot / UI). */
export function stripEquippedFromStacks(inv: InventoryState): InventoryState {
  const stacks = inv.stacks.map((s) => ({ ...s }));
  for (const v of Object.values(inv.eq || {})) {
    const slot = normalizeEqSlot(v as EqSlotValue);
    if (!slot) continue;
    const idx = stacks.findIndex(
      (s) =>
        s.itemId === slot.itemId && normEnchant(s.enchant) === slot.enchant,
    );
    if (idx < 0) continue;
    stacks[idx].qty -= 1;
    if (stacks[idx].qty <= 0) stacks.splice(idx, 1);
  }
  return { ...inv, stacks };
}

export function parseInventory(raw: unknown): InventoryState {
  return stripEquippedFromStacks(parseInventoryRaw(raw));
}

function addStack(
  stacks: BagStack[],
  itemId: number,
  qty: number,
  enchant: number
) {
  const e = normEnchant(enchant);
  const ex = stacks.find(
    (s) => s.itemId === itemId && normEnchant(s.enchant) === e
  );
  if (ex) ex.qty += qty;
  else {
    const row: BagStack = { itemId, qty };
    if (e > 0) row.enchant = e;
    stacks.push(row);
  }
}

/** Додати предмет у сумку (наприклад після покупки). Заточка завжди 0. */
export function addItemToBag(
  inv: InventoryState,
  itemId: number,
  qty: number
): InventoryState {
  const next: InventoryState = {
    ...cloneMeta(inv),
    stacks: inv.stacks.map((s) => ({ ...s })),
    eq: { ...inv.eq },
  };
  addStack(next.stacks, itemId, qty, 0);
  return next;
}

function removeStack(
  stacks: BagStack[],
  itemId: number,
  qty: number,
  enchant: number
) {
  const e = normEnchant(enchant);
  const idx = stacks.findIndex(
    (s) => s.itemId === itemId && normEnchant(s.enchant) === e
  );
  if (idx < 0) throw new Error('not_in_bag');
  const row = stacks[idx];
  if (row.qty < qty) throw new Error('not_in_bag');
  row.qty -= qty;
  if (row.qty <= 0) stacks.splice(idx, 1);
}

const ARMOR_WEAPON_SLOT: Partial<Record<ItemSlotKind, string>> = {
  rhand: 'l1',
  lhand: 'l2',
  chest: 'l3',
  legs: 'l4',
  fullarmor: 'l3',
  head: 'lh',
  gloves: 'lg',
  feet: 'lf',
};

/**
 * Ключ слота екіпу для предмета: броня/зброя — фіксовано; кільця/сережки — перший вільний lr/le.
 */
export function resolveEquipSlotKey(
  itemId: number,
  eq: InventoryState['eq']
): string | null {
  const m = ITEM_CATALOG[itemId];
  if (!m?.slot) return null;
  const kind = m.slot;
  if (kind === 'ring') {
    if (!normalizeEqSlot(eq.lr1)) return 'lr1';
    if (!normalizeEqSlot(eq.lr2)) return 'lr2';
    return 'lr1';
  }
  if (kind === 'earring') {
    if (!normalizeEqSlot(eq.le1)) return 'le1';
    if (!normalizeEqSlot(eq.le2)) return 'le2';
    return 'le1';
  }
  if (kind === 'neck') return 'neck';
  const key = ARMOR_WEAPON_SLOT[kind];
  return key != null ? key : null;
}

/**
 * Взяти предмет із сумки й одягнути у відповідний слот; попередній у тому слоті повертається в сумку.
 * @param enchant — заточка стеку в сумці (якщо кілька стеків одного id — розрізняємо).
 */
export function equipFromBag(
  inv: InventoryState,
  itemId: number,
  enchant: number = 0
): InventoryState {
  const slot = resolveEquipSlotKey(itemId, inv.eq || {});
  if (!slot) {
    throw new Error('unknown_item');
  }
  const meta = ITEM_CATALOG[itemId];
  const next: InventoryState = {
    ...cloneMeta(inv),
    stacks: inv.stacks.map((s) => ({ ...s })),
    eq: { ...inv.eq },
  };
  const en = normEnchant(enchant);

  /** Щит одягається лише з однорукою зброєю: дворуч знімається в сумку. */
  if (slot === 'l2') {
    const rh = normalizeEqSlot(next.eq.l1);
    if (rh) {
      const wk = ITEM_CATALOG[rh.itemId]?.weaponType as
        | WeaponKindForEnchant
        | undefined;
      if (itemBlocksShieldSlot(rh.itemId, wk)) {
        addStack(next.stacks, rh.itemId, 1, rh.enchant);
        delete next.eq.l1;
      }
    }
  }
  /** З дворучкою щит недоступний — знімаємо ліву руку. */
  if (slot === 'l1') {
    const wkNew = meta?.weaponType as WeaponKindForEnchant | undefined;
    if (itemBlocksShieldSlot(itemId, wkNew)) {
      const sh = normalizeEqSlot(next.eq.l2);
      if (sh) {
        addStack(next.stacks, sh.itemId, 1, sh.enchant);
        delete next.eq.l2;
      }
    }
  }
  /** Full armor (мантія) займає і верх, і низ. */
  if (slot === 'l3' && meta?.slot === 'fullarmor') {
    const legs = normalizeEqSlot(next.eq.l4);
    if (legs) {
      addStack(next.stacks, legs.itemId, 1, legs.enchant);
      delete next.eq.l4;
    }
  }
  /** Якщо одягаємо штани — знімаємо full armor з l3. */
  if (slot === 'l4') {
    const top = normalizeEqSlot(next.eq.l3);
    if (top) {
      const topMeta = ITEM_CATALOG[top.itemId];
      if (topMeta?.slot === 'fullarmor') {
        addStack(next.stacks, top.itemId, 1, top.enchant);
        delete next.eq.l3;
      }
    }
  }

  removeStack(next.stacks, itemId, 1, en);
  const prev = normalizeEqSlot(next.eq[slot]);
  if (prev) {
    addStack(next.stacks, prev.itemId, 1, prev.enchant);
  }
  if (en > 0) {
    next.eq[slot] = { itemId, enchant: en };
  } else {
    next.eq[slot] = itemId;
  }
  repairFullarmorEquipmentState(next);
  return next;
}

/** Зняти предмет зі слота в сумку. */
export function unequipSlot(inv: InventoryState, slot: string): InventoryState {
  const next: InventoryState = {
    ...cloneMeta(inv),
    stacks: inv.stacks.map((s) => ({ ...s })),
    eq: { ...inv.eq },
  };
  const prev = normalizeEqSlot(next.eq[slot]);
  if (!prev) {
    throw new Error('slot_empty');
  }
  delete next.eq[slot];
  addStack(next.stacks, prev.itemId, 1, prev.enchant);
  return next;
}

/** Кількість зайнятих слотів сумки (кожен стек = 1 слот). */
export function bagOccupiedSlots(inv: InventoryState): number {
  return inv.stacks.length;
}

/** Чи потрібен новий слот у сумці для itemId+enchant. */
export function bagNeedsNewSlot(
  inv: InventoryState,
  itemId: number,
  enchant: number
): boolean {
  const e = normEnchant(enchant);
  return !inv.stacks.some(
    (s) => s.itemId === itemId && normEnchant(s.enchant) === e
  );
}

/** Додати стек у сумку (з урахуванням заточки). */
export function addEnchantedToBag(
  inv: InventoryState,
  itemId: number,
  qty: number,
  enchant: number = 0
): InventoryState {
  if (qty <= 0) {
    return {
      ...cloneMeta(inv),
      stacks: inv.stacks.map((s) => ({ ...s })),
      eq: { ...inv.eq },
    };
  }
  const next: InventoryState = {
    ...cloneMeta(inv),
    stacks: inv.stacks.map((s) => ({ ...s })),
    eq: { ...inv.eq },
  };
  addStack(next.stacks, itemId, qty, enchant);
  return next;
}

/** Зняти qty зі стеку сумки (з урахуванням заточки). */
export function removeEnchantedFromBag(
  inv: InventoryState,
  itemId: number,
  qty: number,
  enchant: number = 0
): InventoryState {
  const next: InventoryState = {
    ...cloneMeta(inv),
    stacks: inv.stacks.map((s) => ({ ...s })),
    eq: { ...inv.eq },
  };
  removeStack(next.stacks, itemId, qty, enchant);
  return next;
}
