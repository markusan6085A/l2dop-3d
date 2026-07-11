/**
 * Респавн звичайних мобів (не РБ / не епіки) — per character.
 */
import type { MapSpawnKind } from '../data/mapWorldSpawns.js';
import type { MobSpawnHpState } from './mobSpawnHpState.js';
import { parseMobSpawnHpState } from './mobSpawnHpState.js';

export const REGULAR_MOB_RESPAWN_MS = 30_000;

export function isRegularMobRespawnKind(kind: MapSpawnKind): boolean {
  return (
    kind === 'passive' ||
    kind === 'aggressive' ||
    kind === 'neutral' ||
    kind === 'champion'
  );
}

export function isMobSpawnOnRespawn(
  state: MobSpawnHpState,
  spawnId: string,
  nowMs: number
): boolean {
  const sid = String(spawnId || '').trim();
  if (!sid) return false;
  const ent = state[sid];
  if (!ent || ent.respawnUntilMs == null) return false;
  return ent.respawnUntilMs > nowMs;
}

export function setMobSpawnRespawnEntry(
  state: MobSpawnHpState,
  spawnId: string,
  untilMs: number
): MobSpawnHpState {
  const sid = String(spawnId || '').trim();
  const until = Math.floor(untilMs);
  if (!sid || !Number.isFinite(until) || until <= 0) return state;
  return {
    ...state,
    [sid]: { respawnUntilMs: until },
  };
}

export function filterSpawnsVisibleForPlayer<
  T extends { id: string; kind: MapSpawnKind },
>(spawns: T[], mobSpawnHpJson: unknown, nowMs = Date.now()): T[] {
  const state = parseMobSpawnHpState(mobSpawnHpJson, nowMs);
  return spawns.filter((s) => {
    if (!isRegularMobRespawnKind(s.kind)) return true;
    return !isMobSpawnOnRespawn(state, s.id, nowMs);
  });
}

export function mobRespawnSecondsLeft(
  state: MobSpawnHpState,
  spawnId: string,
  nowMs: number
): number {
  if (!isMobSpawnOnRespawn(state, spawnId, nowMs)) return 0;
  const ent = state[spawnId];
  if (!ent || ent.respawnUntilMs == null) return 0;
  return Math.max(0, Math.ceil((ent.respawnUntilMs - nowMs) / 1000));
}
