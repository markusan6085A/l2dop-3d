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
import { ITEM_CATALOG } from './itemsCatalog.js';

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
 * 231 Dragon Grinder (A); 257 «Ікло гадюки» NG (fist у items3, не в переліку дворучок NG).
 */
const ONE_HAND_WITH_SHIELD_ITEM_IDS = new Set<number>([231, 257]);

export function itemBlocksShieldSlot(
  itemId: number,
  weaponType: WeaponKindForEnchant | undefined,
): boolean {
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
