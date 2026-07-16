/**
 * Focus Skill Mastery (skill 334) — Sagittarius toggle-аура.
 * ×10 до шансу Skill Mastery; постійна витрата MP поки увімкнена.
 */
export const FOCUS_SKILL_MASTERY_L2_SKILL_ID = 334;
export const FOCUS_SKILL_MASTERY_BATTLE_ID = 'l2_334';
export const FOCUS_SKILL_MASTERY_MAX_RANK = 1;
export const FOCUS_SKILL_MASTERY_COOLDOWN_SEC = 0;
export const FOCUS_SKILL_MASTERY_PROC_MUL = 10;
/** ~1 MP за бойовий тік (інтервал між ходами). */
export const FOCUS_SKILL_MASTERY_MP_DRAIN_PER_SEC = 1;

export const FOCUS_SKILL_MASTERY_LEVEL_ROWS = [
  {
    level: 1,
    requiredLevel: 78,
    spCost: 64_000_000,
    mpCost: 36,
    mpDrainPerSec: FOCUS_SKILL_MASTERY_MP_DRAIN_PER_SEC,
  },
] as const;

export const FOCUS_SKILL_MASTERY_HINT_UK =
  'Toggle-аура: у 10 разів підвищує шанс Skill Mastery ' +
  '(миттєве скидання reuse або ×2 тривалість бафа/дебафа). ' +
  'Поки увімкнена — постійна витрата MP (~1 MP/с). 78 лв, 1 р., Sagittarius.';

export function focusSkillMasteryMpAtRank(rank: number): number | null {
  const r = Math.max(1, Math.min(FOCUS_SKILL_MASTERY_MAX_RANK, Math.floor(rank)));
  const mp = FOCUS_SKILL_MASTERY_LEVEL_ROWS[r - 1]?.mpCost;
  return typeof mp === 'number' && mp >= 0 ? mp : null;
}

export function focusSkillMasteryMpDrainPerSecAtRank(rank: number): number {
  const r = Math.max(1, Math.min(FOCUS_SKILL_MASTERY_MAX_RANK, Math.floor(rank)));
  return FOCUS_SKILL_MASTERY_LEVEL_ROWS[r - 1]?.mpDrainPerSec ?? 0;
}

export function focusSkillMasteryRequiredLevelAtRank(
  rank: number
): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  return FOCUS_SKILL_MASTERY_LEVEL_ROWS[r - 1]?.requiredLevel;
}

export function focusSkillMasterySpCostAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  const sp = FOCUS_SKILL_MASTERY_LEVEL_ROWS[r - 1]?.spCost;
  return typeof sp === 'number' && sp >= 0 ? sp : undefined;
}

export function focusSkillMasteryStatsNoteUk(): string {
  const mp = focusSkillMasteryMpAtRank(1);
  const drain = focusSkillMasteryMpDrainPerSecAtRank(1);
  return (
    '×' +
    FOCUS_SKILL_MASTERY_PROC_MUL +
    ' шанс Skill Mastery (toggle), MP ' +
    (mp ?? '?') +
    ' при вмиканні, −' +
    drain +
    ' MP/с. 78 лв, Sagittarius.'
  );
}

export function focusSkillMasterySkillLineUk(): string {
  return (
    'Фокус майстерності скілів (334, Focus Skill Mastery): ×' +
    FOCUS_SKILL_MASTERY_PROC_MUL +
    ' шанс Skill Mastery.'
  );
}

export function focusSkillMasterySkillLineOffUk(): string {
  return 'Фокус майстерності скілів (334, Focus Skill Mastery) вимкнено.';
}

export function focusSkillMasteryActiveRank(
  activeBuffs:
    | readonly { skillId: number; level: number }[]
    | undefined,
  raceToggleRanks?: Record<string, number> | undefined
): number | null {
  const fromBuff = activeBuffs?.find(
    (b) =>
      Math.floor(Number(b.skillId)) === FOCUS_SKILL_MASTERY_L2_SKILL_ID
  );
  if (fromBuff && fromBuff.level >= 1) {
    return Math.max(1, Math.floor(fromBuff.level));
  }
  const fromToggle = raceToggleRanks?.[FOCUS_SKILL_MASTERY_BATTLE_ID];
  if (typeof fromToggle === 'number' && fromToggle >= 1) {
    return Math.max(1, Math.floor(fromToggle));
  }
  return null;
}

export function focusSkillMasteryMpDrainForIntervalSec(
  rank: number,
  dtSec: number
): number {
  if (dtSec <= 0 || rank < 1) return 0;
  const rate = focusSkillMasteryMpDrainPerSecAtRank(rank);
  return rate > 0 ? Math.floor(dtSec * rate) : 0;
}
