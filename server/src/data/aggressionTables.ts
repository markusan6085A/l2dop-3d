/**
 * Aggression (skill 28 — Human Knight).
 * Провокує одного ворога: сила power = агро, без урону. Каст 1 с, відкат 3 с.
 */
export const AGGRESSION_KNIGHT_L2_SKILL_ID = 28;
export const AGGRESSION_KNIGHT_BATTLE_ID = 'l2_28';
export const AGGRESSION_MAX_RANK = 49;export const AGGRESSION_COOLDOWN_SEC = 3;
export const AGGRESSION_CAST_SEC = 1;

export const AGGRESSION_LEVEL_ROWS = [
  { level: 1, requiredLevel: 24, spCost: 3_300, mpCost: 20, aggroPower: 655 },
  { level: 2, requiredLevel: 24, spCost: 3_300, mpCost: 21, aggroPower: 679 },
  { level: 3, requiredLevel: 24, spCost: 3_300, mpCost: 22, aggroPower: 703 },
  { level: 4, requiredLevel: 28, spCost: 4_000, mpCost: 23, aggroPower: 752 },
  { level: 5, requiredLevel: 28, spCost: 4_000, mpCost: 24, aggroPower: 777 },
  { level: 6, requiredLevel: 28, spCost: 4_000, mpCost: 25, aggroPower: 803 },
  { level: 7, requiredLevel: 32, spCost: 8_300, mpCost: 26, aggroPower: 855 },
  { level: 8, requiredLevel: 32, spCost: 8_300, mpCost: 27, aggroPower: 882 },
  { level: 9, requiredLevel: 32, spCost: 8_300, mpCost: 28, aggroPower: 909 },
  { level: 10, requiredLevel: 36, spCost: 13_000, mpCost: 29, aggroPower: 965 },
  { level: 11, requiredLevel: 36, spCost: 13_000, mpCost: 30, aggroPower: 993 },
  { level: 12, requiredLevel: 36, spCost: 13_000, mpCost: 31, aggroPower: 1_021 },
  { level: 13, requiredLevel: 40, spCost: 14_000, mpCost: 33, aggroPower: 1_078 },
  { level: 14, requiredLevel: 40, spCost: 14_000, mpCost: 34, aggroPower: 1_107 },
  { level: 15, requiredLevel: 40, spCost: 14_000, mpCost: 35, aggroPower: 1_136 },
  { level: 16, requiredLevel: 43, spCost: 15_000, mpCost: 36, aggroPower: 1_166 },
  { level: 17, requiredLevel: 43, spCost: 15_000, mpCost: 37, aggroPower: 1_195 },
  { level: 18, requiredLevel: 43, spCost: 15_000, mpCost: 38, aggroPower: 1_224 },
  { level: 19, requiredLevel: 46, spCost: 15_000, mpCost: 39, aggroPower: 1_254 },
  { level: 20, requiredLevel: 46, spCost: 15_000, mpCost: 40, aggroPower: 1_283 },
  { level: 21, requiredLevel: 46, spCost: 15_000, mpCost: 41, aggroPower: 1_312 },
  { level: 22, requiredLevel: 49, spCost: 23_000, mpCost: 42, aggroPower: 1_342 },
  { level: 23, requiredLevel: 49, spCost: 23_000, mpCost: 43, aggroPower: 1_371 },
  { level: 24, requiredLevel: 49, spCost: 23_000, mpCost: 44, aggroPower: 1_400 },
  { level: 25, requiredLevel: 52, spCost: 38_000, mpCost: 45, aggroPower: 1_492 },
  { level: 26, requiredLevel: 52, spCost: 38_000, mpCost: 46, aggroPower: 1_457 },
  { level: 27, requiredLevel: 52, spCost: 38_000, mpCost: 47, aggroPower: 1_485 },
  { level: 28, requiredLevel: 55, spCost: 56_000, mpCost: 48, aggroPower: 1_513 },
  { level: 29, requiredLevel: 55, spCost: 56_000, mpCost: 49, aggroPower: 1_541 },
  { level: 30, requiredLevel: 55, spCost: 56_000, mpCost: 50, aggroPower: 1_568 },
  { level: 31, requiredLevel: 58, spCost: 57_000, mpCost: 51, aggroPower: 1_595 },
  { level: 32, requiredLevel: 58, spCost: 57_000, mpCost: 52, aggroPower: 1_621 },
  { level: 33, requiredLevel: 58, spCost: 57_000, mpCost: 53, aggroPower: 1_647 },
  { level: 34, requiredLevel: 60, spCost: 130_000, mpCost: 54, aggroPower: 1_672 },
  { level: 35, requiredLevel: 60, spCost: 130_000, mpCost: 55, aggroPower: 1_697 },
  { level: 36, requiredLevel: 62, spCost: 150_000, mpCost: 57, aggroPower: 1_721 },
  { level: 37, requiredLevel: 62, spCost: 150_000, mpCost: 58, aggroPower: 1_745 },
  { level: 38, requiredLevel: 64, spCost: 180_000, mpCost: 58, aggroPower: 1_768 },
  { level: 39, requiredLevel: 64, spCost: 180_000, mpCost: 59, aggroPower: 1_790 },
  { level: 40, requiredLevel: 66, spCost: 270_000, mpCost: 60, aggroPower: 1_811 },
  { level: 41, requiredLevel: 66, spCost: 270_000, mpCost: 61, aggroPower: 1_831 },
  { level: 42, requiredLevel: 68, spCost: 320_000, mpCost: 62, aggroPower: 1_851 },
  { level: 43, requiredLevel: 68, spCost: 320_000, mpCost: 63, aggroPower: 1_870 },
  { level: 44, requiredLevel: 70, spCost: 330_000, mpCost: 64, aggroPower: 1_888 },
  { level: 45, requiredLevel: 70, spCost: 330_000, mpCost: 65, aggroPower: 1_905 },
  { level: 46, requiredLevel: 72, spCost: 570_000, mpCost: 66, aggroPower: 1_921 },
  { level: 47, requiredLevel: 72, spCost: 570_000, mpCost: 67, aggroPower: 1_936 },
  { level: 48, requiredLevel: 74, spCost: 880_000, mpCost: 67, aggroPower: 1_950 },
  { level: 49, requiredLevel: 74, spCost: 880_000, mpCost: 68, aggroPower: 1_963 },
] as const;

