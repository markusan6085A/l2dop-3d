/**
 * Процедурний дроп крафт-ресурсів з мобів: тір за рівнем моба, 70/20/10 зсув тіра,
 * таблиця шансів/діапазонів рівня з ТЗ автора.
 */
import type { DropEntry } from '../types/combatDrop.js';
import { RESOURCE_CRAFT_ITEM_NAMES_UK } from '../data/resourceCraftItemNamesUk.js';

export interface ResourceLootLine {
  l2ItemId: number;
  qty: number;
  spoil: boolean;
  label: string;
}

export type MobResourceTier = 1 | 2 | 3 | 4 | 5 | 6;

export interface MobResourceRow {
  l2ItemId: number;
  tier: MobResourceTier;
  minMobLvl: number;
  maxMobLvl: number;
  dropPct: number;
  spoilPct: number;
  dropQtyMin: number;
  dropQtyMax: number;
  spoilQtyMin: number;
  spoilQtyMax: number;
}

/** Узгоджено з resourceCraftItemNamesUk / droplist L2. */
export const MOB_RESOURCE_DROP_TABLE: readonly MobResourceRow[] = [
  {
    l2ItemId: 1867,
    tier: 1,
    minMobLvl: 1,
    maxMobLvl: 25,
    dropPct: 18,
    spoilPct: 35,
    dropQtyMin: 1,
    dropQtyMax: 3,
    spoilQtyMin: 1,
    spoilQtyMax: 5,
  },
  {
    l2ItemId: 1872,
    tier: 1,
    minMobLvl: 1,
    maxMobLvl: 25,
    dropPct: 18,
    spoilPct: 35,
    dropQtyMin: 1,
    dropQtyMax: 3,
    spoilQtyMin: 1,
    spoilQtyMax: 5,
  },
  {
    l2ItemId: 1864,
    tier: 1,
    minMobLvl: 1,
    maxMobLvl: 30,
    dropPct: 16,
    spoilPct: 32,
    dropQtyMin: 1,
    dropQtyMax: 3,
    spoilQtyMin: 1,
    spoilQtyMax: 5,
  },
  {
    l2ItemId: 1868,
    tier: 1,
    minMobLvl: 1,
    maxMobLvl: 30,
    dropPct: 15,
    spoilPct: 30,
    dropQtyMin: 1,
    dropQtyMax: 3,
    spoilQtyMin: 1,
    spoilQtyMax: 5,
  },
  {
    l2ItemId: 1869,
    tier: 1,
    minMobLvl: 1,
    maxMobLvl: 40,
    dropPct: 14,
    spoilPct: 28,
    dropQtyMin: 1,
    dropQtyMax: 3,
    spoilQtyMin: 1,
    spoilQtyMax: 5,
  },
  {
    l2ItemId: 1871,
    tier: 2,
    minMobLvl: 15,
    maxMobLvl: 40,
    dropPct: 12,
    spoilPct: 26,
    dropQtyMin: 1,
    dropQtyMax: 2,
    spoilQtyMin: 1,
    spoilQtyMax: 4,
  },
  {
    l2ItemId: 1870,
    tier: 1,
    minMobLvl: 1,
    maxMobLvl: 25,
    dropPct: 12,
    spoilPct: 28,
    dropQtyMin: 1,
    dropQtyMax: 4,
    spoilQtyMin: 1,
    spoilQtyMax: 7,
  },
  {
    l2ItemId: 1865,
    tier: 2,
    minMobLvl: 20,
    maxMobLvl: 45,
    dropPct: 10,
    spoilPct: 24,
    dropQtyMin: 1,
    dropQtyMax: 2,
    spoilQtyMin: 1,
    spoilQtyMax: 4,
  },
  {
    l2ItemId: 1881,
    tier: 2,
    minMobLvl: 20,
    maxMobLvl: 45,
    dropPct: 10,
    spoilPct: 24,
    dropQtyMin: 1,
    dropQtyMax: 2,
    spoilQtyMin: 1,
    spoilQtyMax: 4,
  },
  {
    l2ItemId: 1882,
    tier: 2,
    minMobLvl: 20,
    maxMobLvl: 50,
    dropPct: 9,
    spoilPct: 22,
    dropQtyMin: 1,
    dropQtyMax: 2,
    spoilQtyMin: 1,
    spoilQtyMax: 3,
  },
  {
    l2ItemId: 1884,
    tier: 2,
    minMobLvl: 20,
    maxMobLvl: 50,
    dropPct: 9,
    spoilPct: 22,
    dropQtyMin: 1,
    dropQtyMax: 2,
    spoilQtyMin: 1,
    spoilQtyMax: 3,
  },
  {
    l2ItemId: 1873,
    tier: 3,
    minMobLvl: 30,
    maxMobLvl: 55,
    dropPct: 7,
    spoilPct: 18,
    dropQtyMin: 1,
    dropQtyMax: 2,
    spoilQtyMin: 1,
    spoilQtyMax: 3,
  },
  {
    l2ItemId: 1875,
    tier: 3,
    minMobLvl: 35,
    maxMobLvl: 60,
    dropPct: 6,
    spoilPct: 16,
    dropQtyMin: 1,
    dropQtyMax: 1,
    spoilQtyMin: 1,
    spoilQtyMax: 2,
  },
  {
    l2ItemId: 1879,
    tier: 3,
    minMobLvl: 40,
    maxMobLvl: 65,
    dropPct: 6,
    spoilPct: 16,
    dropQtyMin: 1,
    dropQtyMax: 2,
    spoilQtyMin: 1,
    spoilQtyMax: 3,
  },
  {
    l2ItemId: 1880,
    tier: 3,
    minMobLvl: 45,
    maxMobLvl: 70,
    dropPct: 5,
    spoilPct: 14,
    dropQtyMin: 1,
    dropQtyMax: 1,
    spoilQtyMin: 1,
    spoilQtyMax: 2,
  },
  {
    l2ItemId: 1876,
    tier: 4,
    minMobLvl: 40,
    maxMobLvl: 65,
    dropPct: 5,
    spoilPct: 14,
    dropQtyMin: 1,
    dropQtyMax: 1,
    spoilQtyMin: 1,
    spoilQtyMax: 2,
  },
  {
    l2ItemId: 1883,
    tier: 4,
    minMobLvl: 50,
    maxMobLvl: 70,
    dropPct: 4,
    spoilPct: 12,
    dropQtyMin: 1,
    dropQtyMax: 1,
    spoilQtyMin: 1,
    spoilQtyMax: 2,
  },
  {
    l2ItemId: 4043,
    tier: 4,
    minMobLvl: 55,
    maxMobLvl: 75,
    dropPct: 3.5,
    spoilPct: 10,
    dropQtyMin: 1,
    dropQtyMax: 1,
    spoilQtyMin: 1,
    spoilQtyMax: 2,
  },
  {
    l2ItemId: 4042,
    tier: 5,
    minMobLvl: 60,
    maxMobLvl: 80,
    dropPct: 3,
    spoilPct: 9,
    dropQtyMin: 1,
    dropQtyMax: 1,
    spoilQtyMin: 1,
    spoilQtyMax: 2,
  },
  {
    l2ItemId: 4039,
    tier: 5,
    minMobLvl: 60,
    maxMobLvl: 80,
    dropPct: 2.5,
    spoilPct: 8,
    dropQtyMin: 1,
    dropQtyMax: 1,
    spoilQtyMin: 1,
    spoilQtyMax: 1,
  },
  {
    l2ItemId: 4041,
    tier: 5,
    minMobLvl: 65,
    maxMobLvl: 85,
    dropPct: 2.2,
    spoilPct: 7,
    dropQtyMin: 1,
    dropQtyMax: 1,
    spoilQtyMin: 1,
    spoilQtyMax: 1,
  },
  {
    l2ItemId: 4040,
    tier: 6,
    minMobLvl: 70,
    maxMobLvl: 90,
    dropPct: 2,
    spoilPct: 6,
    dropQtyMin: 1,
    dropQtyMax: 1,
    spoilQtyMin: 1,
    spoilQtyMax: 1,
  },
  {
    l2ItemId: 1874,
    tier: 6,
    minMobLvl: 70,
    maxMobLvl: 90,
    dropPct: 2,
    spoilPct: 6,
    dropQtyMin: 1,
    dropQtyMax: 1,
    spoilQtyMin: 1,
    spoilQtyMax: 1,
  },
] as const;

