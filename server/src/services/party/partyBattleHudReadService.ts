import { getWorldSpawnById } from '../../data/mapWorldSpawns.js';
import {
  getDungeonMobSpawnById,
} from '../../data/sevenSignsDungeonMobSpawns.js';
import {
  isPartyBattleRewardDistributionReady,
} from '../../domain/partyBattleFlags.js';
import {
  isWithinMobBattleRange,
  type PlayfieldPosition,
} from '../../domain/mapNearbyRadius.js';
import {
  isWithinDungeonPartyBattleRadius,
  resolveLiveDungeonMapPosition,
} from '../../domain/partyBattlePlayfield.js';
import {
  isPartyBattleSessionTerminal,
  PARTY_BATTLE_SESSION_STATE,
} from '../../domain/partyBattleSessionConstants.js';
import { parseBattleJson } from '../battleServiceParseBattleJson.js';
import { isSharedWorldBossKind } from '../../domain/worldBossSession.js';
import { parseDungeonStateJson } from '../../domain/dungeonState.js';
import { prisma } from '../../lib/prisma.js';
import type { PartyHudActiveBattle } from './partyTypes.js';
import {
  isCharacterDeadForPartyStatus,
  loadPartyMemberStatusEntries,
  resolveCharacterPlayfieldPosition,
  viewerHasNearbyPartyMember,
  PARTY_MEMBER_STATUS_CHARACTER_SELECT,
  type PartyMemberStatusCharacterRow,
} from './partyMemberStatusReadService.js';

export async function findActivePartyBattleSessionReadOnly(
  partyId: string
): Promise<{
  id: string;
  spawnId: string;
  mobHp: number;
  mobMaxHp: number;
  state: string;
  playfield: 'world' | 'dungeon';
  dungeonId: string | null;
  mobWorldX: number | null;
  mobWorldY: number | null;
  mobMapX: number | null;
  mobMapY: number | null;
} | null> {
  const pid = String(partyId || '').trim();
  if (!pid) return null;
  const session = await prisma.partyBattleSession.findFirst({
    where: {
      activePartyKey: pid,
      state: PARTY_BATTLE_SESSION_STATE.active,
    },
    select: {
      id: true,
      spawnId: true,
      mobHp: true,
      mobMaxHp: true,
      state: true,
      playfield: true,
      dungeonId: true,
      mobWorldX: true,
      mobWorldY: true,
      mobMapX: true,
      mobMapY: true,
    },
  });
  if (!session || isPartyBattleSessionTerminal(session.state)) return null;
  return session;
}

function viewerCanJoinPartyBattle(args: {
  viewerRow: PartyMemberStatusCharacterRow & {
    battleJson: unknown;
    race: string;
    classBranch: string;
    inventoryJson: unknown;
    exp: bigint;
    level: number;
  };
  session: NonNullable<Awaited<ReturnType<typeof findActivePartyBattleSessionReadOnly>>>;
  viewerPlayfield: PlayfieldPosition;
  viewerDungeon: ReturnType<typeof resolveLiveDungeonMapPosition> | null;
}): boolean {
  if (isCharacterDeadForPartyStatus(args.viewerRow)) return false;

  const bj = parseBattleJson(args.viewerRow.battleJson as import('@prisma/client').Prisma.JsonValue);
  if (bj?.partyBattleId === args.session.id) return false;
  if (bj) return false;

  if (args.session.playfield === 'dungeon') {
    const dState = parseDungeonStateJson(args.viewerRow.dungeonStateJson);
    if (!dState || dState.dungeonId !== args.session.dungeonId) return false;
    const dungeonMob = getDungeonMobSpawnById(args.session.spawnId);
    if (!dungeonMob || dungeonMob.kind === 'raid') return false;
    if (!args.viewerDungeon) return false;
    if (
      args.session.mobMapX == null ||
      args.session.mobMapY == null ||
      !isWithinDungeonPartyBattleRadius(
        args.viewerDungeon.mapX,
        args.viewerDungeon.mapY,
        args.session.mobMapX,
        args.session.mobMapY
      )
    ) {
      return false;
    }
    return true;
  }

  const spawn = getWorldSpawnById(args.session.spawnId);
  if (!spawn) return false;
  if (isSharedWorldBossKind(spawn.kind)) return false;
  if (parseDungeonStateJson(args.viewerRow.dungeonStateJson) != null) return false;

  if (
    args.session.mobWorldX == null ||
    args.session.mobWorldY == null ||
    !isWithinMobBattleRange(args.viewerPlayfield, {
      worldX: args.session.mobWorldX,
      worldY: args.session.mobWorldY,
    })
  ) {
    return false;
  }

  return true;
}

/** Read-only active battle DTO для party HUD / party page. */
export async function buildPartyHudActiveBattle(
  partyId: string,
  viewerCharacterId: string
): Promise<PartyHudActiveBattle | null> {
  if (!isPartyBattleRewardDistributionReady()) return null;

  const session = await findActivePartyBattleSessionReadOnly(partyId);
  if (!session) return null;

  const viewer = await prisma.character.findUnique({
    where: { id: viewerCharacterId },
    select: {
      ...PARTY_MEMBER_STATUS_CHARACTER_SELECT,
      battleJson: true,
      race: true,
      classBranch: true,
      inventoryJson: true,
      exp: true,
      level: true,
      activeBuffsJson: true,
      buffHeroicTier: true,
      buffZealotStacks: true,
      skillsLearnedJson: true,
      l2Profession: true,
      worldCombatStateJson: true,
    },
  });
  if (!viewer) return null;

  const viewerPlayfield = resolveCharacterPlayfieldPosition(
    viewer as unknown as PartyMemberStatusCharacterRow
  );
  const viewerDungeon = resolveLiveDungeonMapPosition(
    viewer as Parameters<typeof resolveLiveDungeonMapPosition>[0],
    Date.now()
  );
  const memberEntries = await loadPartyMemberStatusEntries(
    partyId,
    viewerCharacterId,
    viewerPlayfield
  );

  const memberNearby = viewerHasNearbyPartyMember(memberEntries, viewerCharacterId);

  let mobInBattleRange = false;
  if (session.playfield === 'dungeon') {
    mobInBattleRange =
      viewerDungeon != null &&
      session.mobMapX != null &&
      session.mobMapY != null &&
      isWithinDungeonPartyBattleRadius(
        viewerDungeon.mapX,
        viewerDungeon.mapY,
        session.mobMapX,
        session.mobMapY
      );
  } else if (session.mobWorldX != null && session.mobWorldY != null) {
    mobInBattleRange = isWithinMobBattleRange(viewerPlayfield, {
      worldX: session.mobWorldX,
      worldY: session.mobWorldY,
    });
  }

  const dungeonMob = getDungeonMobSpawnById(session.spawnId);
  const worldSpawn = getWorldSpawnById(session.spawnId);
  const mobName =
    dungeonMob?.name ?? worldSpawn?.name ?? 'Монстр';

  const canJoin = viewerCanJoinPartyBattle({
    viewerRow: viewer as PartyMemberStatusCharacterRow & {
      battleJson: unknown;
      race: string;
      classBranch: string;
      inventoryJson: unknown;
      exp: bigint;
      level: number;
    },
    session,
    viewerPlayfield,
    viewerDungeon,
  });

  return {
    partyBattleId: session.id,
    spawnId: session.spawnId,
    mobName,
    mobHp: session.mobHp,
    mobMaxHp: session.mobMaxHp,
    state: session.state,
    playfield: session.playfield,
    dungeonId: session.dungeonId,
    memberNearby,
    mobInBattleRange,
    canJoin,
  };
}
