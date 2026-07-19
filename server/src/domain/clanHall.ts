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
  bonusTable: ClanHallBuffRow[];
};

/** Бонуси благословення Клан-холу за рівнем клану (1–8). */
export function clanHallBuffForLevel(rawLevel: number): ClanHallBuffRow {
  const level = Math.max(1, Math.min(CLAN_HALL_MAX_LEVEL, Math.trunc(rawLevel)));
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

export function isClanHallLevelActive(
  rowLevel: number,
  clanLevel: number
): boolean {
  return rowLevel >= 1 && rowLevel <= Math.trunc(clanLevel);
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
  return {
    hasBlessing,
    canBuy,
    costAdena: CLAN_HALL_BLESSING_COST_ADENA.toString(),
    clanLevel: normalized,
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
