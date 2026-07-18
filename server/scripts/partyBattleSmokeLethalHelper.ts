/**
 * Deterministic party-battle lethal strike for smoke tests (Stage B/C).
 * Syncs shared session HP + clears GCD before each attempt — no sleep/retry masking.
 */
import assert from 'node:assert/strict';
import type { Prisma } from '@prisma/client';
import {
  isPartyBattleSessionTerminal,
  PARTY_BATTLE_SESSION_STATE,
} from '../src/domain/partyBattleSessionConstants.js';
import type { BattleJsonState } from '../src/domain/battleTypes.js';
import { MAP_WORLD_SPAWNS } from '../src/data/mapWorldSpawns.js';
import { BattleSkillNotAllowedError } from '../src/domain/battleSkillNotAllowedError.js';
import { canEndPartyBattleWithoutReward } from '../src/domain/partyBattleFlags.js';
import type { BattleActionFullResponse } from '../src/services/battleServiceDeltaTypes.js';
import { parseBattleJson } from '../src/services/battleServiceParseBattleJson.js';
import { prisma } from '../src/lib/prisma.js';
import { performBattleActionInTx } from '../src/services/battleServicePerformBattleAction.js';
import { ensureClanHallOnRow } from '../src/services/charClientSnapshot.js';
import { GameConflictError } from '../src/services/charErrors.js';
import { toSnapshot } from '../src/services/charService.js';
import type { CharacterRow } from '../src/services/charTypes.js';
import { resolvePartyBattleStageBTestVictoryInTx } from '../src/services/party/partyBattleOutcomeTx.js';
import { touchOnlinePresence, isCharacterOnlineNow } from '../src/services/onlinePresenceService.js';

export type PartyBattleLethalDiag = {
  attempts: number;
  lastCooldownKeys: string[];
  lastRemainingMs?: number;
};

function parseBattleJsonLocal(raw: unknown): BattleJsonState | null {
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) return null;
  return raw as BattleJsonState;
}

async function buildTerminalLethalResponse(
  characterId: string
): Promise<BattleActionFullResponse | undefined> {
  const char = await prisma.character.findUniqueOrThrow({ where: { id: characterId } });
  if (char.battleJson != null) return undefined;

  const reward = await prisma.partyKillReward.findFirst({
    where: { characterId },
    orderBy: { createdAt: 'desc' },
  });
  if (reward) {
    return {
      kind: 'full',
      character: toSnapshot(await ensureClanHallOnRow(char as never, prisma)),
      battle: null,
    };
  }

  const participant = await prisma.partyBattleParticipant.findFirst({
    where: { characterId },
    orderBy: { joinedAt: 'desc' },
    select: { partyBattleId: true },
  });
  if (participant) {
    const session = await prisma.partyBattleSession.findUnique({
      where: { id: participant.partyBattleId },
    });
    if (
      session?.state === PARTY_BATTLE_SESSION_STATE.victory ||
      session?.state === PARTY_BATTLE_SESSION_STATE.ended
    ) {
      return {
        kind: 'full',
        character: toSnapshot(await ensureClanHallOnRow(char as never, prisma)),
        battle: null,
      };
    }
  }

  return undefined;
}

export { buildTerminalLethalResponse };

async function touchPartyMembersOnline(
  sessionId: string,
  killerCharacterId: string
): Promise<void> {
  const session = await prisma.partyBattleSession.findUnique({
    where: { id: sessionId },
    select: { originPartyId: true },
  });
  if (!session) return;
  const members = await prisma.partyMember.findMany({
    where: { partyId: session.originPartyId },
    select: { characterId: true, character: { select: { userId: true } } },
  });
  const participantRows = await prisma.partyBattleParticipant.findMany({
    where: { partyBattleId: sessionId, active: true },
    select: { characterId: true },
  });
  const characterIds = new Set<string>([killerCharacterId]);
  for (const m of members) characterIds.add(m.characterId);
  for (const p of participantRows) characterIds.add(p.characterId);
  for (const m of members) {
    if (m.character.userId) {
      await touchOnlinePresence(m.character.userId);
    }
  }
  for (const characterId of characterIds) {
    if (!isCharacterOnlineNow(characterId)) {
      const row = await prisma.character.findUnique({
        where: { id: characterId },
        select: { userId: true },
      });
      if (row?.userId) await touchOnlinePresence(row.userId);
    }
  }
}

