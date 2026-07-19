import type { BattleJsonState } from './battleTypes.js';
import type { MapSpawnKind } from '../data/mapWorldSpawns.js';
import { getWorldSpawnById } from '../data/mapWorldSpawns.js';

export const PVP_SPAWN_ID_PREFIX = 'pvp:';

export function pvpSpawnIdForCharacter(characterId: string): string {
  return PVP_SPAWN_ID_PREFIX + String(characterId || '').trim();
}

export function parsePvpTargetIdFromSpawnId(spawnId: string): string | null {
  const sid = String(spawnId || '');
  if (!sid.startsWith(PVP_SPAWN_ID_PREFIX)) return null;
  const id = sid.slice(PVP_SPAWN_ID_PREFIX.length).trim();
  return id || null;
}

export function isPvpBattleJson(bj: BattleJsonState): boolean {
  return bj.battleMode === 'pvp' && !!bj.pvpTargetCharacterId;
}

/** Canonical PvP victory payload fields (server → client). */
export function buildPvpVictoryCanonicalFields(st: BattleJsonState): {
  isPvp: true;
  battleType: 'pvp';
  defeatedCharacterId: string;
} {
  return {
    isPvp: true,
    battleType: 'pvp',
    defeatedCharacterId: String(st.pvpTargetCharacterId || '').trim(),
  };
}

/** Надійна перевірка PvP-перемоги (не покладатися лише на spawnId у кеші). */
export function isPvpVictoryPayload(
  v:
    | {
        isPvp?: boolean;
        battleType?: string;
        spawnId?: string;
      }
    | null
    | undefined
): boolean {
  if (!v) return false;
  if (v.isPvp === true || v.battleType === 'pvp') return true;
  return parsePvpTargetIdFromSpawnId(String(v.spawnId || '')) != null;
}

export function isPvpSpawnId(spawnId: string | null | undefined): boolean {
  return parsePvpTargetIdFromSpawnId(String(spawnId || '')) != null;
}

/** Мета цілі бою для UI / логу (моб або гравець). */
export interface BattleSpawnMeta {
  spawnId: string;
  name: string;
  level: number;
  aggressive: boolean;
  kind: MapSpawnKind;
  stunResistPct?: number;
  debuffResistPct?: number;
}

export function resolveBattleSpawnMeta(
  bj: BattleJsonState
): BattleSpawnMeta | null {
  if (isPvpBattleJson(bj)) {
    return {
      spawnId: bj.spawnId,
      name: bj.pvpTargetName?.trim() || 'Гравець',
      level: Math.max(1, Math.floor(bj.pvpTargetLevel ?? 1)),
      aggressive: true,
      kind: 'aggressive',
      stunResistPct: 0,
      debuffResistPct: 0,
    };
  }
  const spawn = getWorldSpawnById(bj.spawnId);
  if (!spawn) return null;
  return {
    spawnId: spawn.id,
    name: spawn.name,
    level: spawn.level,
    aggressive: spawn.aggressive,
    kind: spawn.kind,
    stunResistPct: spawn.stunResistPct,
    debuffResistPct: spawn.debuffResistPct,
  };
}
