/** КланХолл — благословення клану (pure). */
export const CLAN_HALL_BLESSING_COST_ADENA = 1n;

export type ClanHallView = {
  hasBlessing: boolean;
  canBuy: boolean;
  costAdena: string;
};

export function buildClanHallView(
  hasBlessing: boolean,
  canBuy: boolean
): ClanHallView {
  return {
    hasBlessing,
    canBuy,
    costAdena: CLAN_HALL_BLESSING_COST_ADENA.toString(),
  };
}
