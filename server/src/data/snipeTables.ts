/**
 * Snipe (skill 313) — Human Hawkeye → Sagittarius.
 * Селф-баф на 2 хв: +P.Atk (лук), +20% крит, +2 Accuracy; блокує пересування.
 */
import { L2DOP_SNIPE, l2dopTableAt } from './l2dopRawdataBuffTables.js';

export const SNIPE_L2_SKILL_ID = 313;
export const SNIPE_BATTLE_ID = 'l2_313';
export const SNIPE_MAX_RANK = 8;
export const SNIPE_COOLDOWN_SEC = 10;
export const SNIPE_CAST_SEC = 1.5;
export const SNIPE_BUFF_DURATION_SEC = 120;
export const SNIPE_ACCURACY_FLAT = 2;
export const SNIPE_CRIT_RATE_PCT = 20;

export const SNIPE_LEVEL_ROWS = [
  { level: 1, requiredLevel: 60, spCost: 420_000, patkFlat: 110, mpCost: 55 },
  { level: 2, requiredLevel: 62, spCost: 500_000, patkFlat: 119, mpCost: 58 },
  { level: 3, requiredLevel: 64, spCost: 540_000, patkFlat: 129, mpCost: 59 },
  { level: 4, requiredLevel: 66, spCost: 880_000, patkFlat: 138, mpCost: 61 },
  { level: 5, requiredLevel: 68, spCost: 980_000, patkFlat: 148, mpCost: 63 },
  { level: 6, requiredLevel: 70, spCost: 1_200_000, patkFlat: 158, mpCost: 65 },
  { level: 7, requiredLevel: 72, spCost: 1_700_000, patkFlat: 167, mpCost: 67 },
  { level: 8, requiredLevel: 74, spCost: 2_900_000, patkFlat: 177, mpCost: 68 },
] as const;

export const SNIPE_HINT_UK =
  'Активний селф-баф на ' +
  SNIPE_BUFF_DURATION_SEC / 60 +
  ' хв: +P.Atk з луком, +' +
  SNIPE_CRIT_RATE_PCT +
  '% крит, +' +
  SNIPE_ACCURACY_FLAT +
  ' Accuracy; персонаж не може рухатися. Потрібен лук. ' +
  'Hawkeye; 1 р. — 60 лв (+110 P.Atk, MP 55); 8 р. — 74 лв (+177 P.Atk, MP 68). ' +
  'Каст ' +
  SNIPE_CAST_SEC +
  ' с, відкат ' +
  SNIPE_COOLDOWN_SEC +
  ' с.';

export function snipePatkFlatAtRank(rank: number): number {
  const r = Math.max(1, Math.min(SNIPE_MAX_RANK, Math.floor(rank)));
  return SNIPE_LEVEL_ROWS[r - 1]?.patkFlat ?? l2dopTableAt(L2DOP_SNIPE, r);
}

export function snipeMpAtRank(rank: number): number | null {
  const r = Math.max(1, Math.min(SNIPE_MAX_RANK, Math.floor(rank)));
  const mp = SNIPE_LEVEL_ROWS[r - 1]?.mpCost;
  return typeof mp === 'number' && mp >= 0 ? mp : null;
}

export function snipeRequiredLevelAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  return SNIPE_LEVEL_ROWS[r - 1]?.requiredLevel;
}

export function snipeSpCostAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  const sp = SNIPE_LEVEL_ROWS[r - 1]?.spCost;
  return typeof sp === 'number' && sp >= 0 ? sp : undefined;
}

export function snipeStatsNoteUk(rank: number): string {
  const lv = Math.max(1, Math.min(SNIPE_MAX_RANK, Math.floor(rank)));
  const patk = snipePatkFlatAtRank(lv);
  const mp = snipeMpAtRank(lv);
  const reqLv = SNIPE_LEVEL_ROWS[lv - 1]?.requiredLevel;
  const reqPart =
    typeof reqLv === 'number' && reqLv >= 1 ? ` (Hawkeye, ${reqLv} лв)` : '';
  const mpPart = mp != null ? ', MP ' + mp : '';
  return (
    '+' +
    patk +
    ' P.Atk (лук), +' +
    SNIPE_CRIT_RATE_PCT +
    '% крит, +' +
    SNIPE_ACCURACY_FLAT +
    ' Accuracy на ' +
    SNIPE_BUFF_DURATION_SEC / 60 +
    ' хв; без руху (р. ' +
    lv +
    reqPart +
    mpPart +
    ', каст ' +
    SNIPE_CAST_SEC +
    ' с, відкат ' +
    SNIPE_COOLDOWN_SEC +
    ' с).'
  );
}

export function snipeSkillLineUk(rank: number): string {
  const patk = snipePatkFlatAtRank(rank);
  return (
    'Точний постріл (Snipe): +' +
    patk +
    ' P.Atk, +' +
    SNIPE_CRIT_RATE_PCT +
    '% крит, +' +
    SNIPE_ACCURACY_FLAT +
    ' Accuracy на ' +
    SNIPE_BUFF_DURATION_SEC / 60 +
    ' хв (без руху).'
  );
}
