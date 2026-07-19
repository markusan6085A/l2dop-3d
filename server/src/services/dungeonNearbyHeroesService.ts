import { Prisma } from '@prisma/client';
import { isPvpBattleJson } from '../domain/battlePvpContext.js';
import { DUNGEON_NEARBY_RADIUS_PX } from '../domain/dungeonNearbyMobsQuery.js';
import { resolveDungeonMovementPatch } from '../domain/dungeonMapMovement.js';
import { parseDungeonStateJson } from '../domain/dungeonState.js';
import { resolveDungeonMoveSpeedStatsForRow } from '../domain/dungeonRunSpeed.js';
import { getEffectiveCharacterLevel } from '../domain/effectiveCharacterLevel.js';
import {
  resolvePvpNickColor,
  type PvpNickColor,
} from '../domain/pvpKarma.js';
import { parsePvePendingDefeat } from '../domain/pvePendingDefeat.js';
import { parsePvpPendingDefeat } from '../domain/pvpPendingDefeat.js';
import { prisma } from '../lib/prisma.js';
import { parseBattleJson } from './battleServiceParseBattleJson.js';
import { isCharacterOnlineNow } from './onlinePresenceService.js';
import type { CharacterRow } from './charTypes.js';

export interface DungeonNearbyHeroEntry {
  characterId: string;
  name: string;
  level: number;
  mapX: number;
  mapY: number;
  distance: number;
  inBattleRange: boolean;
  inBattle: boolean;
  canPkAttack: boolean;
  pvpNickColor: PvpNickColor;
  pk: number;
  isPartyMember?: boolean;
  isPartyLeader?: boolean;
}

const MAX_NEARBY_HEROES = 30;

const DUNGEON_HERO_SELECT = {
  id: true,
  name: true,
  exp: true,
  dungeonStateJson: true,
  battleJson: true,
  karma: true,
  pvpAggressorUntilMs: true,
  hp: true,
  pvpPendingDefeatJson: true,
  pvePendingDefeatJson: true,
  race: true,
  classBranch: true,
  inventoryJson: true,
  activeBuffsJson: true,
  buffHeroicTier: true,
  buffZealotStacks: true,
  skillsLearnedJson: true,
  worldCombatStateJson: true,
} as const;

type DungeonHeroRow = Pick<
  CharacterRow,
  | 'id'
  | 'name'
  | 'exp'
  | 'dungeonStateJson'
  | 'battleJson'
  | 'karma'
  | 'pvpAggressorUntilMs'
  | 'hp'
  | 'pvpPendingDefeatJson'
  | 'pvePendingDefeatJson'
>;

function canPkAttackHero(row: DungeonHeroRow, viewerCharacterId: string): boolean {
  if (!row.battleJson) return true;
  const bj = parseBattleJson(row.battleJson);
  if (!bj) return false;
  if (!isPvpBattleJson(bj)) return true;
  return bj.pvpTargetCharacterId === viewerCharacterId;
}

/** Read-only: інші гравці в тому ж подземеллі в радіусі DUNGEON_NEARBY_RADIUS_PX. */
export async function getNearbyHeroesForDungeon(
  dungeonId: string,
  viewerMapX: number,
  viewerMapY: number,
  excludeCharacterId: string,
  nowMs: number = Date.now()
): Promise<DungeonNearbyHeroEntry[]> {
  const key = String(dungeonId || '').trim();
  const exclude = String(excludeCharacterId || '').trim();
  if (!key || !exclude) return [];

  const R = DUNGEON_NEARBY_RADIUS_PX;
  const R2 = R * R;

  const viewerMembership = await prisma.partyMember.findUnique({
    where: { characterId: exclude },
    select: {
      partyId: true,
      party: { select: { leaderCharacterId: true } },
    },
  });
  const partyMemberIds = new Set<string>();
  let partyLeaderId = '';
  if (viewerMembership?.partyId) {
    partyLeaderId = viewerMembership.party.leaderCharacterId;
    const members = await prisma.partyMember.findMany({
      where: { partyId: viewerMembership.partyId },
      select: { characterId: true },
    });
    for (const m of members) partyMemberIds.add(m.characterId);
  }

  const rows = await prisma.character.findMany({
    where: {
      id: { not: exclude },
      dungeonStateJson: { not: Prisma.DbNull },
    },
    select: DUNGEON_HERO_SELECT,
    take: 400,
  });

  const candidates: DungeonNearbyHeroEntry[] = [];
  for (const raw of rows) {
    const row = raw as unknown as DungeonHeroRow;
    const state = parseDungeonStateJson(row.dungeonStateJson);
    if (!state || state.dungeonId !== key) continue;
    if (!isCharacterOnlineNow(row.id)) continue;
    if (Math.max(0, Math.floor(Number(row.hp) || 0)) <= 0) continue;
    if (parsePvpPendingDefeat(row.pvpPendingDefeatJson)) continue;
    if (parsePvePendingDefeat(row.pvePendingDefeatJson)) continue;

    const speed = resolveDungeonMoveSpeedStatsForRow(row as CharacterRow, nowMs);
    const live = resolveDungeonMovementPatch(
      state,
      speed.mapMoveSpeedPx,
      nowMs
    ).state;
    const hx = live.mapX;
    const hy = live.mapY;
    const dx = hx - viewerMapX;
    const dy = hy - viewerMapY;
    if (dx * dx + dy * dy > R2) continue;

    const d = Math.hypot(dx, dy);
    const karma = Math.max(0, Math.floor(Number(row.karma) || 0));
    const pvpNickColor = resolvePvpNickColor(
      karma,
      row.pvpAggressorUntilMs,
      nowMs
    );
    candidates.push({
      characterId: row.id,
      name: row.name,
      level: getEffectiveCharacterLevel(row.exp),
      mapX: hx,
      mapY: hy,
      distance: Math.round(d),
      inBattleRange: d <= R,
      inBattle: row.battleJson != null,
      canPkAttack: canPkAttackHero(row, exclude),
      pvpNickColor,
      pk: karma > 0 ? karma : 0,
      isPartyMember: partyMemberIds.has(row.id),
      isPartyLeader: partyLeaderId === row.id,
    });
  }

  candidates.sort((a, b) => a.distance - b.distance);
  return candidates.slice(0, MAX_NEARBY_HEROES);
}