async function rejoinPartyBattleForLethal(
  args: { userId: string; characterId: string },
  sessionId: string
): Promise<void> {
  const session = await prisma.partyBattleSession.findUniqueOrThrow({
    where: { id: sessionId },
  });
  const spawn = MAP_WORLD_SPAWNS.find((s) => s.id === session.spawnId);
  if (!spawn) throw new Error('rejoin_spawn_gone');
  const char = await prisma.character.findUniqueOrThrow({
    where: { id: args.characterId },
  });
  await prisma.$transaction(async (tx) => {
    const { startOrJoinPartyBattleInTx } = await import(
      '../src/services/party/partyBattleStartJoinService.js'
    );
    await startOrJoinPartyBattleInTx(tx, {
      userId: args.userId,
      char: char as CharacterRow,
      spawn,
      expectedRevision: char.revision,
      partyId: session.originPartyId,
      wTick: null,
      nowStartMs: Date.now(),
    });
  });
}

/** Session mobHp=1 + battleJson mobHp=1 + wipe cooldown state (single tx with action). */
async function preparePartyBattleLethalStrikeInTx(
  tx: Prisma.TransactionClient,
  characterId: string
): Promise<{ sessionId: string; revision: number }> {
  const char = await tx.character.findUniqueOrThrow({ where: { id: characterId } });
  const bj = parseBattleJsonLocal(char.battleJson);
  assert.ok(bj?.partyBattleId, 'preparePartyBattleLethalStrike: missing partyBattleId');
  const sessionId = bj!.partyBattleId!;

  await tx.partyBattleSession.update({
    where: { id: sessionId },
    data: { mobHp: 1 },
  });

  const nextBattleJson: BattleJsonState = { ...bj!, mobHp: 1 };
  delete nextBattleJson.mysticSkillCdUntil;

  const now = new Date();
  const maxHp = Math.max(1, Math.floor(Number(char.maxHp) || 5000));
  const updated = await tx.character.update({
    where: { id: characterId },
    data: {
      battleJson: nextBattleJson as unknown as Prisma.InputJsonValue,
      skillCooldownsJson: [],
      hp: maxHp,
      /** Block passive HP regen patch inside performBattleAction (revision bump flake). */
      lastUpdate: now,
    },
  });

  return { sessionId, revision: updated.revision };
}

/** Stage B: deterministic test victory tx (no combat RNG / solo-clear flake). */
async function performPartyBattleStageBTestLethal(args: {
  userId: string;
  characterId: string;
}): Promise<{ response: BattleActionFullResponse; diag: PartyBattleLethalDiag }> {
  assert.ok(canEndPartyBattleWithoutReward(), 'performPartyBattleStageBTestLethal: flags');
  await touchOnlinePresence(args.userId);
  let response: BattleActionFullResponse | undefined;
  await prisma.$transaction(async (tx) => {
    const { sessionId, revision } = await preparePartyBattleLethalStrikeInTx(
      tx,
      args.characterId
    );
    const char = await tx.character.findUniqueOrThrow({
      where: { id: args.characterId },
    });
    const st = parseBattleJson(char.battleJson);
    if (!st) throw new Error('lethal_stage_b_no_battle_json');
    const session = await tx.partyBattleSession.findUniqueOrThrow({
      where: { id: sessionId },
    });
    response = await resolvePartyBattleStageBTestVictoryInTx(tx, {
      sessionId,
      characterId: args.characterId,
      expectedRevision: revision,
      char: char as CharacterRow,
      st,
      playerHp: Math.max(0, Math.floor(Number(char.hp) || 0)),
      mobHpBefore: session.mobHp,
      mobHpAfter: 0,
      log: Array.isArray(st.log) ? st.log : [],
      logLinesAdded: 0,
      maxMpEff:
        typeof st.playerMp === 'number' && Number.isFinite(st.playerMp)
          ? Math.floor(st.playerMp)
          : 1,
      side: {
        activeBuffsChanged: false,
        nextActiveBuffs: [],
        cooldownsChanged: false,
        nextCooldowns: [],
        hotbarStale: false,
      },
    });
  });
  assert.ok(response, 'performPartyBattleStageBTestLethal: no response');
  return {
    response,
    diag: { attempts: 1, lastCooldownKeys: [] },
  };
}

