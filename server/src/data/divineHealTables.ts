/**
 * Divine Heal (skill 45) — Human Knight.
 * Селф-лікування: power = відновлені HP, без урону по цілі.
 */
export const DIVINE_HEAL_L2_SKILL_ID = 45;
export const DIVINE_HEAL_BATTLE_ID = 'l2_45';
export const DIVINE_HEAL_MAX_RANK = 9;
export const DIVINE_HEAL_COOLDOWN_SEC = 10;
export const DIVINE_HEAL_CAST_SEC = 4;

export const DIVINE_HEAL_LEVEL_ROWS = [
  { level: 1, requiredLevel: 28, spCost: 4_000, mpCost: 75, healPower: 143 },
  { level: 2, requiredLevel: 28, spCost: 4_000, mpCost: 79, healPower: 150 },
  { level: 3, requiredLevel: 28, spCost: 4_000, mpCost: 83, healPower: 157 },
  { level: 4, requiredLevel: 32, spCost: 8_300, mpCost: 88, healPower: 171 },
  { level: 5, requiredLevel: 32, spCost: 8_300, mpCost: 88, healPower: 179 },
  { level: 6, requiredLevel: 32, spCost: 8_300, mpCost: 92, healPower: 187 },
  { level: 7, requiredLevel: 36, spCost: 13_000, mpCost: 99, healPower: 203 },
  { level: 8, requiredLevel: 36, spCost: 13_000, mpCost: 103, healPower: 211 },
  { level: 9, requiredLevel: 36, spCost: 13_000, mpCost: 107, healPower: 219 },
] as const;

export const DIVINE_HEAL_HINT_UK =
  'Активне зцілення: лише на себе, відновлює HP (power = кількість HP). ' +
  '9 р. — 28–36 лв (Human Knight). Каст 4 с, відкат 10 с. Урону не завдає.';

export function divineHealPowerAtRank(rank: number): number {
  const r = Math.max(1, Math.min(DIVINE_HEAL_MAX_RANK, Math.floor(rank)));
  return DIVINE_HEAL_LEVEL_ROWS[r - 1]?.healPower ?? 0;
}

export function divineHealMpAtRank(rank: number): number | null {
  const r = Math.max(1, Math.min(DIVINE_HEAL_MAX_RANK, Math.floor(rank)));
  const mp = DIVINE_HEAL_LEVEL_ROWS[r - 1]?.mpCost;
  return typeof mp === 'number' && mp >= 0 ? mp : null;
}

export function divineHealRequiredLevelAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  return DIVINE_HEAL_LEVEL_ROWS[r - 1]?.requiredLevel;
}

export function divineHealSpCostAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  const sp = DIVINE_HEAL_LEVEL_ROWS[r - 1]?.spCost;
  return typeof sp === 'number' && sp >= 0 ? sp : undefined;
}

export function divineHealStatsNoteUk(rank: number): string {
  const r = Math.max(1, Math.min(DIVINE_HEAL_MAX_RANK, Math.floor(rank)));
  const power = divineHealPowerAtRank(r);
  const mp = divineHealMpAtRank(r);
  const reqLv = DIVINE_HEAL_LEVEL_ROWS[r - 1]?.requiredLevel;
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
    DIVINE_HEAL_CAST_SEC +
    ' с, відкат ' +
    DIVINE_HEAL_COOLDOWN_SEC +
    ' с. Лише на себе.'
  );
}

export function divineHealSkillLineUk(rank: number): string {
  const power = divineHealPowerAtRank(rank);
  return (
    'Божественне зцілення (Divine Heal): +' + power + ' HP (селф).'
  );
}
