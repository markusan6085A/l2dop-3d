import type { Prisma } from '@prisma/client';
import { getWorldSpawnById } from '../data/mapWorldSpawns.js';
import type { BattleJsonState } from './battleTypes.js';
import { isPvpBattleJson, isPvpSpawnId } from './battlePvpContext.js';
import { isSharedWorldBossKind } from './worldBossSession.js';
import type { CanonicalMapLocation } from './mapPlayfieldContext.js';

/** Макс. абсолютна різниця рівнів для world PK на карті. */
export const MAX_WORLD_PVP_LEVEL_DIFFERENCE = 20;

export const WORLD_PVP_LEVEL_DIFF_BLOCKED_REASON_UK =
  'Занадто велика різниця рівнів. PK дозволено при різниці не більше 20 рівнів.';

export type WorldPvpEligibilityCode =
  | 'pvp_forbidden_zone'
  | 'pvp_party_member'
  | 'pvp_level_difference_too_high'
  | 'pvp_too_far'
  | 'pvp_target_offline'
  | 'pvp_target_in_battle';

const WORLD_PVP_MAP_BLOCKED_REASONS: Record<WorldPvpEligibilityCode, string> = {
  pvp_forbidden_zone: 'У цій локації PvP заборонено.',
  pvp_party_member: 'Не можна атакувати члена паті.',
  pvp_level_difference_too_high: WORLD_PVP_LEVEL_DIFF_BLOCKED_REASON_UK,
  pvp_too_far: 'Підійди ближче — гравець поза радіусом атаки.',
  pvp_target_offline: 'Гравець офлайн.',
  pvp_target_in_battle: 'Цей гравець уже в бою.',
};

export type WorldPvpMapEligibility = {
  showPkButton: boolean;
  pvpEligibilityCode: WorldPvpEligibilityCode | null;
  pvpBlockedReasonUk: string | null;
  profileOnNameClick: boolean;
};

export function canCharactersFightWorldPvp(
  attackerLevel: number,
  targetLevel: number
): boolean {
  const a = Math.max(1, Math.floor(Number(attackerLevel) || 0));
  const t = Math.max(1, Math.floor(Number(targetLevel) || 0));
  return Math.abs(a - t) <= MAX_WORLD_PVP_LEVEL_DIFFERENCE;
}

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

/**
 * Ціль у party/RB/dungeon/PvP-with-other — блокує world PK.
 * Solo world PvE (звичайний моб) — дозволено, як на відкритому полі L2.
 */
export function characterBlocksWorldPkTarget(
  bj: BattleJsonState | null | undefined
): boolean {
  if (!bj) return false;
  if (isPvpBattleJson(bj)) return true;
  if (typeof bj.partyBattleId === 'string' && bj.partyBattleId.trim()) {
    return true;
  }
  const spawnId = String(bj.spawnId || '').trim();
  if (isPvpSpawnId(spawnId)) return true;
  const spawn = getWorldSpawnById(spawnId);
  if (spawn && isSharedWorldBossKind(spawn.kind)) return true;
  if (spawn) return false;
  return true;
}

/** Ціль доступна для [PK] на карті (не в party/RB/dungeon; solo PvE — OK). */
export function canPkAttackHeroBattleState(
  bj: BattleJsonState | null | undefined,
  viewerCharacterId: string
): boolean {
  if (!bj) return true;
  if (isPvpBattleJson(bj)) {
    return bj.pvpTargetCharacterId === viewerCharacterId;
  }
  return !characterBlocksWorldPkTarget(bj);
}

export function resolveWorldPvpMapEligibility(args: {
  viewerLocation: CanonicalMapLocation;
  targetLocation: CanonicalMapLocation;
  viewerLevel: number;
  targetLevel: number;
  targetIsPartyMember: boolean;
  inBattleRange: boolean;
  targetOnline: boolean;
  targetCanPkAttack: boolean;
}): WorldPvpMapEligibility {
  const deny = (code: WorldPvpEligibilityCode): WorldPvpMapEligibility => ({
    showPkButton: false,
    pvpEligibilityCode: code,
    pvpBlockedReasonUk: WORLD_PVP_MAP_BLOCKED_REASONS[code],
    profileOnNameClick: true,
  });

  if (!args.viewerLocation.pvpAllowed || !args.targetLocation.pvpAllowed) {
    return deny('pvp_forbidden_zone');
  }
  if (args.targetIsPartyMember) {
    return deny('pvp_party_member');
  }
  if (!canCharactersFightWorldPvp(args.viewerLevel, args.targetLevel)) {
    return deny('pvp_level_difference_too_high');
  }
  if (!args.inBattleRange) {
    return deny('pvp_too_far');
  }
  if (!args.targetOnline) {
    return deny('pvp_target_offline');
  }
  if (!args.targetCanPkAttack) {
    return deny('pvp_target_in_battle');
  }

  return {
    showPkButton: true,
    pvpEligibilityCode: null,
    pvpBlockedReasonUk: null,
    profileOnNameClick: false,
  };
}

/** @deprecated Використовуй resolveWorldPvpMapEligibility */
export function resolveShowPkButton(
  args: Omit<
    Parameters<typeof resolveWorldPvpMapEligibility>[0],
    'viewerLevel' | 'targetLevel'
  > & { viewerLevel?: number; targetLevel?: number }
): boolean {
  return resolveWorldPvpMapEligibility({
    viewerLevel: args.viewerLevel ?? 1,
    targetLevel: args.targetLevel ?? 1,
    viewerLocation: args.viewerLocation,
    targetLocation: args.targetLocation,
    targetIsPartyMember: args.targetIsPartyMember,
    inBattleRange: args.inBattleRange,
    targetOnline: args.targetOnline,
    targetCanPkAttack: args.targetCanPkAttack,
  }).showPkButton;
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
