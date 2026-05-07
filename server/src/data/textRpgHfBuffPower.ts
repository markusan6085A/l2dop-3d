import { TEXT_RPG_HF_BUFF_EFFECTS } from './textRpgHfBuffEffects.generated.js';

const BY_ID = new Map(
  TEXT_RPG_HF_BUFF_EFFECTS.map((r) => [r.l2SkillId, r] as const)
);

/**
 * Сила бафа з `gen:text-rpg-buffs` (`powerByLevel[skillLevel]`).
 * Індекс 0 у масивах — 0; рівень скіла ≥ 1.
 */
export function textRpgHfBuffPowerAtSkillLevel(
  l2SkillId: number,
  skillLevel: number
): number {
  const row = BY_ID.get(l2SkillId);
  if (!row) return 0;
  const lv = Math.max(1, Math.min(row.maxLevel, Math.floor(skillLevel)));
  const p = row.powerByLevel[lv];
  return typeof p === 'number' && Number.isFinite(p) ? p : 0;
}
