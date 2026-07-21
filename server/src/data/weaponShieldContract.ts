/**
 * Leaf-модуль контракту щита для зброї — без імпортів каталогів / інвентаря.
 */
import type { WeaponKindForEnchant } from './l2dopEnchant.js';

/** Дворучність за типом (generic rule; explicit blocksShield у каталозі має пріоритет). */
export function weaponTypeBlocksShield(
  weaponType: WeaponKindForEnchant | undefined,
): boolean {
  if (!weaponType) return false;
  switch (weaponType) {
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

export function resolveWeaponBlocksShield(args: {
  itemId: number;
  weaponType: WeaponKindForEnchant | undefined;
  explicitBlocksShield?: boolean;
}): boolean {
  void args.itemId;
  if (typeof args.explicitBlocksShield === 'boolean') {
    return args.explicitBlocksShield;
  }
  return weaponTypeBlocksShield(args.weaponType);
}
