import { getWorldSpawnById } from '../../data/mapWorldSpawns.js';
import {
  isPartyBattleRewardDistributionReady,
} from '../../domain/partyBattleFlags.js';
import {
  isWithinMobBattleRange,
  type PlayfieldPosition,
} from '../../domain/mapNearbyRadius.js';
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
  mobWorldX: number;
  mobWorldY: number;
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
      mobWorldX: true,
      mobWorldY: true,
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
  };
  sessionId: string;
  spawnId: string;
  mobWorldX: number;
  mobWorldY: number;
  viewerPlayfield: PlayfieldPosition;
}): boolean {
  if (isCharacterDeadForPartyStatus(args.viewerRow)) return false;
  if (parseDungeonStateJson(args.viewerRow.dungeonStateJson) != null) return false;

  const spawn = getWorldSpawnById(args.spawnId);
  if (!spawn) return false;
  if (isSharedWorldBossKind(spawn.kind)) return false;

  if (
    !isWithinMobBattleRange(args.viewerPlayfield, {
      worldX: args.mobWorldX,
      worldY: args.mobWorldY,
    })
  ) {
    return false;
  }

  const bj = parseBattleJson(args.viewerRow.battleJson as import('@prisma/client').Prisma.JsonValue);
  if (bj) {
    if (bj.partyBattleId === args.sessionId) return false;
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
    },
  });
  if (!viewer) return null;

  const viewerPlayfield = resolveCharacterPlayfieldPosition(
    viewer as unknown as PartyMemberStatusCharacterRow
  );
  const memberEntries = await loadPartyMemberStatusEntries(
    partyId,
    viewerCharacterId,
    viewerPlayfield
  );

  const memberNearby = viewerHasNearbyPartyMember(memberEntries, viewerCharacterId);
  const mobInBattleRange = isWithinMobBattleRange(viewerPlayfield, {
    worldX: session.mobWorldX,
    worldY: session.mobWorldY,
  });

  const spawn = getWorldSpawnById(session.spawnId);
  const mobName = spawn?.name ?? 'Монстр';

  const canJoin = viewerCanJoinPartyBattle({
    viewerRow: viewer as PartyMemberStatusCharacterRow & {
      battleJson: unknown;
      race: string;
      classBranch: string;
    },
    sessionId: session.id,
    spawnId: session.spawnId,
    mobWorldX: session.mobWorldX,
    mobWorldY: session.mobWorldY,
    viewerPlayfield,
  });

  return {
    partyBattleId: session.id,
    spawnId: session.spawnId,
    mobName,
    mobHp: session.mobHp,
    mobMaxHp: session.mobMaxHp,
    state: session.state,
    memberNearby,
    mobInBattleRange,
    canJoin,
  };
}
