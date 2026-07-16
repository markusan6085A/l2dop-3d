/**
 * Deadly Blow (skill 263) — Human Treasure Hunter → Adventurer.
 * Активний фізичний удар кинджалом; підвищений шанс крита (не гарантований).
 */
export const DEADLY_BLOW_L2_SKILL_ID = 263;
export const DEADLY_BLOW_BATTLE_ID = 'l2_263';
export const DEADLY_BLOW_MAX_RANK = 37;
export const DEADLY_BLOW_COOLDOWN_SEC = 11;
export const DEADLY_BLOW_CAST_SEC = 1.08;
/** Бонус до critRate на кидку скіла (спроба критичного удару). */
export const DEADLY_BLOW_CRIT_RATE_BONUS = 400;

export const DEADLY_BLOW_LEVEL_ROWS = [
  { level: 1, requiredLevel: 40, spCost: 12_000, power: 1107, mpCost: 36 },
  { level: 2, requiredLevel: 40, spCost: 12_000, power: 1176, mpCost: 37 },
  { level: 3, requiredLevel: 40, spCost: 12_000, power: 1249, mpCost: 38 },
  { level: 4, requiredLevel: 43, spCost: 14_000, power: 1325, mpCost: 38 },
  { level: 5, requiredLevel: 43, spCost: 14_000, power: 1405, mpCost: 40 },
  { level: 6, requiredLevel: 43, spCost: 14_000, power: 1488, mpCost: 41 },
  { level: 7, requiredLevel: 46, spCost: 15_000, power: 1574, mpCost: 42 },
  { level: 8, requiredLevel: 46, spCost: 15_000, power: 1664, mpCost: 43 },
  { level: 9, requiredLevel: 46, spCost: 15_000, power: 1757, mpCost: 44 },
  { level: 10, requiredLevel: 49, spCost: 30_000, power: 1853, mpCost: 46 },
  { level: 11, requiredLevel: 49, spCost: 30_000, power: 1953, mpCost: 47 },
  { level: 12, requiredLevel: 49, spCost: 30_000, power: 2057, mpCost: 48 },
  { level: 13, requiredLevel: 52, spCost: 38_000, power: 2164, mpCost: 50 },
  { level: 14, requiredLevel: 52, spCost: 38_000, power: 2274, mpCost: 50 },
  { level: 15, requiredLevel: 52, spCost: 38_000, power: 2388, mpCost: 51 },
  { level: 16, requiredLevel: 55, spCost: 56_000, power: 2505, mpCost: 52 },
  { level: 17, requiredLevel: 55, spCost: 56_000, power: 2625, mpCost: 53 },
  { level: 18, requiredLevel: 55, spCost: 56_000, power: 2748, mpCost: 55 },
  { level: 19, requiredLevel: 58, spCost: 67_000, power: 2875, mpCost: 56 },
  { level: 20, requiredLevel: 58, spCost: 67_000, power: 3004, mpCost: 57 },
  { level: 21, requiredLevel: 58, spCost: 67_000, power: 3136, mpCost: 58 },
  { level: 22, requiredLevel: 60, spCost: 160_000, power: 3271, mpCost: 60 },
  { level: 23, requiredLevel: 60, spCost: 160_000, power: 3408, mpCost: 61 },
  { level: 24, requiredLevel: 62, spCost: 220_000, power: 3548, mpCost: 61 },
  { level: 25, requiredLevel: 62, spCost: 220_000, power: 3690, mpCost: 62 },
  { level: 26, requiredLevel: 64, spCost: 220_000, power: 3834, mpCost: 63 },
  { level: 27, requiredLevel: 64, spCost: 220_000, power: 3980, mpCost: 65 },
  { level: 28, requiredLevel: 66, spCost: 390_000, power: 4127, mpCost: 66 },
  { level: 29, requiredLevel: 66, spCost: 390_000, power: 4275, mpCost: 67 },
  { level: 30, requiredLevel: 68, spCost: 390_000, power: 4425, mpCost: 68 },
  { level: 31, requiredLevel: 68, spCost: 390_000, power: 4575, mpCost: 69 },
  { level: 32, requiredLevel: 70, spCost: 520_000, power: 4726, mpCost: 70 },
  { level: 33, requiredLevel: 70, spCost: 520_000, power: 4878, mpCost: 71 },
  { level: 34, requiredLevel: 72, spCost: 680_000, power: 5029, mpCost: 72 },
  { level: 35, requiredLevel: 72, spCost: 680_000, power: 5180, mpCost: 73 },
  { level: 36, requiredLevel: 74, spCost: 1_300_000, power: 5330, mpCost: 74 },
  { level: 37, requiredLevel: 74, spCost: 1_300_000, power: 5479, mpCost: 75 },
] as const;

