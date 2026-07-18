/**
 * Lock-order helpers для party battle action (B0.5).
 *
 * Canonical order для regular action:
 * 1. READ Character (no lock)
 * 2. revision check (no write)
 * 3. PartyBattleSession FOR UPDATE
 * 4. revalidate session / spawn / participant / mob range
 * 5. persist passive/move + battle mutation (Character write)
 *
 * Заборонено: persistPassiveAndMoveInTx / Character.update до session lock.
 */

import type { PartyBattleSession, Prisma } from '@prisma/client';
import { resolveMapMovement } from '../../domain/mapMovement.js';
import { isWithinMobBattleRange } from '../../domain/mapNearbyRadius.js';
import {
  isPartyBattleSessionTerminal,
} from '../../domain/partyBattleSessionConstants.js';
import {
  passiveAndMovePatch,
} from '../charPassiveMovePersist.js';
import type { CharacterRow } from '../charTypes.js';
import { lockPartyBattleSessionInTx } from './partyBattleSessionService.js';

type Tx = Prisma.TransactionClient;

export type PartyBattleActionLockContext = {
  session: PartyBattleSession;
  char: CharacterRow;
};

/** Test-only trace: порядок lock/write у tx (PARTY_BATTLE_LOCK_TRACE=true). */
export const partyBattleLockTrace = {
  get enabled(): boolean {
    return process.env.PARTY_BATTLE_LOCK_TRACE === 'true';
  },
  events: [] as string[],
  reset(): void {
    this.events = [];
  },
  push(event: string): void {
    if (this.enabled) this.events.push(event);
  },
};

function trace(event: string): void {
  partyBattleLockTrace.push(event);
}

export function peekPartyBattleIdFromBattleJson(
  battleJson: unknown
): string | null {
  if (battleJson == null || typeof battleJson !== 'object' || Array.isArray(battleJson)) {
    return null;
  }
  const id = (battleJson as Record<string, unknown>).partyBattleId;
  if (typeof id !== 'string') return null;
  const trimmed = id.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function isPartyBattleActionPath(
  battleJson: unknown,
  parsedPartyBattleId?: string | null
): boolean {
  const fromParsed =
    typeof parsedPartyBattleId === 'string' && parsedPartyBattleId.trim().length > 0
      ? parsedPartyBattleId.trim()
      : null;
  return fromParsed != null || peekPartyBattleIdFromBattleJson(battleJson) != null;
}

export type LockPartyBattleSessionForActionArgs = {
  sessionId: string;
  characterId: string;
  spawnId: string;
  charRow: CharacterRow;
};

/**
 * Session lock FIRST, потім passive/move persist.
 * Range перевіряється на pure resolveMapMovement(charRow) до write.
 */
export async function lockPartyBattleSessionForActionInTx(
  tx: Tx,
  args: LockPartyBattleSessionForActionArgs
): Promise<PartyBattleActionLockContext> {
  trace('session:lock:begin');
  const locked = await lockPartyBattleSessionInTx(tx, args.sessionId);
  trace('session:lock:done');
  if (!locked) throw new Error('party_battle_session_not_found');
  if (isPartyBattleSessionTerminal(locked.state)) {
    throw new Error('party_battle_session_not_active');
  }
  if (locked.spawnId !== args.spawnId) {
    throw new Error('party_battle_wrong_spawn');
  }

  const participant = await tx.partyBattleParticipant.findUnique({
    where: {
      partyBattleId_characterId: {
        partyBattleId: locked.id,
        characterId: args.characterId,
      },
    },
  });
  if (!participant?.active) {
    throw new Error('party_battle_not_participant');
  }

  const pos = resolveMapMovement(args.charRow);
  if (
    !isWithinMobBattleRange(
      { worldX: pos.worldX, worldY: pos.worldY },
      { worldX: locked.mobWorldX, worldY: locked.mobWorldY }
    )
  ) {
    throw new Error('battle_out_of_range');
  }

  trace('character:passive_move:persist:begin');
  const patch = passiveAndMovePatch(args.charRow);
  let char = args.charRow;
  if (patch) {
    char = (await tx.character.update({
      where: { id: args.charRow.id },
      data: patch,
    })) as CharacterRow;
  }
  trace('character:passive_move:persist:done');

  return { session: locked, char };
}

export type ApplyPartyBattleSharedDamageArgs = {
  sessionId: string;
  characterId: string;
  damage: number;
  nowMs?: number;
};

/** Shared mobHp decrement під session lock (Stage B / B0.5 tests). */
export async function applyPartyBattleSharedDamageInTx(
  tx: Tx,
  args: ApplyPartyBattleSharedDamageArgs
): Promise<PartyBattleSession> {
  const locked = await lockPartyBattleSessionInTx(tx, args.sessionId);
  if (!locked) throw new Error('party_battle_session_not_found');
  if (isPartyBattleSessionTerminal(locked.state)) {
    throw new Error('party_battle_session_not_active');
  }

  const dmg = Math.max(0, Math.floor(args.damage));
  const nowMs = args.nowMs ?? Date.now();
  const newHp = Math.max(0, locked.mobHp - dmg);

  await tx.partyBattleParticipant.update({
    where: {
      partyBattleId_characterId: {
        partyBattleId: locked.id,
        characterId: args.characterId,
      },
    },
    data: {
      totalDamage: { increment: dmg },
      lastDamagingHitAtMs: BigInt(nowMs),
      lastActivityAt: new Date(nowMs),
    },
  });

  return tx.partyBattleSession.update({
    where: { id: locked.id },
    data: {
      mobHp: newHp,
      battleVersion: { increment: 1 },
      lastActivityAt: new Date(nowMs),
    },
  });
}

/**
 * Симуляція party action tx: session damage + mutateCharacterWithRevision.
 * При revision conflict — rollback усіх session writes.
 */
export async function partyBattleActionWithCharacterMutationInTx(
  tx: Tx,
  args: {
    sessionId: string;
    characterId: string;
    spawnId: string;
    charRow: CharacterRow;
    expectedRevision: number;
    damage: number;
    buildCharacterPatch: (
      char: CharacterRow,
      session: PartyBattleSession
    ) => Prisma.CharacterUpdateInput | null;
  }
): Promise<{ session: PartyBattleSession; char: CharacterRow }> {
  const { session, char: charAfterPassive } =
    await lockPartyBattleSessionForActionInTx(tx, {
      sessionId: args.sessionId,
      characterId: args.characterId,
      spawnId: args.spawnId,
      charRow: args.charRow,
    });

  trace('session:damage:begin');
  const afterDamage = await applyPartyBattleSharedDamageInTx(tx, {
    sessionId: session.id,
    characterId: args.characterId,
    damage: args.damage,
  });
  trace('session:damage:done');

  const patch = args.buildCharacterPatch(charAfterPassive, afterDamage);
  if (patch) {
    trace('character:revision:mutate:begin');
    const { mutateCharacterWithRevision } = await import('../characterMutation.js');
    const result = await mutateCharacterWithRevision(
      tx,
      args.characterId,
      args.expectedRevision,
      () => ({
        changed: true,
        data: patch as Prisma.CharacterUpdateManyMutationInput,
      })
    );
    trace('character:revision:mutate:done');
    if (!result.ok) {
      throw new Error('revision_conflict');
    }
    return { session: afterDamage, char: result.character as CharacterRow };
  }

  return { session: afterDamage, char: charAfterPassive };
}
