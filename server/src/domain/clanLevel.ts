/** Рівень клану та вартість підвищення (єдине джерело чисел). */
export const CLAN_START_LEVEL = 0;
export const CLAN_MAX_LEVEL = 8;

export const CLAN_LEVEL_UP_COST_BY_TARGET_LEVEL: Readonly<Record<number, number>> =
  {
    1: 6000,
    2: 16000,
    3: 32000,
    4: 56000,
    5: 90000,
    6: 140000,
    7: 200000,
    8: 300000,
  };

export type ClanLevelProgressionRow = {
  fromLevel: number;
  toLevel: number;
  cost: number;
  cumulativeCost: number;
};

export type ClanNextUpgrade = {
  targetLevel: number;
  cost: number;
  currentPoints: number;
  missingPoints: number;
  canUpgrade: boolean;
};

export function isValidClanLevel(raw: number): boolean {
  return (
    Number.isInteger(raw) &&
    raw >= CLAN_START_LEVEL &&
    raw <= CLAN_MAX_LEVEL
  );
}

/** Ціна переходу на targetLevel (1–8). */
export function clanLevelUpCostForTarget(targetLevel: number): number | null {
  if (!Number.isInteger(targetLevel)) return null;
  if (targetLevel < 1 || targetLevel > CLAN_MAX_LEVEL) return null;
  return CLAN_LEVEL_UP_COST_BY_TARGET_LEVEL[targetLevel] ?? null;
}

/** Ціна підвищення з поточного рівня на +1. */
export function clanLevelUpCost(currentLevel: number): number | null {
  if (!isValidClanLevel(currentLevel)) return null;
  if (currentLevel >= CLAN_MAX_LEVEL) return null;
  return clanLevelUpCostForTarget(currentLevel + 1);
}

export function buildClanLevelProgression(): ClanLevelProgressionRow[] {
  const rows: ClanLevelProgressionRow[] = [];
  let cumulative = 0;
  for (let toLevel = 1; toLevel <= CLAN_MAX_LEVEL; toLevel += 1) {
    const cost = clanLevelUpCostForTarget(toLevel);
    if (cost == null) continue;
    cumulative += cost;
    rows.push({
      fromLevel: toLevel - 1,
      toLevel,
      cost,
      cumulativeCost: cumulative,
    });
  }
  return rows;
}

export function buildClanNextUpgrade(
  currentLevel: number,
  clanPoints: number
): ClanNextUpgrade | null {
  if (!isValidClanLevel(currentLevel)) return null;
  const cost = clanLevelUpCost(currentLevel);
  if (cost == null) return null;
  const points = Math.max(0, Math.trunc(clanPoints));
  const missingPoints = Math.max(0, cost - points);
  return {
    targetLevel: currentLevel + 1,
    cost,
    currentPoints: points,
    missingPoints,
    canUpgrade: points >= cost,
  };
}

export const CLAN_LEVEL_TOTAL_COST_TO_MAX =
  buildClanLevelProgression().at(-1)?.cumulativeCost ?? 0;
