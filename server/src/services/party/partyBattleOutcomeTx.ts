import { Prisma, type PartyBattleSession } from '@prisma/client';
import type { BattleJsonState } from '../../domain/battle.js';
import { applyBattleLogWriteInPlace } from '../../domain/battleVersion.js';
import {
  canEndPartyBattleWithoutReward,
} from '../../domain/partyBattleFlags.js';
import {
  PARTY_BATTLE_END_REASON,
  PARTY_BATTLE_SESSION_STATE,
  isPartyBattleSessionTerminal,
} from '../../domain/partyBattleSessionConstants.js';
import { worldCombatStateFromBattleJson } from '../../domain/worldCombatState.js';
import {
  gameConflictFromMutation,
  toSnapshot,
  type CharacterRow,
} from '../charService.js';
import { ensureClanHallOnRow } from '../charClientSnapshot.js';
import { serializeBattleJsonForDb } from '../battleServiceBattleBuffs.js';
import { mutateCharacterWithRevision } from '../characterMutation.js';
import type {
  BattleActionDeltaResponse,
  BattleActionFullResponse,
} from '../battleServiceDeltaTypes.js';
import { battleTurnJsonExtras, type BattleTurnPersistSide } from '../battleServicePerformBattleAction.outcome.js';
import {
  endPartyBattleSessionInTx,
  lockPartyBattleSessionInTx,
} from './partyBattleSessionService.js';

type Tx = Prisma.TransactionClient;

export type PartyBattleTurnPersistArgs = {
  sessionId: string;
  characterId: string;
  expectedRevision: number;
  char: CharacterRow;
  st: BattleJsonState;
  playerHp: number;
  mobHpBefore: number;
  mobHpAfter: number;
  log: string[];
  logLinesAdded: number;
  maxMpEff: number;
  side: BattleTurnPersistSide;
};

/** Session HP/version/damage ПЕРЕД mutateCharacter — rollback при revision conflict. */
export async function persistPartyBattleSharedHpInTx(
  tx: Tx,
  args: {
    sessionId: string;
    characterId: string;
    mobHpAfter: number;
    mobHpBefore: number;
    nowMs?: number;
  }
): Promise<PartyBattleSession> {
  const locked = await lockPartyBattleSessionInTx(tx, args.sessionId);
  if (!locked) throw new Error('party_battle_session_not_found');
  if (isPartyBattleSessionTerminal(locked.state) || !locked.activePartyKey) {
    throw new Error('party_battle_session_not_active');
  }

  const newHp = Math.max(0, Math.floor(args.mobHpAfter));
  const damageDealt = Math.max(0, Math.floor(args.mobHpBefore) - newHp);
  const nowMs = args.nowMs ?? Date.now();

  if (damageDealt > 0) {
    await tx.partyBattleParticipant.update({
      where: {
        partyBattleId_characterId: {
          partyBattleId: locked.id,
          characterId: args.characterId,
        },
      },
      data: {
        totalDamage: { increment: damageDealt },
        lastDamagingHitAtMs: BigInt(nowMs),
        lastActivityAt: new Date(nowMs),
      },
    });
  }

  return tx.partyBattleSession.update({
    where: { id: locked.id },
    data: {
      mobHp: newHp,
      battleVersion: { increment: 1 },
      lastActivityAt: new Date(nowMs),
    },
  });
}