export const DEADLY_BLOW_HINT_UK =
  'Активний фізичний удар кинджалом; підвищений шанс критичного удару (не гарантований). ' +
  'На відміну від Backstab, не потребує позиції зі спини. Лише кинджал у руці. ' +
  'Treasure Hunter, з 40 лв. Каст ' +
  DEADLY_BLOW_CAST_SEC +
  ' с, відкат ' +
  DEADLY_BLOW_COOLDOWN_SEC +
  ' с, ближній бій. Можливий over-hit.';

export function deadlyBlowMpPowerAtRank(rank: number): {
  mp: number;
  power: number;
} | null {
  const r = Math.max(1, Math.min(DEADLY_BLOW_MAX_RANK, Math.floor(rank)));
  const row = DEADLY_BLOW_LEVEL_ROWS[r - 1];
  if (!row) return null;
  return { mp: row.mpCost, power: row.power };
}

/** Зворотна сумісність з `l2dopHfGapSkillsBattle`. */
export function deadlyBlowThMpAndPower(rank: number): {
  mp: number;
  power: number;
} {
  return deadlyBlowMpPowerAtRank(rank) ?? { mp: 36, power: 1107 };
}

export function deadlyBlowRequiredLevelAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  return DEADLY_BLOW_LEVEL_ROWS[r - 1]?.requiredLevel;
}

export function deadlyBlowSpCostAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  const sp = DEADLY_BLOW_LEVEL_ROWS[r - 1]?.spCost;
  return typeof sp === 'number' && sp >= 0 ? sp : undefined;
}

export function deadlyBlowDamageAtk(
  pAtk: number,
  power: number,
  profMult: number
): number {
  return Math.floor(pAtk * (1.18 + power / 400) * profMult);
}

export function deadlyBlowStatsNoteUk(rank: number): string {
  const row = deadlyBlowMpPowerAtRank(rank);
  const lv = Math.max(1, Math.min(DEADLY_BLOW_MAX_RANK, Math.floor(rank)));
  const reqLv = DEADLY_BLOW_LEVEL_ROWS[lv - 1]?.requiredLevel;
  const reqPart =
    typeof reqLv === 'number' && reqLv >= 1
      ? ` (Treasure Hunter, ${reqLv} лв)`
      : '';
  if (!row) {
    return DEADLY_BLOW_HINT_UK;
  }
  return (
    'Актив: MP ' +
    row.mp +
    ', power ' +
    row.power +
    ' на р. ' +
    lv +
    reqPart +
    '. Лише кинджал; підвищений шанс крита. Каст ' +
    DEADLY_BLOW_CAST_SEC +
    ' с, відкат ' +
    DEADLY_BLOW_COOLDOWN_SEC +
    ' с, ближній бій. Можливий over-hit.'
  );
}

export function deadlyBlowSkillLineUk(
  outcome: 'miss' | 'hit' | 'crit' | null,
  power: number
): string {
  if (outcome === 'crit') {
    return 'Смертельний удар (Deadly Blow): power ' + power + ' — критичний удар!';
  }
  if (outcome === 'hit') {
    return (
      'Смертельний удар (Deadly Blow): power ' +
      power +
      ' — крит не спрацював.'
    );
  }
  if (outcome === 'miss') {
    return 'Смертельний удар (Deadly Blow): промах.';
  }
  return 'Смертельний удар (Deadly Blow): power ' + power + '.';
}
