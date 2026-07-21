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
import { requiresArrowsForWeaponType } from './weaponTypeContract.js';
import {
  resolveWeaponBlocksShield,
  weaponTypeBlocksShield,
} from './weaponShieldContract.js';
import { ITEM_CATALOG } from './itemsCatalog.js';

export { requiresArrowsForWeaponType, weaponTypeBlocksShield };

/** @deprecated alias — використовуй weaponTypeBlocksShield */
export function weaponKindBlocksShieldSlot(kind: WeaponKindForEnchant): boolean {
  return weaponTypeBlocksShield(kind);
}

/**
 * Предмети з «дворучним» weaponType у дампі, але за правилами автора — з щитом.
 */
const ONE_HAND_WITH_SHIELD_ITEM_IDS = new Set<number>([]);

export function itemBlocksShieldSlot(
  itemId: number,
  weaponType: WeaponKindForEnchant | undefined,
): boolean {
  if (ONE_HAND_WITH_SHIELD_ITEM_IDS.has(itemId)) return false;
  const catalog = ITEM_CATALOG[itemId];
  return resolveWeaponBlocksShield({
    itemId,
    weaponType: weaponType ?? catalog?.weaponType,
    explicitBlocksShield:
      typeof catalog?.blocksShield === 'boolean' ? catalog.blocksShield : undefined,
  });
}

/** GET /character — чи лук потребує стріл (лише weaponType === 'bow'). */
export function itemRequiresArrowsHintsForClient(): Record<number, boolean> {
  const out: Record<number, boolean> = {};
  for (const [idStr, m] of Object.entries(ITEM_CATALOG)) {
    const id = Number(idStr);
    if (!Number.isFinite(id) || id <= 0) continue;
    if (m.slot !== 'rhand' || !m.weaponType) continue;
    if (requiresArrowsForWeaponType(m.weaponType)) out[id] = true;
  }
  return out;
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
