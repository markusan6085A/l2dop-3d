import { MAP_NEARBY_HERO_RADIUS } from '../data/mapWorldSpawns.js';
import { BATTLE_RANGE } from '../domain/battleTypes.js';
import { getEffectiveCharacterLevel } from '../domain/effectiveCharacterLevel.js';
import {
  resolveMapMovement,
  type MapMovementFields,
} from '../domain/mapMovement.js';
import {
  isSameCanonicalMapLocation,
  isWorldMapOpenPlayfield,
  resolveCanonicalMapLocation,
} from '../domain/mapPlayfieldContext.js';
import {
  canPkAttackHeroBattleState,
  resolveWorldPvpMapEligibility,
} from '../domain/worldPvpEligibility.js';
import { isCharacterVisibleOnWorldMap } from '../domain/mapHeroWorldVisibility.js';
import {
  resolvePvpNickColor,
  type PvpNickColor,
} from '../domain/pvpKarma.js';
import { prisma } from '../lib/prisma.js';
import {
  getPresenceCanonicalLocationKeyForCharacter,
  getPresencePlayfieldUiForCharacter,
  isCharacterOnlineNow,
} from './onlinePresenceService.js';
import { parseBattleJson } from './battleServiceParseBattleJson.js';
import { parsePvePendingDefeat } from '../domain/pvePendingDefeat.js';
import { isPvpTargetUnavailableForWorldPk } from '../domain/pvpPendingDefeat.js';

/** Герой у радіусі обзору карти (як nearbySpawns для мобів). */
export interface NearbyHeroEntry {
  characterId: string;
  name: string;
  level: number;
  worldX: number;
  worldY: number;
  distance: number;
  /** У радіусі атаки (BATTLE_RANGE). */
  inBattleRange: boolean;
  inBattle: boolean;
  /** Ціль не зайнята несумісним бою (для PK eligibility). */
  canPkAttack: boolean;
  /** Показати кнопку [PK] на world map (server-authoritative). */
  showPkButton: boolean;
  /** PvP дозволено в поточній локації переглядача. */
  pvpAllowed: boolean;
  pvpEligibilityCode: string | null;
  pvpBlockedReasonUk: string | null;
  /** Нік відкриває профіль (коли [PK] приховано). */
  profileOnNameClick: boolean;
  /** Canonical location key for PK rules (`world:<teleportId>`). */
  targetLocationKey: string;
  /** Viewer level used for level-diff eligibility (map HUD level). */
  viewerLevelUsed: number;
  /** Parsed active battle blocks world PK (PvE/RB/party, not raw JSON noise). */
  activeBattle: boolean;
  /** Колір ніка: default | aggressor | pk */
  pvpNickColor: PvpNickColor;
  clanEmblemId: number | null;
  isOnline: boolean;
  gender: string;
  l2Profession: string;
  /** Карма > 0 — для маркера PK. */
  pk: number;
  /** Член поточної паті viewer. */
  isPartyMember?: boolean;
  isPartyLeader?: boolean;
}

export type NearbyHeroesPartyContext = {
  memberIds: Set<string>;
  leaderCharacterId: string;
};

const MAX_NEARBY_HEROES = 50;

const HERO_MAP_SELECT = {
  id: true,
  name: true,
  exp: true,
  worldX: true,
  worldY: true,
  targetX: true,
  targetY: true,
  moveStartAt: true,
  moveFromX: true,
  moveFromY: true,
  race: true,
  classBranch: true,
  inventoryJson: true,
  l2Profession: true,
  gender: true,
  battleJson: true,
  karma: true,
  pvpAggressorUntilMs: true,
  hp: true,
  pvpPendingDefeatJson: true,
  pvePendingDefeatJson: true,
  cityId: true,
  dungeonStateJson: true,
  activeBuffsJson: true,
  buffHeroicTier: true,
  buffZealotStacks: true,
  skillsLearnedJson: true,
  worldCombatStateJson: true,
  clan: { select: { emblemId: true } },
} as const;

type HeroMapRow = MapMovementFields & {
  id: string;
  name: string;
  exp: bigint;
  l2Profession: string;
  gender: string;
  battleJson: unknown;
  karma: number;
  pvpAggressorUntilMs: bigint;
  hp: number;
  pvpPendingDefeatJson: unknown;
  pvePendingDefeatJson: unknown;
  cityId: string;
  dungeonStateJson: unknown;
  clan?: { emblemId: number | null } | null;
};

