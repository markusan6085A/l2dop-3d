import {
  MAP_WORLD_SPAWNS,
  stripSpawnDupSuffix,
  type MapWorldSpawn,
} from '../data/mapWorldSpawns.js';
import { mobCombatFromSpawn } from './battleMobSpawn.js';
import {
  BATTLE_RANGE,
  type BattleJsonState,
  type WhirlwindExtraMobJson,
} from './battleTypes.js';

function pickTwoNearbySpawnsForWhirlwind(
  worldX: number,
  worldY: number,
  primarySpawnId: string,
  range: number
): MapWorldSpawn[] {
  const primaryBase = stripSpawnDupSuffix(primarySpawnId);
  const bestByBase = new Map<string, { sp: MapWorldSpawn; d: number }>();
  for (const sp of MAP_WORLD_SPAWNS) {
    const base = stripSpawnDupSuffix(sp.id);
    if (base === primaryBase) continue;
    const d = Math.hypot(sp.worldX - worldX, sp.worldY - worldY);
    if (!Number.isFinite(d) || d > range) continue;
    const prev = bestByBase.get(base);
    if (!prev || d < prev.d) bestByBase.set(base, { sp, d });
  }
  return [...bestByBase.values()]
    .sort((a, b) => a.d - b.d)
    .slice(0, 2)
    .map((x) => x.sp);
}

function extraMobFromSpawn(sp: MapWorldSpawn): WhirlwindExtraMobJson {
  const mc = mobCombatFromSpawn(sp);
  return {
    spawnId: sp.id,
    name: sp.name,
    mobHp: mc.maxHp,
    mobMaxHp: mc.maxHp,
    mobPAtk: mc.pAtk,
    mobPDef: mc.pDef,
    mobMAtk: mc.mAtk,
    mobMDef: mc.mDef,
    mobEvasion: mc.evasion,
  };
}

/** Фіксує до 2 додаткових цілей при першому успішному Вихорі в цьому бою. */
export function ensureWhirlwindExtraMobs(
  st: BattleJsonState,
  worldX: number,
  worldY: number,
  primarySpawnId: string
): void {
  if (st.whirlwindExtras && st.whirlwindExtras.length > 0) return;
  const picks = pickTwoNearbySpawnsForWhirlwind(
    worldX,
    worldY,
    primarySpawnId,
    BATTLE_RANGE
  );
  st.whirlwindExtras = picks.map(extraMobFromSpawn);
}

/** Максимум додаткових цілей поруч (головна + ці = до 3 цілей для Sonic Storm / Вихор). */
export const NEARBY_EXTRA_MOB_CAP = 2;

/**
 * Той самий фіз. урон по `whirlwindExtras`, що вже нараховано по головній цілі.
 * Повертає імена цілей, які ще були живі до удару.
 */
export function applyPhysDamageToNearbyExtraMobs(
  st: BattleJsonState,
  pDmg: number,
  onExtraKill?: (mobName: string) => void
): string[] {
  if (pDmg <= 0 || !st.whirlwindExtras || st.whirlwindExtras.length === 0) {
    return [];
  }
  const hit: string[] = [];
  for (const ex of st.whirlwindExtras) {
    const before = ex.mobHp;
    if (before <= 0) continue;
    ex.mobHp = Math.max(0, ex.mobHp - pDmg);
    hit.push(ex.name);
    if (before > 0 && ex.mobHp <= 0 && onExtraKill) {
      onExtraKill(ex.name);
    }
  }
  return hit;
}
