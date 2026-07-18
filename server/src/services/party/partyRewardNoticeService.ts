import { prisma } from '../../lib/prisma.js';
import {
  isPartyBattleRewardDistributionReady,
} from '../../domain/partyBattleFlags.js';
import type { PartyHudRewardNotice } from './partyTypes.js';

/** Найстаріша непрочитана нагорода (read-only). */
export async function getUnreadPartyRewardNotice(
  characterId: string
): Promise<PartyHudRewardNotice | null> {
  if (!isPartyBattleRewardDistributionReady()) return null;
  const cid = String(characterId || '').trim();
  if (!cid) return null;

  const row = await prisma.partyKillReward.findFirst({
    where: {
      characterId: cid,
      notifiedAt: null,
    },
    orderBy: { createdAt: 'asc' },
    select: {
      partyBattleId: true,
      expGain: true,
      spGain: true,
      adenaGain: true,
      createdAt: true,
    },
  });
  if (!row) return null;

  return {
    partyBattleId: row.partyBattleId,
    expGain: row.expGain,
    spGain: row.spGain,
    adenaGain: row.adenaGain.toString(),
    createdAt: row.createdAt.toISOString(),
  };
}

/** POST ack — idempotent, без Character.revision++. */
export async function ackPartyRewardNoticeForUser(
  userId: string,
  partyBattleId: string,
  characterId?: string | null
): Promise<{ ok: true }> {
  const battleId = String(partyBattleId || '').trim();
  if (!battleId) throw new Error('invalid_input');

  const char = await prisma.character.findFirst({
    where: {
      userId,
      ...(characterId ? { id: characterId } : {}),
    },
    orderBy: { lastUpdate: 'desc' },
    select: { id: true },
  });
  if (!char) throw new Error('no_character');

  const now = new Date();
  await prisma.partyKillReward.updateMany({
    where: {
      partyBattleId: battleId,
      characterId: char.id,
      notifiedAt: null,
    },
    data: { notifiedAt: now },
  });

  return { ok: true };
}
