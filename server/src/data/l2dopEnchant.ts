/**
 * Заточка як у l2dop/sums.php + l2dop/calc_stats.php:
 * - зброя: weaponunderenchant / weaponoverenchant (до +3 «безпечна», далі over);
 * - броня: +1 P.Def за рівень under, +3 за рівень over (sums.php upper/legs);
 * - M.Atk від заточки зброї: under*3 + over*6 (sums.php біля зброї).
 */

const MAX_ENCHANT = 25;

/** sums.php: якщо bonus <= 3 — усе в «under», інакше under=3, over=bonus-3 */
export function splitEnchant(total: number): { under: number; over: number } {
  const e = Math.max(0, Math.min(MAX_ENCHANT, Math.floor(Number(total) || 0)));
  if (e <= 3) return { under: e, over: 0 };
  return { under: 3, over: e - 3 };
}

/** Бонус P.Def до базового значення частини броні (head/chest/legs/…) — sums.php */
export function armorPiecePDefEnchantBonus(enchant: number): number {
  const { under, over } = splitEnchant(enchant);
  return under * 1 + over * 3;
}

/** Як weapon_type у lineage.sql / items3 (cs1 `$WpnType` для Frenzy/Rage тощо). */
export type WeaponKindForEnchant =
  | 'sword'
  | 'blunt'
  | 'dagger'
  | 'bow'
  | 'bigsword'
  | 'bigblunt'
  | 'dual'
  | 'pole'
  | 'fist';

/**
 * calc_stats.php 2378–2428: D-grade для sword/blunt/dagger — однакові underPATK/overPATK.
 */
export function weaponPatkEnchantBonus(
  _weaponType: WeaponKindForEnchant,
  enchant: number
): number {
  const { under, over } = splitEnchant(enchant);
  void _weaponType; // у D-grade коефіцієнти однакові для меча/булави/кинжала (calc_stats.php)
  const underPATK = 2;
  const overPATK = 4;
  return under * underPATK + over * overPATK;
}

/** sums.php: underMATK=3, overMATK=6 для зброї */
export function weaponMatkEnchantBonus(enchant: number): number {
  const { under, over } = splitEnchant(enchant);
  return under * 3 + over * 6;
}
