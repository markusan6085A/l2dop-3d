/**
 * Transport tie-break для client snapshot (порядок доставки відповідей).
 * НЕ є версією даних: пізніша відповідь може містити старіший стан при однаковому revision.
 * Довгостроково: revision (persistent), battleVersion (runtime), chatUnreadVersion (chat).
 */

type VersionEntry = {
  version: number;
  lastUsedAt: number;
};

const lastVersions = new Map<string, VersionEntry>();
const VERSION_MAP_MAX = 4096;
const VERSION_MAP_TTL_MS = 6 * 60 * 60 * 1000;
const DEBUG_DELAY_MAX_MS = 5000;

function pruneVersionMap(nowMs: number): void {
  if (lastVersions.size <= VERSION_MAP_MAX) return;
  for (const [key, entry] of lastVersions) {
    if (nowMs - entry.lastUsedAt > VERSION_MAP_TTL_MS) {
      lastVersions.delete(key);
    }
  }
  if (lastVersions.size > VERSION_MAP_MAX) {
    lastVersions.clear();
  }
}

/** Монотонний tie-break у межах одного Node-процесу (не глобальний між workers). */
export function nextClientSnapshotVersion(characterId: string): number {
  const key = String(characterId);
  const nowMs = Date.now();
  const previous = lastVersions.get(key)?.version ?? 0;
  const timeBase = nowMs * 1000;
  const next = Math.max(timeBase, previous + 1);
  lastVersions.set(key, { version: next, lastUsedAt: nowMs });
  pruneVersionMap(nowMs);
  return next;
}

/** Затримка відповіді після формування snapshot (dev-only stale-response test). */
export async function applyDevSnapshotResponseDelay(
  delayMs?: number
): Promise<void> {
  if (process.env.NODE_ENV === 'production') return;
  if (process.env.L2_ALLOW_DEBUG_DELAY !== '1') return;

  const fromEnv = Number(process.env.L2_SNAPSHOT_DEBUG_DELAY_MS ?? 0);
  let ms =
    delayMs != null && Number.isFinite(delayMs) && delayMs > 0
      ? delayMs
      : fromEnv;
  if (!Number.isFinite(ms) || ms <= 0) return;
  ms = Math.min(DEBUG_DELAY_MAX_MS, Math.floor(ms));
  await new Promise((resolve) => setTimeout(resolve, ms));
}