export const AGGRESSION_HINT_UK =
  'Провокує одного ворога: створює загрозу (power = сила агро), змушує ціль бити вас. ' +
  'Урону не завдає. На РБ перемикає автоатаку на вас. Каст 1 с, відкат 3 с. ' +
  '1 р. — 24 лв (Knight); до 49 р. — 74 лв. Потрібен щит.';
export function aggressionAggroPowerAtRank(rank: number): number {
  const r = Math.max(1, Math.min(AGGRESSION_MAX_RANK, Math.floor(rank)));
  return AGGRESSION_LEVEL_ROWS[r - 1]?.aggroPower ?? 0;
}

export function aggressionMpAtRank(rank: number): number | null {
  const r = Math.max(1, Math.min(AGGRESSION_MAX_RANK, Math.floor(rank)));
  const mp = AGGRESSION_LEVEL_ROWS[r - 1]?.mpCost;
  return typeof mp === 'number' && mp >= 0 ? mp : null;
}

export function aggressionRequiredLevelAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  return AGGRESSION_LEVEL_ROWS[r - 1]?.requiredLevel;
}

export function aggressionSpCostAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  const sp = AGGRESSION_LEVEL_ROWS[r - 1]?.spCost;
  return typeof sp === 'number' && sp >= 0 ? sp : undefined;
}

export function aggressionStatsNoteUk(rank: number): string {
  const r = Math.max(1, Math.min(AGGRESSION_MAX_RANK, Math.floor(rank)));
  const power = aggressionAggroPowerAtRank(r);
  const mp = aggressionMpAtRank(r);
  const reqLv = AGGRESSION_LEVEL_ROWS[r - 1]?.requiredLevel;
  const reqPart =
    typeof reqLv === 'number' && reqLv >= 1 ? ` (макс. на ${reqLv} лв)` : '';
  return (
    'Загроза ' +
    power +
    ' (power агро, не урон) на р. ' +
    r +
    reqPart +
    ', MP ' +
    (mp ?? '?') +
    ', каст ' +
    AGGRESSION_CAST_SEC +
    ' с, відкат ' +
    AGGRESSION_COOLDOWN_SEC +
    ' с. На РБ перемикає ціль на вас.'
  );
}

export function aggressionSkillLineUk(rank: number): string {
  const power = aggressionAggroPowerAtRank(rank);
  return (
    'Агресія (Aggression): загроза ' +
    power +
    ' — ворог переключається на вас. Урону немає.'
  );
}