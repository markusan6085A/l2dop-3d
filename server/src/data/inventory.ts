import type { ArmorTypeKind, ItemSlotKind } from './itemsCatalog.js';
import { ITEM_CATALOG } from './itemsCatalog.js';
import type { WeaponKindForEnchant } from './l2dopEnchant.js';
import { itemBlocksShieldSlot } from './l2dopTwoHandedWeapon.js';

/**
 * Версія стартового набору в сумці; піднімаємо при зміні складу старту.
 * v3 — вимкнено увесь екіп у грі: стартер порожній, GM-шоп без речей,
 * дроп `kind: "equipment"` фільтрується. Існуючі сумки чистяться при першому
 * вході через `migrateInventoryToSk2`.
 */
export const STARTER_KIT_VERSION = 3;

const MAX_ENCHANT = 20;

function normEnchant(e: unknown): number {
  if (e == null) return 0;
  const n = Math.floor(Number(e));
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(MAX_ENCHANT, n));
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

/** Стартова сумка — порожня: у грі немає екіпу/зброї/біжутерії. */
export function starterInventory(): InventoryState {
  return {
    v: 1,
    _sk: STARTER_KIT_VERSION,
    stacks: [],
    eq: {},
  };
}

export function needsStarterKitMigration(inv: InventoryState): boolean {
  return inv._sk !== STARTER_KIT_VERSION;
}

/**
 * Очищає сумку від речей, яких немає в каталозі (а каталог зараз порожній з
 * боку екіпу — лишилися лише жменя слот-хінтів). Все, що було вдягнено, теж
 * відмонтовуємо. Стартер-кіт прибрано.
 */
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
    stacks,
    eq,
  };
}

function cloneMeta(inv: InventoryState): Pick<InventoryState, 'v' | '_sk'> {
  return { v: inv.v, _sk: inv._sk };
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

export function parseInventory(raw: unknown): InventoryState {
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
  const stacks: BagStack[] = [];
  for (const row of stacksRaw) {
    if (!row || typeof row !== 'object') continue;
    const r = row as Record<string, unknown>;
    const itemId = Number(r.itemId);
    const qty = Number(r.qty);
    if (Number.isFinite(itemId) && itemId > 0 && Number.isFinite(qty) && qty > 0) {
      const b: BagStack = { itemId, qty };
      const en = normEnchant(r.enchant);
      if (en > 0) b.enchant = en;
      stacks.push(b);
    }
  }
  const eq: Partial<Record<string, EqSlotValue>> = {};
  for (const [k, v] of Object.entries(eqRaw)) {
    if (typeof v === 'number' && Number.isFinite(v) && v > 0) {
      eq[k] = v;
      continue;
    }
    if (v && typeof v === 'object' && 'itemId' in v) {
      const slot = normalizeEqSlot(v as EqSlotValue);
      if (slot) {
        eq[k] =
          slot.enchant > 0
            ? { itemId: slot.itemId, enchant: slot.enchant }
            : slot.itemId;
      }
    }
  }

  const inv: InventoryState = { v: 1, _sk, stacks, eq };
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
  return inv;
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
