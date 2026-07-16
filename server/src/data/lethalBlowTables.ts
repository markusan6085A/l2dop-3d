/**
 * Lethal Blow (skill 344) — Human Adventurer.
 * Потужний удар кинджалом; підвищений шанс крита; 6% летальний ефект.
 */
export const LETHAL_BLOW_L2_SKILL_ID = 344;
export const LETHAL_BLOW_BATTLE_ID = 'l2_344';
export const LETHAL_BLOW_MAX_RANK = 1;
export const LETHAL_BLOW_COOLDOWN_SEC = 15;
export const LETHAL_BLOW_CAST_SEC = 1.8;
export const LETHAL_BLOW_LETHAL_CHANCE_PCT = 6;
/** Бонус до critRate на кидку скіла (спроба критичного удару). */
export const LETHAL_BLOW_CRIT_RATE_BONUS = 400;

export const LETHAL_BLOW_LEVEL_ROWS = [
  {
    level: 1,
    requiredLevel: 76,
    spCost: 15_000_000,
    power: 5773,
    mpCost: 85,
  },
] as const;

export const LETHAL_BLOW_HINT_UK =
  'Активний фізичний удар кинджалом: power ' +
  LETHAL_BLOW_LEVEL_ROWS[0]!.power +
  '; підвищений шанс крита; ' +
  LETHAL_BLOW_LETHAL_CHANCE_PCT +
  '% шанс летального ефекту (PvE — 1 HP мобу, PvP — 1 CP суперника). ' +
  'На відміну від Backstab, не потребує позиції зі спини. Лише кинджал; Adventurer, 76 лв. ' +
  'Каст ' +
  LETHAL_BLOW_CAST_SEC +
  ' с, відкат ' +
  LETHAL_BLOW_COOLDOWN_SEC +
  ' с, ближній бій. Можливий over-hit.';

export function lethalBlowMpPowerAtRank(rank: number): {
  mp: number;
  power: number;
} | null {
  const r = Math.max(1, Math.min(LETHAL_BLOW_MAX_RANK, Math.floor(rank)));
  const row = LETHAL_BLOW_LEVEL_ROWS[r - 1];
  if (!row) return null;
  return { mp: row.mpCost, power: row.power };
}

/** Зворотна сумісність з `l2dopHfGapSkillsBattle`. */
export function lethalBlowAdvMpAndPower(_rank: number): {
  mp: number;
  power: number;
} {
  return lethalBlowMpPowerAtRank(1) ?? { mp: 85, power: 5773 };
}

export function lethalBlowRequiredLevelAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  return LETHAL_BLOW_LEVEL_ROWS[r - 1]?.requiredLevel;
}

export function lethalBlowSpCostAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  const sp = LETHAL_BLOW_LEVEL_ROWS[r - 1]?.spCost;
  return typeof sp === 'number' && sp >= 0 ? sp : undefined;
}

export function lethalBlowDamageAtk(
  pAtk: number,
  power: number,
  profMult: number
): number {
  return Math.floor(pAtk * (1.35 + power / 900) * profMult);
}

export function rollLethalBlowProc(): boolean {
  return Math.random() * 100 < LETHAL_BLOW_LETHAL_CHANCE_PCT;
}

export function lethalBlowStatsNoteUk(rank: number): string {
  const lv = Math.max(1, Math.min(LETHAL_BLOW_MAX_RANK, Math.floor(rank)));
  const row = LETHAL_BLOW_LEVEL_ROWS[lv - 1];
  const reqLv = row?.requiredLevel;
  const reqPart =
    typeof reqLv === 'number' && reqLv >= 1 ? ` (Adventurer, ${reqLv} лв)` : '';
  return (
    'Power ' +
    (row?.power ?? 5773) +
    ', MP ' +
    (row?.mpCost ?? 85) +
    '; підвищений шанс крита; ' +
    LETHAL_BLOW_LETHAL_CHANCE_PCT +
    '% летальний ефект (PvE — 1 HP, PvP — 1 CP)' +
    reqPart +
    '. Каст ' +
    LETHAL_BLOW_CAST_SEC +
    ' с, відкат ' +
    LETHAL_BLOW_COOLDOWN_SEC +
    ' с, ближній бій. Лише кинджал.'
  );
}

export function lethalBlowSkillLineUk(
  outcome: 'miss' | 'hit' | 'crit' | null,
  lethalProc: boolean
): string {
  let line = 'Смертельний удар (Lethal Blow): power 5773.';
  if (outcome === 'crit') {
    line += ' Критичний удар!';
  } else if (outcome === 'hit') {
    line += ' Крит не спрацював.';
  } else if (outcome === 'miss') {
    return 'Смертельний удар (Lethal Blow): промах.';
  }
  if (lethalProc) {
    line += ' Летальний ефект!';
  }
  return line;
}
