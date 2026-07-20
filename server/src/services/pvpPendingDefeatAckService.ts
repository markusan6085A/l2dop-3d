import { parsePvpPendingDefeat } from '../domain/pvpPendingDefeat.js';
import { prisma } from '../lib/prisma.js';

/** POST ack — idempotent notice only; pending defeat clears on return-to-town respawn. */
export async function ackPvpPendingDefeatForUser(
  userId: string,
  deathEventId: string,
  characterId?: string | null
): Promise<{ ok: true }> {
  const eventId = String(deathEventId || '').trim();
  if (!eventId) throw new Error('invalid_input');

  const char = await prisma.character.findFirst({
    where: {
      userId,
      ...(characterId ? { id: String(characterId).trim() } : {}),
    },
    orderBy: { lastUpdate: 'desc' },
    select: { id: true, pvpPendingDefeatJson: true },
  });
  if (!char) throw new Error('no_character');

  const pending = parsePvpPendingDefeat(char.pvpPendingDefeatJson);
  if (!pending) return { ok: true };

  if (pending.deathEventId !== eventId) {
    throw new Error('invalid_input');
  }

  return { ok: true };
}
