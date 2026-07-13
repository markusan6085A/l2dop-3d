/**
 * Світові спавни на карті (як точки на mapcreate у l2dop: ..O,tx,ty,колір).
 * Поки без HP/урону/дропу — додається серверно пізніше; поля закладені в типі API.
 */

import {
  MAP_TOWNS,
  mobPoolForCity,
  type MapLocalityMob,
  type MapTownRef,
} from './mapLocalities.js';
import { L2DOP_MAP_CHAMPION_SPAWNS } from './l2dopMapChampionSpawns.generated.js';
import { L2DOP_LINEAGE_EPIC_BOSS_SPAWNS } from './l2dopMapEpicBossSpawns.generated.js';
import { L2DOP_LINEAGE_EPIC_GUARD_SPAWNS } from './l2dopMapEpicGuardSpawns.js';
import { L2DOP_LINEAGE_RAID_BOSS_SPAWNS } from './l2dopMapRaidBossSpawns.generated.js';

export type MapSpawnKind =
  | 'passive'
  | 'aggressive'
  | 'neutral'
  | 'champion'
  | 'raid'
  | 'epic'
  /** Охорона зони епіка — окремий пін на карті, не «епік бос». */
  | 'epic_guard'
  | 'dungeon';

/**
 * Радіус «поруч» для списку й маркерів (світові одиниці).
 * Менше ~15k — епіки/зона (на кшталт Валакаса) часто не потрапляли в список; занадто велико — зайвий шум.
 */
export const MAP_NEARBY_LIST_RADIUS = 26_000;

/** Радіус «поруч» для інших гравців на карті (менший за мобів). */
export const MAP_NEARBY_HERO_RADIUS = 12_000;

/** Злиття ×3 дає id виду `dense_12__dup1` — для списку лишаємо одну точку на базовий спавн. */
export function stripSpawnDupSuffix(spawnId: string): string {
  return spawnId.replace(/__dup\d+$/, '');
}

/** Одна точка моба на карті світу (aden2.jpg + l2dopMapCoords). */
export interface MapWorldSpawn {
  id: string;
  worldX: number;
  worldY: number;
  /** id шаблону NPC у даних L2DOP / XML — для майбутнього бою */
  templateId: string;
  name: string;
  level: number;
  kind: MapSpawnKind;
  /** Чи агресивний (як у L2 aggressive) */
  aggressive: boolean;
  /**
   * Фаза 4: явний резист до stun / «hard» контролю в PvE, %.
   * Якщо не задано — `effectiveMobStunResistPct` бере synthetic за `level`.
   */
  stunResistPct?: number;
  /**
   * Фаза 4: явний резист до маг. дебафів / soft control, %.
   * Якщо не задано — synthetic за `level`.
   */
  debuffResistPct?: number;
  /** Заглушки під майбутній бой / дроп / спойл */
  stats?: {
    hp?: number;
    maxHp?: number;
    pAtk?: number;
    mAtk?: number;
    pDef?: number;
    mDef?: number;
  };
  /** Портрет для списку/картки (наприклад `/epic-npcs/29028.png`). */
  icon?: string;
  dropsPreview?: string[];
}

function rng(seed: string, i: number): number {
  let h = 2166136261;
  const s = seed + ':' + String(i);
  for (let k = 0; k < s.length; k++) {
    h ^= s.charCodeAt(k);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1_000_000) / 1_000_000;
}

function clampWorld(x: number, y: number): { x: number; y: number } {
  return {
    x: Math.max(-131000, Math.min(228000, Math.round(x))),
    y: Math.max(-259000, Math.min(262000, Math.round(y))),
  };
}

function pickMob(pool: MapLocalityMob[], seed: string, idx: number): MapLocalityMob {
  if (pool.length === 0) return { name: 'Mob', level: 1 };
  const k = Math.floor(rng(seed, idx) * pool.length) % pool.length;
  return pool[k]!;
}

