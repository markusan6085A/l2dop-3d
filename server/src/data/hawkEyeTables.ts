/**
 * Hawk Eye (skill 131) — Human Hawkeye → Sagittarius.
 * Селф-баф: +Accuracy, −10% P.Def на 5 хв.
 */
import { L2DOP_HAWKEYE, l2dopTableAt } from './l2dopRawdataBuffTables.js';

export const HAWK_EYE_L2_SKILL_ID = 131;
export const HAWK_EYE_BATTLE_ID = 'l2_131';
export const HAWK_EYE_MAX_RANK = 3;
export const HAWK_EYE_COOLDOWN_SEC = 10;
export const HAWK_EYE_CAST_SEC = 1.5;
export const HAWK_EYE_BUFF_DURATION_SEC = 300;
export const HAWK_EYE_PDEF_MUL = 0.9;

export const HAWK_EYE_LEVEL_ROWS = [
  { level: 1, requiredLevel: 40, spCost: 49_000, accuracy: 6, mpCost: 18 },
  { level: 2, requiredLevel: 49, spCost: 120_000, accuracy: 8, mpCost: 22 },
  { level: 3, requiredLevel: 58, spCost: 270_000, accuracy: 10, mpCost: 27 },
] as const;

export const HAWK_EYE_HINT_UK =
  'Активний селф-баф на ' +
  HAWK_EYE_BUFF_DURATION_SEC / 60 +
  ' хв: +Accuracy, −10% P.Def. Урону не завдає. ' +
  'Hawkeye; 1 р. — 40 лв (+6, MP 18); 2 р. — 49 лв (+8, MP 22); 3 р. — 58 лв (+10, MP 27). ' +
  'Каст ' +
  HAWK_EYE_CAST_SEC +
  ' с, відкат ' +
  HAWK_EYE_COOLDOWN_SEC +
  ' с.';

export function hawkEyeAccuracyAtRank(rank: number): number {
  const r = Math.max(1, Math.min(HAWK_EYE_MAX_RANK, Math.floor(rank)));
  return HAWK_EYE_LEVEL_ROWS[r - 1]?.accuracy ?? l2dopTableAt(L2DOP_HAWKEYE, r);
}

export function hawkEyeMpAtRank(rank: number): number | null {
  const r = Math.max(1, Math.min(HAWK_EYE_MAX_RANK, Math.floor(rank)));
  const mp = HAWK_EYE_LEVEL_ROWS[r - 1]?.mpCost;
  return typeof mp === 'number' && mp >= 0 ? mp : null;
}

export function hawkEyeRequiredLevelAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  return HAWK_EYE_LEVEL_ROWS[r - 1]?.requiredLevel;
}

export function hawkEyeSpCostAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  const sp = HAWK_EYE_LEVEL_ROWS[r - 1]?.spCost;
  return typeof sp === 'number' && sp >= 0 ? sp : undefined;
}

export function hawkEyeStatsNoteUk(rank: number): string {
  const lv = Math.max(1, Math.min(HAWK_EYE_MAX_RANK, Math.floor(rank)));
  const acc = hawkEyeAccuracyAtRank(lv);
  const mp = hawkEyeMpAtRank(lv);
  const reqLv = HAWK_EYE_LEVEL_ROWS[lv - 1]?.requiredLevel;
  const reqPart =
    typeof reqLv === 'number' && reqLv >= 1 ? ` (Hawkeye, ${reqLv} лв)` : '';
  const mpPart = mp != null ? ', MP ' + mp : '';
  return (
    '+' +
    acc +
    ' Accuracy, −10% P.Def на ' +
    HAWK_EYE_BUFF_DURATION_SEC / 60 +
    ' хв (р. ' +
    lv +
    reqPart +
    mpPart +
    ', каст ' +
    HAWK_EYE_CAST_SEC +
    ' с, відкат ' +
    HAWK_EYE_COOLDOWN_SEC +
    ' с).'
  );
}

export function hawkEyeSkillLineUk(rank: number): string {
  const acc = hawkEyeAccuracyAtRank(rank);
  return (
    'Око яструба (Hawk Eye): +' +
    acc +
    ' Accuracy, −10% P.Def на ' +
    HAWK_EYE_BUFF_DURATION_SEC / 60 +
    ' хв.'
  );
}
