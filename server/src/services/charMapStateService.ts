import type { Prisma } from '@prisma/client';
import { expSegmentForLevelBar, levelFromTotalExp } from '../data/l2dopExpgain.js';
import { resolveMapLocality } from '../data/mapLocalities.js';
import {
  MAP_CATALOG_VERSION,
  mapSyncHasChanges,
  mobSpawnHpPersonalSig,
} from '../domain/mapSyncVersion.js';
import { isWithinMapNearbyHeroRadius } from '../domain/mapNearbyRadius.js';
import { mammonRotationSig } from '../domain/mammonRotationSync.js';
import {
  getMammonMerchantState,
  type MammonMerchantStatePayload,
} from './mammonMerchantService.js';
import {
  getMammonBlacksmithState,
  type MammonBlacksmithStatePayload,
} from './mammonBlacksmithService.js';
import { prisma } from '../lib/prisma.js';
import { getNearbyHeroesForMap } from './mapNearbyHeroesService.js';
import { buildMapNearbySpawnViews } from './mapNearbySpawnsQuery.js';
import { applyCharacterReadView } from './charReadView.js';
import { ensureClanHallOnRow } from './charClientSnapshot.js';
import { toSnapshot } from './charSnapshotLogic.js';
import type { CharacterRow } from './charTypes.js';
import {
  findPvpIncomingForCharacter,
  type PvpIncomingAttack,
} from './pvpIncomingService.js';
import { parsePvpPendingDefeat, pvpPendingDefeatToClientSummary } from '../domain/pvpPendingDefeat.js';
import {
  parsePvePendingDefeat,
  pvePendingDefeatToSummary,
} from '../domain/pvePendingDefeat.js';
import {
  getDungeonEntranceAt,
  type DungeonEntrancePayload,
} from './sevenSignsDungeonService.js';
import { getMapRadiiConfig, type MapRadiiConfig } from '../domain/mapRadiiConfig.js';
import { isPartyBattleRewardDistributionReady } from '../domain/partyBattleFlags.js';
import {
  loadPartyMemberStatusEntries,
  partyNearbyMemberNames,
  resolveCharacterPlayfieldPosition,
  type PartyMemberStatusCharacterRow,
} from './party/partyMemberStatusReadService.js';

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

async function mapStateFromRow(row: CharacterRow): Promise<CharacterMapStatePayload> {
  const rowReady = await ensureClanHallOnRow(row);
  const snap = toSnapshot(rowReady);
  const expSeg = expSegmentForLevelBar(row.exp);
  return {
    id: row.id,
    revision: row.revision,
    worldX: row.worldX,
    worldY: row.worldY,
    targetX: row.targetX,
    targetY: row.targetY,
    level: levelFromTotalExp(row.exp),
    hp: snap.hp,
    maxHp: snap.maxHp,
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
    include: { clan: { select: { name: true, hallBlessingAt: true, level: true } } },
  });
  if (!row) return null;
  return mapStateFromRow(applyCharacterReadView(row as CharacterRow));
}

export interface MapSyncPayload {
  changed: boolean;
  mapCatalogVersion: number;
  personalMapSig: string;
  mammonRotationSig: string;
  revision: number;
  mapRadii: MapRadiiConfig;
  mapState: CharacterMapStatePayload;
  mammonMerchant: MammonMerchantStatePayload | null;
  mammonBlacksmith: MammonBlacksmithStatePayload | null;
  dungeonEntrance: DungeonEntrancePayload | null;
  around: ReturnType<typeof resolveMapLocality> & {
    nearbySpawns: ReturnType<typeof buildMapNearbySpawnViews>['listEntries'];
    nearbyHeroes: Awaited<ReturnType<typeof getNearbyHeroesForMap>>;
    partyNearbyMembers: { characterId: string; name: string }[];
  };
  spawns: ReturnType<typeof buildMapNearbySpawnViews>['markerEntries'];
  pvpIncoming: PvpIncomingAttack | null;
  pvpDefeat: import('../domain/pvpPendingDefeat.js').PvpDefeatClientSummary | null;
  pveDefeat: ReturnType<typeof pvePendingDefeatToSummary> | null;
}

export type MapSyncQuery = {
  mapCatalogVersion?: number;
  personalMapSig?: string;
  mammonRotationSig?: string;
  revision?: number;
};

function mammonStateIfNearby<
  T extends { current: { worldX: number; worldY: number } },
