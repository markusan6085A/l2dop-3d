import { prisma } from '../../lib/prisma.js';
import {
  isPartyBattleRewardDistributionReady,
} from '../../domain/partyBattleFlags.js';
import {
  buildWorldPartyKillRewardNoticeId,
  parseWorldPartyKillRewardNoticeId,
} from '../../domain/worldPartyKillRewardKey.js';
import type { PartyHudRewardNotice } from './partyTypes.js';

/** Найстаріша непрочитана нагорода (party battle або world L2 split). */
export async function getUnreadPartyRewardNotice(
  characterId: string
): Promise<PartyHudRewardNotice | null> {
  if (!isPartyBattleRewardDistributionReady()) return null;
  const cid = String(characterId || '').trim();
  if (!cid) return null;

  const [partyRow, worldRow] = await Promise.all([
    prisma.partyKillReward.findFirst({
      where: { characterId: cid, notifiedAt: null },
      orderBy: { createdAt: 'asc' },
      select: {
        partyBattleId: true,
        expGain: true,
        spGain: true,
        adenaGain: true,
        createdAt: true,
      },
    }),
    prisma.worldPartyKillReward.findFirst({
      where: { recipientCharacterId: cid, notifiedAt: null },
      orderBy: { createdAt: 'asc' },
      select: {
        killerCharacterId: true,
        spawnId: true,
        killRevision: true,
        expGain: true,
        spGain: true,
        adenaGain: true,
        createdAt: true,
      },
    }),
  ]);

  if (!partyRow && !worldRow) return null;
  if (partyRow && worldRow) {
    const pickParty = partyRow.createdAt <= worldRow.createdAt;
    if (pickParty) {
      return {
        partyBattleId: partyRow.partyBattleId,
        expGain: partyRow.expGain,
        spGain: partyRow.spGain,
        adenaGain: partyRow.adenaGain.toString(),
        createdAt: partyRow.createdAt.toISOString(),
      };
    }
  }

  if (worldRow && (!partyRow || worldRow.createdAt < partyRow.createdAt)) {
    return {
      partyBattleId: buildWorldPartyKillRewardNoticeId({
        killerCharacterId: worldRow.killerCharacterId,
        spawnId: worldRow.spawnId,
        killRevision: worldRow.killRevision,
      }),
      expGain: worldRow.expGain,
      spGain: worldRow.spGain,
      adenaGain: worldRow.adenaGain.toString(),
      createdAt: worldRow.createdAt.toISOString(),
    };
  }

  if (partyRow) {
    return {
      partyBattleId: partyRow.partyBattleId,
      expGain: partyRow.expGain,
      spGain: partyRow.spGain,
      adenaGain: partyRow.adenaGain.toString(),
      createdAt: partyRow.createdAt.toISOString(),
    };
  }
  return null;
}

/** POST ack — idempotent, без Character.revision++. */
export async function ackPartyRewardNoticeForUser(
  userId: string,
  partyBattleId: string,
  characterId?: string | null
): Promise<{ ok: true }> {
  const noticeId = String(partyBattleId || '').trim();
  if (!noticeId) throw new Error('invalid_input');

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
  const worldKey = parseWorldPartyKillRewardNoticeId(noticeId);
  if (worldKey) {
    await prisma.worldPartyKillReward.updateMany({
      where: {
        killerCharacterId: worldKey.killerCharacterId,
        spawnId: worldKey.spawnId,
        killRevision: worldKey.killRevision,
        recipientCharacterId: char.id,
        notifiedAt: null,
      },
      data: { notifiedAt: now },
    });
    return { ok: true };
  }

  await prisma.partyKillReward.updateMany({
    where: {
      partyBattleId: noticeId,
      characterId: char.id,
      notifiedAt: null,
    },
    data: { notifiedAt: now },
  });

  return { ok: true };
}
