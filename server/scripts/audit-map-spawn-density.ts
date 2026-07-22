/**
 * Read-only audit: щільність world spawns біля точок телепорту.
 * npm run audit:map-spawn-density
 */
import {
  MAP_NEARBY_LIST_RADIUS,
  MAP_WORLD_SPAWNS,
  stripSpawnDupSuffix,
  type MapSpawnKind,
  type MapWorldSpawn,
} from '../src/data/mapWorldSpawns.js';
import { MAP_TOWNS, type MapTownRef } from '../src/data/mapLocalities.js';

const REGULAR_KINDS: ReadonlySet<MapSpawnKind> = new Set([
  'passive',
  'aggressive',
  'neutral',
]);

const FEATURED_TELEPORT_IDS = [
  'gludio',
  'ant_nest',
  'dion',
  'giran',
  'dragon_valley',
  'aden',
  'goddard',
  'rune',
] as const;

type TownDensityRow = {
  town: MapTownRef;
  physicalTotal: number;
  uniqueBaseIds: number;
  byKind: Record<MapSpawnKind, number>;
  regularLevelMin: number | null;
  regularLevelMax: number | null;
};

function countNearTown(town: MapTownRef): TownDensityRow {
  const R = MAP_NEARBY_LIST_RADIUS;
  const R2 = R * R;
  const byKind: Record<MapSpawnKind, number> = {
    passive: 0,
    aggressive: 0,
    neutral: 0,
    champion: 0,
    raid: 0,
    epic: 0,
    epic_guard: 0,
    dungeon: 0,
  };
  const uniqueBases = new Set<string>();
  let regularLevelMin: number | null = null;
  let regularLevelMax: number | null = null;
  let physicalTotal = 0;

  for (const s of MAP_WORLD_SPAWNS) {
    const dx = s.worldX - town.worldX;
    const dy = s.worldY - town.worldY;
    if (dx * dx + dy * dy > R2) continue;
    physicalTotal += 1;
    byKind[s.kind] += 1;
    uniqueBases.add(stripSpawnDupSuffix(s.id));
    if (REGULAR_KINDS.has(s.kind)) {
      const lv = Math.floor(Number(s.level));
      if (Number.isFinite(lv) && lv >= 1) {
        if (regularLevelMin == null || lv < regularLevelMin) regularLevelMin = lv;
        if (regularLevelMax == null || lv > regularLevelMax) regularLevelMax = lv;
      }
    }
  }

  return {
    town,
    physicalTotal,
    uniqueBaseIds: uniqueBases.size,
    byKind,
    regularLevelMin,
    regularLevelMax,
  };
}

function fmtRow(row: TownDensityRow): void {
  const t = row.town;
  const k = row.byKind;
  console.log(
    [
      `- ${t.teleportId} (${t.labelUk})`,
      `  coords: (${t.worldX}, ${t.worldY})`,
      `  radius: ${MAP_NEARBY_LIST_RADIUS}`,
      `  physical spawns: ${row.physicalTotal}`,
      `  unique base ids: ${row.uniqueBaseIds}`,
      `  kinds: passive=${k.passive}, aggressive=${k.aggressive}, neutral=${k.neutral}, champion=${k.champion}, raid=${k.raid}, epic=${k.epic}, epic_guard=${k.epic_guard}, dungeon=${k.dungeon}`,
      `  regular mob levels: ${row.regularLevelMin ?? '—'} .. ${row.regularLevelMax ?? '—'}`,
    ].join('\n')
  );
}

function main(): void {
  console.log('=== MAP spawn density audit (read-only) ===\n');
  console.log(`MAP_WORLD_SPAWNS.length: ${MAP_WORLD_SPAWNS.length}`);
  console.log(`MAP_NEARBY_LIST_RADIUS: ${MAP_NEARBY_LIST_RADIUS}`);
  console.log(`MAP_TOWNS count: ${MAP_TOWNS.length}\n`);

  const rows = MAP_TOWNS.map(countNearTown);
  const uniqueCounts = rows.map((r) => r.uniqueBaseIds);
  const avgUnique =
    uniqueCounts.reduce((a, b) => a + b, 0) / Math.max(1, uniqueCounts.length);
  const minUnique = Math.min(...uniqueCounts);
  const maxUnique = Math.max(...uniqueCounts);

  console.log('--- Featured teleport zones ---');
  for (const teleportId of FEATURED_TELEPORT_IDS) {
    const row = rows.find((r) => r.town.teleportId === teleportId);
    if (!row) {
      console.log(`- ${teleportId}: NOT FOUND in MAP_TOWNS`);
      continue;
    }
    fmtRow(row);
    console.log('');
  }

  console.log('--- Aggregate (all MAP_TOWNS) ---');
  console.log(`Average unique base ids per teleport: ${avgUnique.toFixed(1)}`);
  console.log(`Minimum unique base ids: ${minUnique}`);
  console.log(`Maximum unique base ids: ${maxUnique}`);

  const byUniqueDesc = [...rows].sort((a, b) => b.uniqueBaseIds - a.uniqueBaseIds);
  const byUniqueAsc = [...rows].sort((a, b) => a.uniqueBaseIds - b.uniqueBaseIds);

  console.log('\n--- Top 10 overcrowded zones (unique base ids) ---');
  for (const row of byUniqueDesc.slice(0, 10)) {
    console.log(
      `  ${row.town.teleportId.padEnd(22)} ${String(row.uniqueBaseIds).padStart(5)} unique | ${String(row.physicalTotal).padStart(5)} physical | ${row.town.labelUk}`
    );
  }

  console.log('\n--- Top 10 sparse zones (unique base ids) ---');
  for (const row of byUniqueAsc.slice(0, 10)) {
    console.log(
      `  ${row.town.teleportId.padEnd(22)} ${String(row.uniqueBaseIds).padStart(5)} unique | ${String(row.physicalTotal).padStart(5)} physical | ${row.town.labelUk}`
    );
  }

  const physicalAvg =
    rows.reduce((a, r) => a + r.physicalTotal, 0) / Math.max(1, rows.length);
  console.log('\n--- Physical spawn totals ---');
  console.log(`Average physical spawns per teleport: ${physicalAvg.toFixed(1)}`);
  console.log(
    `Min physical: ${Math.min(...rows.map((r) => r.physicalTotal))}, max physical: ${Math.max(...rows.map((r) => r.physicalTotal))}`
  );
}

main();
