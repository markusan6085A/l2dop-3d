import { resolveMapMovement, type MapMovementFields } from '../../domain/mapMovement.js';
import {
  isSameWorldPlayfield,
  isWithinPlayerVisibilityRadius,
  type PlayfieldPosition,
} from '../../domain/mapNearbyRadius.js';
import {
  isWithinDungeonMemberRadius,
  resolveLiveDungeonMapPosition,
} from '../../domain/partyBattlePlayfield.js';
import { parseDungeonStateJson } from '../../domain/dungeonState.js';
import { parsePvePendingDefeat } from '../../domain/pvePendingDefeat.js';
import { parsePvpPendingDefeat } from '../../domain/pvpPendingDefeat.js';
import { prisma } from '../../lib/prisma.js';
import { isCharacterOnlineNow } from '../onlinePresenceService.js';

export const PARTY_MEMBER_STATUS_CHARACTER_SELECT = {
  id: true,
  name: true,
  worldX: true,
  worldY: true,
  targetX: true,
  targetY: true,
  moveStartAt: true,
  moveFromX: true,
  moveFromY: true,
  dungeonStateJson: true,
  hp: true,
  pvePendingDefeatJson: true,
  pvpPendingDefeatJson: true,
} as const;

export type PartyMemberStatusCharacterRow = MapMovementFields & {
  id: string;
  name: string;
  dungeonStateJson: unknown;
  hp: number;
  pvePendingDefeatJson: unknown;
  pvpPendingDefeatJson: unknown;
};

export type PartyMemberStatusEntry = {
  characterId: string;
  name: string;
  playfield: PlayfieldPosition;
  online: boolean;
  dead: boolean;
  nearby: boolean;
};

export function isCharacterDeadForPartyStatus(row: {
  hp: number;
  pvePendingDefeatJson: unknown;
  pvpPendingDefeatJson: unknown;
}): boolean {
  if (Math.max(0, Math.floor(Number(row.hp) || 0)) <= 0) return true;
  if (parsePvePendingDefeat(row.pvePendingDefeatJson)) return true;
  if (parsePvpPendingDefeat(row.pvpPendingDefeatJson)) return true;
  return false;
}

export function resolveCharacterPlayfieldPosition(
  row: PartyMemberStatusCharacterRow
): PlayfieldPosition {
  const moved = resolveMapMovement(row);
  return {
    worldX: moved.worldX,
    worldY: moved.worldY,
    dungeonStateJson: row.dungeonStateJson,
  };
}

export function isMemberNearbyToViewer(
  viewer: PlayfieldPosition,
  member: PlayfieldPosition,
  viewerDungeon?: ReturnType<typeof resolveLiveDungeonMapPosition> | null,
  memberDungeon?: ReturnType<typeof resolveLiveDungeonMapPosition> | null
): boolean {
  const viewerDungeonState = parseDungeonStateJson(viewer.dungeonStateJson);
  const memberDungeonState = parseDungeonStateJson(member.dungeonStateJson);
  if (viewerDungeonState && memberDungeonState) {
    if (viewerDungeonState.dungeonId !== memberDungeonState.dungeonId) {
      return false;
    }
    const v = viewerDungeon ?? null;
    const m = memberDungeon ?? null;
    if (!v || !m) return false;
    return isWithinDungeonMemberRadius(v.mapX, v.mapY, m.mapX, m.mapY);
  }
  if (!isSameWorldPlayfield(viewer, member)) return false;
  return isWithinPlayerVisibilityRadius(viewer, member);
}

const DUNGEON_LIVE_SELECT = {
  ...PARTY_MEMBER_STATUS_CHARACTER_SELECT,
  race: true,
  classBranch: true,
  inventoryJson: true,
  activeBuffsJson: true,
  buffHeroicTier: true,
  buffZealotStacks: true,
  skillsLearnedJson: true,
  l2Profession: true,
  worldCombatStateJson: true,
  exp: true,
  level: true,
} as const;

type DungeonLiveCharacterRow = PartyMemberStatusCharacterRow & {
  race: string;
  classBranch: string;
  inventoryJson: unknown;
  activeBuffsJson?: unknown;
  buffHeroicTier?: number | null;
  buffZealotStacks?: number | null;
  skillsLearnedJson?: unknown;
  l2Profession?: string;
  worldCombatStateJson?: unknown;
  exp: bigint;
  level: number;
};

function resolveDungeonLiveForStatusRow(
  row: DungeonLiveCharacterRow,
  nowMs: number = Date.now()
): ReturnType<typeof resolveLiveDungeonMapPosition> | null {
  return resolveLiveDungeonMapPosition(row as import('../charTypes.js').CharacterRow, nowMs);
}
export async function loadPartyMemberStatusEntries(
  partyId: string,
  viewerCharacterId: string,
  viewerPlayfield: PlayfieldPosition,
  nowMs: number = Date.now()
): Promise<PartyMemberStatusEntry[]> {
  const pid = String(partyId || '').trim();
  const viewerId = String(viewerCharacterId || '').trim();
  if (!pid || !viewerId) return [];

  const viewerRow = (await prisma.character.findUnique({
    where: { id: viewerId },
    select: DUNGEON_LIVE_SELECT,
  })) as DungeonLiveCharacterRow | null;
  const viewerDungeon = viewerRow
    ? resolveDungeonLiveForStatusRow(viewerRow, nowMs)
    : null;

  const rows = await prisma.partyMember.findMany({
    where: { partyId: pid },
    orderBy: [{ slotOrder: 'asc' }, { joinedAt: 'asc' }],
    select: {
      characterId: true,
      character: { select: DUNGEON_LIVE_SELECT },
    },
  });

  const out: PartyMemberStatusEntry[] = [];
  for (const m of rows) {
    const row = m.character as unknown as DungeonLiveCharacterRow;
    const playfield = resolveCharacterPlayfieldPosition(row);
    const memberDungeon = resolveDungeonLiveForStatusRow(row, nowMs);
    const online = isCharacterOnlineNow(row.id);
    const dead = isCharacterDeadForPartyStatus(row);
    const nearby =
      m.characterId !== viewerId &&
      online &&
      !dead &&
      isMemberNearbyToViewer(
        viewerPlayfield,
        playfield,
        viewerDungeon,
        memberDungeon
      );
    out.push({
      characterId: m.characterId,
      name: row.name,
      playfield,
      online,
      dead,
      nearby,
    });
  }
  return out;
}
/** Члени паті в червоному радіусі (для «У локації з вами»). */
export function partyNearbyMemberNames(
  entries: PartyMemberStatusEntry[],
  viewerCharacterId: string
): { characterId: string; name: string }[] {
  const viewerId = String(viewerCharacterId || '').trim();
  return entries
    .filter(
      (e) =>
        e.characterId !== viewerId && e.online && !e.dead && e.nearby
    )
    .map((e) => ({ characterId: e.characterId, name: e.name }));
}

export function viewerHasNearbyPartyMember(
  entries: PartyMemberStatusEntry[],
  viewerCharacterId: string
): boolean {
  return partyNearbyMemberNames(entries, viewerCharacterId).length > 0;
}