/** Read-only: онлайн-герої в тій самій canonical world location + червоний радіус. */
export async function getNearbyHeroesForMap(
  worldX: number,
  worldY: number,
  excludeCharacterId: string,
  nowMs: number = Date.now(),
  partyContext: NearbyHeroesPartyContext | null = null,
  viewerDungeonStateJson?: unknown | null,
  /** Canonical viewer level (map HUD / snapshot); avoids stale level column vs exp drift. */
  viewerLevelOverride?: number
): Promise<NearbyHeroEntry[]> {
  const R = MAP_NEARBY_HERO_RADIUS;
  const R2 = R * R;
  const exclude = String(excludeCharacterId || '').trim();
  if (!exclude) return [];

  const viewerLoc = resolveCanonicalMapLocation({
    worldX,
    worldY,
    dungeonStateJson: viewerDungeonStateJson,
  });
  if (!isWorldMapOpenPlayfield(viewerLoc)) return [];

  let viewerLevel =
    viewerLevelOverride != null &&
    Number.isFinite(Number(viewerLevelOverride)) &&
    Number(viewerLevelOverride) >= 1
      ? Math.floor(Number(viewerLevelOverride))
      : 1;
  if (viewerLevelOverride == null) {
    const viewerRow = await prisma.character.findUnique({
      where: { id: exclude },
      select: { exp: true },
    });
    viewerLevel = viewerRow ? getEffectiveCharacterLevel(viewerRow.exp) : 1;
  }

  const rows = await prisma.character.findMany({
    where: {
      id: { not: exclude },
      worldX: { gte: worldX - R, lte: worldX + R },
      worldY: { gte: worldY - R, lte: worldY + R },
    },
    select: HERO_MAP_SELECT,
    take: 200,
  });

  const candidates: NearbyHeroEntry[] = [];
  for (const raw of rows) {
    const row = raw as unknown as HeroMapRow;
    const moved = resolveMapMovement(row);
    const hx = moved.worldX;
    const hy = moved.worldY;
    const dx = hx - worldX;
    const dy = hy - worldY;
    if (dx * dx + dy * dy > R2) continue;

    const targetLoc = resolveCanonicalMapLocation({
      worldX: hx,
      worldY: hy,
      dungeonStateJson: row.dungeonStateJson,
    });
    if (!isWorldMapOpenPlayfield(targetLoc)) continue;
    if (!isSameCanonicalMapLocation(viewerLoc, targetLoc)) continue;

    const presenceLocKey = getPresenceCanonicalLocationKeyForCharacter(row.id);
    if (presenceLocKey && presenceLocKey !== targetLoc.key) {
      continue;
    }

    if (getPresencePlayfieldUiForCharacter(row.id) === 'city') {
      continue;
    }

    if (
      !isCharacterVisibleOnWorldMap({
        worldX: hx,
        worldY: hy,
        dungeonStateJson: row.dungeonStateJson,
      })
    ) {
      continue;
    }

    if (!isCharacterOnlineNow(row.id)) continue;
    if (isPvpTargetUnavailableForWorldPk(row)) continue;
    if (parsePvePendingDefeat(row.pvePendingDefeatJson)) continue;

    const d = Math.hypot(dx, dy);
    const karma = Math.max(0, Math.floor(Number(row.karma) || 0));
    const pvpNickColor = resolvePvpNickColor(
      karma,
      row.pvpAggressorUntilMs,
      nowMs
    );
    const targetBj = row.battleJson ? parseBattleJson(row.battleJson) : null;
    const pkAllowed = canPkAttackHeroBattleState(targetBj, exclude);
    const isPartyMember =
      partyContext != null && partyContext.memberIds.has(row.id);
    const isPartyLeader =
      isPartyMember && partyContext!.leaderCharacterId === row.id;
    const inBattleRange = d <= BATTLE_RANGE;
    const online = isCharacterOnlineNow(row.id);
    const targetLevel = getEffectiveCharacterLevel(row.exp);
    const eligibility = resolveWorldPvpMapEligibility({
      viewerLocation: viewerLoc,
      targetLocation: targetLoc,
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
      worldX: hx,
      worldY: hy,
      distance: Math.round(d),
      inBattleRange,
      inBattle: targetBj != null,
      canPkAttack: pkAllowed,
      showPkButton: eligibility.showPkButton === true,
      pvpAllowed: viewerLoc.pvpAllowed,
      pvpEligibilityCode: eligibility.pvpEligibilityCode,
      pvpBlockedReasonUk: eligibility.pvpBlockedReasonUk,
      profileOnNameClick: eligibility.profileOnNameClick === true,
      targetLocationKey: targetLoc.key,
      viewerLevelUsed: viewerLevel,
      activeBattle: targetBj != null,
      pvpNickColor,
      clanEmblemId: row.clan?.emblemId ?? null,
      isOnline: online,
      gender: row.gender || 'male',
      l2Profession: row.l2Profession || '',
      pk: karma > 0 ? karma : 0,
      isPartyMember,
      isPartyLeader,
    });
  }

  candidates.sort((a, b) => a.distance - b.distance);
  return candidates.slice(0, MAX_NEARBY_HEROES);
}
