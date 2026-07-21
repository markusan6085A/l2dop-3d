/**
 * Єдиний контракт типів зброї L2DOP (NG→S).
 * Runtime використовує лише 9 канонічних weaponType; legacy — тільки при імпорті/міграції.
 */
import type { WeaponKindForEnchant } from './l2dopEnchant.js';

export const CANONICAL_WEAPON_TYPES = [
  'sword',
  'blunt',
  'dagger',
  'bow',
  'bigsword',
  'bigblunt',
  'dual',
  'pole',
  'fist',
] as const satisfies readonly WeaponKindForEnchant[];

export type CanonicalWeaponType = (typeof CANONICAL_WEAPON_TYPES)[number];

const CANONICAL_SET = new Set<string>(CANONICAL_WEAPON_TYPES);

/** Legacy → canonical; лише для import/migration, не для runtime inference з назви. */
const LEGACY_WEAPON_TYPE_MAP: Readonly<Record<string, WeaponKindForEnchant>> = {
  mace: 'blunt',
  'one-handed mace': 'blunt',
  'magic mace': 'blunt',
  axe: 'blunt',
  staff: 'bigblunt',
  'two-handed magic blunt': 'bigblunt',
  'twohand_blunt': 'bigblunt',
  twohandblunt: 'bigblunt',
  'two-handed sword': 'bigsword',
  twohand: 'bigsword',
  twohandsword: 'bigsword',
  'twohand_sword': 'bigsword',
  'two-handed axe': 'bigblunt',
  'two-handed blunt': 'bigblunt',
  spear: 'pole',
  pike: 'pole',
  lance: 'pole',
  knuckles: 'fist',
  gloves: 'fist',
  fists: 'fist',
  duals: 'dual',
  dualsword: 'dual',
  bow2h: 'bow',
  weapon: 'sword',
};

export function isCanonicalWeaponType(
  wt: unknown,
): wt is WeaponKindForEnchant {
  return typeof wt === 'string' && CANONICAL_SET.has(wt);
}

/** Нормалізація legacy weaponType при імпорті/міграції. */
export function normalizeLegacyWeaponType(
  raw: unknown,
): WeaponKindForEnchant | undefined {
  if (typeof raw !== 'string' || !raw.trim()) return undefined;
  const k = raw.trim().toLowerCase();
  if (CANONICAL_SET.has(k)) return k as WeaponKindForEnchant;
  return LEGACY_WEAPON_TYPE_MAP[k];
}

/** Стріли потрібні лише для луків. */
export function requiresArrowsForWeaponType(
  weaponType: WeaponKindForEnchant | string | undefined,
): boolean {
  return weaponType === 'bow';
}

export { weaponTypeBlocksShield } from './weaponShieldContract.js';

/** Frenzy/Rage heavy branch — лише bigsword/bigblunt (не bow/pole/dual/fist). */
export function isTwoHandHeavyWeaponType(
  weaponType: WeaponKindForEnchant | string | undefined,
): boolean {
  return weaponType === 'bigsword' || weaponType === 'bigblunt';
}