export async function persistPartyBattleContinueTurnInTx(
  tx: Tx,
  args: PartyBattleTurnPersistArgs
): Promise<BattleActionDeltaResponse> {
  const session = await persistPartyBattleSharedHpInTx(tx, {
    sessionId: args.sessionId,
    characterId: args.characterId,
    mobHpBefore: args.mobHpBefore,
    mobHpAfter: args.mobHpAfter,
  });

  args.st.mobHp = session.mobHp;
  args.st.battleVersion = session.battleVersion;
  applyBattleLogWriteInPlace(args.st, args.log, args.logLinesAdded);

  const worldMirrorMid = worldCombatStateFromBattleJson(
    args.st,
    args.maxMpEff,
    Date.now()
  );
  const extras = battleTurnJsonExtras(args.side);

  const updated = await mutateCharacterWithRevision(
    tx,
    args.char.id,
    args.expectedRevision,
    () => ({
      changed: true,
      data: {
        hp: args.playerHp,
        battleJson: serializeBattleJsonForDb(args.st),
        worldCombatStateJson:
          worldMirrorMid != null
            ? (JSON.parse(JSON.stringify(worldMirrorMid)) as Prisma.InputJsonValue)
            : Prisma.JsonNull,
        ...extras,
        ...(args.side.dailyQuestsJson !== undefined
          ? { dailyQuestsJson: args.side.dailyQuestsJson }
          : {}),
      },
    })
  );
  if (!updated.ok) throw gameConflictFromMutation(updated);

  const snap = toSnapshot(await ensureClanHallOnRow(updated.character as CharacterRow, tx));
  const bv = session.battleVersion;
  const logTail = args.log.slice(-Math.min(args.log.length, args.logLinesAdded + 8));

  return {
    kind: 'delta',
    revision: snap.revision,
    characterId: args.char.id,
    serverNowMs: Date.now(),
    delta: {
      changed: true,
      revision: snap.revision,
      battleVersion: bv,
      logSeq: args.st.lastLogSeq ?? args.log.length,
      logTail,
      characterHp: args.playerHp,
      characterMp: args.st.playerMp,
      characterMaxHp: snap.maxHp,
      characterMaxMp: args.maxMpEff,
      mobHp: session.mobHp,
      mobMaxHp: args.st.mobMaxHp,
      mobDead: session.mobHp <= 0,
      hotbarStale: args.side.hotbarStale,
      battleMods: args.st.battleMods ?? null,
    },
  };
}

/** Stage B test lethal — без solo reward / economy. */
export async function resolvePartyBattleStageBTestVictoryInTx(
  tx: Tx,
  args: PartyBattleTurnPersistArgs
): Promise<BattleActionFullResponse> {
  if (!canEndPartyBattleWithoutReward()) {
    throw new Error('party_battle_not_ready');
  }

  await persistPartyBattleSharedHpInTx(tx, {
    sessionId: args.sessionId,
    characterId: args.characterId,
    mobHpBefore: args.mobHpBefore,
    mobHpAfter: 0,
  });

  await endPartyBattleSessionInTx(tx, {
    sessionId: args.sessionId,
    terminalState: PARTY_BATTLE_SESSION_STATE.victory,
    endReason: PARTY_BATTLE_END_REASON.stage_b_test_victory,
  });

  const participants = await tx.partyBattleParticipant.findMany({
    where: { partyBattleId: args.sessionId, active: true },
    select: { characterId: true },
    orderBy: { characterId: 'asc' },
  });

  let attackerSnap = args.char;
  for (const p of participants) {
    const isAttacker = p.characterId === args.characterId;
    const result = await mutateCharacterWithRevision(
      tx,
      p.characterId,
      isAttacker ? args.expectedRevision : null,
      (row) => {
        const bj = row.battleJson;
        if (bj == null || typeof bj !== 'object' || Array.isArray(bj)) {
          return { changed: false, data: {} };
        }
        const partyId = (bj as Record<string, unknown>).partyBattleId;
        if (partyId !== args.sessionId) return { changed: false, data: {} };
        return {
          changed: true,
          data: {
            battleJson: Prisma.JsonNull,
            worldCombatStateJson: Prisma.JsonNull,
          },
        };
      }
    );
    if (isAttacker) {
      if (!result.ok) throw gameConflictFromMutation(result);
      attackerSnap = result.character as CharacterRow;
    }
  }

  const snap = toSnapshot(await ensureClanHallOnRow(attackerSnap, tx));
  return {
    kind: 'full',
    character: snap,
    battle: null,
    lethalMeta: {
      battleEnded: true,
      mobDead: true,
      mobHp: 0,
      mobMaxHp: args.st.mobMaxHp,
      outcome: 'VICTORY',
      battleVersion: 0,
    },
  };
}
