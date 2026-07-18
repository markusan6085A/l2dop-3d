import { levelFromTotalExp } from '../../data/l2dopExpgain.js';
import { parseInventory } from '../../data/inventory.js';
import { computeCombatStats, effectiveMaxMpWithJewelFlat } from '../../data/l2dopCombatFormulas.js';
import { computeVitals } from '../../data/l2dopVitals.js';
import { professionDisplayUk } from '../../domain/professionDisplay.js';
import {
  isPartyBattleEngineEnabled,
} from '../../domain/partyBattleFlags.js';
import type { PlayfieldPosition } from '../../domain/mapNearbyRadius.js';
import { prisma } from '../../lib/prisma.js';
import { combatOptsFromRow } from '../charService.js';
import { parseBattleJson } from '../battleServiceParseBattleJson.js';
import { isCharacterOnlineNow } from '../onlinePresenceService.js';
import { partyMemberBuffIconsFromActiveJson } from './partyBuffIconsLightweight.js';
import {
  isCharacterDeadForPartyStatus,
  isMemberNearbyToViewer,
  resolveCharacterPlayfieldPosition,
  type PartyMemberStatusCharacterRow,
} from './partyMemberStatusReadService.js';
import type { PartyBattleMemberSyncDto } from './partyBattleSyncService.js';

const MEMBER_BATTLE_SELECT = {
  id: true,
  name: true,
  exp: true,
  l2Profession: true,
  race: true,
  classBranch: true,
  inventoryJson: true,
  hp: true,
  battleJson: true,
  worldX: true,
  worldY: true,
  targetX: true,
  targetY: true,
  moveStartAt: true,
  moveFromX: true,
  moveFromY: true,
  dungeonStateJson: true,
  pvePendingDefeatJson: true,
  pvpPendingDefeatJson: true,
  buffHeroicTier: true,
  buffZealotStacks: true,
  skillsLearnedJson: true,
  worldCombatStateJson: true,
} as const;

function memberVitalsFromRow(
  row: PartyMemberStatusCharacterRow & {
    exp: bigint;
    race: string;
    classBranch: string;
    inventoryJson: unknown;
    battleJson: unknown;
  }
): { hp: number; maxHp: number; mp: number; maxMp: number; level: number } {
  const effLv = levelFromTotalExp(row.exp);
  const inv = parseInventory(row.inventoryJson);
  const combat = computeCombatStats(
    effLv,
    row.race,
    row.classBranch,
    inv,
    combatOptsFromRow(row as never)
  );
  const vit = computeVitals(
    effLv,
    row.race,
    row.classBranch,
    combat.con,
    combat.men
  );
  const maxMp = effectiveMaxMpWithJewelFlat(vit.maxMp, combat);
  const hp = Math.max(0, Math.min(vit.maxHp, Math.floor(Number(row.hp) || 0)));
  const bj = parseBattleJson(row.battleJson as import('@prisma/client').Prisma.JsonValue);
  const mpRaw =
    bj && typeof bj.playerMp === 'number' && Number.isFinite(bj.playerMp)
      ? Math.floor(bj.playerMp)
      : maxMp;
  const mp = Math.max(0, Math.min(maxMp, mpRaw));
  return { hp, maxHp: vit.maxHp, mp, maxMp, level: effLv };
}

/** Один roster query + participants — members[] без N+1. */
export async function buildPartyBattleMemberSyncDtos(
  partyBattleId: string,
  partyId: string,
  viewerCharacterId: string,
  viewerPlayfield: PlayfieldPosition,
  nowMs: number = Date.now()
): Promise<PartyBattleMemberSyncDto[]> {
  if (!isPartyBattleEngineEnabled()) return [];
  const viewerId = String(viewerCharacterId || '').trim();
  const sessionId = String(partyBattleId || '').trim();
  const pid = String(partyId || '').trim();
  if (!viewerId || !sessionId || !pid) return [];

  const [membershipRows, participantRows, partyRow] = await Promise.all([
    prisma.partyMember.findMany({
      where: { partyId: pid },
      orderBy: [{ slotOrder: 'asc' }, { joinedAt: 'asc' }],
      select: {
        characterId: true,
        character: { select: MEMBER_BATTLE_SELECT },
      },
    }),
    prisma.partyBattleParticipant.findMany({
      where: { partyBattleId: sessionId, active: true },
      select: { characterId: true },
    }),
    prisma.party.findUnique({
      where: { id: pid },
      select: { leaderCharacterId: true },
    }),
  ]);

  const activeParticipantIds = new Set(
    participantRows.map((p) => p.characterId)
  );
  const leaderId = partyRow?.leaderCharacterId ?? '';

  const out: PartyBattleMemberSyncDto[] = [];
  for (const m of membershipRows) {
    if (m.characterId === viewerId) continue;
    const row = m.character as unknown as PartyMemberStatusCharacterRow & {
      exp: bigint;
      race: string;
      classBranch: string;
      inventoryJson: unknown;
      l2Profession: string;
      activeBuffsJson: unknown;
      battleJson: unknown;
    };
    const playfield = resolveCharacterPlayfieldPosition(row);
    const online = isCharacterOnlineNow(row.id);
    const dead = isCharacterDeadForPartyStatus(row);
    const nearby =
      online && !dead && isMemberNearbyToViewer(viewerPlayfield, playfield);
    const vit = memberVitalsFromRow(row);
    const bj = parseBattleJson(row.battleJson as import('@prisma/client').Prisma.JsonValue);
    const activeInBattle =
      activeParticipantIds.has(m.characterId) &&
      bj?.partyBattleId === sessionId;
    const { buffIcons, buffOverflow } = partyMemberBuffIconsFromActiveJson(
      row.activeBuffsJson,
      nowMs
    );

    out.push({
      characterId: m.characterId,
      name: row.name,
      level: vit.level,
      profession: professionDisplayUk(row.l2Profession),
      hp: vit.hp,
      maxHp: vit.maxHp,
      mp: vit.mp,
      maxMp: vit.maxMp,
      online,
      nearby,
      dead,
      isLeader: m.characterId === leaderId,
      activeInBattle,
      buffIcons,
      buffOverflow,
    });
    if (out.length >= 4) break;
  }

  return out;
}

/** Active participants для party page enrich (single query). */
export async function findActivePartyBattleParticipantIds(
  partyBattleId: string
): Promise<Set<string>> {
  const rows = await prisma.partyBattleParticipant.findMany({
    where: { partyBattleId, active: true },
    select: { characterId: true },
  });
  return new Set(rows.map((r) => r.characterId));
}
