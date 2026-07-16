/**
 * Ultimate Defense (skill 110) — Interlude, Knight / Paladin / Dark Avenger.
 * Селф-баф: +P.Def / +M.Def flat, персонаж не рухається. Макс. 2 ранги.
 */
import {
  L2DOP_UDMDEF,
  L2DOP_UDPDEF,
  l2dopTableAt,
} from './l2dopRawdataBuffTables.js';

export const ULTIMATE_DEFENSE_L2_SKILL_ID = 110;
export const ULTIMATE_DEFENSE_BATTLE_ID = 'l2_110';
export const ULTIMATE_DEFENSE_MAX_RANK = 2;
export const ULTIMATE_DEFENSE_BUFF_DURATION_SEC = 30;
export const ULTIMATE_DEFENSE_COOLDOWN_SEC = 600;
export const ULTIMATE_DEFENSE_CAST_SEC = 1;

export const ULTIMATE_DEFENSE_LEVEL_ROWS = [
  {
    level: 1,
    requiredLevel: 20,
    mpCost: 19,
    spKnight: 4700,
    spPaladin: 4700,
    spDarkAvenger: 4700,
  },
  {
    level: 2,
    requiredLevel: 46,
    mpCost: 41,
    spKnight: 0,
    spPaladin: 55000,
    spDarkAvenger: 47000,
  },
] as const;

export const ULTIMATE_DEFENSE_HINT_UK =
  'Активний селф-баф: +P.Def / +M.Def на 30 с; персонаж не може рухатися. ' +
  '1 р. — Knight (20 лв); 2 р. — Paladin / Dark Avenger (46 лв). ' +
  'Каст 1 с, відкат 10 хв.';

export function ultimateDefensePdefFlatAtRank(rank: number): number {
  return l2dopTableAt(L2DOP_UDPDEF, rank);
}

export function ultimateDefenseMdefFlatAtRank(rank: number): number {
  return l2dopTableAt(L2DOP_UDMDEF, rank);
}

export function ultimateDefenseRequiredLevelAtRank(
  rank: number
): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  return ULTIMATE_DEFENSE_LEVEL_ROWS[r - 1]?.requiredLevel;
}

export function ultimateDefenseMpAtRank(rank: number): number | null {
  const r = Math.max(1, Math.min(ULTIMATE_DEFENSE_MAX_RANK, Math.floor(rank)));
  const mp = ULTIMATE_DEFENSE_LEVEL_ROWS[r - 1]?.mpCost;
  return typeof mp === 'number' && mp >= 0 ? mp : null;
}

export function ultimateDefenseSpCostAtRank(
  rank: number,
  mappedHumanProf: string
): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  const row = ULTIMATE_DEFENSE_LEVEL_ROWS[r - 1];
  if (!row) return undefined;
  const p = String(mappedHumanProf || '').trim();
  if (p === 'human_paladin' || p === 'human_phoenix_knight') {
    return row.spPaladin >= 1 ? row.spPaladin : undefined;
  }
  if (p === 'human_dark_avenger' || p === 'human_hell_knight') {
    return row.spDarkAvenger >= 1 ? row.spDarkAvenger : undefined;
  }
  if (p === 'human_knight') {
    return row.spKnight >= 1 ? row.spKnight : undefined;
  }
  return undefined;
}

/** Knight — 1 р.; Paladin / Dark Avenger — до 2. */
export function ultimateDefenseMaxRankForMappedProfession(
  mappedHumanProf: string
): number {
  const p = String(mappedHumanProf || '').trim();
  if (p === 'human_knight') return 1;
  if (
    p === 'human_paladin' ||
    p === 'human_dark_avenger' ||
    p === 'human_phoenix_knight' ||
    p === 'human_hell_knight'
  ) {
    return ULTIMATE_DEFENSE_MAX_RANK;
  }
  return 0;
}

export function ultimateDefenseStatsNoteUk(rank: number): string {
  const lv = Math.max(1, Math.min(ULTIMATE_DEFENSE_MAX_RANK, Math.floor(rank)));
  const pdef = ultimateDefensePdefFlatAtRank(lv);
  const mdef = ultimateDefenseMdefFlatAtRank(lv);
  const mp = ultimateDefenseMpAtRank(lv);
  const mpPart = mp != null ? ', MP ' + mp : '';
  return (
    '+' +
    pdef +
    ' P.Def, +' +
    mdef +
    ' M.Def на 30 с; без руху (р. ' +
    lv +
    mpPart +
    ', каст ' +
    ULTIMATE_DEFENSE_CAST_SEC +
    ' с, відкат ' +
    ULTIMATE_DEFENSE_COOLDOWN_SEC / 60 +
    ' хв).'
  );
}

export function ultimateDefenseSkillLineUk(rank: number): string {
  const lv = Math.max(1, Math.min(ULTIMATE_DEFENSE_MAX_RANK, Math.floor(rank)));
  const pdef = ultimateDefensePdefFlatAtRank(lv);
  const mdef = ultimateDefenseMdefFlatAtRank(lv);
  return (
    'Абсолютний захист (110): +' +
    pdef +
    ' P.Def, +' +
    mdef +
    ' M.Def на 30 с; персонаж не рухається.'
  );
}
