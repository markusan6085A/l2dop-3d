import { prisma } from '../lib/prisma.js';

/** Активність за останні N хв — вважаємо «в онлайні». */
const ONLINE_TTL_MS = 10 * 60 * 1000;

type PresenceEntry = {
  name: string;
  lastSeenMs: number;
};

const byUserId = new Map<string, PresenceEntry>();
const nameByUserId = new Map<string, string>();

async function resolveCharacterName(userId: string): Promise<string> {
  const cached = nameByUserId.get(userId);
  if (cached) return cached;

  const row = await prisma.character.findFirst({
    where: { userId },
    orderBy: { lastUpdate: 'desc' },
    select: { name: true },
  });
  const name = row?.name?.trim() || '—';
  nameByUserId.set(userId, name);
  return name;
}

/** Оновити присутність (викликати після успішної auth-дії). */
export async function touchOnlinePresence(userId: string): Promise<void> {
  const id = String(userId || '').trim();
  if (!id) return;
  const name = await resolveCharacterName(id);
  byUserId.set(id, { name, lastSeenMs: Date.now() });
}

export type OnlinePresencePlayer = {
  name: string;
};

export type OnlinePresenceSnapshot = {
  count: number;
  players: OnlinePresencePlayer[];
};

function pruneExpired(now: number): void {
  for (const [userId, entry] of byUserId) {
    if (now - entry.lastSeenMs > ONLINE_TTL_MS) {
      byUserId.delete(userId);
    }
  }
}

export function getOnlinePresenceSnapshot(): OnlinePresenceSnapshot {
  const now = Date.now();
  pruneExpired(now);

  const players: OnlinePresencePlayer[] = [];
  for (const entry of byUserId.values()) {
    if (now - entry.lastSeenMs <= ONLINE_TTL_MS) {
      players.push({ name: entry.name });
    }
  }

  players.sort((a, b) => a.name.localeCompare(b.name, 'uk'));

  return {
    count: players.length,
    players,
  };
}
