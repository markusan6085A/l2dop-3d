/**

 * Majesty (skill 82) — Interlude, Knight / Paladin / Dark Avenger.

 * Селф-баф: +P.Def %, −Evasion. Макс. 3 ранги.

 */

import {
  L2DOP_MAJESTY,
  L2DOP_MAJESTY_EVA,
  l2dopTableAt,
} from './l2dopRawdataBuffTables.js';



export const MAJESTY_L2_SKILL_ID = 82;

export const MAJESTY_MAX_RANK = 3;

export const MAJESTY_BUFF_DURATION_SEC = 300;

export const MAJESTY_COOLDOWN_SEC = 10;

export const MAJESTY_CAST_SEC = 1.5;



export const MAJESTY_LEVEL_ROWS = [

  { level: 1, requiredLevel: 20, mpCost: 10, spKnight: 4700, spPaladin: 4700, spDarkAvenger: 4700 },

  { level: 2, requiredLevel: 40, mpCost: 18, spKnight: 0, spPaladin: 35000, spDarkAvenger: 33000 },

  { level: 3, requiredLevel: 58, mpCost: 27, spKnight: 0, spPaladin: 200000, spDarkAvenger: 170000 },

] as const;



export const MAJESTY_HINT_UK =

  'Активний селф-баф: +P.Def, −ухилення на 5 хв. Каст 1,5 с, відкат 10 с. ' +

  '1 р. — Knight (20 лв); 2–3 р. — Paladin або Dark Avenger (40 / 58 лв).';



export function majestyPdefMulAtRank(rank: number): number {

  return l2dopTableAt(L2DOP_MAJESTY, rank);

}



export function majestyEvaDeltaAtRank(rank: number): number {

  return l2dopTableAt(L2DOP_MAJESTY_EVA, rank);

}



export function majestyPdefPctAtRank(rank: number): number {

  const mul = majestyPdefMulAtRank(rank);

  if (mul <= 0 || mul === 1) return 0;

  return Math.round((mul - 1) * 100);

}



export function majestyRequiredLevelAtRank(rank: number): number | undefined {

  const r = Math.max(1, Math.floor(rank));

  return MAJESTY_LEVEL_ROWS[r - 1]?.requiredLevel;

}



export function majestyMpAtRank(rank: number): number | null {

  const r = Math.max(1, Math.min(MAJESTY_MAX_RANK, Math.floor(rank)));

  const mp = MAJESTY_LEVEL_ROWS[r - 1]?.mpCost;

  return typeof mp === 'number' && mp >= 0 ? mp : null;

}



/** SP за професією (mapped human catalog id). */

export function majestySpCostAtRank(

  rank: number,

  mappedHumanProf: string

): number | undefined {

  const r = Math.max(1, Math.floor(rank));

  const row = MAJESTY_LEVEL_ROWS[r - 1];

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



/** Knight — лише 1 ранг; 2–3 профа — до 3. */

export function majestyMaxRankForMappedProfession(

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

    return MAJESTY_MAX_RANK;

  }

  return 0;

}



export function majestyStatsNoteUk(rank: number): string {

  const lv = Math.max(1, Math.min(MAJESTY_MAX_RANK, Math.floor(rank)));

  const pdef = majestyPdefPctAtRank(lv);

  const eva = majestyEvaDeltaAtRank(lv);

  const mp = majestyMpAtRank(lv);

  const mpPart = mp != null ? ', MP ' + mp : '';

  return (

    '+' +

    pdef +

    '% P.Def, ' +

    eva +

    ' ухилення на 5 хв (р. ' +

    lv +

    mpPart +

    ', каст ' +

    MAJESTY_CAST_SEC +

    ' с, відкат ' +

    MAJESTY_COOLDOWN_SEC +

    ' с).'

  );

}



export function majestySkillLineUk(rank: number): string {

  const lv = Math.max(1, Math.min(MAJESTY_MAX_RANK, Math.floor(rank)));

  const pdef = majestyPdefPctAtRank(lv);

  const eva = majestyEvaDeltaAtRank(lv);

  return (

    'Велич (Majesty): +' +

    pdef +

    '% P.Def, ' +

    eva +

    ' ухилення на 5 хв.'

  );

}


