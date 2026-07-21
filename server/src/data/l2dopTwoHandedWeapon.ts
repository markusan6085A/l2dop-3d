/**
 * Дворучна зброя: займає праву руку (l1) і блокує щит (l2) — як у L2.
 *
 * Кодова класифікація (відповідає дампу lineage `WeaponKindForEnchant`):
 * - bow, pole, dual, fist
 * - staff / twohand_blunt → `bigblunt`
 * - twohand_sword → `bigsword`
 *
 * Винятки: предмети з типом «дворуч» у дампі, які за правилами гри одягаються з щитом.
 */
import type { WeaponKindForEnchant } from './l2dopEnchant.js';
import { A_WEAPON_CATALOG } from './aWeaponCatalog.js';
import { B_WEAPON_CATALOG } from './bWeaponCatalog.js';
import { C_WEAPON_CATALOG } from './cWeaponCatalog.js';
import { D_WEAPON_CATALOG } from './dWeaponCatalog.js';
import { NG_WEAPON_CATALOG } from './ngWeaponCatalog.js';
import { S_WEAPON_CATALOG } from './sWeaponCatalog.js';
import { ITEM_CATALOG } from './itemsCatalog.js';

/** Канонічна дворучність з *WeaponCatalog — перекриває stale GM weaponType. */
const CANON_BLOCKS_SHIELD_BY_ITEM_ID: ReadonlyMap<number, boolean> = (() => {
  const m = new Map<number, boolean>();
  for (const entry of [
    ...NG_WEAPON_CATALOG,
    ...D_WEAPON_CATALOG,
    ...C_WEAPON_CATALOG,
    ...B_WEAPON_CATALOG,
    ...A_WEAPON_CATALOG,
    ...S_WEAPON_CATALOG,
  ]) {
    m.set(entry.itemId, entry.blocksShield);
  }
  return m;
})();

export function weaponKindBlocksShieldSlot(kind: WeaponKindForEnchant): boolean {
  switch (kind) {
    case 'bigsword':
    case 'bow':
    case 'pole':
    case 'dual':
    case 'bigblunt':
    case 'fist':
      return true;
    case 'sword':
    case 'blunt':
    case 'dagger':
    default:
      return false;
  }
}

/**
 * Предмети з «дворучним» weaponType у дампі, але за правилами автора — з щитом.
 */
const ONE_HAND_WITH_SHIELD_ITEM_IDS = new Set<number>([]);

export function itemBlocksShieldSlot(
  itemId: number,
  weaponType: WeaponKindForEnchant | undefined,
): boolean {
  const canon = CANON_BLOCKS_SHIELD_BY_ITEM_ID.get(itemId);
  if (canon !== undefined) return canon;
  if (!weaponType) return false;
  if (ONE_HAND_WITH_SHIELD_ITEM_IDS.has(itemId)) return false;
  return weaponKindBlocksShieldSlot(weaponType);
}

/** GET /character — чи предмет дворучний для екіпу l1+l2 (UI дзеркало в слоті щита). */
export function itemBlocksShieldHintsForClient(): Record<number, boolean> {
  const out: Record<number, boolean> = {};
  for (const [idStr, m] of Object.entries(ITEM_CATALOG)) {
    const id = Number(idStr);
    if (!Number.isFinite(id) || id <= 0) continue;
    if (m.slot !== 'rhand' || !m.weaponType) continue;
    out[id] = itemBlocksShieldSlot(id, m.weaponType);
  }
  return out;
}