function kindForMob(_mob: MapLocalityMob, seed: string, idx: number): MapSpawnKind {
  const r = rng(seed + 'k', idx);
  /** РБ / епіки лише з SPECIAL_SPAWNS — тут ніколи не буває raid/epic, інакше «половина карти без РБ». */
  if (r < 0.38) return 'passive';
  if (r < 0.78) return 'aggressive';
  return 'neutral';
}

function nearestTown(wx: number, wy: number): MapTownRef {
  let best = MAP_TOWNS[0]!;
  let bestD = Infinity;
  for (const t of MAP_TOWNS) {
    const d = Math.hypot(t.worldX - wx, t.worldY - wy);
    if (d < bestD) {
      bestD = d;
      best = t;
    }
  }
  return best;
}

/**
 * Щільне поле навколо міст — великий диск, щоб покрити околиці (не лише 3–4 тис. од. від центру міста).
 */
function buildDenseTownFieldSpawns(): MapWorldSpawn[] {
  const out: MapWorldSpawn[] = [];
  let idx = 0;
  const STEP = 280;
  const RING = 10_000;
  for (const t of MAP_TOWNS) {
    const pool = mobPoolForCity(t.cityId);
    for (let gx = -RING; gx <= RING; gx += STEP) {
      for (let gy = -RING; gy <= RING; gy += STEP) {
        if (gx * gx + gy * gy > RING * RING) continue;
        const jx = (rng(t.labelUk + 'jx', idx) - 0.5) * 42;
        const jy = (rng(t.labelUk + 'jy', idx) - 0.5) * 42;
        const c = clampWorld(t.worldX + gx + jx, t.worldY + gy + jy);
        const mob = pickMob(pool, t.labelUk + 'd', idx);
        let kind: MapSpawnKind = kindForMob(mob, t.labelUk, idx);
        const champRoll = rng('champ' + t.cityId, idx);
        if (
          champRoll < 0.035 &&
          kind !== 'raid' &&
          kind !== 'epic'
        ) {
          kind = 'champion';
        }
        const aggressive =
          kind === 'aggressive' ||
          kind === 'champion' ||
          kind === 'raid' ||
          kind === 'epic';
        const id = `dense_${idx}`;
        out.push({
          id,
          worldX: c.x,
          worldY: c.y,
          templateId: `l2dop_dense_${idx}`,
          name: mob.name,
          level: mob.level,
          kind,
          aggressive,
        });
        idx += 1;
      }
    }
  }
  return out;
}

/** Випадкові точки по всьому світу — щоб між містами й далекими зонами теж були моби. */
function buildScatterSpawns(): MapWorldSpawn[] {
  const out: MapWorldSpawn[] = [];
  const TOTAL = 16_000;
  for (let i = 0; i < TOTAL; i++) {
    const rx = -131000 + rng('scx', i) * 359000;
    const ry = -259000 + rng('scy', i) * 521000;
    const c = clampWorld(rx, ry);
    const t = nearestTown(c.x, c.y);
    const pool = mobPoolForCity(t.cityId);
    const mob = pickMob(pool, 'scatter' + t.cityId, i);
    let kind: MapSpawnKind = kindForMob(mob, 'scatterk', i);
    if (rng('schamp', i) < 0.028 && kind !== 'raid' && kind !== 'epic') {
      kind = 'champion';
    }
    const aggressive =
      kind === 'aggressive' ||
      kind === 'champion' ||
      kind === 'raid' ||
      kind === 'epic';
    out.push({
      id: `scatter_${i}`,
      worldX: c.x,
      worldY: c.y,
      templateId: `l2dop_scatter_${i}`,
      name: mob.name,
      level: mob.level,
      kind,
      aggressive,
    });
  }
  return out;
}

/**
 * РБ / епіки з канону text-rpg (l2dop: mobs.ts + epicRaidBosses.ts + ancient tomb + Giran).
 * Генерація: `npm run gen:map-raid-spawns` → l2dopMapRaidBossSpawns / l2dopMapEpicBossSpawns / заглушка чемпіонів.
 */
