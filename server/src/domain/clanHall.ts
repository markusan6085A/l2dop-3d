/** КланХолл — благословення клану (pure). */
export const CLAN_HALL_BLESSING_COST_ADENA = 1n;
export const CLAN_HALL_MAX_LEVEL = 8;

export type ClanHallBuffRow = {
  level: number;
  pAtk: number;
  mAtk: number;
  pDef: number;
  mDef: number;
  maxHp: number;
};

export type ClanHallView = {
  hasBlessing: boolean;
  canBuy: boolean;
  costAdena: string;
  clanLevel: number;
  activeBonus: ClanHallBuffRow | null;
  bonusTable: ClanHallBuffRow[];
};

/** Бонуси благословення Клан-холу за рівнем клану (0 = нуль, 1–8 = ×75 / ×300 HP). */
export function clanHallBuffForLevel(rawLevel: number): ClanHallBuffRow {
  const level = Math.max(0, Math.min(CLAN_HALL_MAX_LEVEL, Math.trunc(rawLevel)));
  const stat = level * 75;
  return {
    level,
    pAtk: stat,
    mAtk: stat,
    pDef: stat,
    mDef: stat,
    maxHp: level * 300,
  };
}

/** Повна таблиця бонусів (1–8). */
export function clanHallBonusTable(): ClanHallBuffRow[] {
  const rows: ClanHallBuffRow[] = [];
  for (let lv = 1; lv <= CLAN_HALL_MAX_LEVEL; lv += 1) {
    rows.push(clanHallBuffForLevel(lv));
  }
  return rows;
}

/** Поточний рівень клану в таблиці (лише один активний рядок). */
export function isClanHallLevelCurrent(
  rowLevel: number,
  clanLevel: number,
  hasBlessing: boolean
): boolean {
  const lv = Math.trunc(clanLevel);
  return hasBlessing && lv >= 1 && rowLevel === lv;
}

/** Попередні досягнуті рівні в таблиці. */
export function isClanHallLevelAchieved(
  rowLevel: number,
  clanLevel: number,
  hasBlessing: boolean
): boolean {
  const lv = Math.trunc(clanLevel);
  return hasBlessing && lv >= 1 && rowLevel >= 1 && rowLevel < lv;
}

/** Пасивний бонус поточного рівня клану (лише якщо куплено Клан-хол і level >= 1). */
export function resolveClanHallPassiveBonus(
  clan:
    | {
        hallBlessingAt?: Date | null;
        level?: number;
      }
    | null
    | undefined
): ClanHallBuffRow | null {
  if (!clan?.hallBlessingAt) return null;
  const level = clan.level ?? 0;
  if (level < 1) return null;
  return clanHallBuffForLevel(level);
}

export function buildClanHallView(
  hasBlessing: boolean,
  canBuy: boolean,
  clanLevel: number
): ClanHallView {
  const normalized = Math.max(0, Math.min(CLAN_HALL_MAX_LEVEL, Math.trunc(clanLevel)));
  const activeBonus =
    hasBlessing && normalized >= 1
      ? clanHallBuffForLevel(normalized)
      : null;
  return {
    hasBlessing,
    canBuy,
    costAdena: CLAN_HALL_BLESSING_COST_ADENA.toString(),
    clanLevel: normalized,
    activeBonus,
    bonusTable: clanHallBonusTable(),
  };
}

export function applyClanHallPassiveFlat(
  base: {
    pAtk: number;
    mAtk: number;
    pDef: number;
    mDef: number;
    maxHp: number;
  },
  bonus: ClanHallBuffRow | null
): typeof base {
  if (!bonus) return base;
  return {
    pAtk: base.pAtk + bonus.pAtk,
    mAtk: base.mAtk + bonus.mAtk,
    pDef: base.pDef + bonus.pDef,
    mDef: base.mDef + bonus.mDef,
    maxHp: base.maxHp + bonus.maxHp,
  };
}
