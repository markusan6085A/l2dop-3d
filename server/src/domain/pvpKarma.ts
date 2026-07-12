/** Фіолетовий нік агресора після удару в PvP. */
export const PVP_AGGRESSOR_MARK_MS = 10_000;

/** Карма за вбивство гравця, який не дав відсічі. */
export const PVP_KILL_KARMA_GAIN = 100;

/** Змивання карми за одного моба. */
export const MOB_KILL_KARMA_WASH = 15;

export type PvpNickColor = 'default' | 'aggressor' | 'pk';

export function resolvePvpNickColor(
  karma: number,
  pvpAggressorUntilMs: bigint | number,
  nowMs: number = Date.now()
): PvpNickColor {
  if (Math.max(0, Math.floor(karma)) > 0) return 'pk';
  const until = Number(pvpAggressorUntilMs);
  if (Number.isFinite(until) && until > nowMs) return 'aggressor';
  return 'default';
}

export function nextPvpAggressorUntilMs(nowMs: number = Date.now()): bigint {
  return BigInt(nowMs + PVP_AGGRESSOR_MARK_MS);
}

const NICK_HEX: Record<PvpNickColor, string> = {
  default: '#bfa88a',
  aggressor: '#a060d8',
  pk: '#e85840',
};

export function pvpNickColorToHex(color: PvpNickColor): string {
  return NICK_HEX[color] ?? NICK_HEX.default;
}

export function nickColorFromKarmaRow(
  karma: number,
  pvpAggressorUntilMs: bigint | number,
  nowMs: number = Date.now()
): string {
  return pvpNickColorToHex(resolvePvpNickColor(karma, pvpAggressorUntilMs, nowMs));
}
