import type { PartyBattleSession } from '@prisma/client';
import { DUNGEON_NEARBY_RADIUS_PX } from './dungeonNearbyMobsQuery.js';
import { resolveDungeonMovementPatch } from './dungeonMapMovement.js';
import { resolveDungeonMoveSpeedStatsForRow } from './dungeonRunSpeed.js';
import { parseDungeonStateJson, type DungeonStateV1 } from './dungeonState.js';
import type { CharacterRow } from '../services/charTypes.js';

export const DUNGEON_PARTY_BATTLE_RADIUS_PX = DUNGEON_NEARBY_RADIUS_PX;

export type ResolvedDungeonMapPosition = {
  dungeonId: string;
  mapX: number;
  mapY: number;
};

export function resolveLiveDungeonMapPosition(
  row: Pick<CharacterRow, 'dungeonStateJson' | 'race' | 'classBranch' | 'inventoryJson' | 'activeBuffsJson' | 'buffHeroicTier' | 'buffZealotStacks' | 'skillsLearnedJson' | 'l2Profession' | 'worldCombatStateJson' | 'exp' | 'level'>,
  nowMs: number = Date.now()
): ResolvedDungeonMapPosition | null {
  const state = parseDungeonStateJson(row.dungeonStateJson);
  if (!state) return null;
  const speed = resolveDungeonMoveSpeedStatsForRow(row as CharacterRow, nowMs);
  const live = resolveDungeonMovementPatch(state, speed.mapMoveSpeedPx, nowMs).state;
  return {
    dungeonId: live.dungeonId,
    mapX: live.mapX,
    mapY: live.mapY,
  };
}

export function isWithinDungeonPartyBattleRadius(
  charMapX: number,
  charMapY: number,
  mobMapX: number,
  mobMapY: number,
  radius: number = DUNGEON_PARTY_BATTLE_RADIUS_PX
): boolean {
  const dx = charMapX - mobMapX;
  const dy = charMapY - mobMapY;
  return dx * dx + dy * dy <= radius * radius;
}

export function isWithinDungeonMemberRadius(
  aMapX: number,
  aMapY: number,
  bMapX: number,
  bMapY: number,
  radius: number = DUNGEON_PARTY_BATTLE_RADIUS_PX
): boolean {
  return isWithinDungeonPartyBattleRadius(aMapX, aMapY, bMapX, bMapY, radius);
}

export function buildDungeonMovementStopState(
  live: DungeonStateV1
): DungeonStateV1 {
  return {
    ...live,
    targetMapX: 0,
    targetMapY: 0,
    moveStartAt: null,
    moveFromMapX: live.mapX,
    moveFromMapY: live.mapY,
    pathPts: [],
  };
}

/** Invariant: world sessions мають mobWorldX/Y; dungeon — mobMapX/Y + dungeonId. */
export function validatePartyBattleSessionCoords(
  session: Pick<
    PartyBattleSession,
    'playfield' | 'dungeonId' | 'mobWorldX' | 'mobWorldY' | 'mobMapX' | 'mobMapY'
  >
): void {
  if (session.playfield === 'world') {
    if (session.dungeonId != null) throw new Error('party_battle_invalid_session');
    if (session.mobWorldX == null || session.mobWorldY == null) {
      throw new Error('party_battle_invalid_session');
    }
    if (session.mobMapX != null || session.mobMapY != null) {
      throw new Error('party_battle_invalid_session');
    }
    return;
  }
  if (session.playfield === 'dungeon') {
    const did = String(session.dungeonId || '').trim();
    if (!did) throw new Error('party_battle_invalid_session');
    if (session.mobMapX == null || session.mobMapY == null) {
      throw new Error('party_battle_invalid_session');
    }
    if (session.mobWorldX != null || session.mobWorldY != null) {
      throw new Error('party_battle_invalid_session');
    }
    return;
  }
  throw new Error('party_battle_invalid_session');
}

export function assertDungeonSessionMatchesMob(
  session: Pick<PartyBattleSession, 'playfield' | 'dungeonId' | 'spawnId'>,
  dungeonMob: { dungeonId: string; id: string }
): void {
  if (session.playfield !== 'dungeon') throw new Error('party_battle_wrong_spawn');
  if (session.dungeonId !== dungeonMob.dungeonId) {
    throw new Error('party_battle_wrong_spawn');
  }
  if (session.spawnId !== dungeonMob.id) throw new Error('party_battle_wrong_spawn');
}
