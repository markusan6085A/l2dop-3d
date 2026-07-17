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
  buff: ClanHallBuffRow | null;
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

export function buildClanHallView(
  hasBlessing: boolean,
  canBuy: boolean,
  clanLevel: number
): ClanHallView {
  return {
    hasBlessing,
    canBuy,
    costAdena: CLAN_HALL_BLESSING_COST_ADENA.toString(),
    clanLevel,
    buff: hasBlessing ? clanHallBuffForLevel(clanLevel) : null,
  };
}
