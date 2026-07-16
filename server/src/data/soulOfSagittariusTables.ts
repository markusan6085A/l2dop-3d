/**
 * Soul of Sagittarius (skill 303) — Human Hawkeye → Sagittarius.
 * Селф-баф: +Max MP на 20 хв; MP не витрачає, при касті — HP.
 */
import { L2DOP_SOULOFSAG, l2dopTableAt } from './l2dopRawdataBuffTables.js';

export const SOUL_OF_SAGITTARIUS_L2_SKILL_ID = 303;
export const SOUL_OF_SAGITTARIUS_BATTLE_ID = 'l2_303';
export const SOUL_OF_SAGITTARIUS_MAX_RANK = 4;
export const SOUL_OF_SAGITTARIUS_COOLDOWN_SEC = 6;
export const SOUL_OF_SAGITTARIUS_CAST_SEC = 4;
export const SOUL_OF_SAGITTARIUS_BUFF_DURATION_SEC = 1200;

export const SOUL_OF_SAGITTARIUS_LEVEL_ROWS = [
  { level: 1, requiredLevel: 46, spCost: 67_000, maxMpPct: 10, hpCost: 185 },
  { level: 2, requiredLevel: 58, spCost: 270_000, maxMpPct: 15, hpCost: 271 },
  { level: 3, requiredLevel: 64, spCost: 540_000, maxMpPct: 20, hpCost: 316 },
  { level: 4, requiredLevel: 70, spCost: 1_200_000, maxMpPct: 25, hpCost: 364 },
] as const;

export const SOUL_OF_SAGITTARIUS_HINT_UK =
  'Активний селф-баф на ' +
  SOUL_OF_SAGITTARIUS_BUFF_DURATION_SEC / 60 +
  ' хв: +Max MP; MP не витрачає, при касті — HP. ' +
  'Hawkeye; 1 р. — 46 лв (+10%, HP 185); 2 р. — 58 лв (+15%, HP 271); ' +
  '3 р. — 64 лв (+20%, HP 316); 4 р. — 70 лв (+25%, HP 364). ' +
  'Каст ' +
  SOUL_OF_SAGITTARIUS_CAST_SEC +
  ' с, відкат ' +
  SOUL_OF_SAGITTARIUS_COOLDOWN_SEC +
  ' с.';

export function soulOfSagittariusMaxMpPctAtRank(rank: number): number {
  const r = Math.max(1, Math.min(SOUL_OF_SAGITTARIUS_MAX_RANK, Math.floor(rank)));
  const row = SOUL_OF_SAGITTARIUS_LEVEL_ROWS[r - 1];
  if (row) return row.maxMpPct;
  const mul = l2dopTableAt(L2DOP_SOULOFSAG, r);
  return Math.round((mul - 1) * 100);
}

export function soulOfSagittariusHpCostAtRank(rank: number): number {
  const r = Math.max(1, Math.min(SOUL_OF_SAGITTARIUS_MAX_RANK, Math.floor(rank)));
  return SOUL_OF_SAGITTARIUS_LEVEL_ROWS[r - 1]?.hpCost ?? 0;
}

export function soulOfSagittariusRequiredLevelAtRank(
  rank: number
): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  return SOUL_OF_SAGITTARIUS_LEVEL_ROWS[r - 1]?.requiredLevel;
}

export function soulOfSagittariusSpCostAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  const sp = SOUL_OF_SAGITTARIUS_LEVEL_ROWS[r - 1]?.spCost;
  return typeof sp === 'number' && sp >= 0 ? sp : undefined;
}

export function soulOfSagittariusStatsNoteUk(rank: number): string {
  const lv = Math.max(1, Math.min(SOUL_OF_SAGITTARIUS_MAX_RANK, Math.floor(rank)));
  const pct = soulOfSagittariusMaxMpPctAtRank(lv);
  const hp = soulOfSagittariusHpCostAtRank(lv);
  const reqLv = SOUL_OF_SAGITTARIUS_LEVEL_ROWS[lv - 1]?.requiredLevel;
  const reqPart =
    typeof reqLv === 'number' && reqLv >= 1 ? ` (Hawkeye, ${reqLv} лв)` : '';
  return (
    '+' +
    pct +
    '% Max MP на ' +
    SOUL_OF_SAGITTARIUS_BUFF_DURATION_SEC / 60 +
    ' хв (р. ' +
    lv +
    reqPart +
    ', HP ' +
    hp +
    ', каст ' +
    SOUL_OF_SAGITTARIUS_CAST_SEC +
    ' с, відкат ' +
    SOUL_OF_SAGITTARIUS_COOLDOWN_SEC +
    ' с).'
  );
}

export function soulOfSagittariusSkillLineUk(rank: number): string {
  const pct = soulOfSagittariusMaxMpPctAtRank(rank);
  return (
    'Дух Стрільця (Soul of Sagittarius): +' +
    pct +
    '% Max MP на ' +
    SOUL_OF_SAGITTARIUS_BUFF_DURATION_SEC / 60 +
    ' хв.'
  );
}