export async function performPartyBattleLethalAttack(args: {
  userId: string;
  characterId: string;
  battleSpawnId: string;
  maxAttempts?: number;
}): Promise<{ response?: BattleActionFullResponse; diag: PartyBattleLethalDiag }> {
  process.env.PARTY_BATTLE_SMOKE_GUARANTEED_LETHAL = '1';
  try {
  if (canEndPartyBattleWithoutReward()) {
    const stageB = await performPartyBattleStageBTestLethal(args);
    return stageB;
  }

  await touchOnlinePresence(args.userId);
  const maxAttempts = args.maxAttempts ?? 40;
  const diag: PartyBattleLethalDiag = { attempts: 0, lastCooldownKeys: [] };
  let sessionId: string | null = null;

  const resolveSessionId = (raw: unknown): string | null => {
    const bj = parseBattleJsonLocal(raw);
    return bj?.partyBattleId ?? null;
  };

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    diag.attempts = attempt + 1;
    await touchOnlinePresence(args.userId);

    const pre = await prisma.character.findUniqueOrThrow({
      where: { id: args.characterId },
    });
    if (!sessionId) {
      sessionId = resolveSessionId(pre.battleJson);
    }

    if (sessionId) {
      const terminalSession = await prisma.partyBattleSession.findUnique({
        where: { id: sessionId },
      });
      if (terminalSession && isPartyBattleSessionTerminal(terminalSession.state)) {
        const terminal = await buildTerminalLethalResponse(args.characterId);
        return { response: terminal, diag };
      }
    }

    if (pre.battleJson == null) {
      if (sessionId) {
        const openSession = await prisma.partyBattleSession.findUnique({
          where: { id: sessionId },
        });
        if (
          openSession &&
          openSession.state === PARTY_BATTLE_SESSION_STATE.active
        ) {
          await rejoinPartyBattleForLethal(args, sessionId);
          continue;
        }
      }
      const terminal = await buildTerminalLethalResponse(args.characterId);
      if (terminal) return { response: terminal, diag };
      throw new Error('lethal_orphan_state: battleJson cleared but session not terminal');
    }

    assert.ok(sessionId, 'performPartyBattleLethalAttack: missing partyBattleId');
    await touchPartyMembersOnline(sessionId, args.characterId);

    try {
      let response: BattleActionFullResponse | undefined;
      await prisma.$transaction(async (tx) => {
        const { revision } = await preparePartyBattleLethalStrikeInTx(tx, args.characterId);
        const r = await performBattleActionInTx(tx, args.userId, 'attack', revision, {
          characterId: args.characterId,
          battleSpawnId: args.battleSpawnId,
        });
        if (r.kind === 'full') {
          response = r as BattleActionFullResponse;
        } else if (
          r.kind === 'delta' &&
          (r.victory != null || r.delta.battleEnded === true || r.delta.mobDead === true)
        ) {
          const charAfter = await tx.character.findUniqueOrThrow({
            where: { id: args.characterId },
          });
          response = {
            kind: 'full',
            character: toSnapshot(await ensureClanHallOnRow(charAfter as never, tx)),
            battle: null,
            ...(r.victory ? { victory: r.victory } : {}),
          };
        }
      });
      if (response) {
        if (sessionId) {
          const session = await prisma.partyBattleSession.findUnique({
            where: { id: sessionId },
          });
          if (session && isPartyBattleSessionTerminal(session.state)) {
            return { response, diag };
          }
          response = undefined;
        } else {
          return { response, diag };
        }
      }
    } catch (err) {
      if (err instanceof BattleSkillNotAllowedError) {
        const detail = err.cooldownDiag;
        diag.lastCooldownKeys = detail?.cooldownMapKeys ?? [];
        diag.lastRemainingMs = detail?.remainingMs;
        throw new Error(
          `lethal_cooldown_after_prepare: attempt=${attempt + 1} keys=${diag.lastCooldownKeys.join(',')} remainingMs=${diag.lastRemainingMs ?? '?'}`
        );
      }
      if (err instanceof GameConflictError) {
        continue;
      }
      throw err;
    }

    const terminal = await buildTerminalLethalResponse(args.characterId);
    if (terminal) {
      return { response: terminal, diag };
    }
  }

  if (sessionId) {
    const session = await prisma.partyBattleSession.findUnique({
      where: { id: sessionId },
    });
    if (session && isPartyBattleSessionTerminal(session.state)) {
      const terminal = await buildTerminalLethalResponse(args.characterId);
      return { response: terminal, diag };
    }
  }

  throw new Error(`lethal_attack_failed: attempts=${diag.attempts}`);
  } finally {
    delete process.env.PARTY_BATTLE_SMOKE_GUARANTEED_LETHAL;
  }
}
