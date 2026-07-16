/**
 * Shield Fortress (skill 322) — Human Paladin / Dark Avenger (+ Phoenix / Hell Knight).
 * Toggle-аура: +Shield Defense (flat), постійна витрата MP, без урону.
 */
export const SHIELD_FORTRESS_L2_SKILL_ID = 322;
export const SHIELD_FORTRESS_BATTLE_ID = 'l2_322';
export const SHIELD_FORTRESS_MAX_RANK = 6;
export const SHIELD_FORTRESS_COOLDOWN_SEC = 0;

export const SHIELD_FORTRESS_LEVEL_ROWS = [
  {
    level: 1,
    requiredLevel: 64,
    spPaladin: 370_000,
    spDarkAvenger: 370_000,
    mpCost: 12,
    mpDrainPerSec: 0.4,
    shieldDef: 446,
  },
  {
    level: 2,
    requiredLevel: 66,
    spPaladin: 580_000,
    spDarkAvenger: 540_000,
    mpCost: 13,
    mpDrainPerSec: 0.8,
    shieldDef: 469,
  },
  {
    level: 3,
    requiredLevel: 68,
    spPaladin: 650_000,
    spDarkAvenger: 650_000,
    mpCost: 13,
    mpDrainPerSec: 1.2,
    shieldDef: 491,
  },
  {
    level: 4,
    requiredLevel: 70,
    spPaladin: 780_000,
    spDarkAvenger: 660_000,
    mpCost: 13,
    mpDrainPerSec: 1.6,
    shieldDef: 514,
  },
  {
    level: 5,
    requiredLevel: 72,
    spPaladin: 1_200_000,
    spDarkAvenger: 1_200_000,
    mpCost: 14,
    mpDrainPerSec: 2.0,
    shieldDef: 537,
  },
  {
    level: 6,
    requiredLevel: 74,
    spPaladin: 1_900_000,
    spDarkAvenger: 1_800_000,
    mpCost: 14,
    mpDrainPerSec: 2.4,
    shieldDef: 560,
  },
] as const;

export const SHIELD_FORTRESS_HINT_UK =
  'Toggle-аура: +Shield Defense (сила захисту щита, не шанс блоку). ' +
  'Поки увімкнена — постійна витрата MP. 6 р. — 64–74 лв (Paladin / Dark Avenger). ' +
  'Потрібен екіпований щит.';

export function shieldFortressShieldDefAtRank(rank: number): number {
  const r = Math.max(1, Math.min(SHIELD_FORTRESS_MAX_RANK, Math.floor(rank)));
  return SHIELD_FORTRESS_LEVEL_ROWS[r - 1]?.shieldDef ?? 0;
}

export function shieldFortressMpAtRank(rank: number): number | null {
  const r = Math.max(1, Math.min(SHIELD_FORTRESS_MAX_RANK, Math.floor(rank)));
  const mp = SHIELD_FORTRESS_LEVEL_ROWS[r - 1]?.mpCost;
  return typeof mp === 'number' && mp >= 0 ? mp : null;
}

export function shieldFortressMpDrainPerSecAtRank(rank: number): number {
  const r = Math.max(1, Math.min(SHIELD_FORTRESS_MAX_RANK, Math.floor(rank)));
  return SHIELD_FORTRESS_LEVEL_ROWS[r - 1]?.mpDrainPerSec ?? 0;
}

export function shieldFortressRequiredLevelAtRank(
  rank: number
): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  return SHIELD_FORTRESS_LEVEL_ROWS[r - 1]?.requiredLevel;
}

export function shieldFortressSpCostAtRank(
  rank: number,
  mappedHumanProf: string
): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  const row = SHIELD_FORTRESS_LEVEL_ROWS[r - 1];
  if (!row) return undefined;
  const p = String(mappedHumanProf || '').trim();
  if (p === 'human_paladin' || p === 'human_phoenix_knight') {
    return row.spPaladin >= 1 ? row.spPaladin : undefined;
  }
  if (p === 'human_dark_avenger' || p === 'human_hell_knight') {
    return row.spDarkAvenger >= 1 ? row.spDarkAvenger : undefined;
  }
  return undefined;
}

export function shieldFortressStatsNoteUk(rank: number): string {
  const r = Math.max(1, Math.min(SHIELD_FORTRESS_MAX_RANK, Math.floor(rank)));
  const def = shieldFortressShieldDefAtRank(r);
  const mp = shieldFortressMpAtRank(r);
  const drain = shieldFortressMpDrainPerSecAtRank(r);
  const reqLv = SHIELD_FORTRESS_LEVEL_ROWS[r - 1]?.requiredLevel;
  const reqPart =
    typeof reqLv === 'number' && reqLv >= 1 ? ` (макс. на ${reqLv} лв)` : '';
  return (
    '+Shield Def ' +
    def +
    ' (toggle), р. ' +
    r +
    reqPart +
    ', MP ' +
    (mp ?? '?') +
    ' при вмиканні, −' +
    drain +
    ' MP/с. Потрібен щит.'
  );
}

export function shieldFortressSkillLineUk(rank: number): string {
  const def = shieldFortressShieldDefAtRank(rank);
  return 'Фортеця щита (322, Shield Fortress): +Shield Def ' + def + '.';
}

export function shieldFortressSkillLineOffUk(): string {
  return 'Фортеця щита (322, Shield Fortress) вимкнено.';
}

/** Активний ранг з activeBuffs або `raceToggleRanks.l2_322`. */
export function shieldFortressActiveRank(
  activeBuffs:
    | readonly { skillId: number; level: number }[]
    | undefined,
  raceToggleRanks?: Record<string, number> | undefined
): number | null {
  const fromBuff = activeBuffs?.find(
    (b) => Math.floor(Number(b.skillId)) === SHIELD_FORTRESS_L2_SKILL_ID
  );
  if (fromBuff && fromBuff.level >= 1) {
    return Math.max(1, Math.floor(fromBuff.level));
  }
  const fromToggle = raceToggleRanks?.[SHIELD_FORTRESS_BATTLE_ID];
  if (typeof fromToggle === 'number' && fromToggle >= 1) {
    return Math.max(1, Math.floor(fromToggle));
  }
  return null;
}

export function shieldFortressMpDrainForIntervalSec(
  rank: number,
  dtSec: number
): number {
  if (dtSec <= 0 || rank < 1) return 0;
  const rate = shieldFortressMpDrainPerSecAtRank(rank);
  return rate > 0 ? Math.floor(dtSec * rate) : 0;
}
