/**
 * Порівняння грейду зброї та броні для множника patk2/matk2 (calc_stats $weapon_noshtraf).
 * У PHP логіка зав’язана на клас/бафи; тут — евристика L2: зброя не нижча за «тир» броні.
 */
import type { InventoryState } from './inventory.js';
import { ARMOR_PDEF_EQ_KEYS, normalizeEqSlot } from './inventory.js';
import {
  L2DOP_GM_SHOP_ARMOR,
  L2DOP_GM_SHOP_WEAPONS,
  type GmShopGrade,
} from './l2dopGmShopCatalog.generated.js';
import { L2DOP_ITEM_GRADE_UK } from './l2dopItemDisplayNameUk.js';

const GRADE_ORDER: Record<string, number> = {
  NG: -1,
  D: 0,
  C: 1,
  B: 2,
  A: 3,
  S: 4,
};

function rankFromGmGrade(g: GmShopGrade): number {
  return GRADE_ORDER[g] ?? 0;
}

function rankFromUkString(raw: string): number | null {
  const s = String(raw || '')
    .trim()
    .toUpperCase();
  if (s in GRADE_ORDER) return GRADE_ORDER[s]!;
  return null;
}

/** Грейд зброї за itemId (GM-каталог + ручні доповнення L2DOP_ITEM_GRADE_UK). */
export function gmShopGradeForWeaponItemId(
  itemId: number
): GmShopGrade | undefined {
  if (!Number.isFinite(itemId) || itemId <= 0) return undefined;
  for (const row of L2DOP_GM_SHOP_WEAPONS) {
    if (row.itemId === itemId) return row.grade;
  }
  const uk = L2DOP_ITEM_GRADE_UK[itemId];
  if (uk == null || String(uk).trim() === '') return undefined;
  const s = String(uk).trim().toUpperCase();
  if (s === 'NG' || s === 'D' || s === 'C' || s === 'B' || s === 'A' || s === 'S') {
    return s as GmShopGrade;
  }
  return undefined;
}

const ITEM_GRADE_RANK = (() => {
  const m = new Map<number, number>();
  for (const row of L2DOP_GM_SHOP_WEAPONS) {
    m.set(row.itemId, rankFromGmGrade(row.grade));
  }
  for (const row of L2DOP_GM_SHOP_ARMOR) {
    m.set(row.itemId, rankFromGmGrade(row.grade));
  }
  for (const [idStr, label] of Object.entries(L2DOP_ITEM_GRADE_UK)) {
    const id = Number(idStr);
    const r = rankFromUkString(label);
    if (Number.isFinite(id) && id > 0 && r != null) {
      m.set(id, r);
    }
  }
  return m;
})();

/** Числовий ранг грейду (NG -1 … S 4). Невідомі id — null. */
export function itemGradeRank(itemId: number): number | null {
  if (!Number.isFinite(itemId) || itemId <= 0) return null;
  if (!ITEM_GRADE_RANK.has(itemId)) return null;
  return ITEM_GRADE_RANK.get(itemId)!;
}

/**
 * true → ×1.1 на patk2/matk2; false → ×0.75 (зброя слабша за найвищий грейд одягнутої броні).
 * Без зброї / без відомої броні в каталозі — без штрафу.
 */
export function inferWeaponGradeMatchesArmor(inv: InventoryState): boolean {
  const eq = inv.eq || {};
  const armorRanks: number[] = [];
  for (const key of ARMOR_PDEF_EQ_KEYS) {
    const sl = normalizeEqSlot(eq[key]);
    if (!sl) continue;
    const r = itemGradeRank(sl.itemId);
    if (r != null) armorRanks.push(r);
  }
  if (armorRanks.length === 0) {
    return true;
  }
  const needWeaponRank = Math.max(...armorRanks);

  const w = normalizeEqSlot(eq.l1);
  if (!w) {
    return true;
  }
  const wRank = itemGradeRank(w.itemId);
  if (wRank == null) {
    return true;
  }
  return wRank >= needWeaponRank;
}
