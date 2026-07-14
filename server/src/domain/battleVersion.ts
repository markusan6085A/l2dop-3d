import { MAX_BATTLE_LOG, type BattleJsonState } from './battleTypes.js';

export function battleVersionFromState(
  st: BattleJsonState | null | undefined
): number {
  const v = st?.battleVersion;
  return typeof v === 'number' && Number.isFinite(v) && v >= 0
    ? Math.floor(v)
    : 0;
}

/** Інкремент `battleVersion` у тій самій транзакції, де змінюється battle state. */
export function bumpBattleVersionInPlace(st: BattleJsonState): number {
  const next = battleVersionFromState(st) + 1;
  st.battleVersion = next;
  return next;
}

/** Монотонний лічильник рядків логу (не через array.length після обрізання). */
export function battleLogSeqFromState(
  st: BattleJsonState | null | undefined
): number {
  const v = st?.lastLogSeq;
  if (typeof v === 'number' && Number.isFinite(v) && v >= 0) {
    return Math.floor(v);
  }
  return 0;
}

/** Чи є нові дані для легкого poll (версія або seq строго більші за клієнтські). */
export function battleSyncHasChanges(args: {
  clientBattleVersion?: number;
  clientLastLogSeq?: number;
  serverBattleVersion: number;
  serverLogSeq: number;
}): boolean {
  const clientBv = args.clientBattleVersion;
  const clientLs = Math.max(0, Math.floor(args.clientLastLogSeq ?? 0));
  const serverBv = Math.max(0, Math.floor(args.serverBattleVersion));
  const serverLs = Math.max(0, Math.floor(args.serverLogSeq));

  if (clientBv == null) {
    return serverBv > 0 || serverLs > clientLs;
  }
  if (serverBv > Math.max(0, Math.floor(clientBv))) return true;
  if (serverLs > clientLs) return true;
  return false;
}

/** Оновити `log` і `lastLogSeq` після додавання рядків у цьому ході. */
export function applyBattleLogWriteInPlace(
  st: BattleJsonState,
  log: string[],
  linesAdded: number
): void {
  const prevSeq = battleLogSeqFromState(st);
  st.log = log.slice(-MAX_BATTLE_LOG);
  if (linesAdded > 0) {
    st.lastLogSeq = prevSeq + linesAdded;
  } else if (st.lastLogSeq == null && st.log.length > 0) {
    st.lastLogSeq = st.log.length;
  }
}

/** Хвіст логу після `afterSeq` (якщо старі рядки вже обрізані — повертаємо весь видимий лог). */
export function battleLogTailAfterSeq(
  st: BattleJsonState,
  afterSeq: number
): { tail: string[]; logSeq: number } {
  const log = st.log ?? [];
  const logSeq = battleLogSeqFromState(st);
  const after = Math.max(0, Math.floor(afterSeq));
  if (after >= logSeq) return { tail: [], logSeq };
  const visibleStart = logSeq - log.length;
  if (after < visibleStart) return { tail: [...log], logSeq };
  const idx = Math.max(0, after - visibleStart);
  return { tail: log.slice(idx), logSeq };
}