>(state: T, playerX: number, playerY: number): T | null {
  if (
    !isWithinMapNearbyHeroRadius(
      playerX,
      playerY,
      state.current.worldX,
      state.current.worldY
    )
  ) {
    return null;
  }
  return state;
}

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
  const mammonRotationSigVal = mammonRotationSig(nowMs);
  const mammonMerchant = mammonStateIfNearby(
    getMammonMerchantState(nowMs),
    mapState.worldX,
    mapState.worldY
  );
  const mammonBlacksmith = mammonStateIfNearby(
    getMammonBlacksmithState(nowMs),
    mapState.worldX,
    mapState.worldY
  );
  const dungeonEntrance = getDungeonEntranceAt(mapState.worldX, mapState.worldY);
  const changed = mapSyncHasChanges({
    clientMapCatalogVersion: query.mapCatalogVersion,
    clientPersonalMapSig: query.personalMapSig,
    clientMammonRotationSig: query.mammonRotationSig,
    clientRevision: query.revision,
    serverMapCatalogVersion: MAP_CATALOG_VERSION,
    serverPersonalMapSig: personalMapSig,
    serverMammonRotationSig: mammonRotationSigVal,
    serverRevision: mapState.revision,
  });

  const pendingDefeat = parsePvpPendingDefeat(row.pvpPendingDefeatJson);
  const pvpDefeat = pendingDefeat
    ? pvpPendingDefeatToClientSummary(pendingDefeat)
    : null;

  const pendingPveDefeat = parsePvePendingDefeat(row.pvePendingDefeatJson);
  const pveDefeat = pendingPveDefeat
    ? pvePendingDefeatToSummary(pendingPveDefeat)
    : null;

  const locality = resolveMapLocality(mapState.worldX, mapState.worldY);
  const mapRadii = getMapRadiiConfig();

  let partyContext: {
    memberIds: Set<string>;
    leaderCharacterId: string;
  } | null = null;
  let partyNearbyMembers: { characterId: string; name: string }[] = [];

  if (isPartyBattleRewardDistributionReady()) {
    const membership = await prisma.partyMember.findUnique({
      where: { characterId: mapState.id },
      select: {
        partyId: true,
        party: {
          select: {
            leaderCharacterId: true,
            members: { select: { characterId: true } },
          },
        },
      },
    });
    if (membership?.party) {
      partyContext = {
        memberIds: new Set(
          membership.party.members.map((m) => m.characterId)
        ),
        leaderCharacterId: membership.party.leaderCharacterId,
      };
      const viewerRow = await prisma.character.findUnique({
        where: { id: mapState.id },
        select: {
          worldX: true,
          worldY: true,
          targetX: true,
          targetY: true,
          moveStartAt: true,
          moveFromX: true,
          moveFromY: true,
          dungeonStateJson: true,
        },
      });
      if (viewerRow) {
        const viewerPlayfield = resolveCharacterPlayfieldPosition(
          viewerRow as unknown as PartyMemberStatusCharacterRow
        );
        const statusEntries = await loadPartyMemberStatusEntries(
          membership.partyId,
          mapState.id,
          viewerPlayfield
        );
        partyNearbyMembers = partyNearbyMemberNames(statusEntries, mapState.id);
      }
    }
  }

  const nearbyHeroes = await getNearbyHeroesForMap(
    mapState.worldX,
    mapState.worldY,
    mapState.id,
    nowMs,
    partyContext
  );
  const pvpIncoming = await findPvpIncomingForCharacter(mapState.id);

  if (!changed) {
    return {
      changed: false,
      mapCatalogVersion: MAP_CATALOG_VERSION,
      personalMapSig,
      mammonRotationSig: mammonRotationSigVal,
      revision: mapState.revision,
      mapRadii,
      mapState,
      mammonMerchant,
      mammonBlacksmith,
      dungeonEntrance,
      around: {
        ...locality,
        nearbySpawns: [],
        nearbyHeroes,
        partyNearbyMembers,
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
    mammonRotationSig: mammonRotationSigVal,
    revision: mapState.revision,
    mapRadii,
    mapState,
    mammonMerchant,
    mammonBlacksmith,
    dungeonEntrance,
    around: {
      ...locality,
      nearbySpawns: listEntries,
      nearbyHeroes,
      partyNearbyMembers,
    },
    spawns: markerEntries,
    pvpIncoming,
    pvpDefeat,
    pveDefeat,
  };
}
