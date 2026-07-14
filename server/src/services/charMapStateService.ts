import type { Prisma } from '@prisma/client';
import { expSegmentForLevelBar, levelFromTotalExp } from '../data/l2dopExpgain.js';
import { resolveMapLocality } from '../data/mapLocalities.js';
import {
  MAP_CATALOG_VERSION,
  mapSyncHasChanges,
  mobSpawnHpPersonalSig,
} from '../domain/mapSyncVersion.js';
import { prisma } from '../lib/prisma.js';
import { getNearbyHeroesForMap } from './mapNearbyHeroesService.js';
import { buildMapNearbySpawnViews } from './mapNearbySpawnsQuery.js';
import { applyCharacterReadView } from './charReadView.js';
import type { CharacterRow } from './charTypes.js';
import {
  findPvpIncomingForCharacter,
  type PvpIncomingAttack,
} from './pvpIncomingService.js';
import { parsePvpPendingDefeat } from '../domain/pvpPendingDefeat.js';
import {
  parsePvePendingDefeat,
  pvePendingDefeatToSummary,
} from '../domain/pvePendingDefeat.js';

/** Легкий зріз для карти / HUD (без інвентаря й каталогів). */
export interface CharacterMapStatePayload {
  id: string;
  revision: number;
  worldX: number;
  worldY: number;
  targetX: number;
  targetY: number;
  level: number;
  hp: number;
  maxHp: number;
  expBarCur: string;
  expBarMax: string;
  expBarPct: number;
  name: string;
}

function mapStateFromRow(row: CharacterRow): CharacterMapStatePayload {
  const expSeg = expSegmentForLevelBar(row.exp);
  return {
    id: row.id,
    revision: row.revision,
    worldX: row.worldX,
    worldY: row.worldY,
    targetX: row.targetX,
    targetY: row.targetY,
    level: levelFromTotalExp(row.exp),
    hp: row.hp,
    maxHp: row.maxHp,
    expBarCur: expSeg.cur.toString(),
    expBarMax: expSeg.max.toString(),
    expBarPct: expSeg.pct,
    name: row.name,
  };
}

/** Read-path: regen HP + рух по карті в пам’яті; без write у БД. */
export async function getCharacterMapStateForUser(
  userId: string
): Promise<CharacterMapStatePayload | null> {
  const row = await prisma.character.findFirst({
    where: { userId },
    orderBy: { lastUpdate: 'desc' },
  });
  if (!row) return null;
  return mapStateFromRow(applyCharacterReadView(row as CharacterRow));
}

export interface MapSyncPayload {
  changed: boolean;
  mapCatalogVersion: number;
  personalMapSig: string;
  revision: number;
  mapState: CharacterMapStatePayload;
  around: ReturnType<typeof resolveMapLocality> & {
    nearbySpawns: ReturnType<typeof buildMapNearbySpawnViews>['listEntries'];
    nearbyHeroes: Awaited<ReturnType<typeof getNearbyHeroesForMap>>;
  };
  spawns: ReturnType<typeof buildMapNearbySpawnViews>['markerEntries'];
  pvpIncoming: PvpIncomingAttack | null;
  pvpDefeat: {
    killerName: string;
    killerCharacterId: string;
    fullLog?: string[];
  } | null;
  pveDefeat: ReturnType<typeof pvePendingDefeatToSummary> | null;
}

export type MapSyncQuery = {
  mapCatalogVersion?: number;
  personalMapSig?: string;
  revision?: number;
};

/** Один poll для map.html: позиція + околиці + маркери (один spatial-запит). */
export async function getMapSyncForUser(
  userId: string,
  query: MapSyncQuery = {}
): Promise<MapSyncPayload | null> {
  const row = (await prisma.character.findFirst({
    where: { userId },
    orderBy: { lastUpdate: 'desc' },
    select: {
      id: true,
      mobSpawnHpJson: true,
      pvpPendingDefeatJson: true,
      pvePendingDefeatJson: true,
    } as Prisma.CharacterSelect,
  })) as {
    id: string;
    mobSpawnHpJson: unknown;
    pvpPendingDefeatJson: unknown;
    pvePendingDefeatJson: unknown;
  } | null;
  if (!row) return null;

  const mapState = await getCharacterMapStateForUser(userId);
  if (!mapState) return null;

  const nowMs = Date.now();
  const mobSpawnHpJson = row.mobSpawnHpJson;
  const personalMapSig = mobSpawnHpPersonalSig(mobSpawnHpJson, nowMs);
  const changed = mapSyncHasChanges({
    clientMapCatalogVersion: query.mapCatalogVersion,
    clientPersonalMapSig: query.personalMapSig,
    clientRevision: query.revision,
    serverMapCatalogVersion: MAP_CATALOG_VERSION,
    serverPersonalMapSig: personalMapSig,
    serverRevision: mapState.revision,
  });

  const pendingDefeat = parsePvpPendingDefeat(row.pvpPendingDefeatJson);
  const pvpDefeat = pendingDefeat
    ? {
        killerName: pendingDefeat.killerName,
        killerCharacterId: pendingDefeat.killerCharacterId,
        ...(pendingDefeat.fullLog && pendingDefeat.fullLog.length > 0
          ? { fullLog: pendingDefeat.fullLog }
          : {}),
      }
    : null;

  const pendingPveDefeat = parsePvePendingDefeat(row.pvePendingDefeatJson);
  const pveDefeat = pendingPveDefeat
    ? pvePendingDefeatToSummary(pendingPveDefeat)
    : null;

  const locality = resolveMapLocality(mapState.worldX, mapState.worldY);
  const nearbyHeroes = await getNearbyHeroesForMap(
    mapState.worldX,
    mapState.worldY,
    mapState.id,
    nowMs
  );
  const pvpIncoming = await findPvpIncomingForCharacter(mapState.id);

  if (!changed) {
    return {
      changed: false,
      mapCatalogVersion: MAP_CATALOG_VERSION,
      personalMapSig,
      revision: mapState.revision,
      mapState,
      around: {
        ...locality,
        nearbySpawns: [],
        nearbyHeroes,
      },
      spawns: [],
      pvpIncoming,
      pvpDefeat,
      pveDefeat,
    };
  }

  const { listEntries, markerEntries } = buildMapNearbySpawnViews(
    mapState.worldX,
    mapState.worldY,
    mobSpawnHpJson,
    nowMs
  );

  return {
    changed: true,
    mapCatalogVersion: MAP_CATALOG_VERSION,
    personalMapSig,
    revision: mapState.revision,
    mapState,
    around: {
      ...locality,
      nearbySpawns: listEntries,
      nearbyHeroes,
    },
    spawns: markerEntries,
    pvpIncoming,
    pvpDefeat,
    pveDefeat,
  };
}
