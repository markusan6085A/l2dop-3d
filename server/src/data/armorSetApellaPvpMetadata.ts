/**
 * Apella Light 4/4 — PvP metadata (Interlude skill 3609 / effect 296975).
 * Trigger pipeline — planned; не підміняти вигаданими combat-статами.
 */
export const APELLA_LIGHT_PVP_SPEED_DEBUFF_SKILL_ID = 3609;
export const APELLA_LIGHT_PVP_SPEED_DEBUFF_EFFECT_ID = 296975;
export const APELLA_LIGHT_PVP_SPEED_DEBUFF_CHANCE_PCT = 20;

export type ApellaPvpSpeedDebuffRollContext = {
  /** Захисник у повному Apella Light 4/4. */
  defenderFullApellaLight: boolean;
  /** Атакуючий — інший гравець (не NPC/mob). */
  attackerIsPlayer: boolean;
  /** Урон не self/environment. */
  damageFromExternalAttacker: boolean;
};

/** Один roll шансу 20% — лише для PvP-атаки по повному Apella Light. */
export function rollApellaPvpAttackerSpeedDebuff(
  ctx: ApellaPvpSpeedDebuffRollContext,
  rng: () => number = Math.random
): boolean {
  if (!ctx.defenderFullApellaLight) return false;
  if (!ctx.attackerIsPlayer) return false;
  if (!ctx.damageFromExternalAttacker) return false;
  return rng() * 100 < APELLA_LIGHT_PVP_SPEED_DEBUFF_CHANCE_PCT;
}