const SPECIAL_SPAWNS: MapWorldSpawn[] = [
  ...(L2DOP_LINEAGE_RAID_BOSS_SPAWNS as unknown as MapWorldSpawn[]),
  ...(L2DOP_LINEAGE_EPIC_BOSS_SPAWNS as unknown as MapWorldSpawn[]),
  ...L2DOP_LINEAGE_EPIC_GUARD_SPAWNS,
  ...(L2DOP_MAP_CHAMPION_SPAWNS as unknown as MapWorldSpawn[]),
  {
    id: 'dung_catacomb_giran',
    worldX: 45000,
    worldY: 123000,
    templateId: 'l2dop_dung_catacomb',
    name: 'Catacomb (вхід)',
    level: 45,
    kind: 'dungeon',
    aggressive: false,
  },
  {
    id: 'dung_necropolis',
    worldX: 178000,
    worldY: 20800,
    templateId: 'l2dop_dung_necropolis',
    name: 'Necropolis (вхід)',
    level: 60,
    kind: 'dungeon',
    aggressive: false,
  },
];

/**
 * Звичайні моби (пасивні / агресивні / нейтральні) ×3 — окремі точки з легким зміщенням.
 * Чемпіони, РБ, епіки, данжени — без змін (як у l2dop: особливі точки одні).
 */
function expandRegularSpawnsThreefold(spawns: MapWorldSpawn[]): MapWorldSpawn[] {
  const out: MapWorldSpawn[] = [];
  for (const s of spawns) {
    if (
      s.kind === 'champion' ||
      s.kind === 'raid' ||
      s.kind === 'epic' ||
      s.kind === 'epic_guard' ||
      s.kind === 'dungeon'
    ) {
      out.push(s);
      continue;
    }
    for (let k = 0; k < 3; k++) {
      if (k === 0) {
        out.push(s);
        continue;
      }
      const jx = (rng(s.id + 'dupx', k) - 0.5) * 160;
      const jy = (rng(s.id + 'dupy', k) - 0.5) * 160;
      const c = clampWorld(s.worldX + jx, s.worldY + jy);
      out.push({
        ...s,
        id: `${s.id}__dup${k}`,
        worldX: c.x,
        worldY: c.y,
      });
    }
  }
  return out;
}

/** Усі спавни для БД/бою (статично; пізніше — spawnlist з l2dop). */
export const MAP_WORLD_SPAWNS: MapWorldSpawn[] = expandRegularSpawnsThreefold([
  ...buildDenseTownFieldSpawns(),
  ...buildScatterSpawns(),
  ...SPECIAL_SPAWNS,
]);

export function getWorldSpawnById(id: string): MapWorldSpawn | undefined {
  return MAP_WORLD_SPAWNS.find((s) => s.id === id);
}

const HUNTING_SPAWN_KINDS: ReadonlySet<MapSpawnKind> = new Set([
  'passive',
  'aggressive',
  'neutral',
  'champion',
]);

/**
 * Діапазон рівнів мобів «поруч» з точки світу — той самий радіус і дедуп, що у списку на карті.
 * Для телепорту: показуємо те, що гравець реально побачить після прибуття.
 */
export function getMobLevelRangeFromNearbySpawns(
  worldX: number,
  worldY: number,
  radius: number = MAP_NEARBY_LIST_RADIUS
): { min: number; max: number } | null {
  const R2 = radius * radius;
  const byBase = new Map<string, { s: MapWorldSpawn; d: number }>();
  for (const s of MAP_WORLD_SPAWNS) {
    if (!HUNTING_SPAWN_KINDS.has(s.kind)) continue;
    const dx = s.worldX - worldX;
    const dy = s.worldY - worldY;
    if (dx * dx + dy * dy > R2) continue;
    const d = Math.hypot(dx, dy);
    const base = stripSpawnDupSuffix(s.id);
    const prev = byBase.get(base);
    if (!prev || d < prev.d) {
      byBase.set(base, { s, d });
    }
  }
  let min = Infinity;
  let max = -Infinity;
  for (const row of byBase.values()) {
    const lv = Math.floor(Number(row.s.level));
    if (!Number.isFinite(lv) || lv < 1) continue;
    if (lv < min) min = lv;
    if (lv > max) max = lv;
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) return null;
  return { min, max };
}
