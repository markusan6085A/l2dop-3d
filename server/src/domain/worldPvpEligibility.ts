import type { Prisma } from '@prisma/client';
import { getWorldSpawnById } from '../data/mapWorldSpawns.js';
import type { BattleJsonState } from './battleTypes.js';
import { isPvpBattleJson } from './battlePvpContext.js';
import { isSharedWorldBossKind } from './worldBossSession.js';
import type { CanonicalMapLocation } from './mapPlayfieldContext.js';

/** Активний PvE / party / RB — блокує старт world PvP (окрім counter-attack сценарію). */
export function characterBlocksWorldPvpStart(
  bj: BattleJsonState | null | undefined
): boolean {
  if (!bj) return false;
  if (isPvpBattleJson(bj)) return false;
  if (typeof bj.partyBattleId === 'string' && bj.partyBattleId.trim()) {
    return true;
  }
  const spawn = getWorldSpawnById(String(bj.spawnId || ''));
  if (spawn && isSharedWorldBossKind(spawn.kind)) return true;
  return true;
}

/** Ціль доступна для [PK] на карті (не в чужому PvE/RB/party battle). */
export function canPkAttackHeroBattleState(
  bj: BattleJsonState | null | undefined,
  viewerCharacterId: string
): boolean {
  if (!bj) return true;
  if (isPvpBattleJson(bj)) {
    return bj.pvpTargetCharacterId === viewerCharacterId;
  }
  return false;
}

export function resolveShowPkButton(args: {
  viewerLocation: CanonicalMapLocation;
  targetLocation: CanonicalMapLocation;
  targetIsPartyMember: boolean;
  inBattleRange: boolean;
  targetOnline: boolean;
  targetCanPkAttack: boolean;
}): boolean {
  if (!args.viewerLocation.pvpAllowed) return false;
  if (!args.targetLocation.pvpAllowed) return false;
  if (args.targetIsPartyMember) return false;
  if (!args.inBattleRange) return false;
  if (!args.targetOnline) return false;
  if (!args.targetCanPkAttack) return false;
  return true;
}

export async function areCharactersInSamePartyInTx(
  tx: Prisma.TransactionClient,
  characterA: string,
  characterB: string
): Promise<boolean> {
  const aId = String(characterA || '').trim();
  const bId = String(characterB || '').trim();
  if (!aId || !bId) return false;
  if (aId === bId) return true;
  const [a, b] = await Promise.all([
    tx.partyMember.findUnique({
      where: { characterId: aId },
      select: { partyId: true },
    }),
    tx.partyMember.findUnique({
      where: { characterId: bId },
      select: { partyId: true },
    }),
  ]);
  if (!a?.partyId || !b?.partyId) return false;
  return a.partyId === b.partyId;
}
