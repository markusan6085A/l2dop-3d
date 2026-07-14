/**
 * HP мобів на карті між боями (per character + spawnId).
 * Поки гравець не вбив моба — залишок HP зберігається після втечі/поразки/телепорту.
 * Після kill звичайного моба — respawnUntilMs (див. mobSpawnRespawn.ts).
 */
import { Prisma } from '@prisma/client';
import type { BattleJsonState } from './battle.js';

export type MobSpawnHpEntry = {
  mobHp?: number;
  mobMaxHp?: number;
  respawnUntilMs?: number;
};

export type MobSpawnHpState = Record<string, MobSpawnHpEntry>;

export function parseMobSpawnHpState(
  raw: unknown,
  nowMs: number = Date.now()
): MobSpawnHpState {
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) {
    return {};
  }
  const out: MobSpawnHpState = {};
  for (const [spawnId, ent] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof spawnId !== 'string' || !spawnId.trim()) continue;
    if (spawnId.startsWith('_')) continue;
    if (ent == null || typeof ent !== 'object' || Array.isArray(ent)) continue;
    const o = ent as Record<string, unknown>;

    const respawnUntilMs = Number(o.respawnUntilMs);
    if (Number.isFinite(respawnUntilMs) && respawnUntilMs > nowMs) {
      out[spawnId] = { respawnUntilMs: Math.floor(respawnUntilMs) };
      continue;
    }

    const mobHp = Number(o.mobHp);
    const mobMaxHp = Number(o.mobMaxHp);
    if (
      !Number.isFinite(mobHp) ||
      !Number.isFinite(mobMaxHp) ||
      mobMaxHp <= 0 ||
      mobHp <= 0 ||
      mobHp > mobMaxHp
    ) {
      continue;
    }
    out[spawnId] = {
      mobHp: Math.floor(mobHp),
      mobMaxHp: Math.floor(mobMaxHp),
    };
  }
  return out;
}

/** Стартове HP моба: збережене або повне. */
export function resolveMobHpAtSpawnStart(
  state: MobSpawnHpState,
  spawnId: string,
  mobMaxHp: number
): number {
  const max = Math.max(1, Math.floor(mobMaxHp));
  const ent = state[spawnId];
  if (!ent || ent.respawnUntilMs != null) return max;
  if (ent.mobMaxHp == null || ent.mobHp == null) return max;
  if (ent.mobMaxHp !== max) return max;
  return Math.max(1, Math.min(max, Math.floor(ent.mobHp)));
}

export function mergeMobSpawnHpEntry(
  state: MobSpawnHpState,
  spawnId: string,
  mobHp: number,
  mobMaxHp: number
): MobSpawnHpState {
  const sid = String(spawnId || '').trim();
  const max = Math.floor(mobMaxHp);
  const hp = Math.floor(mobHp);
  if (!sid || !Number.isFinite(max) || max <= 0) return state;
  if (!Number.isFinite(hp) || hp <= 0 || hp >= max) {
    if (!(sid in state)) return state;
    const next = { ...state };
    delete next[sid];
    return next;
  }
  return {
    ...state,
    [sid]: { mobHp: hp, mobMaxHp: max },
  };
}

export function clearMobSpawnHpEntry(
  state: MobSpawnHpState,
  spawnId: string
): MobSpawnHpState {
  const sid = String(spawnId || '').trim();
  if (!sid || !(sid in state)) return state;
  const next = { ...state };
  delete next[sid];
  return next;
}

export function mobSpawnHpFromBattleJson(
  bj: BattleJsonState | null
): { spawnId: string; mobHp: number; mobMaxHp: number } | null {
  if (!bj) return null;
  const spawnId = String(bj.spawnId || '').trim();
  if (!spawnId) return null;
  const mobMaxHp = Math.floor(bj.mobMaxHp);
  const mobHp = Math.floor(bj.mobHp);
  if (!Number.isFinite(mobMaxHp) || mobMaxHp <= 0) return null;
  if (!Number.isFinite(mobHp) || mobHp < 0) return null;
  return { spawnId, mobHp, mobMaxHp };
}

export function serializeMobSpawnHpState(
  state: MobSpawnHpState
): Prisma.InputJsonValue | typeof Prisma.JsonNull {
  const keys = Object.keys(state);
  if (keys.length === 0) return Prisma.JsonNull;
  return JSON.parse(JSON.stringify(state)) as Prisma.InputJsonValue;
}
