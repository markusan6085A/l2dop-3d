import { Prisma } from '@prisma/client';
import { DUNGEON_NEARBY_RADIUS_PX } from '../domain/dungeonNearbyMobsQuery.js';
import { resolveDungeonMovementPatch } from '../domain/dungeonMapMovement.js';
import { parseDungeonStateJson } from '../domain/dungeonState.js';
import { resolveDungeonMoveSpeedStatsForRow } from '../domain/dungeonRunSpeed.js';
import { getEffectiveCharacterLevel } from '../domain/effectiveCharacterLevel.js';
import {
  resolvePvpNickColor,
  type PvpNickColor,
} from '../domain/pvpKarma.js';
import {
  canPkAttackHeroBattleState,
  resolveWorldPvpMapEligibility,
} from '../domain/worldPvpEligibility.js';
import { resolveDungeonCanonicalLocation } from '../domain/mapPlayfieldContext.js';
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
  showPkButton: boolean;
  pvpAllowed: boolean;
  pvpEligibilityCode: string | null;
  pvpBlockedReasonUk: string | null;
  profileOnNameClick: boolean;
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

  const viewerLoc = resolveDungeonCanonicalLocation(key);

  const viewerRow = await prisma.character.findUnique({
    where: { id: exclude },
    select: { exp: true },
  });
  const viewerLevel = viewerRow
    ? getEffectiveCharacterLevel(viewerRow.exp)
    : 1;

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
    const targetBj = row.battleJson ? parseBattleJson(row.battleJson) : null;
    const pkAllowed = canPkAttackHeroBattleState(targetBj, exclude);
    const isPartyMember = partyMemberIds.has(row.id);
    const inBattleRange = d <= R;
    const online = isCharacterOnlineNow(row.id);
    const targetLevel = getEffectiveCharacterLevel(row.exp);
    const eligibility = resolveWorldPvpMapEligibility({
      viewerLocation: viewerLoc,
      targetLocation: viewerLoc,
      viewerLevel,
      targetLevel,
      targetIsPartyMember: isPartyMember,
      inBattleRange,
      targetOnline: online,
      targetCanPkAttack: pkAllowed,
    });

    candidates.push({
      characterId: row.id,
      name: row.name,
      level: targetLevel,
      mapX: hx,
      mapY: hy,
      distance: Math.round(d),
      inBattleRange,
      inBattle: row.battleJson != null,
      canPkAttack: pkAllowed,
      showPkButton: eligibility.showPkButton,
      pvpAllowed: viewerLoc.pvpAllowed,
      pvpEligibilityCode: eligibility.pvpEligibilityCode,
      pvpBlockedReasonUk: eligibility.pvpBlockedReasonUk,
      profileOnNameClick: eligibility.profileOnNameClick,
      pvpNickColor,
      pk: karma > 0 ? karma : 0,
      isPartyMember,
      isPartyLeader: partyLeaderId === row.id,
    });
  }

  candidates.sort((a, b) => a.distance - b.distance);
  return candidates.slice(0, MAX_NEARBY_HEROES);
}
