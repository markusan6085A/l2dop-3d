/**
 * Sacrifice (skill 69) — Human Paladin → Phoenix Knight.
 * Витрачає власне HP, зцілює себе або союзника (до 600); power = відновлені HP.
 */
export const SACRIFICE_L2_SKILL_ID = 69;
export const SACRIFICE_BATTLE_ID = 'l2_69';
export const SACRIFICE_MAX_RANK = 25;
export const SACRIFICE_COOLDOWN_SEC = 8;
export const SACRIFICE_CAST_SEC = 1.5;
export const SACRIFICE_RANGE = 600;

export const SACRIFICE_LEVEL_ROWS = [
  { level: 1, requiredLevel: 52, spCost: 42_000, healPower: 741, hpCost: 988 },
  { level: 2, requiredLevel: 52, spCost: 42_000, healPower: 762, hpCost: 1015 },
  { level: 3, requiredLevel: 52, spCost: 42_000, healPower: 782, hpCost: 1042 },
  { level: 4, requiredLevel: 55, spCost: 49_000, healPower: 802, hpCost: 1069 },
  { level: 5, requiredLevel: 55, spCost: 49_000, healPower: 822, hpCost: 1096 },
  { level: 6, requiredLevel: 55, spCost: 49_000, healPower: 843, hpCost: 1123 },
  { level: 7, requiredLevel: 58, spCost: 67_000, healPower: 863, hpCost: 1150 },
  { level: 8, requiredLevel: 58, spCost: 67_000, healPower: 882, hpCost: 1176 },
  { level: 9, requiredLevel: 58, spCost: 67_000, healPower: 902, hpCost: 1203 },
  { level: 10, requiredLevel: 60, spCost: 130_000, healPower: 922, hpCost: 1229 },
  { level: 11, requiredLevel: 60, spCost: 130_000, healPower: 941, hpCost: 1254 },
  { level: 12, requiredLevel: 62, spCost: 170_000, healPower: 960, hpCost: 1280 },
  { level: 13, requiredLevel: 62, spCost: 170_000, healPower: 979, hpCost: 1305 },
  { level: 14, requiredLevel: 64, spCost: 190_000, healPower: 997, hpCost: 1329 },
  { level: 15, requiredLevel: 64, spCost: 190_000, healPower: 1015, hpCost: 1353 },
  { level: 16, requiredLevel: 66, spCost: 290_000, healPower: 1033, hpCost: 1377 },
  { level: 17, requiredLevel: 66, spCost: 290_000, healPower: 1050, hpCost: 1400 },
  { level: 18, requiredLevel: 68, spCost: 330_000, healPower: 1067, hpCost: 1422 },
  { level: 19, requiredLevel: 68, spCost: 330_000, healPower: 1083, hpCost: 1444 },
  { level: 20, requiredLevel: 70, spCost: 390_000, healPower: 1099, hpCost: 1465 },
  { level: 21, requiredLevel: 70, spCost: 390_000, healPower: 1115, hpCost: 1486 },
  { level: 22, requiredLevel: 72, spCost: 580_000, healPower: 1129, hpCost: 1506 },
  { level: 23, requiredLevel: 72, spCost: 580_000, healPower: 1144, hpCost: 1525 },
  { level: 24, requiredLevel: 74, spCost: 960_000, healPower: 1157, hpCost: 1543 },
  { level: 25, requiredLevel: 74, spCost: 960_000, healPower: 1170, hpCost: 1560 },
] as const;

export const SACRIFICE_HINT_UK =
  'Активне зцілення за власне HP: себе або союзника на дистанції до 600. ' +
  'Power = відновлені HP; MP не витрачає. 25 р. — 52–74 лв (Paladin / Phoenix Knight). ' +
  'Каст 1,5 с, відкат 8 с.';

export function sacrificePowerAtRank(rank: number): number {
  const r = Math.max(1, Math.min(SACRIFICE_MAX_RANK, Math.floor(rank)));
  return SACRIFICE_LEVEL_ROWS[r - 1]?.healPower ?? 0;
}

export function sacrificeHpCostAtRank(rank: number): number {
  const r = Math.max(1, Math.min(SACRIFICE_MAX_RANK, Math.floor(rank)));
  return SACRIFICE_LEVEL_ROWS[r - 1]?.hpCost ?? 0;
}

export function sacrificeRequiredLevelAtRank(
  rank: number
): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  return SACRIFICE_LEVEL_ROWS[r - 1]?.requiredLevel;
}

export function sacrificeSpCostAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  const sp = SACRIFICE_LEVEL_ROWS[r - 1]?.spCost;
  return typeof sp === 'number' && sp >= 0 ? sp : undefined;
}

export function sacrificeStatsNoteUk(rank: number): string {
  const r = Math.max(1, Math.min(SACRIFICE_MAX_RANK, Math.floor(rank)));
  const power = sacrificePowerAtRank(r);
  const hpCost = sacrificeHpCostAtRank(r);
  const reqLv = SACRIFICE_LEVEL_ROWS[r - 1]?.requiredLevel;
  const reqPart =
    typeof reqLv === 'number' && reqLv >= 1 ? ` (макс. на ${reqLv} лв)` : '';
  return (
    'Зцілення ' +
    power +
    ' HP, витрата ' +
    hpCost +
    ' HP на р. ' +
    r +
    reqPart +
    ', MP 0, каст ' +
    SACRIFICE_CAST_SEC +
    ' с, відкат ' +
    SACRIFICE_COOLDOWN_SEC +
    ' с. Себе або союзник (600).'
  );
}

export function sacrificeSkillLineUk(rank: number): string {
  const power = sacrificePowerAtRank(rank);
  const hpCost = sacrificeHpCostAtRank(rank);
  return (
    'Жертва (69, Sacrifice): +' +
    power +
    ' HP, −' +
    hpCost +
    ' HP.'
  );
}