export function focusResourceTierFromMobLevel(level: number): MobResourceTier {
  const L = Math.max(1, Math.floor(level));
  if (L <= 20) return 1;
  if (L <= 35) return 2;
  if (L <= 50) return 3;
  if (L <= 60) return 4;
  if (L <= 75) return 5;
  return 6;
}

/** 70% поточний тір, 20% попередній, 10% наступний (в межах 1–6). */
export function rollResourceTierVariant(mobLevel: number): MobResourceTier {
  const focus = focusResourceTierFromMobLevel(mobLevel);
  const r = Math.random();
  if (r < 0.7) return focus;
  if (r < 0.9) return Math.max(1, focus - 1) as MobResourceTier;
  return Math.min(6, focus + 1) as MobResourceTier;
}

function labelForResource(id: number): string {
  const uk = RESOURCE_CRAFT_ITEM_NAMES_UK[id];
  if (uk) {
    const cut = uk.indexOf(' [');
    return cut >= 0 ? uk.slice(0, cut).trim() : uk;
  }
  return '#' + id;
}

function eligibleForTierAndLevel(
  tier: MobResourceTier,
  mobLevel: number
): MobResourceRow[] {
  return MOB_RESOURCE_DROP_TABLE.filter(
    (row) =>
      row.tier === tier &&
      mobLevel >= row.minMobLvl &&
      mobLevel <= row.maxMobLvl
  );
}

