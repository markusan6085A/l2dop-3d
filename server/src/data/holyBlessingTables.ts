/**
 * Holy Blessing (skill 262) — Human Paladin → Phoenix Knight.
 * Зцілення себе або союзника (до 600); power = відновлені HP.
 */
export const HOLY_BLESSING_L2_SKILL_ID = 262;
export const HOLY_BLESSING_BATTLE_ID = 'l2_262';
export const HOLY_BLESSING_MAX_RANK = 37;
export const HOLY_BLESSING_COOLDOWN_SEC = 10;
export const HOLY_BLESSING_CAST_SEC = 5;
export const HOLY_BLESSING_RANGE = 600;

export const HOLY_BLESSING_LEVEL_ROWS = [
  { level: 1, requiredLevel: 40, spCost: 12_000, mpCost: 115, healPower: 236 },
  { level: 2, requiredLevel: 40, spCost: 12_000, mpCost: 119, healPower: 245 },
  { level: 3, requiredLevel: 40, spCost: 12_000, mpCost: 122, healPower: 254 },
  { level: 4, requiredLevel: 43, spCost: 14_000, mpCost: 122, healPower: 262 },
  { level: 5, requiredLevel: 43, spCost: 14_000, mpCost: 127, healPower: 271 },
  { level: 6, requiredLevel: 43, spCost: 14_000, mpCost: 130, healPower: 281 },
  { level: 7, requiredLevel: 46, spCost: 18_000, mpCost: 134, healPower: 290 },
  { level: 8, requiredLevel: 46, spCost: 18_000, mpCost: 139, healPower: 299 },
  { level: 9, requiredLevel: 46, spCost: 18_000, mpCost: 143, healPower: 308 },
  { level: 10, requiredLevel: 49, spCost: 27_000, mpCost: 148, healPower: 318 },
  { level: 11, requiredLevel: 49, spCost: 27_000, mpCost: 152, healPower: 327 },
  { level: 12, requiredLevel: 49, spCost: 27_000, mpCost: 157, healPower: 337 },
  { level: 13, requiredLevel: 52, spCost: 42_000, mpCost: 159, healPower: 346 },
  { level: 14, requiredLevel: 52, spCost: 42_000, mpCost: 159, healPower: 356 },
  { level: 15, requiredLevel: 52, spCost: 42_000, mpCost: 164, healPower: 365 },
  { level: 16, requiredLevel: 55, spCost: 49_000, mpCost: 168, healPower: 375 },
  { level: 17, requiredLevel: 55, spCost: 49_000, mpCost: 173, healPower: 384 },
  { level: 18, requiredLevel: 55, spCost: 49_000, mpCost: 177, healPower: 393 },
  { level: 19, requiredLevel: 58, spCost: 67_000, mpCost: 180, healPower: 403 },
  { level: 20, requiredLevel: 58, spCost: 67_000, mpCost: 185, healPower: 412 },
  { level: 21, requiredLevel: 58, spCost: 67_000, mpCost: 189, healPower: 421 },
  { level: 22, requiredLevel: 60, spCost: 130_000, mpCost: 193, healPower: 430 },
  { level: 23, requiredLevel: 60, spCost: 130_000, mpCost: 195, healPower: 439 },
  { level: 24, requiredLevel: 62, spCost: 170_000, mpCost: 195, healPower: 448 },
  { level: 25, requiredLevel: 62, spCost: 170_000, mpCost: 199, healPower: 457 },
  { level: 26, requiredLevel: 64, spCost: 190_000, mpCost: 203, healPower: 466 },
  { level: 27, requiredLevel: 64, spCost: 190_000, mpCost: 207, healPower: 474 },
  { level: 28, requiredLevel: 66, spCost: 290_000, mpCost: 210, healPower: 482 },
  { level: 29, requiredLevel: 66, spCost: 290_000, mpCost: 214, healPower: 490 },
  { level: 30, requiredLevel: 68, spCost: 330_000, mpCost: 218, healPower: 498 },
  { level: 31, requiredLevel: 68, spCost: 330_000, mpCost: 222, healPower: 506 },
  { level: 32, requiredLevel: 70, spCost: 390_000, mpCost: 224, healPower: 513 },
  { level: 33, requiredLevel: 70, spCost: 390_000, mpCost: 228, healPower: 520 },
  { level: 34, requiredLevel: 72, spCost: 580_000, mpCost: 230, healPower: 527 },
  { level: 35, requiredLevel: 72, spCost: 580_000, mpCost: 233, healPower: 534 },
  { level: 36, requiredLevel: 74, spCost: 960_000, mpCost: 237, healPower: 540 },
  { level: 37, requiredLevel: 74, spCost: 960_000, mpCost: 239, healPower: 546 },
] as const;

export const HOLY_BLESSING_HINT_UK =
  'Активне зцілення: себе або союзника на дистанції до 600. ' +
  'Power = відновлені HP (не урон). 37 р. — 40–74 лв (Paladin / Phoenix Knight). ' +
  'Каст 5 с, відкат 10 с.';

export function holyBlessingPowerAtRank(rank: number): number {
  const r = Math.max(1, Math.min(HOLY_BLESSING_MAX_RANK, Math.floor(rank)));
  return HOLY_BLESSING_LEVEL_ROWS[r - 1]?.healPower ?? 0;
}

export function holyBlessingMpAtRank(rank: number): number | null {
  const r = Math.max(1, Math.min(HOLY_BLESSING_MAX_RANK, Math.floor(rank)));
  const mp = HOLY_BLESSING_LEVEL_ROWS[r - 1]?.mpCost;
  return typeof mp === 'number' && mp >= 0 ? mp : null;
}

export function holyBlessingRequiredLevelAtRank(
  rank: number
): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  return HOLY_BLESSING_LEVEL_ROWS[r - 1]?.requiredLevel;
}

export function holyBlessingSpCostAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  const sp = HOLY_BLESSING_LEVEL_ROWS[r - 1]?.spCost;
  return typeof sp === 'number' && sp >= 0 ? sp : undefined;
}

export function holyBlessingStatsNoteUk(rank: number): string {
  const r = Math.max(1, Math.min(HOLY_BLESSING_MAX_RANK, Math.floor(rank)));
  const power = holyBlessingPowerAtRank(r);
  const mp = holyBlessingMpAtRank(r);
  const reqLv = HOLY_BLESSING_LEVEL_ROWS[r - 1]?.requiredLevel;
  const reqPart =
    typeof reqLv === 'number' && reqLv >= 1 ? ` (макс. на ${reqLv} лв)` : '';
  return (
    'Зцілення ' +
    power +
    ' HP на р. ' +
    r +
    reqPart +
    ', MP ' +
    (mp ?? '?') +
    ', каст ' +
    HOLY_BLESSING_CAST_SEC +
    ' с, відкат ' +
    HOLY_BLESSING_COOLDOWN_SEC +
    ' с. Себе або союзник (600).'
  );
}

export function holyBlessingSkillLineUk(rank: number): string {
  const power = holyBlessingPowerAtRank(rank);
  return (
    'Святе благословення (262, Holy Blessing): +' + power + ' HP.'
  );
}
