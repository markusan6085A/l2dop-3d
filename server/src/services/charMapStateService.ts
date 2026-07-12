import type { Prisma } from '@prisma/client';
import { expSegmentForLevelBar, levelFromTotalExp } from '../data/l2dopExpgain.js';
import { resolveMapLocality } from '../data/mapLocalities.js';
import { resolveMapMovementPatch } from '../domain/mapMovement.js';
import { prisma } from '../lib/prisma.js';
import { getNearbyHeroesForMap } from './mapNearbyHeroesService.js';
import { buildMapNearbySpawnViews } from './mapNearbySpawnsQuery.js';
import { computePassiveHpRegenPatch } from './charPassiveRegen.js';
import type { CharacterRow } from './charTypes.js';
import {
  findPvpIncomingForCharacter,
  type PvpIncomingAttack,
} from './pvpIncomingService.js';
import { parsePvpPendingDefeat } from '../domain/pvpPendingDefeat.js';

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

/** Read-path: regen HP + рух по карті; без gearCatalog / інвентарних міграцій. */
export async function getCharacterMapStateForUser(
  userId: string
): Promise<CharacterMapStatePayload | null> {
  return prisma.$transaction(async (tx) => {
    const row = await tx.character.findFirst({
      where: { userId },
      orderBy: { lastUpdate: 'desc' },
    });
    if (!row) return null;

    const cr = row as CharacterRow;
    const nowMs = Date.now();
    const data: Prisma.CharacterUncheckedUpdateInput = {};

    const regenPatch = computePassiveHpRegenPatch(cr, nowMs);
    if (regenPatch.changed) {
      data.hp = regenPatch.nextHp;
    }

    const movePatch = resolveMapMovementPatch(cr, nowMs);
    if (movePatch.changed) {
      data.worldX = movePatch.data.worldX;
      data.worldY = movePatch.data.worldY;
      data.targetX = movePatch.data.targetX;
      data.targetY = movePatch.data.targetY;
      data.moveStartAt = movePatch.data.moveStartAt;
      data.moveFromX = movePatch.data.moveFromX;
      data.moveFromY = movePatch.data.moveFromY;
    }

    if (Object.keys(data).length === 0) {
      return mapStateFromRow(cr);
    }
    const next = (await tx.character.update({
      where: { id: cr.id },
      data,
    })) as CharacterRow;
    return mapStateFromRow(next);
  });
}

export interface MapSyncPayload {
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
}

/** Один poll для map.html: позиція + околиці + маркери (один spatial-запит). */
export async function getMapSyncForUser(userId: string): Promise<MapSyncPayload | null> {
  const row = await prisma.character.findFirst({
    where: { userId },
    orderBy: { lastUpdate: 'desc' },
    select: { id: true, mobSpawnHpJson: true, pvpPendingDefeatJson: true },
  });
  if (!row) return null;

  const mapState = await getCharacterMapStateForUser(userId);
  if (!mapState) return null;

  const nowMs = Date.now();
  const mobSpawnHpJson = row.mobSpawnHpJson;
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

  const { listEntries, markerEntries } = buildMapNearbySpawnViews(
    mapState.worldX,
    mapState.worldY,
    mobSpawnHpJson,
    nowMs
  );
  const locality = resolveMapLocality(mapState.worldX, mapState.worldY);
  const nearbyHeroes = await getNearbyHeroesForMap(
    mapState.worldX,
    mapState.worldY,
    mapState.id,
    nowMs
  );

  return {
    mapState,
    around: {
      ...locality,
      nearbySpawns: listEntries,
      nearbyHeroes,
    },
    spawns: markerEntries,
    pvpIncoming: await findPvpIncomingForCharacter(mapState.id),
    pvpDefeat,
  };
}