function pickWeightedResource(rows: MobResourceRow[], spoil: boolean): MobResourceRow | null {
  if (rows.length === 0) return null;
  const w = rows.map((r) => (spoil ? r.spoilPct : r.dropPct));
  const sum = w.reduce((a, b) => a + b, 0);
  if (sum <= 0) return rows[Math.floor(Math.random() * rows.length)]!;
  let t = Math.random() * sum;
  for (let i = 0; i < rows.length; i++) {
    t -= w[i]!;
    if (t <= 0) return rows[i]!;
  }
  return rows[rows.length - 1]!;
}

function rollInt(min: number, max: number): number {
  return Math.floor(min + Math.random() * (max - min + 1));
}

function dropAttemptCount(mobLevel: number): number {
  const L = Math.max(1, Math.floor(mobLevel));
  if (L <= 10) return rollInt(2, 4);
  if (L <= 40) return rollInt(2, 5);
  return rollInt(2, 6);
}

function spoilAttemptCount(mobLevel: number): number {
  const L = Math.max(1, Math.floor(mobLevel));
  if (L <= 20) return rollInt(1, 2);
  if (L <= 50) return rollInt(1, 3);
  return rollInt(2, 4);
}

/**
 * Спроби дропу/спойлу за кілл (окремо від рядка адени в сумці).
 */
