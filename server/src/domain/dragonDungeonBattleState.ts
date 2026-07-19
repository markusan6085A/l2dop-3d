/** Стан особистої спроби бою з клановим драконом (JSON у contribution). */
export type DragonDungeonBattleState = {
  playerHp: number;
  playerMaxHp: number;
  playerMp: number;
  playerMaxMp: number;
  stunUntilMs: number | null;
  lastDragonAttackAtMs: number;
  lastDragonSpecialAtMs: number;
  log: string[];
};

const MAX_LOG = 24;

export function emptyDragonBattleState(
  playerHp: number,
  playerMaxHp: number,
  playerMp: number,
  playerMaxMp: number,
  nowMs: number
): DragonDungeonBattleState {
  return {
    playerHp,
    playerMaxHp,
    playerMp,
    playerMaxMp,
    stunUntilMs: null,
    lastDragonAttackAtMs: nowMs,
    lastDragonSpecialAtMs: nowMs,
    log: [],
  };
}

export function parseDragonBattleState(raw: unknown): DragonDungeonBattleState | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const playerHp = Number(o.playerHp);
  const playerMaxHp = Number(o.playerMaxHp);
  const playerMp = Number(o.playerMp);
  const playerMaxMp = Number(o.playerMaxMp);
  if (
    !Number.isFinite(playerHp) ||
    !Number.isFinite(playerMaxHp) ||
    !Number.isFinite(playerMp) ||
    !Number.isFinite(playerMaxMp)
  ) {
    return null;
  }
  const stunRaw = o.stunUntilMs;
  const stunUntilMs =
    stunRaw == null
      ? null
      : Number.isFinite(Number(stunRaw))
        ? Math.floor(Number(stunRaw))
        : null;
  const log = Array.isArray(o.log)
    ? o.log.map((x) => String(x)).slice(-MAX_LOG)
    : [];
  return {
    playerHp: Math.max(0, Math.floor(playerHp)),
    playerMaxHp: Math.max(1, Math.floor(playerMaxHp)),
    playerMp: Math.max(0, Math.floor(playerMp)),
    playerMaxMp: Math.max(0, Math.floor(playerMaxMp)),
    stunUntilMs,
    lastDragonAttackAtMs: Math.max(0, Math.floor(Number(o.lastDragonAttackAtMs) || 0)),
    lastDragonSpecialAtMs: Math.max(0, Math.floor(Number(o.lastDragonSpecialAtMs) || 0)),
    log,
  };
}

export function appendDragonBattleLog(
  st: DragonDungeonBattleState,
  line: string
): DragonDungeonBattleState {
  const log = [...st.log, line].slice(-MAX_LOG);
  return { ...st, log };
}

export function isDragonBattleStunned(st: DragonDungeonBattleState, nowMs: number): boolean {
  return st.stunUntilMs != null && nowMs < st.stunUntilMs;
}
