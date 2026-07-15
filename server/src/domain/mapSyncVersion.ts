import { parseMobSpawnHpState } from './mobSpawnHpState.js';

/** Піднімати при зміні статичного каталогу спавнів (generated coords / ids). */
export const MAP_CATALOG_VERSION = 4;
/** Стабільний підпис персонального mobSpawnHpJson (без write-path version bump). */
export function mobSpawnHpPersonalSig(
  raw: unknown,
  nowMs: number = Date.now()
): string {
  const st = parseMobSpawnHpState(raw, nowMs);
  const keys = Object.keys(st).sort();
  if (keys.length === 0) return '0';
  const parts: string[] = [];
  for (const id of keys) {
    const e = st[id]!;
    if (e.respawnUntilMs != null) {
      parts.push(id + ':r' + String(e.respawnUntilMs));
    } else if (e.mobHp != null && e.mobMaxHp != null) {
      parts.push(id + ':' + String(e.mobHp) + '/' + String(e.mobMaxHp));
    }
  }
  return parts.join('|');
}

export function mapSyncHasChanges(args: {
  clientMapCatalogVersion?: number;
  clientPersonalMapSig?: string;
  clientRevision?: number;
  serverMapCatalogVersion: number;
  serverPersonalMapSig: string;
  serverRevision: number;
}): boolean {
  const clientCat = args.clientMapCatalogVersion;
  const clientSig = args.clientPersonalMapSig;
  const clientRev = args.clientRevision;
  if (clientCat == null || clientSig == null || clientRev == null) return true;
  if (clientCat !== args.serverMapCatalogVersion) return true;
  if (clientSig !== args.serverPersonalMapSig) return true;
  if (clientRev !== args.serverRevision) return true;
  return false;
}