export function rollProceduralResourceLoot(mobLevel: number): ResourceLootLine[] {
  const L = Math.max(1, Math.floor(mobLevel));
  const out: ResourceLootLine[] = [];
  const nDrop = dropAttemptCount(L);
  const nSpoil = spoilAttemptCount(L);

  for (let i = 0; i < nDrop; i++) {
    let tier = rollResourceTierVariant(L);
    let pool = eligibleForTierAndLevel(tier, L);
    if (pool.length === 0) {
      pool = eligibleForTierAndLevel(focusResourceTierFromMobLevel(L), L);
    }
    if (pool.length === 0) {
      pool = MOB_RESOURCE_DROP_TABLE.filter(
        (r) => L >= r.minMobLvl && L <= r.maxMobLvl
      );
    }
    if (pool.length === 0) continue;
    const row = pickWeightedResource(pool, false);
    if (!row) continue;
    const qty = rollInt(row.dropQtyMin, row.dropQtyMax);
    if (qty <= 0) continue;
    out.push({
      l2ItemId: row.l2ItemId,
      qty,
      spoil: false,
      label: labelForResource(row.l2ItemId),
    });
  }

  for (let i = 0; i < nSpoil; i++) {
    let tier = rollResourceTierVariant(L);
    let pool = eligibleForTierAndLevel(tier, L);
    if (pool.length === 0) {
      pool = eligibleForTierAndLevel(focusResourceTierFromMobLevel(L), L);
    }
    if (pool.length === 0) {
      pool = MOB_RESOURCE_DROP_TABLE.filter(
        (r) => L >= r.minMobLvl && L <= r.maxMobLvl
      );
    }
    if (pool.length === 0) continue;
    const row = pickWeightedResource(pool, true);
    if (!row) continue;
    const qty = rollInt(row.spoilQtyMin, row.spoilQtyMax);
    if (qty <= 0) continue;
    out.push({
      l2ItemId: row.l2ItemId,
      qty,
      spoil: true,
      label: labelForResource(row.l2ItemId),
    });
  }

  return out;
}

function spawnIdSeed32(spawnId: string): number {
  let h = 2166136261;
  const s = spawnId || '—';
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Детермінований RNG для прев’ю (один spawnId → стабільний спискок UI). */
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleInPlace<T>(arr: T[], rnd: () => number): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    const a = arr[i]!;
    arr[i] = arr[j]!;
    arr[j] = a;
  }
}

function shuffleSpawnRows(rows: MobResourceRow[], spawnId: string): MobResourceRow[] {
  const copy = rows.slice();
  const rnd = mulberry32(spawnIdSeed32(spawnId));
  shuffleInPlace(copy, rnd);
  return copy;
}

function catalogRowToDropEntry(
  row: MobResourceRow,
  mode: 'drop' | 'spoil'
): DropEntry {
  const name = labelForResource(row.l2ItemId);
  const spoil = mode === 'spoil';
  const pct = spoil ? row.spoilPct : row.dropPct;
  return {
    id: 'res_' + row.l2ItemId + '_' + mode,
    kind: 'resource',
    chance: pct / 100,
    min: spoil ? row.spoilQtyMin : row.dropQtyMin,
    max: spoil ? row.spoilQtyMax : row.dropQtyMax,
    chancePerMillion: Math.round(pct * 10_000),
    l2ItemId: row.l2ItemId,
    displayName: name,
  };
}

/**
 * Прев’ю для картки моба: різні набори для «Дроп» і «Спойл» (не дзеркало).
 * Перемішка й поділ залежать від spawnId — у мобів одного рівня списки відрізняються.
 */
export function resourceDropsForSpawnCatalog(
  mobLevel: number,
  spawnId: string
): {
  drops: DropEntry[];
  spoil: DropEntry[];
} {
  const L = Math.max(1, Math.floor(mobLevel));
  const eligible = MOB_RESOURCE_DROP_TABLE.filter(
    (row) => L >= row.minMobLvl && L <= row.maxMobLvl
  );
  if (eligible.length === 0) {
    return { drops: [], spoil: [] };
  }

  const shuffled = shuffleSpawnRows(eligible, spawnId);

  if (shuffled.length === 1) {
    const only = shuffled[0]!;
    if (only.dropPct >= only.spoilPct) {
      return { drops: [catalogRowToDropEntry(only, 'drop')], spoil: [] };
    }
    return { drops: [], spoil: [catalogRowToDropEntry(only, 'spoil')] };
  }

  const mid = Math.ceil(shuffled.length / 2);
  const dropRows = shuffled.slice(0, mid);
  const spoilRows = shuffled.slice(mid);
  return {
    drops: dropRows.map((r) => catalogRowToDropEntry(r, 'drop')),
    spoil: spoilRows.map((r) => catalogRowToDropEntry(r, 'spoil')),
  };
}
