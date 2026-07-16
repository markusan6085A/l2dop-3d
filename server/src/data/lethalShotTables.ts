/**
 * Lethal Shot (skill 343) — Human Sagittarius.
 * Потужний постріл з лука; 2% летальний ефект (PvE → 1 HP, PvP → 1 CP).
 */
export const LETHAL_SHOT_L2_SKILL_ID = 343;
export const LETHAL_SHOT_BATTLE_ID = 'l2_343';
export const LETHAL_SHOT_MAX_RANK = 1;
export const LETHAL_SHOT_COOLDOWN_SEC = 30;
export const LETHAL_SHOT_CAST_SEC = 4;
export const LETHAL_SHOT_RANGE = 900;
export const LETHAL_SHOT_LETHAL_CHANCE_PCT = 2;

export const LETHAL_SHOT_LEVEL_ROWS = [
  {
    level: 1,
    requiredLevel: 76,
    spCost: 15_000_000,
    power: 5132,
    mpCost: 170,
  },
] as const;

export const LETHAL_SHOT_HINT_UK =
  'Активний фізичний скіл із лука: power ' +
  LETHAL_SHOT_LEVEL_ROWS[0]!.power +
  '; 2% шанс летального ефекту (PvE — 1 HP мобу, PvP — 1 CP суперника). ' +
  'Можливий Over-hit. Лише з луком; Sagittarius, 76 лв. ' +
  'Каст ' +
  LETHAL_SHOT_CAST_SEC +
  ' с, відкат ' +
  LETHAL_SHOT_COOLDOWN_SEC +
  ' с, дальність ' +
  LETHAL_SHOT_RANGE +
  '.';

export function lethalShotMpPowerAtRank(rank: number): {
  mp: number;
  power: number;
} | null {
  const r = Math.max(1, Math.min(LETHAL_SHOT_MAX_RANK, Math.floor(rank)));
  const row = LETHAL_SHOT_LEVEL_ROWS[r - 1];
  if (!row) return null;
  return { mp: row.mpCost, power: row.power };
}

export function lethalShotRequiredLevelAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  return LETHAL_SHOT_LEVEL_ROWS[r - 1]?.requiredLevel;
}

export function lethalShotSpCostAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  const sp = LETHAL_SHOT_LEVEL_ROWS[r - 1]?.spCost;
  return typeof sp === 'number' && sp >= 0 ? sp : undefined;
}

/** Фіз. урон з лука (як у `humanFighterTurnCoreBasics`). */
export function lethalShotDamageAtk(
  pAtk: number,
  power: number,
  profMult: number
): number {
  return Math.floor(pAtk * (1.28 + power / 2200) * profMult);
}

export function rollLethalShotProc(): boolean {
  return Math.random() * 100 < LETHAL_SHOT_LETHAL_CHANCE_PCT;
}

export function lethalShotStatsNoteUk(rank: number): string {
  const lv = Math.max(1, Math.min(LETHAL_SHOT_MAX_RANK, Math.floor(rank)));
  const row = LETHAL_SHOT_LEVEL_ROWS[lv - 1];
  const reqLv = row?.requiredLevel;
  const reqPart =
    typeof reqLv === 'number' && reqLv >= 1 ? ` (Sagittarius, ${reqLv} лв)` : '';
  return (
    'Power ' +
    (row?.power ?? 5132) +
    ', MP ' +
    (row?.mpCost ?? 170) +
    '; 2% летальний ефект (PvE — 1 HP, PvP — 1 CP); over-hit' +
    reqPart +
    '. Каст ' +
    LETHAL_SHOT_CAST_SEC +
    ' с, відкат ' +
    LETHAL_SHOT_COOLDOWN_SEC +
    ' с, дальність ' +
    LETHAL_SHOT_RANGE +
    '.'
  );
}

export function lethalShotSkillLineUk(lethalProc: boolean): string {
  const base = 'Смертельний постріл (Lethal Shot): power 5132.';
  if (!lethalProc) return base;
  return base + ' Летальний ефект!';
}
