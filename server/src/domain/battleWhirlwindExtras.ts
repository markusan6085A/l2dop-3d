import {
  MAP_WORLD_SPAWNS,
  stripSpawnDupSuffix,
  type MapWorldSpawn,
} from '../data/mapWorldSpawns.js';
import {
  HATE_AURA_EXTRA_MOB_CAP,
  hateAuraWorldRadius,
  spawnAllowsHateAuraAggro,
} from '../data/hateAuraTables.js';
import {
  provokePoleResistCutPctAtRank,
  provokeWorldRadiusAtRank,
  PROVOKE_EXTRA_MOB_CAP,
  spawnAllowsProvokeAggro,
} from '../data/provokeTables.js';
import { mobCombatFromSpawn } from './battleMobSpawn.js';
import {
  BATTLE_RANGE,
  type BattleJsonState,
  type WhirlwindExtraMobJson,
} from './battleTypes.js';

/** Додаткових цілей для Whirlwind: головна + ці = до 4. */
export const WHIRLWIND_EXTRA_MOB_CAP = 3;
/** Додаткових цілей для Sonic Storm: головна + ці = до 3. */
export const SONIC_STORM_EXTRA_MOB_CAP = 2;
/** Додаткових цілей для Thunder Storm (TARGET_AURA): головна + ці = до 4. */
export const THUNDER_STORM_EXTRA_MOB_CAP = 3;
/** Howl (116): додаткові цілі в `BATTLE_RANGE` (радіус як у мобів на карті). */
export const HOWL_EXTRA_MOB_CAP = 20;
/** Howl: −23% P.Atk ворога (Interlude mul 0.77). */
export const HOWL_MOB_PATK_DEBUFF_MUL = 0.77;

function pickNearbySpawns(
  worldX: number,
  worldY: number,
  primarySpawnId: string,
  range: number,
  extraCap: number,
  filter?: (sp: MapWorldSpawn) => boolean
): MapWorldSpawn[] {
  const primaryBase = stripSpawnDupSuffix(primarySpawnId);
  const bestByBase = new Map<string, { sp: MapWorldSpawn; d: number }>();
  for (const sp of MAP_WORLD_SPAWNS) {
    if (filter && !filter(sp)) continue;
    const base = stripSpawnDupSuffix(sp.id);
    if (base === primaryBase) continue;
    const d = Math.hypot(sp.worldX - worldX, sp.worldY - worldY);
    if (!Number.isFinite(d) || d > range) continue;
    const prev = bestByBase.get(base);
    if (!prev || d < prev.d) bestByBase.set(base, { sp, d });
  }
  return [...bestByBase.values()]
    .sort((a, b) => a.d - b.d)
    .slice(0, Math.max(0, Math.floor(extraCap)))
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

/** Фіксує додаткові цілі поруч (до `extraCap`) при першому AoE-удары в бою. */
export function ensureWhirlwindExtraMobs(
  st: BattleJsonState,
  worldX: number,
  worldY: number,
  primarySpawnId: string,
  extraCap: number = WHIRLWIND_EXTRA_MOB_CAP,
  range: number = BATTLE_RANGE
): void {
  const cap = Math.max(0, Math.floor(extraCap));
  const existing = st.whirlwindExtras ?? [];
  if (existing.length >= cap) return;
  const haveIds = new Set(existing.map((e) => stripSpawnDupSuffix(e.spawnId)));
  const picks = pickNearbySpawns(
    worldX,
    worldY,
    primarySpawnId,
    range,
    cap
  ).filter((sp) => !haveIds.has(stripSpawnDupSuffix(sp.id)));
  const merged = [...existing];
  for (const sp of picks) {
    if (merged.length >= cap) break;
    merged.push(extraMobFromSpawn(sp));
  }
  if (merged.length > 0) st.whirlwindExtras = merged;
}

/** Howl: знижує P.Atk додаткових мобів у `whirlwindExtras` (головна — через `battleMods`). */
export function applyHowlDebuffToNearbyExtraMobs(
  st: BattleJsonState,
  debuffMul: number = HOWL_MOB_PATK_DEBUFF_MUL
): string[] {
  if (!st.whirlwindExtras?.length || debuffMul <= 0 || debuffMul >= 1) {
    return [];
  }
  const hit: string[] = [];
  for (const ex of st.whirlwindExtras) {
    ex.mobPatkDebuffMul = debuffMul;
    hit.push(ex.name);
  }
  return hit;
}

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

/**
 * Provoke (286): підтягує мобів і РБ у радіусі за рангом; епіки/epic_guard пропускає.
 */
export function ensureProvokeExtraMobs(
  st: BattleJsonState,
  worldX: number,
  worldY: number,
  primarySpawnId: string,
  skillRank: number
): string[] {
  const range = provokeWorldRadiusAtRank(skillRank);
  const poleCut = provokePoleResistCutPctAtRank(skillRank);
  const cap = PROVOKE_EXTRA_MOB_CAP;
  const existing = st.whirlwindExtras ?? [];
  const byBase = new Map<string, WhirlwindExtraMobJson>();
  for (const ex of existing) {
    byBase.set(stripSpawnDupSuffix(ex.spawnId), ex);
  }
  const picks = pickNearbySpawns(
    worldX,
    worldY,
    primarySpawnId,
    range,
    cap,
    (sp) => spawnAllowsProvokeAggro(sp.kind)
  );
  const added: string[] = [];
  for (const sp of picks) {
    const base = stripSpawnDupSuffix(sp.id);
    const prev = byBase.get(base);
    if (prev) {
      prev.mobPoleResistCutPct = poleCut;
      continue;
    }
    const ex = extraMobFromSpawn(sp);
    ex.mobPoleResistCutPct = poleCut;
    byBase.set(base, ex);
    added.push(ex.name);
  }
  const merged = [...byBase.values()].slice(0, cap);
  if (merged.length > 0) st.whirlwindExtras = merged;
  return added;
}

/**
 * Hate Aura (18): підтягує мобів і РБ у радіусі 200; епіки/epic_guard пропускає.
 */
export function ensureHateAuraExtraMobs(
  st: BattleJsonState,
  worldX: number,
  worldY: number,
  primarySpawnId: string
): string[] {
  const range = hateAuraWorldRadius();
  const cap = HATE_AURA_EXTRA_MOB_CAP;
  const existing = st.whirlwindExtras ?? [];
  const byBase = new Map<string, WhirlwindExtraMobJson>();
  for (const ex of existing) {
    byBase.set(stripSpawnDupSuffix(ex.spawnId), ex);
  }
  const picks = pickNearbySpawns(
    worldX,
    worldY,
    primarySpawnId,
    range,
    cap,
    (sp) => spawnAllowsHateAuraAggro(sp.kind)
  );
  const added: string[] = [];
  for (const sp of picks) {
    const base = stripSpawnDupSuffix(sp.id);
    if (byBase.has(base)) continue;
    const ex = extraMobFromSpawn(sp);
    byBase.set(base, ex);
    added.push(ex.name);
  }
  const merged = [...byBase.values()].slice(0, cap);
  if (merged.length > 0) st.whirlwindExtras = merged;
  return added;
}

export function stripProvokeDebuffFromExtraMobs(st: BattleJsonState): void {
  if (!st.whirlwindExtras?.length) return;
  for (const ex of st.whirlwindExtras) {
    delete ex.mobPoleResistCutPct;
  }
}
