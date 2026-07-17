/**
 * «Швидкість бою» на зброї (379, 433, 293…) — raw-стата L2 з items/GM.
 * У профілі та CD використовуємо шкалу pAtkSpd/castSpd з baseline 600:
 * 379 → 600, 433 → ~685, 293 → ~464.
 *
 * Це не «+379 до castSpd», а множник швидкості відносно типової NG blunt (379).
 */
export const WEAPON_ATK_SPD_L2_REFERENCE = 379;

export function combatSpeedFromWeaponAtkSpd(weaponAtkSpdRaw: number): number {
  const raw =
    typeof weaponAtkSpdRaw === 'number' &&
    Number.isFinite(weaponAtkSpdRaw) &&
    weaponAtkSpdRaw > 0
      ? weaponAtkSpdRaw
      : WEAPON_ATK_SPD_L2_REFERENCE;
  return Math.max(
    50,
    Math.round((raw / WEAPON_ATK_SPD_L2_REFERENCE) * 600)
  );
}
