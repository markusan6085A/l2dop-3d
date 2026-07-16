/**
 * Fortitude (skill 335) — Human Phoenix Knight.
 * Toggle-аура: +стійкість до стану та паралічу; постійна витрата MP.
 */
export const FORTITUDE_L2_SKILL_ID = 335;
export const FORTITUDE_BATTLE_ID = 'l2_335';
export const FORTITUDE_MAX_RANK = 1;
export const FORTITUDE_COOLDOWN_SEC = 0;
export const FORTITUDE_MP_DRAIN_PER_SEC = 0.5;
export const FORTITUDE_STUN_RESIST_PCT = 30;
export const FORTITUDE_PARALYZE_RESIST_PCT = 30;

export const FORTITUDE_LEVEL_ROWS = [
  {
    level: 1,
    requiredLevel: 76,
    spCost: 10_000_000,
    mpCost: 35,
    mpDrainPerSec: FORTITUDE_MP_DRAIN_PER_SEC,
    stunResistPct: FORTITUDE_STUN_RESIST_PCT,
    paralyzeResistPct: FORTITUDE_PARALYZE_RESIST_PCT,
  },
] as const;

export const FORTITUDE_HINT_UK =
  'Toggle-аура: +30% захист від стану та паралічу. ' +
  'Поки увімкнена — постійна витрата MP (~0,5 MP/с). 1 р. — 76 лв (Phoenix Knight).';

export function fortitudeStunResistPctAtRank(rank: number): number {
  const r = Math.max(1, Math.min(FORTITUDE_MAX_RANK, Math.floor(rank)));
  return FORTITUDE_LEVEL_ROWS[r - 1]?.stunResistPct ?? 0;
}

export function fortitudeParalyzeResistPctAtRank(rank: number): number {
  const r = Math.max(1, Math.min(FORTITUDE_MAX_RANK, Math.floor(rank)));
  return FORTITUDE_LEVEL_ROWS[r - 1]?.paralyzeResistPct ?? 0;
}

export function fortitudeMpAtRank(rank: number): number | null {
  const r = Math.max(1, Math.min(FORTITUDE_MAX_RANK, Math.floor(rank)));
  const mp = FORTITUDE_LEVEL_ROWS[r - 1]?.mpCost;
  return typeof mp === 'number' && mp >= 0 ? mp : null;
}

export function fortitudeMpDrainPerSecAtRank(rank: number): number {
  const r = Math.max(1, Math.min(FORTITUDE_MAX_RANK, Math.floor(rank)));
  return FORTITUDE_LEVEL_ROWS[r - 1]?.mpDrainPerSec ?? 0;
}

export function fortitudeRequiredLevelAtRank(
  rank: number
): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  return FORTITUDE_LEVEL_ROWS[r - 1]?.requiredLevel;
}

export function fortitudeSpCostAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  const sp = FORTITUDE_LEVEL_ROWS[r - 1]?.spCost;
  return typeof sp === 'number' && sp >= 0 ? sp : undefined;
}

export function fortitudeStatsNoteUk(rank: number): string {
  const r = Math.max(1, Math.min(FORTITUDE_MAX_RANK, Math.floor(rank)));
  const stun = fortitudeStunResistPctAtRank(r);
  const para = fortitudeParalyzeResistPctAtRank(r);
  const mp = fortitudeMpAtRank(r);
  const drain = fortitudeMpDrainPerSecAtRank(r);
  const reqLv = FORTITUDE_LEVEL_ROWS[r - 1]?.requiredLevel;
  const reqPart =
    typeof reqLv === 'number' && reqLv >= 1 ? ` (макс. на ${reqLv} лв)` : '';
  return (
    '+стан ' +
    stun +
    '%, +параліч ' +
    para +
    '% (toggle), р. ' +
    r +
    reqPart +
    ', MP ' +
    (mp ?? '?') +
    ' при вмиканні, −' +
    drain +
    ' MP/с.'
  );
}

export function fortitudeSkillLineUk(rank: number): string {
  const stun = fortitudeStunResistPctAtRank(rank);
  const para = fortitudeParalyzeResistPctAtRank(rank);
  return (
    'Стійкість (335, Fortitude): +стан ' +
    stun +
    '%, +параліч ' +
    para +
    '%.'
  );
}

export function fortitudeSkillLineOffUk(): string {
  return 'Стійкість (335, Fortitude) вимкнено.';
}

export function fortitudeActiveRank(
  activeBuffs:
    | readonly { skillId: number; level: number }[]
    | undefined,
  raceToggleRanks?: Record<string, number> | undefined
): number | null {
  const fromBuff = activeBuffs?.find(
    (b) => Math.floor(Number(b.skillId)) === FORTITUDE_L2_SKILL_ID
  );
  if (fromBuff && fromBuff.level >= 1) {
    return Math.max(1, Math.floor(fromBuff.level));
  }
  const fromToggle = raceToggleRanks?.[FORTITUDE_BATTLE_ID];
  if (typeof fromToggle === 'number' && fromToggle >= 1) {
    return Math.max(1, Math.floor(fromToggle));
  }
  return null;
}

export function fortitudeMpDrainForIntervalSec(
  rank: number,
  dtSec: number
): number {
  if (dtSec <= 0 || rank < 1) return 0;
  const rate = fortitudeMpDrainPerSecAtRank(rank);
  return rate > 0 ? Math.floor(dtSec * rate) : 0;
}
